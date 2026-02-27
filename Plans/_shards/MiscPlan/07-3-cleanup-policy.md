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

