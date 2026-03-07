# GitHub Integration -- Spec

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- GITHUB INTEGRATION SPEC

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

LOCKED DECISIONS (DO NOT CHANGE IN THIS DOC):
- GitHub operations: GitHub API provider only; no external auth-shell dependency
- Default auth flow: OAuth device-code (realm: github_api)
- No secrets in seglog/redb/Tantivy or logs; secrets live only in OS credential store
- Local git operations use the local `git` binary (not the GitHub API)
- SSH remote execution: git commands run on the remote via SSH subprocess
- All interactive UI elements dispatch UICommand IDs; no business logic in the UI layer
-->

## Change Summary

- **2026-02-25:** Remediation pass for §B. Added conditional PR/Issues panel visibility
  behavior (optional surface with deterministic disabled state), expanded PR/Issues/Actions
  failure-state tables, and added explicit Actions run/log summary contract fields.
- **2026-02-25:** Initial creation. Covers IDE Git Panel (§A), GitHub API integration
  (§B), SSH Remote Dev Servers (§C), and no-wizard Project Management flows (§D).
  All decisions resolved deterministically; no open questions.

---

## SSOT References (DRY)

The following canonical documents govern this spec. This document MUST NOT redefine
schemas or contracts owned by those sources; it adds the IDE UX layer on top of them.

ContractRef: ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2

| Reference | Purpose |
|---|---|
| `Plans/Spec_Lock.json` | Locked decisions (github_operations, auth_model) |
| `Plans/DRY_Rules.md` | DRY + ContractRef rule (canonical) |
| `Plans/Contracts_V0.md` | Canonical contracts: EventRecord, UICommand, AuthState |
| `Plans/Glossary.md` | Canonical terminology |
| `Plans/Decision_Policy.md` | Deterministic defaults; tie-break policy |
| `Plans/Architecture_Invariants.md` | INV-002 (no secrets in storage), INV-010 (naming), INV-003/004/011/012 (UI rules) |
| `Plans/GitHub_API_Auth_and_Flows.md` | GitHub auth contract and API call flows (SSOT for auth; this doc adds IDE UX layer only) |
| `Plans/WorktreeGitImprovement.md` | Git/worktree implementation details and gap fixes |
| `Plans/FileManager.md` | File Manager panel and IDE-style editor |
| `Plans/chain-wizard-flexibility.md` | Wizard/project intent-based workflow definitions |
| `Plans/UI_Command_Catalog.md` | Stable UI command IDs (canonical SSOT) |
| `Plans/Progression_Gates.md` | GATE-003 (invariants), GATE-009 (ContractRef), GATE-010 (wiring) |
| `Plans/Crosswalk.md` | Primitive ownership boundaries |
| `Plans/storage-plan.md` | redb/seglog/Tantivy storage rules |

> This document intentionally does **not** redefine `AuthState`, `AuthPolicy`, `AuthEvent`,
> GitHub device-code polling semantics, token storage rules, or GitHub API call contracts.
> Those are canonical in `Plans/GitHub_API_Auth_and_Flows.md` and `Plans/Contracts_V0.md`.

---

> **Anti-Drift Compliance:**
> - All operational statements require `ContractRef:` annotations (ContractRef: Plans/DRY_Rules.md, Plans/Progression_Gates.md#GATE-009).
> - Architecture invariants apply, especially secrets and naming (ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010).
> - Ambiguity resolved deterministically via `Plans/Decision_Policy.md` §2 (ContractRef: PolicyRule:Decision_Policy.md§2).
> - GitHub API operations use `github_api` realm only; not `copilot_github` (ContractRef: Plans/GitHub_API_Auth_and_Flows.md §auth-realm-split).

---

## A. Git Panel (IDE Surface)

The Git Panel is the IDE-integrated surface for all local and remote Git operations.
It is a first-class panel in the Puppet Master UI; it MUST dispatch `UICommand` IDs
for all user-initiated actions and MUST NOT execute Git business logic directly.

ContractRef: Invariant:INV-004, Invariant:INV-011, ContractName:Plans/Contracts_V0.md#UICommand

---

### A.1 Repository & Branch Status Bar

The status bar occupies the topmost area of the Git Panel and MUST always reflect the
current state of the active project's repository without requiring user interaction.

ContractRef: ContractName:Plans/Contracts_V0.md#UICommand, Invariant:INV-003

#### Repository name

- When the active project folder contains a `.git` directory, the status bar MUST display
  the repository name derived from the `origin` remote URL, or the folder name if no
  remote exists.
  ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2
- When the active project folder does NOT contain a `.git` directory, the status bar MUST
  display the literal text `(no repo)` and all Git-specific controls MUST be disabled.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

#### Branch name and upstream tracking state

The branch display MUST show the current branch name followed by a deterministic upstream
tracking indicator from the following fixed set (no intermediate or ambiguous states):

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2

| State | Display text | Condition |
|---|---|---|
| `up-to-date` | `↕ up to date` | Local and remote refs are equal |
| `ahead` | `↑ N` | Local is N commits ahead of remote |
| `behind` | `↓ N` | Local is N commits behind remote |
| `diverged` | `↕ ↑A ↓B` | Local is A ahead and B behind |
| `no-upstream` | `(local only)` | No tracking remote configured |
| `detached` | `HEAD detached` | Repository is in detached HEAD state |

#### Working folder location and mode

The working folder display MUST show the project location according to the active mode:

- **Local mode:** display the absolute filesystem path (e.g. `/home/user/projects/myapp`).
  ContractRef: PolicyRule:Decision_Policy.md§2
- **SSH Remote Dev Server mode:** display the SSH path in the form `user@host:remote/path`
  (e.g. `alice@dev.example.com:/home/alice/projects/myapp`). See §C for SSH management.
  ContractRef: ContractName:Plans/GitHub_Integration.md#C, PolicyRule:Decision_Policy.md§2

#### Status badges

The status bar MUST display exactly one primary status badge from the following fixed set.
Each badge MUST have deterministic display text and icon — no ambiguous intermediate states.

ContractRef: Invariant:INV-003, PolicyRule:Decision_Policy.md§2

| Badge ID | Icon | Display text | Trigger condition |
|---|---|---|---|
| `clean` | ✓ (green) | `Clean` | No staged or unstaged changes; not in error state |
| `changes` | ● (blue) | `N changed` | Staged or unstaged files present; no conflicts |
| `merge-conflict` | ✕ (red) | `N conflict(s)` | Merge or rebase conflict files present |
| `detached-head` | ⎇ (orange) | `Detached HEAD · <short-sha>` | Repository is in detached HEAD state |
| `auth-expired` | 🔒 (red) | `Auth expired — re-authenticate` | GitHub API token expired or revoked |
| `remote-unreachable` | ⚠ (yellow) | `Remote unreachable · <host>` | Remote fetch failed with network error |

Badge precedence (deterministic, highest to lowest): `merge-conflict` > `auth-expired` >
`remote-unreachable` > `detached-head` > `changes` > `clean`.

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### A.2 File Changes List

The File Changes List MUST present all pending changes to files in the working directory,
organized into deterministic groups, in the order defined below.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, Invariant:INV-003

#### Groups (fixed order, always shown if non-empty)

1. **Staged** — files added to the index (ready to commit).
2. **Changes** — files modified/deleted in the working tree but not yet staged.
3. **Untracked** — files not tracked by Git (shown below Changes; collapsible; default: expanded).

ContractRef: PolicyRule:Decision_Policy.md§2

#### Per-file display

Each file entry MUST show:

- **Status letter:** `M` (modified) / `A` (added) / `D` (deleted) / `R` (renamed) /
  `U` (unmerged/conflict) / `?` (untracked).
- **Filename** (basename).
- **Relative path** from the project root.

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

#### Interactions

- **Click file:** opens the diff preview panel (§A.3) for that file.
  ContractRef: UICommand:cmd.git.diff_open, Invariant:INV-011
- **Right-click context menu:** MUST offer exactly the following actions:
  `Stage`, `Unstage`, `Discard`, `Copy path`.
  ContractRef: UICommand:cmd.git.stage, UICommand:cmd.git.unstage, UICommand:cmd.git.discard, Invariant:INV-011
- **Select all / deselect:** A checkbox affordance at the group header MUST allow
  bulk-selecting all files in that group for bulk Stage or Unstage.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-011

#### Error state

If `git status` fails (e.g. repo directory removed, permission denied), the File Changes
List MUST be replaced by an error banner showing `Git status failed: <reason>` with a
`Retry` action button. No stale file entries MUST remain visible behind the banner.

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### A.3 Diff Preview Panel

The Diff Preview Panel MUST open inline within the Git Panel when a file is selected in
the File Changes List (§A.2).

ContractRef: Invariant:INV-003, ContractName:Plans/FileManager.md

#### View mode

- The panel MUST support two view modes: **Side-by-side** (default) and **Unified**.
  ContractRef: PolicyRule:Decision_Policy.md§2
- The user's selected view mode MUST be persisted per project in redb under the key
  `git_panel/diff_view_mode/{project_id}` with values `side_by_side` or `unified`.
  ContractRef: ConfigKey:git_panel/diff_view_mode, ContractName:Plans/storage-plan.md
- The toggle between modes is a UI-only state change dispatched as a UICommand.
  ContractRef: UICommand:cmd.git.diff_toggle_mode, Invariant:INV-011

#### Display requirements

- **Syntax highlighting:** applied based on the file's detected language (same language
  heuristics as the IDE-style editor in `Plans/FileManager.md`).
  ContractRef: ContractName:Plans/FileManager.md
- **Line numbers:** MUST be shown on both sides in side-by-side mode; on both old and new
  sides in unified mode.
  ContractRef: PolicyRule:Decision_Policy.md§2

#### Special cases (deterministic, no ambiguity)

| Condition | Required display |
|---|---|
| Binary file | `Binary file — cannot preview diff` (no diff content) |
| Diff exceeds 5 000 lines | Truncated diff (first 5 000 lines) + `Show full diff in editor` link that opens the file diff in the IDE editor |
| File deleted | Full content of deleted file shown as removed lines |
| New untracked file | Full content shown as added lines |

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### A.4 Git Operations

Each operation below specifies: trigger UI, required inputs, success state, and all error
states. All operations MUST be dispatched as UICommands; the UI layer MUST NOT invoke
`git` directly.

ContractRef: Invariant:INV-004, Invariant:INV-011, ContractName:Plans/UI_Command_Catalog.md

---

#### Stage / Unstage

**Stage**

- Trigger: "Stage" button per file, or "Stage Selected" button for bulk-selected files.
  ContractRef: UICommand:cmd.git.stage, Invariant:INV-011
- Required inputs: one or more file paths (from selection).
  ContractRef: PolicyRule:Decision_Policy.md§2
- Success state: file(s) move from the "Changes" group to the "Staged" group; the File
  Changes List MUST refresh immediately.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Error — locked or inaccessible file: show inline banner `Stage failed: <reason>` on the
  affected file row; all other files in a bulk operation MUST continue to stage.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

**Unstage**

- Trigger: "Unstage" button per file, or "Unstage Selected" button for bulk-selected files.
  ContractRef: UICommand:cmd.git.unstage, Invariant:INV-011
- Required inputs: one or more file paths (from selection).
- Success state: file(s) move from the "Staged" group to the "Changes" group; the File
  Changes List MUST refresh immediately.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Error — locked or inaccessible file: show inline banner `Unstage failed: <reason>` on
  the affected file row.
  ContractRef: Invariant:INV-003

---

#### Commit

- Trigger: "Commit" button at the bottom of the Git Panel.
  ContractRef: UICommand:cmd.git.commit, Invariant:INV-011
- Required inputs:
  - **Commit message subject** (text field, required): minimum 1 character, maximum 72
    characters. The "Commit" button MUST be disabled if this field is empty or if no files
    are staged.
    ContractRef: PolicyRule:Decision_Policy.md§2
  - **Commit message body** (expandable textarea, optional): shown when the user clicks
    "Add description"; no character limit; MUST NOT be required.
    ContractRef: PolicyRule:Decision_Policy.md§2
- **Amend last commit** toggle: shown with a warning banner `Warning: this commit has
  already been pushed — amend will require a force push` when the HEAD commit's upstream
  ref exists. Default: off.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- Success state: staged files are committed; Staged group empties; branch tracking
  indicator updates to show N commits ahead.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Error — nothing to commit: show `No staged changes to commit` as a non-blocking
  inline message; do not dismiss the panel.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- Error — pre-commit hook failed: show `Commit failed — pre-commit hook exited with
  code <N>` banner with hook stdout/stderr output (scrollable, max 40 lines shown; "Show
  all" expands to full output). The commit message MUST be preserved in the text field.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

#### Push / Pull / Sync / Fetch

**Push**

- Trigger: "Push" button (up arrow).
  ContractRef: UICommand:cmd.git.push, Invariant:INV-011
- Required inputs: none when tracking remote exists. When no tracking remote is configured,
  a prompt MUST appear asking the user to select or enter a remote name and branch; default
  remote: `origin`, default branch: current branch name.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Success state: branch badge updates to `up to date`; no modal shown.
  ContractRef: PolicyRule:Decision_Policy.md§2

**Pull**

- Trigger: "Pull" button (down arrow).
  ContractRef: UICommand:cmd.git.pull, Invariant:INV-011
- Pull strategy: **rebase** (default). User MAY change to **merge** via a setting persisted
  in redb under `git_panel/pull_strategy/{project_id}` with values `rebase` or `merge`.
  ContractRef: ConfigKey:git_panel/pull_strategy, PolicyRule:Decision_Policy.md§2, ContractName:Plans/storage-plan.md
- Success state: local branch updated; File Changes List refreshes.
  ContractRef: PolicyRule:Decision_Policy.md§2

**Sync**

- Trigger: "Sync" button (up + down arrows).
  ContractRef: UICommand:cmd.git.sync, Invariant:INV-011
- Behavior: Pull (using configured pull strategy) then Push, in that order.
  ContractRef: PolicyRule:Decision_Policy.md§2
- If Pull fails, Push MUST NOT be attempted; the Pull error MUST be shown.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

**Fetch**

- Trigger: "Fetch" button or automatic background fetch on panel focus.
  ContractRef: UICommand:cmd.git.fetch, Invariant:INV-011
- Behavior: fetches all remotes silently (no modal); on completion the tracking indicator
  in the status bar MUST update to reflect the new upstream state.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Automatic background fetch interval: every 5 minutes while the Git Panel is visible.
  Interval persisted in redb key `git_panel/fetch_interval_s/{project_id}` (default: 300).
  ContractRef: ConfigKey:git_panel/fetch_interval_s, PolicyRule:Decision_Policy.md§2

**Push / Pull / Sync error states (exhaustive)**

All errors MUST present a user-facing message and at least one resolution action.
No error state MUST be a dead end.

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

| Error | Display text | Action(s) |
|---|---|---|
| Auth expired | `Push failed: authentication required` | `Re-authenticate` (triggers device-code flow inline; see §B.1) |
| Remote unreachable | `Push failed: remote unreachable — <host>` | `Retry` |
| Merge conflict | `Pull failed: merge conflict in <N> file(s)` + conflicted file list | `Resolve in editor` (opens first conflict file) |
| Non-fast-forward | `Push failed: remote has changes — pull first` | `Pull` |
| No upstream set | `Push failed: no upstream configured` | `Set upstream` (triggers remote/branch prompt) |
| Permission denied (API) | `Push failed: permission denied on remote` | `Dismiss` |

ContractRef: EventType:auth.github.failed, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

#### Branch Create / Switch

- Trigger: branch name display in the status bar (clickable); opens branch switcher.
  ContractRef: UICommand:cmd.git.branch_switch, Invariant:INV-011
- Branch switcher: searchable dropdown listing local branches first, then remote branches
  (alphabetical within each group). MUST support keyboard navigation.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- **New branch** option: pinned at the top of the dropdown; prompts for a branch name in
  an inline text field within the dropdown.
  ContractRef: UICommand:cmd.git.branch_create, Invariant:INV-011
- Branch name validation (deterministic, checked on input):
  - MUST reject names containing: space, `~`, `^`, `:`, `?`, `*`, `[`, `\`, `..`, `@{`.
    ContractRef: PolicyRule:Decision_Policy.md§2
  - MUST warn (non-blocking, yellow badge) if a branch with that name already exists
    locally.
    ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- **Switch with uncommitted changes:** when the working tree is dirty, Puppet Master MUST
  show a modal with three deterministic options: `Stash & Switch`, `Discard & Switch`,
  `Cancel`. Default focus: `Cancel`.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- After switch: File Changes List and Diff Preview Panel MUST reset to the new branch's
  state; the status bar MUST update within one render cycle.
  ContractRef: PolicyRule:Decision_Policy.md§2
- **Remote branch switch:** when the user selects a remote-only branch (e.g.
  `origin/feature-x`), Puppet Master MUST offer to create a local tracking branch
  (`feature-x` tracking `origin/feature-x`); default: accept and create.
  ContractRef: PolicyRule:Decision_Policy.md§2

---

#### Stash

> **MVP scope note:** Stash is included in the MVP Git Panel. Deterministic defaults are
> specified below; no open questions remain.
> ContractRef: PolicyRule:Decision_Policy.md§2

- **Stash button:** visible in the Git Panel header. Stashes all uncommitted changes
  (staged and unstaged) with an auto-generated message `Puppet Master auto-stash
  <timestamp-ISO8601>`.
  ContractRef: UICommand:cmd.git.stash_push, PolicyRule:Decision_Policy.md§2, Invariant:INV-011
- **Stash list:** accessible via "Stash ▾" dropdown showing stash entries as
  `stash@{N}: <message>` (newest first).
  ContractRef: UICommand:cmd.git.stash_list, Invariant:INV-011
- **Pop stash:** apply the selected stash entry and drop it from the stash list. If the
  apply produces a conflict, leave the stash entry in place and show
  `Stash pop failed: conflict in <N> file(s)` with the conflicted file list and a
  `Resolve in editor` action.
  ContractRef: UICommand:cmd.git.stash_pop, PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### A.5 Status Badges & Error States

All error states in the Git Panel MUST follow these display rules:

ContractRef: Invariant:INV-003, PolicyRule:Decision_Policy.md§2

| Badge | Icon | Panel header display | Resolution action |
|---|---|---|---|
| `auth-expired` | 🔒 (red) | `Auth expired — re-authenticate` | Inline `Re-authenticate` link → device-code flow (§B.1) |
| `remote-unreachable` | ⚠ (yellow) | `Remote unreachable · <host>` | `Retry fetch` button |
| `merge-conflict` | ✕ (red) | `<N> conflict(s) — resolve before committing` | `Open first conflict` button |
| `detached-head` | ⎇ (orange) | `Detached HEAD · <7-char SHA>` | `Create branch here` link |
| `clean` | ✓ (green) | *(no banner; status bar only)* | N/A |
| `changes` | ● (blue) | *(no banner; file count in status bar)* | N/A |

**Hard rules:**

- Every error state MUST have at least one displayed action that leads toward resolution.
  MUST NOT show an error with only a dismiss/close option if a recovery path exists.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- Error messages MUST include the specific reason or file count; vague messages such as
  "something went wrong" are PROHIBITED.
  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/DRY_Rules.md#4
- Badge precedence (highest wins, shown simultaneously in header only when distinct
  panels are affected): `merge-conflict` > `auth-expired` > `remote-unreachable` >
  `detached-head` > `changes` > `clean`.
  ContractRef: PolicyRule:Decision_Policy.md§2

---

## B. GitHub API Integration

GitHub API is used for hosting operations only (repository management, PR, Issues,
Actions). All local repository content operations use the local `git` binary.

ContractRef: Invariant:INV-008, ContractName:Plans/GitHub_API_Auth_and_Flows.md, SchemaID:Spec_Lock.json#github_operations

> **DRY boundary:** Auth flows, token storage rules, polling semantics, API request
> envelope, and failure kinds are SSOT in `Plans/GitHub_API_Auth_and_Flows.md`.
> This section specifies only the IDE UX layer that sits on top of those contracts.

---

### B.1 Authentication (IDE UX Layer)

Authentication behavior for the `github_api` realm is defined canonically in
`Plans/GitHub_API_Auth_and_Flows.md`. This section specifies only the Git Panel UX binding.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, SchemaID:Spec_Lock.json#auth_model

- The Git Panel MUST display the auth realm `github_api` (NEVER `copilot_github`) in all
  auth-related UI elements.
  ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md#auth-realm-split, SchemaID:Spec_Lock.json#github_operations
- When the `auth-expired` badge is active, the panel header MUST show an inline
  `Re-authenticate` link that dispatches `UICommand:cmd.github.connect` without opening
  a modal dialog. The device-code auth flow MUST render inline within the Git Panel.
  ContractRef: UICommand:cmd.github.connect, Invariant:INV-011, ContractName:Plans/GitHub_API_Auth_and_Flows.md
- Tokens MUST be stored in the OS credential store only — NEVER in seglog, redb, Tantivy,
  or any plaintext file. This rule is non-negotiable and applies throughout this document.
  ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002
- The Git Panel MUST NOT show `github_api` token values anywhere in its UI; token
  fingerprint (short hash prefix, display-only) MAY be shown for identity confirmation.
  ContractRef: PolicyRule:redaction, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

### B.2 PR & Issues Panel

> **MVP scope (conditional surface):** PR and Issues capabilities are included in MVP, but
> each panel is shown only when the repository is GitHub-linked and the `github_api` realm
> is authenticated. Otherwise the panel renders a deterministic disabled state with recovery
> actions (no background API fetch attempts while disabled).
> ContractRef: PolicyRule:Decision_Policy.md§2

**Disabled-state behavior (deterministic):**

- Condition: repository has no GitHub remote or has not been linked in project settings.
  Display: `Repository not linked to GitHub`. Primary action: `Link repository`.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- Condition: repository linked but `github_api` auth is missing/expired.
  Display: `GitHub authentication required`. Primary action: `Connect GitHub` (device-code flow).
  ContractRef: UICommand:cmd.github.connect, ContractName:Plans/GitHub_API_Auth_and_Flows.md
- Per-project feature toggles are persisted in redb key
  `github_panel/features/{project_id}` with schema `{ pr: boolean, issues: boolean }`.
  Default is `{ pr: true, issues: true }`. Disabled features hide their panel and show
  `Feature disabled in project settings` with action `Enable in settings`.
  ContractRef: ConfigKey:github_panel/features, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2

#### Pull Request panel

- Displays open PRs for the current repository.
  ContractRef: UICommand:cmd.github.pr_list, Invariant:INV-011
- Columns per PR: title, author, draft flag, review status
  (`approved` / `changes-requested` / `pending`), CI status.
  ContractRef: PolicyRule:Decision_Policy.md§2
- PR detail view (on click): description (body), review status summary, CI run status.
  ContractRef: UICommand:cmd.github.pr_detail, Invariant:INV-011
- **Create PR** action:
  - Pre-fills title from the last commit message on the current branch.
    ContractRef: PolicyRule:Decision_Policy.md§2
  - Pre-fills body by concatenating commit messages since the branch diverged from base.
    ContractRef: PolicyRule:Decision_Policy.md§2
  - Pre-fills target branch from the configured `base_branch` (redb key
    `git_panel/base_branch/{project_id}`; default: `main`).
    ContractRef: ConfigKey:git_panel/base_branch, PolicyRule:Decision_Policy.md§2
  - Uses `POST /repos/{owner}/{repo}/pulls` (canonical: `Plans/GitHub_API_Auth_and_Flows.md §E`).
    ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, SchemaID:Spec_Lock.json#github_operations

**Error states (PR panel, exhaustive for list/detail/create):**

| Error | Display text | Action(s) |
|---|---|---|
| Auth expired | `GitHub auth expired — reconnect to load pull requests` | `Reconnect GitHub` |
| Missing scopes / permission denied | `Missing GitHub permissions for pull requests` | `Reconnect with required permissions`, `Open auth details` |
| API rate limited | `GitHub API rate limit reached — retry after <HH:MM:SS>` | `Retry` (enabled after reset time) |
| Network/unreachable | `Unable to reach GitHub while loading pull requests` | `Retry`, `Open Git panel` |
| Repository unavailable (404/410) | `Repository not available on GitHub` | `Relink repository`, `Refresh repository metadata` |
| PR create validation failed (422) | `Cannot create pull request: <validation message>` | `Edit title/body/base`, `Retry` |
| PR already exists for head/base | `A pull request already exists for this branch pair` | `Open existing PR`, `Change base branch` |

ContractRef: Invariant:INV-003, PolicyRule:Decision_Policy.md§2, ContractName:Plans/GitHub_API_Auth_and_Flows.md

#### Issues panel

- Displays open issues for the current repository: title, labels (colored chips), assignee.
  ContractRef: UICommand:cmd.github.issue_list, Invariant:INV-011

**Error states (Issues panel, exhaustive for list fetch):**

| Error | Display text | Action(s) |
|---|---|---|
| Auth expired | `GitHub auth expired — reconnect to load issues` | `Reconnect GitHub` |
| API rate limited | `GitHub API rate limit reached — retry after <HH:MM:SS>` | `Retry` (enabled after reset time) |
| Repository not linked | `Repository is not linked to GitHub` | `Link repository` |
| Network/unreachable | `Unable to reach GitHub while loading issues` | `Retry` |
| API error (non-rate-limit) | `Unable to load issues: <status> — <message>` | `Retry`, `Open diagnostics` |

ContractRef: Invariant:INV-003, PolicyRule:Decision_Policy.md§2, ContractName:Plans/GitHub_API_Auth_and_Flows.md

#### Caching and rate limits

- Both panels MUST lazy-load data via GitHub REST API.
  ContractRef: SchemaID:Spec_Lock.json#github_operations
- Responses MUST be cached in redb with a TTL of 60 seconds. Cached data MUST be shown
  immediately while a background refresh is in flight.
  ContractRef: ConfigKey:github_panel/cache_ttl_s, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2
- On API rate limit (`X-RateLimit-Remaining: 0`): show `API rate limit reached — retry
  after <HH:MM:SS>` with a `Retry` button that becomes active after the reset time.
  ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, EventType:auth.github.failed

---

### B.3 GitHub Actions Panel

The GitHub Actions Panel surfaces workflow runs for the current repository and supports
triggering `workflow_dispatch` workflows.

ContractRef: UICommand:cmd.github.actions_list, Invariant:INV-011

#### Workflow runs list

- Columns (all REQUIRED): workflow name, branch, run status, duration, triggered-by,
  timestamp (relative + absolute on hover).
  ContractRef: PolicyRule:Decision_Policy.md§2
- Run status icons with semantic color (deterministic mapping, no ambiguous states):
  ContractRef: PolicyRule:Decision_Policy.md§2

  | Status | Icon | Color |
  |---|---|---|
  | `queued` | ○ | grey |
  | `in_progress` | ◑ (spinning) | yellow |
  | `success` | ✓ | green |
  | `failure` | ✕ | red |
  | `cancelled` | ⊘ | grey |

- Click run → opens run detail view (§B.3 workflow run detail).
  ContractRef: UICommand:cmd.github.actions_run_detail, Invariant:INV-011

#### Workflow run detail

- Job list with status icon per job (same semantic color table as above).
  ContractRef: PolicyRule:Decision_Policy.md§2
- Expand job → step list with status icon and duration per step.
  ContractRef: UICommand:cmd.github.actions_job_expand, Invariant:INV-011
- **Run/log summary strip (REQUIRED):** visible at top of run detail and always includes:
  (1) run status, (2) run conclusion, (3) run duration, (4) failed job count,
  (5) log truncation state (`complete` or `truncated`), and (6) last log timestamp.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
  - Run status + conclusion are sourced from workflow run payload fields (`status`,
    `conclusion`).
    ContractRef: SchemaID:Spec_Lock.json#github_operations
  - Run duration is computed from `run_started_at` to `updated_at` and shown as
    `MM:SS` for <1h and `HH:MM:SS` for >=1h.
    ContractRef: PolicyRule:Decision_Policy.md§2
  - Failed job count is computed from job entries whose terminal conclusion is failure-like.
    ContractRef: PolicyRule:Decision_Policy.md§2
  - Last log timestamp is parsed from the latest timestamped log line when present;
    otherwise fallback to run `updated_at`.
    ContractRef: PolicyRule:Decision_Policy.md§2
- **View logs:** fetches and displays the last 200 lines of the job log.
  ContractRef: UICommand:cmd.github.actions_view_logs, Invariant:INV-011
  - Log viewer MUST use monospace font; ANSI escape codes MUST be stripped before display;
    viewer MUST support text search (Ctrl+F / Cmd+F).
    ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- **Download full log:** downloads the complete log archive via GitHub API and saves to
  the user's OS Downloads folder; shows a toast on completion.
  ContractRef: UICommand:cmd.github.actions_download_log, Invariant:INV-011

#### Trigger workflow (`workflow_dispatch`)

- The "Run workflow" button MUST be shown only for workflows whose YAML defines a
  `workflow_dispatch` trigger. MUST NOT be shown for other trigger types.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- If the workflow defines inputs, each input MUST be rendered as a form field (text,
  boolean toggle, or select) matching the input's type as declared in the YAML.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Submit dispatches `POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches` via the
  GitHub API (realm: `github_api`).
  ContractRef: SchemaID:Spec_Lock.json#github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md
- Success: show `Workflow triggered — run will appear shortly` toast; auto-refresh list.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Error — HTTP 403: show `Permission denied: you do not have Actions write access`.
  ContractRef: Invariant:INV-003, PolicyRule:Decision_Policy.md§2
- Error — HTTP 422: show the validation error message from the API response body verbatim
  (truncated to 200 characters; `Show full error` expands inline).
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

#### Auto-refresh

- The workflow runs list MUST auto-refresh every 30 seconds while the Actions Panel is
  visible. Refresh MUST be silently cancelled when the panel is hidden.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Refresh interval MUST be persisted in redb under key
  `github_actions/refresh_interval_s` (default: `30`; minimum: `10`; maximum: `300`).
  ContractRef: ConfigKey:github_actions/refresh_interval_s, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2
- Retry on refresh failure: bounded to 3 consecutive attempts with exponential back-off
  starting at 5 seconds. After 3 failures, show `Actions refresh failed — <reason>` with
  a `Retry now` button; auto-retry stops until the user retries or the panel is closed.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

**Actions panel failure states (exhaustive for list/detail/log flows):**

| Error | Display text | Action(s) |
|---|---|---|
| Run list fetch auth failure (401/403) | `Cannot load workflow runs: authentication required` | `Reconnect GitHub`, `Retry` |
| Run list rate limited | `GitHub API rate limit reached — retry after <HH:MM:SS>` | `Retry` (enabled after reset) |
| Run detail unavailable (404) | `Workflow run not found or no longer available` | `Refresh run list` |
| Job detail fetch failure | `Unable to load job details: <status> — <message>` | `Retry`, `Open workflow in browser` |
| Log tail fetch failed | `Unable to load log tail for job <id>` | `Retry`, `Download full log` |
| Full log download permission failure (403) | `Permission denied: cannot download workflow logs` | `Reconnect GitHub`, `Open run in browser` |
| Full log download missing/expired (404/410) | `Log archive unavailable for this run` | `Retry`, `Refresh run list` |
| Full log redirect/download network failure | `Log download failed: network error` | `Retry download` |
| Workflow dispatch permission failure (403) | `Permission denied: you do not have Actions write access` | `Reconnect GitHub`, `Dismiss` |
| Workflow dispatch validation failure (422) | `Workflow dispatch rejected: <validation message>` | `Edit inputs`, `Retry` |

ContractRef: Invariant:INV-003, PolicyRule:Decision_Policy.md§2, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

## C. SSH Remote Dev Servers

Puppet Master supports running projects on remote servers accessed via SSH. When a
project is configured for a remote, all Git operations, file browsing, and agent execution
occur on the remote machine; the Puppet Master UI runs locally.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/WorktreeGitImprovement.md

---

### C.1 Adding an SSH Target

**Entry point:** Settings → SSH Remotes → "Add Remote"

This flow MUST NOT require the Chain Wizard.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

**GUI flow (sequential steps, no branching ambiguity):**

**Step 1 — Required fields (all REQUIRED; form MUST NOT advance until all are valid):**

| Field | Type | Validation | Default |
|---|---|---|---|
| Host | text | Valid hostname or IP address | *(none)* |
| User | text | Non-empty, no whitespace | *(none)* |
| Auth method | select | `ssh_key` or `ssh_agent` | `ssh_key` |
| Remote folder | text | Absolute path (starts with `/`) | *(none)* |
| Nickname | text | Non-empty; auto-suggested as `user@host` | `user@host` |

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 2 — Optional fields:**

| Field | Type | Default |
|---|---|---|
| SSH port | integer | `22` |
| Proxy jump host | text | *(empty = no jump)* |

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 3 — Auth method detail (conditional on Step 1 auth method selection):**

- `ssh_key` selected: show a key-file picker listing key files found in `~/.ssh/` (files
  matching `id_*`, `*.pem`, `*.key`); user may also browse for any file. MUST NOT require
  the user to enter a passphrase here; the OS SSH agent or OS keychain handles passphrases.
  ContractRef: PolicyRule:no_secrets_in_storage, Invariant:INV-002
- `ssh_agent` selected: no additional input required; Puppet Master uses the running SSH
  agent (`$SSH_AUTH_SOCK`).
  ContractRef: PolicyRule:Decision_Policy.md§2

**Step 4 — Validation:**

Puppet Master MUST attempt a validation connection before saving. The connection test MUST
execute: `ssh -q -o BatchMode=yes -o ConnectTimeout=10 [-p <port>] [-J <jump>] <user>@<host> exit`.

ContractRef: PolicyRule:Decision_Policy.md§2

Validation MUST report one of the following deterministic outcomes:

| Outcome | Display text | Action(s) |
|---|---|---|
| Success | `Connection successful — remote is reachable` | `Save` |
| Connection refused | `Port closed or SSH not running on host` | `Back`, `Retry` |
| Auth failed | `Auth failed — check key or user` | `Back`, `Retry` |
| Host key mismatch | `Host key changed — verify and accept or reject` | `Accept` (saves key), `Reject` (cancels) |
| Timeout | `Connection timed out` | `Back`, `Retry` |

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

- The `Accept` action for host key mismatch MUST present the new key fingerprint for user
  review before accepting. MUST NOT auto-accept changed host keys.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

**Step 5 — Save:**

On successful validation, the SSH remote MUST be saved to redb under the key
`ssh_remotes/{id}` where `{id}` is a stable UUID generated at save time.

ContractRef: ConfigKey:ssh_remotes, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2

The saved record MUST contain: `id`, `nickname`, `host`, `port`, `user`, `auth_method`,
`key_path` (if `ssh_key`), `remote_folder`, `jump_host` (if set). MUST NOT contain
passphrases or private key content.

ContractRef: PolicyRule:no_secrets_in_storage, Invariant:INV-002

---

### C.2 Managing SSH Targets

**Entry point:** Settings → SSH Remotes

- The SSH Remotes settings page MUST list all saved remotes as a table with columns:
  Nickname, Host, User, Status badge.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- Status badge per remote (deterministic set):
  ContractRef: PolicyRule:Decision_Policy.md§2

  | Badge | Display | Condition |
  |---|---|---|
  | `connected` | ✓ Connected | Last test or active session succeeded |
  | `disconnected` | ○ Disconnected | Not tested; or session ended cleanly |
  | `error` | ✕ Error · <reason> | Last test or session failed |

- Per-remote actions (right-click or row action menu): `Edit`, `Remove`, `Test connection`,
  `Set as active`.
  ContractRef: UICommand:cmd.ssh.remote_edit, UICommand:cmd.ssh.remote_remove, UICommand:cmd.ssh.remote_test, UICommand:cmd.ssh.remote_set_active, Invariant:INV-011
- **Test connection:** re-runs the validation check from §C.1 Step 4 and updates the
  status badge with the result. MUST complete within 15 seconds; on timeout, show
  `Connection timed out` with `Retry`.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- **Remove:** prompts `Remove remote "<nickname>"? This will not affect the remote server.`
  with `Remove` (confirm) and `Cancel`. MUST NOT remove any files from the remote.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### C.3 Remote Project Context

When a project is configured to use an SSH remote, the following rules MUST apply:

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2

**Git Panel:**

- The status bar working folder MUST display `user@host:remote/path`.
  ContractRef: PolicyRule:Decision_Policy.md§2
- All `git` commands MUST be executed on the remote via SSH subprocess:
  `ssh [-p <port>] [-J <jump>] <user>@<host> "cd <remote_folder> && git <args>"`.
  MUST NOT run `git` locally for remote-mode projects.
  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/WorktreeGitImprovement.md

**File Manager:**

- The file tree MUST show the remote filesystem. File listing MUST use SFTP or an
  SSH `find`/`ls` pipeline; the choice is implementation-defined (deterministic default:
  SFTP when available, SSH pipeline as fallback).
  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/FileManager.md
- File edits MUST be applied on the remote (write via SFTP or heredoc over SSH).
  MUST NOT create a local checkout for remote-mode projects.
  ContractRef: PolicyRule:Decision_Policy.md§2

**Terminal:**

- The local terminal tab MUST open an SSH session to the remote; no local shell MUST be
  opened for remote-mode projects.
  ContractRef: PolicyRule:Decision_Policy.md§2

**Agents and execution:**

- Puppet Master agents MUST run on the remote machine, not locally, in remote mode.
  ContractRef: PolicyRule:Decision_Policy.md§2

---

### C.4 Tool & Provider Execution on Remote

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2

- **Git operations:** run via SSH command on remote as specified in §C.3.
  ContractRef: ContractName:Plans/WorktreeGitImprovement.md
- **File browsing:** SFTP or SSH `find`/`ls` pipeline (deterministic default: SFTP when
  available; SSH pipeline as fallback).
  ContractRef: PolicyRule:Decision_Policy.md§2
- **AI provider CLIs:** MUST be installed on the remote machine. Puppet Master MUST invoke
  them via SSH subprocess and MUST stream stdout/stderr back over SSH to the local UI in
  real time.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Error — provider CLI not found on remote: show
  `Provider CLI not found on remote — install <provider_name> on <host>` with a `Dismiss`
  action. MUST NOT attempt to install the CLI automatically without explicit user consent.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- Error — SSH session drops mid-run: show `SSH session lost — reconnecting…` and
  auto-retry the connection once (bounded: 1 auto-retry, then show `Reconnect` button for
  manual retry). MUST NOT silently swallow the disconnect.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

## D. Project Management Flows (No Chain Wizard Required)

All three flows below MUST:

(a) Not require the Chain Wizard to complete.
(b) Offer a `Run Chain Wizard later` button on the finish screen that links to the Chain
    Wizard with the new project context pre-loaded.
(c) Provide full error handling — no dead ends; every error state has a resolution action.
(d) Be accessible from both the app's main **File** menu and the **Dashboard**.

The `Run Chain Wizard later` button dispatches **`UICommand:cmd.project.chain_wizard_open_deferred`**. The command payload MUST contain, at minimum: `project_id`, `wizard_id`, `default_intent`, `project_path`, optional `remote_repo_ref`, and optional `deferred_wizard_payload_ref`. It opens the wizard at the preloaded Project Setup review state instead of a blank intent picker.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

---

### D.1 Add Existing Project

**Entry points:**
- File menu → `Add Existing Project`
- Dashboard → `Add Project` button

ContractRef: UICommand:cmd.project.add_existing, Invariant:INV-011

**Steps (sequential; no branching ambiguity):**

**Step 1 — Select folder:**

- Option A: native OS folder picker (for local projects).
  ContractRef: PolicyRule:Decision_Policy.md§2
- Option B: `From SSH Remote` — user selects a saved SSH target (§C.2) and enters or
  browses to the remote path. Requires at least one saved SSH remote; if none exist, show
  `No SSH remotes configured — Add one in Settings → SSH Remotes` with a direct link.
  ContractRef: UICommand:cmd.ssh.remote_add, PolicyRule:Decision_Policy.md§2, Invariant:INV-003

**Step 2 — Detect:**

Puppet Master MUST automatically detect:

- Presence of `.git` directory (git repo vs. plain folder).
  ContractRef: ContractName:Plans/WorktreeGitImprovement.md
- Language/framework via file heuristics (deterministic priority order):

  | File present | Detected language |
  |---|---|
  | `Cargo.toml` | Rust |
  | `package.json` | Node.js |
  | `pyproject.toml` / `setup.py` / `requirements.txt` | Python |
  | `go.mod` | Go |
  | `pom.xml` / `build.gradle` | Java/JVM |
  | `*.csproj` / `*.sln` | C# / .NET |
  | *(none matched)* | `Unknown` |

  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/FileManager.md#11

**Step 3 — Review:**

Show detected info as an editable summary:

- Repository remote URL (if any; read-only display).
- Current branch (if git repo).
- Detected language (read-only display).
- **Project name** (text field; pre-filled from folder basename; user-editable; validated:
  non-empty, no special chars, not a duplicate in the project list).
  ContractRef: PolicyRule:Decision_Policy.md§2

**Step 4 — GitHub link (optional):**

If the project has a GitHub remote (`origin` URL contains `github.com`), Puppet Master
MUST offer: `Link to GitHub — authorize Puppet Master to access this repo's GitHub
features (PR, Issues, Actions)`. User may skip.

ContractRef: PolicyRule:Decision_Policy.md§2

If the user accepts and is not yet authenticated in realm `github_api`, the device-code
flow MUST launch inline (no modal). Canonical auth flow: `Plans/GitHub_API_Auth_and_Flows.md`.

ContractRef: UICommand:cmd.github.connect, ContractName:Plans/GitHub_API_Auth_and_Flows.md

**Step 5 — Finish:**

- Project is added to the project list and immediately opened in the File Manager and
  editor.
  ContractRef: UICommand:cmd.project.open, ContractName:Plans/FileManager.md
- Finish screen MUST display a `Run Chain Wizard later` button.
  ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

**Error states (exhaustive):**

| Error | Display | Action(s) |
|---|---|---|
| Folder not readable | `Cannot access folder: <reason>` | `Choose different folder`, `Cancel` |
| Folder has no git repo | `No Git repository found — add as plain folder?` | `Add as plain folder`, `Cancel` |
| Duplicate project name | `A project named "<name>" already exists — choose another name` | Back to Step 3 |
| SSH remote unreachable | `SSH remote unreachable — <host>: <reason>` | `Retry`, `Choose different remote`, `Cancel` |

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### D.2 Create New Local Project

**Entry points:**
- File menu → `New Project` → `Local Only`
- Dashboard → `New Project` button

ContractRef: UICommand:cmd.project.new_local, Invariant:INV-011

**Steps (sequential):**

**Step 1 — Project name:**

Text input (required). Validation rules (checked live on input):

- MUST NOT be empty.
- MUST NOT contain: `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`.
- MUST NOT duplicate an existing project name (case-insensitive).
- If valid: green ✓ indicator. If invalid: red ✕ with inline error text.

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

**Step 2 — Location:**

OS folder picker for the parent directory. Puppet Master MUST create a subdirectory
`<parent>/<project_name>/` on finish. Preview of the full path MUST be shown below the
picker as the user types the project name.

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 3 — Initialize git:**

Toggle labeled `Initialize Git repository` (default: **on**). When on: `git init` and an
initial commit (`Initial commit` message, empty except for `.gitignore` if a preset is
selected) are run on finish.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/WorktreeGitImprovement.md

**Step 4 — Language/framework preset (optional):**

Dropdown of supported presets (same list as `Plans/FileManager.md §11`). Selecting a
preset may prompt a tool download on project open (non-blocking; download in background).
Default selection: `None`.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/FileManager.md#11

**Step 5 — Finish:**

- Project directory created; `git init` and initial commit run (if toggle on).
- Project opened in File Manager and editor.
- Finish screen MUST display a `Run Chain Wizard later` button.
  ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

**Error states (exhaustive):**

| Error | Display | Action(s) |
|---|---|---|
| Folder already exists | `Folder "<path>" already exists — use existing folder or choose a different name?` | `Use existing folder`, `Choose different name`, `Cancel` |
| Cannot create directory | `Failed to create project folder: <reason>` | `Retry`, `Cancel` |
| git init failed | `Git initialization failed: <reason> — continue without Git?` | `Continue without Git`, `Cancel` |

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### D.3 Create New GitHub Repo + Project

**Entry points:**
- File menu → `New Project` → `New GitHub Repo`
- Dashboard → `New Project` → `On GitHub`

ContractRef: UICommand:cmd.project.new_github_repo, Invariant:INV-011

**Prerequisite:** `github_api` realm auth. If not authenticated, Step 1 triggers the
inline auth widget before presenting the form.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, SchemaID:Spec_Lock.json#auth_model

**Steps (sequential):**

**Step 1 — Auth check:**

If the user is not authenticated in realm `github_api`, Puppet Master MUST show an inline
`GitHub sign-in required` widget using the device-code flow
(`UICommand:cmd.github.connect`). The form fields for Step 2 MUST NOT be shown until auth
is confirmed. If the user cancels auth, the entire flow exits with `Cancel`.

ContractRef: UICommand:cmd.github.connect, ContractName:Plans/GitHub_API_Auth_and_Flows.md, PolicyRule:Decision_Policy.md§2

**Step 2 — Repo settings:**

| Field | Type | Required | Validation | Default |
|---|---|---|---|---|
| Repository name | text | Yes | GitHub naming rules: alphanumeric, `-`, `_`; max 100 chars; no spaces | *(none)* |
| Description | text | No | Max 255 chars | *(empty)* |
| Visibility | select | Yes | `Public` or `Private` | `Private` |
| Initialize with README | toggle | — | — | On |
| .gitignore template | select | No | List from GitHub API `GET /gitignore/templates` | *(None)* |
| License | select | No | List from GitHub API `GET /licenses` | *(None)* |

ContractRef: SchemaID:Spec_Lock.json#github_operations, PolicyRule:Decision_Policy.md§2

**Step 3 — Local clone location:**

OS folder picker for where to clone the new repository locally.

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 4 — Preview:**

Show summary of all selections before creating. No action is taken on the remote until
the user confirms.

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 5 — Create:**

1. POST to `POST /user/repos` with the settings from Step 2.
   ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md#C, SchemaID:Spec_Lock.json#github_operations
2. On success, run `git clone <clone_url> <local_path>` using the local `git` binary.
   ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, Primitive:PatchPipeline

**Step 6 — Finish:**

- Project added to project list; opened in File Manager and editor.
- Finish screen MUST display a `Run Chain Wizard later` button.
  ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

**Error states (exhaustive):**

| Error | Display | Action(s) |
|---|---|---|
| Repo name already taken on GitHub | `Repository name "<name>" is already taken on GitHub — choose another` | Back to Step 2 |
| API auth failed mid-flow | `GitHub authentication failed — sign in again` | Back to Step 1 |
| Clone failed | `Clone failed: <reason>` | `Retry clone`, `Open folder anyway` (without git), `Cancel` |
| API error (non-name-conflict) | `GitHub API error: <status> — <message>` | `Retry`, `Cancel` |
| Local clone path not writable | `Cannot write to <path>: <reason>` | `Choose different location`, `Cancel` |

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

## E. UI Command IDs Reserved by This Document

All new UICommand IDs defined by this spec MUST be added to `Plans/UI_Command_Catalog.md`
before implementation. IDs inherited from the existing catalog are marked *(existing)*.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, Invariant:INV-007, Invariant:INV-012

| Command ID | Section | Args schema (keys only) | Expected events / notes |
|---|---|---|---|
| `cmd.github.connect` | §B.1, §D.1, §D.3 | `{}` | *(existing)* device-code flow |
| `cmd.github.disconnect` | §B.1 | `{}` | *(existing)* token removal |
| `cmd.git.stage` | §A.2, §A.4 | `{ paths: string[] }` | no persisted domain event (index update) |
| `cmd.git.unstage` | §A.2, §A.4 | `{ paths: string[] }` | no persisted domain event (index update) |
| `cmd.git.discard` | §A.2 | `{ paths: string[] }` | no persisted domain event (working-tree restore) |
| `cmd.git.diff_open` | §A.3 | `{ path: string }` | no persisted domain event (UI panel open) |
| `cmd.git.diff_toggle_mode` | §A.3 | `{ mode: "side_by_side" \| "unified" }` | no persisted domain event (UI state toggle) |
| `cmd.git.commit` | §A.4 | `{ message: string, body?: string, amend?: boolean }` | `git.commit.completed` |
| `cmd.git.push` | §A.4 | `{ remote?: string, branch?: string }` | `git.push.completed` or `git.push.failed` |
| `cmd.git.pull` | §A.4 | `{ strategy?: "rebase" \| "merge" }` | `git.pull.completed` or `git.pull.failed` |
| `cmd.git.sync` | §A.4 | `{}` | pull then push events |
| `cmd.git.fetch` | §A.4 | `{}` | no persisted domain event (remote ref update) |
| `cmd.git.branch_switch` | §A.4 | `{ branch: string, stash?: boolean, discard?: boolean }` | `git.branch.switched` |
| `cmd.git.branch_create` | §A.4 | `{ name: string, from?: string }` | `git.branch.created` |
| `cmd.git.stash_push` | §A.4 | `{ message?: string }` | `git.stash.pushed` |
| `cmd.git.stash_list` | §A.4 | `{}` | no persisted domain event (UI dropdown populate) |
| `cmd.git.stash_pop` | §A.4 | `{ index: integer }` | `git.stash.popped` or `git.stash.conflict` |
| `cmd.github.pr_list` | §B.2 | `{}` | no persisted domain event (API fetch + cache) |
| `cmd.github.pr_detail` | §B.2 | `{ pr_number: integer }` | no persisted domain event (API fetch + cache) |
| `cmd.github.issue_list` | §B.2 | `{}` | no persisted domain event (API fetch + cache) |
| `cmd.github.actions_list` | §B.3 | `{}` | no persisted domain event (API fetch + cache) |
| `cmd.github.actions_run_detail` | §B.3 | `{ run_id: integer }` | no persisted domain event (API fetch) |
| `cmd.github.actions_job_expand` | §B.3 | `{ job_id: integer }` | no persisted domain event (UI expand) |
| `cmd.github.actions_view_logs` | §B.3 | `{ job_id: integer }` | no persisted domain event (log fetch) |
| `cmd.github.actions_download_log` | §B.3 | `{ run_id: integer }` | no persisted domain event (file download) |
| `cmd.ssh.remote_add` | §C.1 | `{}` | `ssh.remote.added` |
| `cmd.ssh.remote_edit` | §C.2 | `{ id: string }` | `ssh.remote.updated` |
| `cmd.ssh.remote_remove` | §C.2 | `{ id: string }` | `ssh.remote.removed` |
| `cmd.ssh.remote_test` | §C.2 | `{ id: string }` | `ssh.remote.test_result` |
| `cmd.ssh.remote_set_active` | §C.2 | `{ id: string }` | `ssh.remote.active_changed` |
| `cmd.project.add_existing` | §D.1 | `{ path?: string, ssh_remote_id?: string, ssh_path?: string }` | `project.added` |
| `cmd.project.new_local` | §D.2 | `{ name: string, parent_path: string, init_git?: boolean, preset?: string }` | `project.created` |
| `cmd.project.new_github_repo` | §D.3 | `{ name: string, description?: string, private: boolean, ... }` | `project.created`, `git.clone.completed` |
| `cmd.project.open` | §D.1, §D.2, §D.3 | `{ project_id: string }` | no persisted domain event (navigation) |
| `cmd.project.chain_wizard_open_deferred` | §D.1, §D.2, §D.3 | `{ project_id: string, wizard_id: string, default_intent: string, project_path: string, remote_repo_ref?: object, deferred_wizard_payload_ref?: string }` | `wizard.opened`, `wizard.deferred_payload.loaded` |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, Invariant:INV-007, Invariant:INV-011, Invariant:INV-012, Gate:GATE-010

---

## F. redb Configuration Keys Reserved by This Document

All `ConfigKey` entries below MUST be registered in `Plans/storage-plan.md` before
implementation. All are stored in redb; NONE contain secrets.

ContractRef: ContractName:Plans/storage-plan.md, Invariant:INV-002, PolicyRule:no_secrets_in_storage

| Config key | Type | Default | Description |
|---|---|---|---|
| `git_panel/diff_view_mode/{project_id}` | string enum | `side_by_side` | Per-project diff view preference |
| `git_panel/pull_strategy/{project_id}` | string enum | `rebase` | Per-project pull strategy (`rebase` or `merge`) |
| `git_panel/fetch_interval_s/{project_id}` | integer | `300` | Background fetch interval in seconds (min: 60, max: 3600) |
| `git_panel/base_branch/{project_id}` | string | `main` | Default base branch for PR creation |
| `github_panel/cache_ttl_s` | integer | `60` | TTL for GitHub API panel cache (PR, Issues) |
| `github_panel/features/{project_id}` | JSON object | `{\"pr\":true,\"issues\":true}` | Per-project enable flags for PR and Issues panels |
| `github_actions/refresh_interval_s` | integer | `30` | Actions panel auto-refresh interval (min: 10, max: 300) |
| `ssh_remotes/{id}` | JSON object | *(n/a)* | Saved SSH remote record (no secrets) |

ContractRef: ConfigKey:git_panel/diff_view_mode, ConfigKey:git_panel/pull_strategy, ConfigKey:git_panel/fetch_interval_s, ConfigKey:git_panel/base_branch, ConfigKey:github_panel/cache_ttl_s, ConfigKey:github_panel/features, ConfigKey:github_actions/refresh_interval_s, ConfigKey:ssh_remotes

---

## Anti-Drift Compliance

> - All operational statements require `ContractRef:` annotations
>   (ContractRef: Plans/DRY_Rules.md, Plans/Progression_Gates.md#GATE-009).
> - Architecture invariants apply, especially secrets and naming
>   (ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010).
> - Ambiguity resolved deterministically via `Plans/Decision_Policy.md` §2
>   (ContractRef: PolicyRule:Decision_Policy.md§2).
> - GitHub API operations use `github_api` realm only; not `copilot_github`
>   (ContractRef: Plans/GitHub_API_Auth_and_Flows.md §auth-realm-split).
> - No `TBD`, `Open question`, or `ask later` language exists in this document
>   (ContractRef: ContractName:Plans/DRY_Rules.md#4).
> - All MUST/SHALL/REQUIRED/NEVER statements carry at least one `ContractRef:`
>   (ContractRef: ContractName:Plans/DRY_Rules.md#7).
> - UI commands are reserved in §E and MUST be added to `Plans/UI_Command_Catalog.md`
>   before implementation (ContractRef: Invariant:INV-007, Gate:GATE-010).

---

## References

- `Plans/Spec_Lock.json`
- `Plans/DRY_Rules.md`
- `Plans/Contracts_V0.md`
- `Plans/Glossary.md`
- `Plans/Decision_Policy.md`
- `Plans/Architecture_Invariants.md` — INV-002, INV-003, INV-004, INV-007, INV-008, INV-010, INV-011, INV-012
- `Plans/Progression_Gates.md` — GATE-003, GATE-009, GATE-010
- `Plans/GitHub_API_Auth_and_Flows.md` — canonical auth contract (device-code, polling, token storage, failure UX)
- `Plans/WorktreeGitImprovement.md` — Git/worktree implementation details and gap fixes
- `Plans/FileManager.md` — File Manager, IDE-style editor, language presets
- `Plans/chain-wizard-flexibility.md` — wizard/project intent-based flows
- `Plans/UI_Command_Catalog.md` — canonical UICommand IDs
- `Plans/storage-plan.md` — redb/seglog storage rules
- `Plans/Crosswalk.md` — primitive ownership boundaries
## Chat-driven external repo import (MVP)

Puppet Master Assistant Chat supports importing an external repository (typically a GitHub repo) into the **project workspace** when the user explicitly requests it (see `Plans/assistant-chat-design.md` §7.4).

### Requirements

- **Explicit user intent:** The assistant must not import repos opportunistically. Import occurs only when the user asks to pull a repo in for inspection or work.
- **Auth + API rule:** All GitHub HTTPS API calls (repo lookup, forks, PR metadata, archive URLs) MUST use `GitHubApiTool` (Plans/Tools.md). GitHub CLI (`gh`) remains forbidden for these operations.
- **Acquisition methods:** MVP supports:
  1. API-assisted resolution (GitHubApiTool resolves metadata/URLs) + clone/download
  2. Direct `git clone` over HTTPS via `bash` when permitted
- **Placement modes (user-selected):**
  - **new_project**: create a new project rooted at the imported repo
  - **add_workspace_root**: add the imported repo as an additional workspace root under the current project
  - **temporary_mount**: mount/import for read-only inspection without permanently expanding the project roots (still auditable)
- **Permissions:** Import must be governed by:
  - `repo.import` permission key (default ask),
  - network tool permissions (`webfetch`, `websearch`, `bash` as applicable),
  - `external_directory` constraints for destination paths,
  - domain/host allowlists for remote hosts (default ask).
- **Audit trail:** Import actions must be recorded as thread audit entries: source, destination, method used, and (when known) repo owner/name + default branch/commit.

ContractRef: ToolID:GitHubApiTool, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md
