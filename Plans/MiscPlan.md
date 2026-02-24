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

- **Main repo path:** When not using worktrees, cleanup runs in `paths.workspace` (or configured project root).
- **Worktrees:** When a tier runs in a worktree, cleanup runs in that worktree path only; do not clean the main working tree for that tier's artifacts.
- **After execution:** `cleanup_after_execution` runs in the same directory the agent used (main repo or that tier's worktree).

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
| **Orchestrator** | `ExecutionEngine::execute_iteration` in `core/execution_engine.rs`; invoked by `orchestrator.rs` (e.g. `execute_iteration(&context)`). | `context.working_dir` (from tier worktree or `config.project.working_directory`). | **Yes.** Call `prepare_working_directory(work_dir)` before building/running the request and `cleanup_after_execution(work_dir)` after `execute` returns (success or failure), for each iteration. This is the main iteration path where cleanup matters most. |
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

- **Retention:** Keep evidence for the last N days, or last M runs per tier, or keep all (configurable).
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

The Config view has **8 tabs**: Tiers, Branching, Verification, Memory, Budgets, **Advanced**, Interview, YAML. Doctor is a separate view. The following GUI updates are required or recommended so cleanup, evidence, and related behavior are visible and wired.

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
- **Orchestrator plan:** Config has plan-mode and subagent UI (Tiers tab, optional "Enable plan mode for all tiers," Subagents section). Ensure cleanup subsection does not conflict with existing Advanced layout; use a clearly labeled "Workspace / Cleanup" block.
- **Interview plan:** Interview tab has its own GUI gaps (min/max questions, generate_initial_agents_md, etc.); see Interview plan §GUI gaps. No overlap with cleanup UI.

**Potential issues and improvements**

- **Discoverability:** If cleanup lives only in Advanced, some users may miss it. Add a one-line mention in Doctor: "Workspace cleanup runs before each iteration when enabled in Config → Advanced → Workspace."
- **Dry-run UX:** For "Clean workspace now," a "Preview" button could show a scrollable list of paths that would be removed (from `git clean -fd -n`); then "Confirm" runs the real clean. Requires parsing `git clean -n` output and showing in a modal or secondary view.
- **State after clean:** After "Clean workspace now," the UI could show a toast: "Cleaned N files/dirs" or "Nothing to clean." Improves feedback.
- **Missing project context:** When Doctor (or Config) has no project selected and no config path, "Clean workspace now" should be **disabled** with tooltip "Select a project or open a config to clean." Otherwise we might run clean in CWD or an wrong directory. Resolve project path from the same source as the run (current project, config path, or explicit selection).

### 7.6 Leveraging platform CLI capabilities (hooks, skills, plugins, extensions)

Platform CLIs (Cursor, Codex, Claude Code, Gemini, Copilot) support **hooks**, **skills**, **plugins**, **extensions**, and **MCP servers**. These can complement (not replace) Puppet Master's own prepare/cleanup and orchestration.

**Current stance**

- **Prepare and cleanup:** Puppet Master implements prepare_working_directory and cleanup_after_execution **internally** and invokes them via `run_with_cleanup` before/after each `runner.execute()`. Puppet Master does **not** rely on platform-specific hooks or scripts to perform workspace cleanup, so behavior is consistent across all five platforms and does not require the user to install or configure per-platform hooks.
- **Subagents and plan mode:** Subagent names and plan-mode flags are passed in the **prompt or CLI args** (per platform_specs and runners). Puppet Master does not require Cursor plugins or Claude hooks to define subagents; the orchestrator and interview plans define how Puppet Master invokes each platform.

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

**Skill model (align with OpenCode):**

- **One folder per skill**, with a `SKILL.md` inside. Recognized fields in frontmatter: `name` (required), `description` (required), `license`, `compatibility`, `metadata` (optional map).
- **Discovery paths** (single source of truth in backend, §7.10):
  - Project: `.puppet-master/skills/<name>/SKILL.md`, `.opencode/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md` (walk up from cwd to git worktree).
  - Global: `~/.config/puppet-master/skills/<name>/SKILL.md`, `~/.config/opencode/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`.
- **Name rules:** 1-64 chars, lowercase alphanumeric with single hyphens, no leading/trailing `-`, no consecutive `--`; must match directory name. **Description:** 1-1024 chars.

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

Backend components required so the Agent Skills GUI (§7.8) and skill-aware flows (orchestrator, interview, platform runners) work.

**Discovery paths (DRY:DATA:skill_search_paths):**

- Define the ordered list of (base_dir, relative_path) or full paths to search for `skills/<name>/SKILL.md`. Include:
  - Project: `.puppet-master/skills`, `.opencode/skills`, `.claude/skills`, `.agents/skills` -- resolve relative to project root (walk up from cwd to git worktree or use configured project path).
  - Global: `~/.config/puppet-master/skills`, `~/.config/opencode/skills`, `~/.claude/skills`, `~/.agents/skills`.
- **discover_skills(project_root: Option<&Path>) -> Vec<SkillInfo>:** Walk each path; for each `<base>/<name>/SKILL.md` found, collect name, path, source (project vs global). Deduplicate by name (e.g. project overrides global, or first-wins -- document the rule). Tag **DRY:FN:discover_skills**.

**Skill content and frontmatter:**

- **SkillInfo:** Struct with at least `name: String`, `description: String`, `path: PathBuf`, `source: SkillSource` (Project | Global), and optionally `license`, `compatibility`, `metadata` from frontmatter.
- **load_skill(path: &Path) -> Result<SkillInfo>:** Read `SKILL.md`, parse YAML frontmatter (first delimited block), validate `name` and `description` (length and name rules per §7.8). Parse body as markdown (keep raw for agent use). Tag **DRY:FN:load_skill**.
- **Name validation:** 1-64 chars, `^[a-z0-9]+(-[a-z0-9]+)*$`, and name must match directory name. Reject or warn on invalid names in GUI and in discovery.

**Permissions:**

- **Config shape:** `GuiConfig.skill_permissions` (or equivalent): map from skill name (or pattern, e.g. `internal-*`) to `allow | deny | ask`. Pattern-based matching supports wildcards (e.g. `internal-*`). Default: e.g. `*: allow` if unset.
- **resolve_skill_permission(name: &str, permissions: &SkillPermissions) -> Permission:** Return allow / deny / ask for a given skill name. Tag **DRY:FN:resolve_skill_permission**.
- When listing skills in GUI or when building agent context, filter or annotate by permission (denied skills hidden or greyed out; ask requires runtime prompt if implemented).

**CRUD and persistence:**

- **Create:** Create directory `<base>/<name>/` and write `SKILL.md` with valid frontmatter and placeholder body. Base chosen by user (project or global).
- **Update:** Overwrite or patch `SKILL.md` at known path; re-validate frontmatter and name.
- **Delete:** Remove skill folder only after user confirmation; optional "Disable" that only sets permission to deny without deleting files.
- Persist only **permissions** and any "pinned" or "favorite" list in config; skill content lives on disk. Discovery is stateless from disk.

**Integration with runners and prompts:**

- When building iteration context or prompt for a platform that supports skills (see platform_specs and orchestrator plan), include allowed skill names and paths (or the loaded content) so the CLI/SDK can load them (e.g. via `skill` tool or equivalent). Backend exposes: `list_skills_for_agent(project_root, permissions) -> Vec<SkillInfo>` that returns only allowed skills with their paths (and optionally loaded content). Tag **DRY:FN:list_skills_for_agent**.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Discovery and platform_specs:**

- How runners receive skills must be explicitly tied to **platform_specs** (or a dedicated doc section referenced from AGENTS.md). **Implementation plan must list per platform (Cursor, Codex, Claude, Gemini, Copilot) how skill paths or content are passed** -- e.g. env var, prompt injection, or tool (e.g. `skill` tool). No implementation of runner wiring without this mapping.

**Error handling (backend):**

- **load_skill:** Invalid frontmatter → return `Err` with message (e.g. "Invalid YAML frontmatter"). Missing SKILL.md → return `Err` ("SKILL.md not found"). Name/description validation failure → return `Err` with field and rule (e.g. "name must match directory").
- **Create:** If target directory already exists and contains SKILL.md → return error; do not overwrite (see §7.11). If directory exists but no SKILL.md, implementation must decide (error vs create SKILL.md only).
- **Update/Delete:** File not found or permission denied → return `Err`; do not corrupt in-memory state.
- **Config write (permissions):** On save failure, return `Err` to caller; GUI shows toast and keeps in-memory edits for retry.

**Module placement:**

- New module `src/skills/` (or under `src/config/`): `mod.rs`, `discovery.rs`, `frontmatter.rs`, `permissions.rs`. Keep discovery and load pure so they can be tested without GUI. Tag all public types and functions with DRY as above.

**Checklist:** See §8.9.

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
| **Deduplication by name** | **Decision:** **First-wins by search order.** Discovery walks paths in a defined order (e.g. project paths first, then global; within each, e.g. `.puppet-master/skills` then `.opencode/skills` then `.claude/skills` then `.agents/skills`). First `skills/<name>/SKILL.md` found for a given `name` wins; later duplicates with the same name are skipped (or listed as "shadowed" in GUI). Document this order in DRY:DATA:skill_search_paths. |
| **Create skill: directory already exists** | **Decision:** On "Create new" skill, if the target directory (e.g. `<base>/<name>/`) already exists and contains a `SKILL.md`, **do not overwrite**. Show an error (e.g. "A skill named &lt;name&gt; already exists at this location") and do not create. User must choose a different name or remove/import the existing skill first. Implementation must decide whether to treat "dir exists but no SKILL.md" as error or as partial state (e.g. offer to create SKILL.md only). |
| **Edit: concurrent edit on disk** | **Implementation must decide:** If the user has the skill open in the GUI editor and the file is changed on disk (e.g. by another editor or process), on save: (1) overwrite and warn "File was modified on disk; your version was saved", or (2) detect mtime/content change and prompt "File changed on disk. Reload / Overwrite / Cancel", or (3) lock file for v1 (complex). Recommend (2) for clarity. |
| **Validate all: show only errors vs full table** | **Decision:** Show a **full table** (all discovered skills) with a status column: OK or Error + message. This allows users to see which skills passed and which failed in one view. Summary line: "N OK, M errors." Optional: filter toggle "Show only errors" to collapse to errors-only. Implementation plan may choose errors-only modal for v1 if full table is deferred. |
| **Permission "ask": when and where** | **Defer to later:** "Ask" means prompt user before an agent loads the skill. When implemented: user is prompted **at the moment the runner would load the skill** (e.g. when building iteration context or when platform CLI would invoke the skill)--i.e. in-app, before or at run start, not inside the platform CLI. Where: modal or toast from the app (e.g. "Allow skill 'doc-lookup' for this run?" Allow / Deny / Always / Never). Implementation plan can mark "ask" as phase 2 and leave exact UI location to implementation. |
| **Pattern precedence: explicit vs pattern** | **Decision:** **Explicit per-skill entry wins over pattern.** When resolving permission for a skill name, check explicit entries in `skill_permissions` first; if none match, then apply pattern rules (e.g. `doc-*: allow`). So a skill "doc-release" with explicit "deny" remains denied even if pattern "doc-*" is allow. Document in backend resolve logic and in bulk-permission UI. |
| **"Import from path"** | **Decision:** **Copy into a discovery path.** "Import" means: user picks an existing folder containing `SKILL.md`; we copy that folder into a chosen discovery base (e.g. `.puppet-master/skills/<name>` or `~/.config/puppet-master/skills/<name>`). We do not persist arbitrary external paths (keeps discovery simple and portable). Validate name and frontmatter after copy. |
| **Create skill when no project** | When no project is open (no project root), "Create new" skill: offer **global only** (e.g. `~/.config/puppet-master/skills/<name>`). Disable or hide "project" option when `project_root` is None. |
| **Edit: name change in frontmatter** | **Decision:** **Name in frontmatter must match directory name.** On save, if user changes `name` in frontmatter so it no longer matches the dir name: (1) reject with validation error "Name must match folder name", or (2) offer "Rename folder" to rename dir to match (then save). Prefer (1) for v1 to avoid accidental renames. |
| **How runners receive skills** | **Document per platform:** platform_specs (or orchestrator plan) should state for each platform how skills are passed (paths only vs full content; CLI env var vs prompt injection vs `skill` tool). **Implementation plan must list per platform (Cursor, Codex, Claude, Gemini, Copilot) how skill paths or content are passed (env, prompt, tool).** See §7.10 "Discovery and platform_specs" and §8.9.6. |
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
- [ ] **8.9.2** Define discovery paths (DRY:DATA:skill_search_paths) in **canonical order**: project first (`.puppet-master/skills`, `.opencode/skills`, `.claude/skills`, `.agents/skills`), then global (`~/.config/puppet-master/skills`, etc.); implement `discover_skills(project_root) -> Vec<SkillInfo>` with first-wins deduplication by name; tag DRY:FN:discover_skills.
- [ ] **8.9.3** Implement `load_skill(path) -> Result<SkillInfo>` with YAML frontmatter parsing and name/description validation (length, regex, dir-name match); return clear errors for invalid frontmatter or missing file; tag DRY:FN:load_skill.
- [ ] **8.9.4** Add `skill_permissions` to GuiConfig; implement pattern-based resolve (allow/deny/ask) with wildcards; **explicit per-skill entry wins over pattern**; tag DRY:FN:resolve_skill_permission.
- [ ] **8.9.5** Implement CRUD: create skill dir + SKILL.md (if target dir already contains SKILL.md, return error and do not overwrite -- §7.11); update SKILL.md; delete (with confirmation); persist only permissions in config. On config write failure, return error to caller.
- [ ] **8.9.6** Implement `list_skills_for_agent(project_root, permissions) -> Vec<SkillInfo>` for runner/prompt integration; tag DRY:FN:list_skills_for_agent. **Document per platform (Cursor, Codex, Claude, Gemini, Copilot) how skill paths or content are passed** (env, prompt, tool) in platform_specs or linked doc; implementation plan must list this mapping.
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

- In the codebase, **orchestrator** resolves `working_directory` via `get_tier_worktree(tier_id).unwrap_or_else(|| config.project.working_directory)` (execution_engine / orchestrator path). In **app.rs** `execute_ai_turn`, `working_dir` is set to `std::env::current_dir()` -- i.e. process CWD, which may not be the configured project or a tier worktree.
- **Recommendation:** Ensure prepare/cleanup use the same source as the execution request: for orchestrator-driven runs use tier worktree or `config.project.working_directory`; for other flows (e.g. interview/wizard) either pass the same working_dir used for execution or document that cleanup is skipped when not using orchestrator workspace. Avoid using `current_dir()` for cleanup unless it is the intended workspace.

### 9.1.6 git clean exclude list

- `git clean -fd -e <pattern>` can exclude paths by pattern; multiple `-e` flags are allowed. The plan says "exclude list so `.puppet-master/` and allowlisted paths are never touched" but does not specify exact patterns (e.g. `-e '.puppet-master'`, `-e 'progress.txt'`, `-e 'AGENTS.md'`). Git's `-e` is a pattern (e.g. ignore pattern), not necessarily a path.
- **Recommendation:** Implement the single helper **DRY:FN:run_git_clean_with_excludes** (§4.7) that builds the command from the allowlist (DRY:DATA). Document the exact patterns there (or in `CLEANUP_EXCLUDE_PATTERNS`); test that excluded paths are never removed.

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

### 9.1.7 Evidence retention: definition of "run"

- Section 6 uses **evidence.retain_last_runs** without defining what counts as a "run" (per iteration, per subtask, per task, global). Without a clear definition, pruning may remove evidence that is still relevant for the current tier or for reporting.
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

- **Current plan:** §4.3 says cleanup_after_execution "Run workspace cleanup in work_dir per policy (e.g. git clean -fd)". The call flow is: **run_with_cleanup** does prepare → execute → **cleanup** (immediately after the runner returns). The **orchestrator** then runs **commit_tier_progress** (add_all, commit) only after the iteration result is processed. So cleanup runs **before** the commit.
- **Problem:** If cleanup_after_execution runs `git clean -fd`, it would remove **all untracked files** in the workspace, including **new files the agent just created** (e.g. new source files, docs). Those files would be deleted before the orchestrator can stage and commit them. Result: loss of iteration output.
- **Fix:** **Do not run broad "git clean -fd" (untracked files) in cleanup_after_execution.** In that step, only: (1) kill/terminate process if still running, (2) clean **runner temp files** (e.g. context copy temp files). **Full workspace untracked cleanup** (git clean -fd with excludes) should run only in **prepare_working_directory** (before the run), so we remove the *previous* run's cruft, not the current run's output. Optionally in cleanup_after_execution we can remove only **known build-artifact dirs** (e.g. `target/`) if config says so, but never untracked source or docs. Document this in §4.2 and §4.3 and in the implementation.

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

### 9.1.14 Interview and orchestrator plan output locations

- **Interview:** The interview orchestrator writes to `output_dir` = `.puppet-master/interview/` (state, phase docs, requirements-complete.md, test-strategy, technology-matrix, AGENTS.md). Research engine writes to `.puppet-master/research/`. All under `.puppet-master/`, so already allowlisted. **No gap** as long as interview never writes final output to project root; if it does (e.g. a top-level REQUIREMENTS.md), that path must be allowlisted or cleanup must not run broad git clean in interview context.
- **Start chain / wizard:** Writes to `.puppet-master/start-chain/` (e.g. tier-plan.md) and pipeline tier/test plans under paths derived from config. As long as those are under `.puppet-master/`, they are safe. If any start-chain or wizard output is written to project root, allowlist or skip broad cleanup for that flow.
- **Orchestrator / tier plans:** STATE_FILES.md places phase/task/subtask plans under `.puppet-master/plans/`. If the orchestrator or agents write tier plans there, they are safe. If an agent during an iteration writes a plan or doc to **repo root** (e.g. `PLAN.md`), it is untracked; with the fix in §9.1.13 we do not run git clean after execution, so that file would remain until the next prepare (or commit). So after the fix, we do not delete current-iteration output.
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

The following reflects a sweep of the codebase and plans. Use it to avoid missing wiring or GUI updates when implementing.

**Not yet implemented (MiscPlan / cleanup)**

- **Cleanup module:** No `src/cleanup/`; no `prepare_working_directory`, `cleanup_after_execution`, `run_git_clean_with_excludes`, or `run_with_cleanup`. All call sites still call `runner.execute()` (or SDK fallback) with no prepare/cleanup. Implement per §4 and §8.
- **CleanupConfig / run config:** No `CleanupConfig` type; no cleanup or evidence section in the config the run uses. When implementing, add to the **run config** (Option B: build from gui_config at run start) so the orchestrator and other call sites receive cleanup settings.
- **GUI -- Config → Advanced:** No "Workspace / Cleanup" subsection; no toggles for clean untracked, clean ignored, clear agent-output, evidence retention. Add per §7.5 and checklist 8.6.
- **GUI -- Doctor:** No "Clean workspace now" button; no Workspace category. Doctor does not receive a project-path hint when run from the app (Worktree plan §7.2). Add button and project context per §7.5 and 8.6.2.

**Unwired (run does not use GUI state)**

- **Orchestrator run config:** The backend uses `ConfigManager::discover()` (no hint) and `get_config()` which loads **PuppetMasterConfig** from the **file**. The Config page saves **GuiConfig** to the same path. The two shapes differ (Worktree plan §5); the run does **not** receive `gui_config.advanced.execution.enable_parallel` or other GUI-only fields unless Option B (build run config from gui_config at run start) is implemented. So **enable_parallel**, branching, and (once added) cleanup toggles are **unwired** until Option B is in place.
- **Interview:** When building `InterviewOrchestratorConfig` in app.rs, only **generate_initial_agents_md** and **generate_playwright_requirements** are passed from `gui_config.interview`. The following are **in the GUI** but **not** passed to the orchestrator: **require_architecture_confirmation**, **vision_provider**, **max_questions_per_phase**. **min_questions_per_phase** does not exist in GUI or in `InterviewOrchestratorConfig`. Phase definitions use hardcoded `min_questions: 3`, `max_questions: 8`. Wire these per Interview plan "GUI gaps: Interview tab" and orchestrator plan "Interviewer Enhancements and Config Wiring."

**Shortcuts and Skills (§7.7-§7.11)**

- **Shortcuts:** No `ShortcutAction`/`KeyBinding` or `default_shortcuts`; no `build_key_map` or key-event wiring; no Shortcuts tab or config. Implement per §7.7, §7.9, §8.8; resolve gaps in §7.11 (record flow, Slint wiring, serialization).
- **Skills:** No `src/skills/`; no discovery, load_skill, or permissions; no Skills tab or config. Implement per §7.8, §7.10, §8.9; resolve gaps in §7.11 (deduplication rule, import semantics, no-project create, name-change on edit).

**GUI changes required (summary)**

| Plan / feature | GUI change |
|----------------|------------|
| **MiscPlan** | Config → Advanced: add "Workspace / Cleanup" subsection (toggles + optional evidence). Doctor: add "Clean workspace now" (and optional "Clean all worktrees"); resolve project path; disable when no project. |
| **MiscPlan (Shortcuts)** | Config: add Shortcuts subsection/tab; list actions + bindings; Change / Reset; persist in GuiConfig. Wire key map at app level per §7.11. |
| **MiscPlan (Skills)** | Config: add Skills subsection/tab; list discovered skills; Add / Edit / Remove / Permissions / Refresh; persist permissions in GuiConfig. |
| **Worktree** | Branching tab: Enable Git, Auto PR, Branch strategy; fix/hide naming_pattern. Option B: run receives config built from gui_config so enable_parallel and branching take effect. |
| **Interview** | Interview tab: add min_questions_per_phase; add "Unlimited" for max; wire require_architecture_confirmation, vision_provider, min/max into InterviewOrchestratorConfig when starting interview. |
| **Orchestrator** | Tiers tab: plan mode global toggle, "Enable plan mode for all tiers" button; Subagents section. Single Save persists all (gui_config); Option B run-config build includes plan mode and subagents. |

**Widgets and DRY**

- All new GUI for cleanup, interview min/max, and branching must use existing widgets from `docs/gui-widget-catalog.md` (e.g. toggler, styled_button, styled_text_input, help_tooltip, confirm_modal). Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after changes. Tag new reusable widgets with `// DRY:WIDGET:`.

### 9.1.19 Shortcuts: config load failure, key conflicts, and discoverability

- **Config load failure:** If the shortcuts section of GuiConfig is corrupted or invalid at load time, the app must not crash. **Recommendation:** Fall back to empty overrides, log a warning, show toast "Shortcuts reset to defaults due to config error", and build key map from defaults only (§7.11, §8.8.7). Wire this at app startup and when opening Config → Shortcuts.
- **Key already bound to another action:** When the user records a new shortcut that is already assigned to a different action, **recommend rejecting** with tooltip "Already used by &lt;ActionName&gt;" and not saving (§7.11). Alternative (steal binding) is implementation-defined if preferred.
- **Export/import versioning:** Export JSON must include a `version` field; reject imports with unsupported version and show clear error (§7.11). Document supported version(s) in code or STATE_FILES.md.
- **Tooltip when key map not loaded:** Before the key map is built (e.g. config not yet loaded), show action label only or "(Loading...)" where shortcut labels appear; never show blank or "(undefined)" (§7.11).

### 9.1.21 Skills: discovery, permissions, and runner wiring

- **Discovery path order and portability:** Discovery path order is canonical (§7.10); any change (e.g. adding a path) can change which skill "wins" for a given name. **Recommendation:** Keep DRY:DATA:skill_search_paths as the single source of truth; document order in code and in AGENTS.md so implementers and users understand first-wins behavior. On Windows, path case and separators may affect discovery; first-wins deduplication should use consistent name comparison (e.g. normalize case for comparison if desired).
- **Permission "ask" and runner wiring:** Until "ask" is implemented (§7.11), only allow/deny are active. When "ask" is added, the app must prompt the user at the point where the runner would load the skill (before or at run start); implementation must decide exact UI (modal vs toast) and persistence (e.g. "Always/Never for this skill").
- **Per-platform skill delivery:** Runners must receive the allowed skill list in a form each platform understands. **Recommendation:** Implementation plan must list per platform (Cursor, Codex, Claude, Gemini, Copilot) how skill paths or content are passed (env var, prompt injection, tool); without this, Skills integration remains stubbed. See §7.10 "Discovery and platform_specs" and §8.9.6.
- **Create/import overwrite and concurrent edit:** Creating a skill when the target directory already contains SKILL.md must not overwrite (§7.11); implementation must return a clear error. Concurrent edit on disk during in-app edit is an implementation must-decide (detect and prompt Reload/Overwrite/Cancel recommended).

### 9.1.22 Shortcuts and Skills: implementation summary

**Known risks**

- **Slint key API:** Key event handling depends on Slint's key-event API (e.g. `FocusScope` `key-pressed` callback, `KeyEvent` struct). Behavior may differ by Slint version; implementer should confirm the integration point against Slint 1.15.1 docs and document it in the implementation plan.
- **Skill discovery on Windows path case:** Discovery paths (e.g. `.puppet-master/skills`, `.opencode/skills`) may behave differently on Windows (case-insensitivity, path separators). First-wins deduplication by name should account for case-normalization if needed.
- **platform_specs skill injection:** How each platform (Cursor, Codex, Claude, Gemini, Copilot) receives the skill list (env var, prompt injection, tool) must be defined in platform_specs or orchestrator plan; until then, Skills integration with runners is stubbed.

**Before implementation plan**

- Confirm Slint key-event API (Slint 1.15.1): where key events are captured (window vs focused widget, via `FocusScope`) and how KeyMap is applied.
- Confirm platform_specs (or equivalent) documents skill injection for each platform so the implementation plan can wire `list_skills_for_agent` per runner.

---

## 10. Cross-Plan Dependencies and Impacts

This section ties the Misc Plan to **Plans/WorktreeGitImprovement.md**, **Plans/orchestrator-subagent-integration.md**, and **Plans/interview-subagent-integration.md**: what this plan depends on, what it impacts, and what else needs to be done so cleanup fits the rest of the system.

### 10.1 WorktreeGitImprovement.md

**What the Worktree plan does:** Config wiring (Option B: build run config from GUI at run start), worktree create/merge/cleanup (of worktree *directories*), active_worktrees repopulation, git binary resolution, GitHub API PR creation wiring (no GitHub CLI), Branching tab GUI, Doctor worktrees check.

**Dependencies (MiscPlan depends on Worktree):**

- **Config wiring (Phase 1):** Cleanup config (cleanup.untracked, cleanup.ignored, cleanup.clear_agent_output, etc.) must live in the **same** config shape that the run receives. When implementing MiscPlan §7 (Cleanup UX & Config), add cleanup fields to that schema and ensure they are populated from the GUI (or file) the same way as other run settings. If Option B is not yet implemented, cleanup toggles in the GUI would not affect the run; implement Option B first or in parallel so cleanup config is wired.
- **Git binary resolution (Phase 3):** The Worktree plan introduces a shared helper for resolving the `git` executable: `path_utils::resolve_git_executable()`, used by both GitManager and Doctor. **MiscPlan's cleanup module** must use that same helper when running `git clean` (in `run_git_clean_with_excludes`). Do not use `Command::new("git")` alone; resolve the binary so cleanup works in environments where git is only in app-local or custom paths. See Worktree §3.1, §7.5.
- **Worktree list for "Clean workspace" (optional):** If implementing "Clean workspace now" for **all active worktrees** (§7.2), the list of worktrees must come from the same place as the orchestrator (e.g. `worktree_manager.list_worktrees()` and/or `active_worktrees`). Worktree plan §2.2 and §7.6 describe repopulation of active_worktrees; if that is not done, "clean all worktrees" may only clean the main workspace. Prefer implementing after or with Worktree Phase 2 so worktree list is reliable.

**Distinction:** Worktree plan's "cleanup" is **removing the worktree directory** after merge (`cleanup_subtask_worktree`, `remove_worktree`). MiscPlan's cleanup is **removing untracked/ignored files *inside* ** the workspace or worktree. Both apply: after an iteration, run MiscPlan's cleanup_after_execution in that worktree; when the subtask is done and merged, run Worktree's remove_worktree. No conflict.

**STATE_FILES.md:** Worktree plan adds a worktrees subsection under `.puppet-master/`; MiscPlan adds agent-output and possibly evidence retention. Both can update STATE_FILES in their own subsections.

### 10.2 orchestrator-subagent-integration.md

**What the Orchestrator plan does:** Subagent selection and invocation at Phase/Task/Subtask/Iteration, config-wiring validation, start/end verification (verify_tier_start, verify_tier_end) at tier boundaries, quality verification (reviewer subagent, gate criteria), parallel execution with worktrees per subtask.

**Impacts (MiscPlan impacts Orchestrator):**

- **Single execution path:** All agent runs (main iteration and subagent runs) should go through the same prepare → execute → cleanup flow. When the orchestrator plan adds `execute_tier_with_subagents` or similar, that path must **use run_with_cleanup** (or the same prepare/execute/cleanup wrapper) so that both "main" iterations and subagent invocations get prepare_working_directory before run and cleanup_after_execution after run. Do not call `runner.execute()` directly from new orchestrator/subagent code; use the wrapper from MiscPlan §4.6.
- **Ordering with start/end verification:** Orchestrator plan's verify_tier_start runs at Phase/Task/Subtask (and optionally Iteration) **entry**; verify_tier_end runs at Phase/Task/Subtask **completion**. MiscPlan's prepare/cleanup run at **iteration** boundaries (before and after each runner.execute). So the flow is: verify_tier_start (tier) → ... → prepare_working_directory (iteration) → execute → cleanup_after_execution (iteration) → ... → verify_tier_end (tier). No conflict; both apply. When implementing orchestrator start/end verification, keep iteration-level prepare/cleanup as defined in MiscPlan.
- **Parallel subtasks:** Each parallel subtask has its own worktree and working_dir. cleanup_after_execution runs in that subtask's work_dir only (per MiscPlan §3.3). Orchestrator plan's parallel execution (worktree per subtask) is compatible; no extra change needed.
- **Commit order:** The orchestrator calls commit_tier_progress **after** the iteration returns; run_with_cleanup runs cleanup **before** that. So cleanup_after_execution must not remove untracked files (§9.1.13); only runner temp files. Full workspace untracked clean runs in prepare_working_directory (before the run).

**Dependencies (MiscPlan depends on Orchestrator):** None. MiscPlan can be implemented first; orchestrator subagent integration should then wire its runner calls through run_with_cleanup.

### 10.3 interview-subagent-integration.md

**What the Interview plan does:** Subagent persona assignments per interview phase, research_engine enhancements (e.g. research_pre_question_with_subagent), prompt templates with subagent instructions, SubagentInvoker for platform-specific invocation, document generation and validation subagents.

**Impacts (MiscPlan impacts Interview):**

- **Research engine:** Interview plan adds or extends `research_pre_question_with_subagent` and similar. Whenever the interview flow calls the platform runner (e.g. `runner.execute(&request)` in research_engine or in subagent invocation), that call must go through **run_with_cleanup** so the interview working directory is prepared and cleaned the same way as orchestrator and start_chain. MiscPlan §4.6 already lists interview research_engine as a call site; when the interview plan adds subagent-based research, that new path must also use the wrapper (not raw runner.execute).
- **SubagentInvoker / platform invocation:** If the interview plan introduces a helper that builds a prompt and then runs the platform (e.g. for validation or research), that run should use run_with_cleanup so agent-left-behind files from interview runs are cleaned. Centralize on the single wrapper for all runner invocations from the interview flow.

**Dependencies (MiscPlan depends on Interview):** None. MiscPlan can be implemented first; interview subagent integration should then use run_with_cleanup for every runner call.

**Interview and orchestrator output:** Interview writes to `.puppet-master/interview/` and `.puppet-master/research/`; start-chain/wizard to `.puppet-master/start-chain/`; tier plans to `.puppet-master/plans/` (STATE_FILES). All are under `.puppet-master/` and thus allowlisted. When adding new output paths in the interview or orchestrator plans, keep them under `.puppet-master/` or add them to the cleanup allowlist so they are never removed (§9.1.14).

### 10.4 newfeatures.md

**Plans/newfeatures.md §13** (Bounded buffers and process isolation) requires that all subprocess output (runners, headless, stream consumers) use **bounded buffers** (fixed max size, drop oldest when full) and that the CLI always runs in a **separate process**. When implementing cleanup or any runner path, ensure we do not accumulate unbounded stdout/stderr; align with newfeatures §13 and document in AGENTS.md. **§2** (Background/async agents) defines output for background runs at `.puppet-master/agent-output/{run-id}/`; if that feature is implemented, the cleanup allowlist and optional "agent output" policy (§3.2, §5) should account for that path so background run output is preserved or cleared per policy.

### 10.5 Summary: what else needs to be done

| Plan | What to do so MiscPlan fits |
|------|-----------------------------|
| **WorktreeGitImprovement** | Implement Phase 1 (config wiring) so cleanup config is in the same run config; implement Phase 3 shared git binary resolution and use it in MiscPlan's run_git_clean_with_excludes; optionally Phase 2 (active_worktrees) for "Clean all worktrees." |
| **orchestrator-subagent-integration** | When adding subagent/iteration execution, use run_with_cleanup (MiscPlan) for every runner invocation; keep verify_tier_start/verify_tier_end at tier boundaries and prepare/cleanup at iteration boundaries. |
| **interview-subagent-integration** | When adding research or subagent runs that call the platform runner, use run_with_cleanup so interview runs get the same prepare/cleanup behavior. |

---

## 10.5 Crews and Subagent Communication Enhancements for Cleanup Operations

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines **Crews** (multi-agent communication system) and enhanced subagent communication. These features can enhance **cleanup operations** to enable better coordination between cleanup operations and subagents.

### 1. Cleanup Coordination via Crews

**Concept:** When orchestrator performs cleanup operations, crews can coordinate to ensure cleanup is safe and effective.

**Benefits:**
- **Safe cleanup:** Crew members can warn about files that should not be cleaned
- **Coordinated cleanup:** Multiple cleanup operations can coordinate to avoid conflicts
- **Evidence preservation:** Crew members can coordinate to preserve evidence files

**BeforeCleanup crew coordination responsibilities:**

- **Identify cleanup scope:** Determine which files/directories will be cleaned and which subagents are involved
- **Create cleanup crew:** Create crew with subagents involved in cleanup operations, crew_id = `cleanup-{cleanup_id}`
- **Post cleanup warnings:** Crew members post warnings about files that should not be cleaned (e.g., evidence files, state files)
- **Coordinate cleanup order:** Crew members coordinate cleanup order to avoid conflicts

**DuringCleanup crew coordination responsibilities:**

- **Monitor cleanup progress:** Crew members post updates about cleanup progress
- **Handle cleanup conflicts:** If cleanup conflicts arise, crew members coordinate resolution
- **Preserve evidence files:** Crew members ensure evidence files are not cleaned

**AfterCleanup crew completion responsibilities:**

- **Validate cleanup results:** Crew members confirm that cleanup completed successfully and evidence files were preserved
- **Archive cleanup coordination messages:** Archive cleanup coordination messages to `.puppet-master/memory/cleanup-{cleanup_id}-messages.json`
- **Disband cleanup crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/cleanup/workspace.rs` to create cleanup crews, coordinate cleanup operations, and disband crews after cleanup completes.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Integration with cleanup module:**

In `src/cleanup/workspace.rs`, extend cleanup operations:

```rust
impl CleanupModule {
    pub async fn prepare_working_directory_with_crew_coordination(
        &self,
        work_dir: &Path,
        config: &CleanupConfig,
        crew_id: Option<&str>,
    ) -> Result<()> {
        if let Some(crew_id) = crew_id {
            // Post cleanup plan to crew for review
            let cleanup_plan_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "cleanup-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Request,
                subject: "Cleanup plan review".to_string(),
                content: format!(
                    "Proposed cleanup plan:\nWork directory: {}\nClean untracked: {}\nClean ignored: {}\nAllowlist: {:?}\n\nPlease review and warn about files that should not be cleaned.",
                    work_dir.display(),
                    config.untracked,
                    config.clean_ignored,
                    cleanup_exclude_patterns()
                ),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, cleanup_plan_message).await?;
            
            // Wait for crew warnings (or timeout after 5 seconds)
            let warnings = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Warning,
                chrono::Duration::seconds(5),
            ).await?;
            
            // Apply warnings to cleanup config (add additional exclude patterns)
            let updated_config = self.apply_cleanup_warnings(config, &warnings)?;
            
            // Perform cleanup with updated config
            self.prepare_working_directory(work_dir, &updated_config).await?;
            
            // Post cleanup completion to crew
            let completion_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "cleanup-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Announcement,
                subject: "Cleanup completed".to_string(),
                content: format!("Cleanup completed for work directory: {}", work_dir.display()),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, completion_message).await?;
        } else {
            // No crew coordination, perform cleanup directly
            self.prepare_working_directory(work_dir, config).await?;
        }
        
        Ok(())
    }
    
    fn apply_cleanup_warnings(
        &self,
        config: &CleanupConfig,
        warnings: &[AgentMessage],
    ) -> Result<CleanupConfig> {
        let mut updated_config = config.clone();
        
        // Extract additional exclude patterns from warnings
        let mut additional_excludes = Vec::new();
        for warning in warnings {
            // Parse warning content to extract file paths/patterns that should not be cleaned
            // E.g., "Do not clean .puppet-master/evidence/test-results.json"
            let exclude_patterns = self.extract_exclude_patterns_from_warning(warning)?;
            additional_excludes.extend(exclude_patterns);
        }
        
        // Add additional excludes to config (implementation depends on CleanupConfig structure)
        // updated_config.additional_excludes.extend(additional_excludes);
        
        Ok(updated_config)
    }
    
    fn extract_exclude_patterns_from_warning(
        &self,
        warning: &AgentMessage,
    ) -> Result<Vec<String>> {
        // Parse warning content to extract exclude patterns
        // Simple implementation: look for file paths mentioned in warning
        let mut patterns = Vec::new();
        
        // Extract paths from warning content (simple regex or string matching)
        // E.g., "Do not clean .puppet-master/evidence/test-results.json" → ".puppet-master/evidence/test-results.json"
        // Implementation depends on warning message format
        
        Ok(patterns)
    }
}
```

**Error handling:**

- **Cleanup crew creation failure:** If crew creation fails, log warning and proceed without crew coordination
- **Cleanup warning parsing failure:** If cleanup warnings cannot be parsed, log warning and proceed with original config
- **Cleanup coordination failure:** If cleanup coordination fails, log warning and proceed with direct cleanup (may clean files that should be preserved)

## 10.6 Lifecycle and Quality Enhancements for Cleanup Operations

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines lifecycle hooks, structured handoff validation, remediation loops, and cross-session memory. These features can enhance **cleanup operations** to improve reliability, quality, and continuity.

### 1. Hook-Based Lifecycle for Cleanup Operations

**Concept:** Apply hook-based lifecycle middleware to cleanup operations. Run **BeforeCleanup** and **AfterCleanup** hooks before and after workspace cleanup (prepare_working_directory, cleanup_after_execution, manual "Clean workspace").

**BeforeCleanup hook responsibilities:**

- **Track active cleanup:** Record which cleanup operation is being performed (e.g., `prepare_working_directory`, `cleanup_after_execution`, `manual_clean`).
- **Inject cleanup context:** Add workspace path, allowlist state, config snapshot, and known cleanup issues to cleanup context.
- **Load cross-session memory:** Load prior cleanup patterns (e.g., which dirs were cleaned, which were preserved) from `.puppet-master/memory/` and inject into cleanup context.
- **Validate workspace state:** Check workspace is valid (git repo, permissions) before cleanup.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**AfterCleanup hook responsibilities:**

- **Validate cleanup result:** Check that cleanup succeeded (e.g., files removed, allowlisted paths preserved).
- **Track completion:** Update cleanup operation tracking, mark cleanup completion state.
- **Save memory:** Persist cleanup patterns (e.g., which patterns were effective, which dirs were problematic) to `.puppet-master/memory/patterns.json`.
- **Safe error handling:** Guarantee structured output even on cleanup failure.

**Implementation:** Extend `src/cleanup/workspace.rs` to call hooks before and after cleanup operations. Use the same hook registry pattern as orchestrator hooks, but with cleanup-specific contexts (`BeforeCleanupContext`, `AfterCleanupContext`).

**Integration with cleanup module:**

In `src/cleanup/workspace.rs`, wrap cleanup operations:

```rust
// Before cleanup
let before_ctx = BeforeCleanupContext {
    operation: CleanupOperation::PrepareWorkingDirectory,
    work_dir: work_dir.to_path_buf(),
    config: config.clone(),
    allowlist: cleanup_exclude_patterns(),
    known_issues: get_known_cleanup_issues()?,
};

let before_result = self.hook_registry.execute_before_cleanup(&before_ctx)?;

if before_result.block {
    return Err(anyhow!("Cleanup blocked by hook: {}", before_result.block_reason.unwrap_or_default()));
}

// Perform cleanup
let result = run_git_clean_with_excludes(work_dir, config.untracked, config.clean_ignored).await?;

// After cleanup
let after_ctx = AfterCleanupContext {
    operation: CleanupOperation::PrepareWorkingDirectory,
    work_dir: work_dir.to_path_buf(),
    cleanup_result: result.clone(),
    completion_status: if result.success { CompletionStatus::Success } else { CompletionStatus::Failure(result.error) },
    files_removed: result.files_removed,
    allowlisted_preserved: result.allowlisted_preserved,
};

let after_result = self.hook_registry.execute_after_cleanup(&after_ctx)?;

// Save memory if cleanup succeeded
if result.success {
    self.memory_manager.save_pattern(EstablishedPattern {
        name: "cleanup_patterns".to_string(),
        description: format!("Cleaned {} files, preserved allowlisted paths", result.files_removed),
        examples: vec![format!("git clean -fd -e .puppet-master ...")],
        timestamp: Utc::now(),
    }).await?;
}
```

### 2. Structured Handoff Validation for Cleanup Results

**Concept:** Enforce structured output format for cleanup operation results. Use structured format for cleanup operation outputs.

**Cleanup operation result format:**

```rust
pub struct CleanupResult {
    pub operation: CleanupOperation,
    pub success: bool,
    pub files_removed: u32,
    pub dirs_removed: u32,
    pub allowlisted_preserved: Vec<PathBuf>,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub duration_ms: u64,
}
```

**Validation:** After cleanup operations, validate result format matches `CleanupResult`. On validation failure (e.g., unexpected git clean output format), log warning and proceed with partial result.

**Integration:** Extend `run_git_clean_with_excludes()` and `prepare_working_directory()` to return structured `CleanupResult` instead of raw success/failure. Parse git clean output into structured format (e.g., count files/dirs removed from `git clean -fd -n` preview).

### 3. Cross-Session Memory for Cleanup Patterns

**Concept:** Persist cleanup patterns (effective exclude patterns, problematic directories, cleanup frequency) to `.puppet-master/memory/` so future runs can load prior cleanup knowledge.

**What to persist:**

- **Cleanup patterns:** Examples of effective cleanup operations (e.g., "git clean -fd -e .puppet-master removed 15 files").
- **Problematic directories:** Directories that caused cleanup issues (e.g., permission errors, locked files).
- **Cleanup frequency:** How often cleanup runs, which operations are most effective.

**When to persist:**

- **At cleanup completion:** Save cleanup pattern example if cleanup was effective.
- **At cleanup failure:** Save problematic directory pattern if cleanup failed.

**When to load:**

- **At run start:** Load prior cleanup patterns and inject into cleanup context.
- **At cleanup operation:** Load prior cleanup patterns to optimize cleanup strategy.

**Integration:** Use the same `MemoryManager` from orchestrator plan. In cleanup module, call `memory_manager.save_pattern()` at cleanup operations (prepare, cleanup_after_execution, manual clean).

### 4. Active Agent Tracking for Cleanup Operations

**Concept:** Track which cleanup operation is currently active. Store in cleanup module state and expose for logging and debugging.

**Tracking:**

- **Per operation:** `active_cleanup_operation: Option<CleanupOperation>` in cleanup module state.
- **Persistence:** Write to `.puppet-master/state/active-cleanup-operations.json` (updated on each cleanup operation).

**Use cases:**

- **Logging:** "Cleanup operation: prepare_working_directory, work_dir = /path/to/project, files_removed = 15"
- **Debugging:** "Why did this cleanup fail? Check active cleanup operation logs."
- **Audit trails:** "Which cleanup operations ran in this run? See active-cleanup-operations.json."

### 5. Remediation Loop for Cleanup Failures

**Concept:** When cleanup operations fail with recoverable errors (e.g., permission errors, locked files), enter a remediation loop. Retry with fixes until cleanup succeeds or escalate.

**Severity levels:**

- **Critical:** Workspace corruption, critical permission errors -- **escalate to user**.
- **Major:** Permission errors for specific files, locked files -- **remediate automatically** (skip problematic files, retry with different strategy).
- **Minor:** Non-fatal warnings (e.g., "some files could not be removed") -- **log and proceed**.
- **Info:** Informational messages -- **log and proceed**.

**Remediation loop:**

1. Cleanup operation fails (e.g., `git clean -fd` fails with "Permission denied" for specific file).
2. Parse error from cleanup output.
3. Categorize error (Critical/Major/Minor/Info).
4. If Major (recoverable):
   - Apply remediation (e.g., skip problematic file, retry with `-f` force flag, or use alternative cleanup method).
   - Retry cleanup operation.
   - Repeat until succeeds or max retries (e.g., 2).
   - If max retries reached, escalate to user or skip problematic files.
5. If Critical: escalate to user immediately.
6. If Minor/Info: log and proceed.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Integration:** Extend cleanup module to use remediation loop pattern from orchestrator plan. Wrap cleanup operations in remediation-aware handlers that detect recoverable errors and apply fixes.

### Implementation Notes

- **Where:** Extend `src/cleanup/workspace.rs` with hook integration; reuse `src/core/memory.rs` for persistence; reuse `src/core/remediation.rs` for remediation loops.
- **What:** Add BeforeCleanup/AfterCleanup hooks; validate cleanup results with structured format; persist cleanup patterns to memory; track active cleanup operations; implement remediation loops for recoverable cleanup errors.
- **When:** Hooks run automatically at cleanup boundaries; memory persists at cleanup operations; remediation loop runs when cleanup operations fail with recoverable errors.

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
