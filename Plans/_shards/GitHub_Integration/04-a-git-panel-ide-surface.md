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

