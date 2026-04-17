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

The legacy heading remains for document continuity, but the canonical user-facing surface defined here is **Source Control**.

Source Control is Git-first and owns:
- working tree changes
- diff and compare workflows
- stage / unstage / discard / commit / amend
- fetch / pull / push / sync
- branch and stash workflows
- history and commit-detail browsing
- commit graph parity
- worktree inventory, lineage, and recovery

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md

### A.1 Source Control information architecture

Source Control MUST present these stable subviews as vertically stacked collapsible accordion sections (not horizontal tabs):

**Section order (top to bottom, fixed — not user-reorderable in MVP):**
1. `Changes`
2. `Worktrees`
3. `Branches / Stash`
4. `History`
5. `Graph`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

**Accordion behavior:**
- Section headers always visible, full panel width
- Click header to expand/collapse
- Multiple sections can be open simultaneously
- Header shows section name + item count badge (e.g. "Changes (3)", "Worktrees (2)")
- Expanded section content gets full panel width, scrolls independently within its region
- When total expanded content exceeds panel height, the accordion itself scrolls vertically (section headers stay in scroll flow, not pinned)

**Default open sections on first load:** Changes (expanded), all others collapsed.

**Persistence:** Section open/close state persisted in redb per project: `config:project:{pid}:source_control.accordion_state` — JSON object mapping section names to booleans. Section order is fixed; scroll position within sections is NOT persisted.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

**Minimum width:** Accordion layout must work at the Source Control panel's minimum width of 240px. Section headers truncate with ellipsis at small sizes; item count badges always visible.

**Keyboard navigation:** Tab between section headers. Enter/Space to toggle expand/collapse. Arrow keys move between headers. When expanded, Tab into content; Escape returns to header.

**Accessible labels:** Each section header: `accessible-role: button`, `accessible-label: "{section_name}, {item_count} items, {expanded|collapsed}"`.

**Two-level scroll model:** Each expanded section has a `max-height` constraint (e.g. 50% of panel height) with internal scroll. Outer container scrolls when total exceeds panel height. These are independent scroll regions.

### A.2 Changes

The `Changes` subview is the Source Control owner for day-to-day file mutation review.

It MUST present:
- unstaged files
- staged files
- untracked files
- conflicted files
- file-level diff entrypoints
- hunk-level Git actions
- conflict-review entrypoints

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

Default compare targets:

| Origin | Default compare target |
|---|---|
| unstaged file | `index <-> working tree` |
| staged file | `HEAD <-> index` |
| untracked file | `empty <-> working tree` |
| conflicted file | `base`, `ours`, `theirs`, `result` |

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

Rules:
- hunk stage/unstage/discard are Git mutations, not editor undo
- diff-local search is owned by the diff/review surface and MUST NOT be routed through project Search
- conflict review uses explicit base/ours/theirs/result context and structured resolution actions
- tree badges and editor markers consume Source Control projections but do not replace Source Control ownership

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md

### A.3 History and Graph
Source Control remains the Git/worktree owner surface.

Rules:
- History and Graph pivots that mention Orchestrator now point at `Plans/Orchestrator_Page.md#Source Control boundary` rather than the stale numbered anchor.
- Git lineage remains authoritative even when Orchestrator metadata is present.
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

The GitHub Actions surface is a distinct GitHub-hosted workflow/admin panel. It is not a sub-mode of Source Control.

Required stable subviews:
- `Current Branch`
- `Workflows`
- `Settings`

Panel-level rules:
- the panel consumes requested/effective runtime identity and account binding from the shared runtime contracts; it MUST NOT invent a GitHub-local auth badge schema
- every subview exposes freshness through the shared axes `freshness`, `health`, and `write_availability`
- mutating actions are offered only when `write_availability = writable`; degraded or stale states may remain inspectable but must disclose why writes are blocked
- workflow/job/admin receipts are durable and project-scoped even when the action occurs outside an orchestrator run
- the panel owns shell-level placement, focus, and summary disclosure; detailed workflow/admin payload schemas remain owned by GitHub/storage owner docs

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Current Branch

This subview shows workflow runs for the branch currently in scope for the selected repo/worktree context and supports latest-run state, rerun/cancel when permitted, failing-job drilldown, and direct pivots to the relevant compare/review surfaces.

**Current Branch precedence:**
1. bound worktree branch for the focused repo/worktree
2. repo active branch from Source Control when no explicit worktree focus exists
3. last explicit Actions branch selection if still valid, labeled `historical_selection`

**Required refresh triggers:**
- workflow run/status events from GitHub
- push, pull, fetch, or HEAD advance for the in-scope repo/worktree
- worktree switch, bind, unbind, or branch retarget
- explicit refresh
- auth/account switch that changes the effective GitHub identity
- rerun, cancel, or `workflow_dispatch` completion

**Freshness rules:**
- `current` — panel data is known to reflect current host state
- `refreshing` — a refresh is in progress; last successful projection remains visible
- `stale` — last successful projection is still readable, but mutating Actions are blocked until revalidated
- stale labels MUST name the stale reason when known (for example auth drift, host disconnect, branch retarget, or refresh backlog)

**Identity/routing rules:**
- pivots from Actions into diff/review/file/history preserve compare identity, compare origin, and the requested/effective GitHub identity snapshot captured for that workflow context
- Current Branch never silently reinterprets a historical workflow run as belonging to the newly active branch just because the repo selection changed

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

### Workflows

This subview owns:
- workflow list
- pin / unpin
- run history
- run, job, and step detail
- log tail and full-log download
- `workflow_dispatch` forms and validation
- refresh, backoff, and rate-limit behavior

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/storage-plan.md

### Settings

This subview owns in-app admin behavior for:
- repository secrets CRUD
- environment secrets CRUD
- variables CRUD
- environment inventory and selection
- explicit disabled states when auth, scope, or repo linkage is insufficient

Browser fallback is allowed only for unsupported edge cases; it is not the default contract.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Permissions_System.md

### Workflow authoring alignment

Workflow generation in Settings > Advanced must align with this live Actions surface.

Precedence rules:
- repository workflow YAML in the active repo/worktree becomes runtime truth immediately after save/apply
- generated workflow metadata, readiness checks, and required-secret suggestions remain advisory until that YAML is applied
- settings-side workflow authoring MUST deep-link back into GitHub Actions using stable repo/worktree/workflow identity rather than an ad hoc settings-only payload
- GitHub admin actions such as secret/variable/environment CRUD, workflow pinning, and readiness checks MUST emit durable project-scoped receipts even when they are not attached to an orchestrator run

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

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

A remote-mode project is a first-class project context bound to a remote host and remote path.

Remote-mode rules:
- file browsing, file mutation, git operations, terminal launches, search execution, Source Control projections, LSP execution, and provider-side project tools all run against the remote host context
- remote-mode projects MUST NOT silently fall back to local checkout, local git, local shell, local search, or local LSP execution
ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/storage-plan.md
- UI surfaces may retain stale snapshots while disconnected, but they must label `freshness`, `health`, and `write_availability` accurately and block new host-required mutations when the remote context is unavailable
- local acceleration caches are correctness aids only after remote verification; they are never the authority for remote identity or mutation success

**Remote identity contract:**
Every cross-surface handoff into GitHub/Source Control/FileManager carries, when applicable:
- `remote_project_ref`
- `host_ref`
- `repo_id`
- `worktree_id?`
- `path?`
- `compare_session_id?` / `compare_origin?`

**Remote-aware Open in Source Control semantics:**
- if remote repo/worktree/path identity is known, open navigates to that exact remote-scoped subject
- if only a historical receipt remains, open lands in a historical/stale view with reconnect/fetch actions instead of silently substituting a local checkout
- PM-mediated writes MUST stage the updated content into the remote-aware cache path before returning success so write-then-search freshness remains preserved even before watcher round-trips arrive

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

#### Remote Git project search cache

For remote Git projects, PM keeps a local bare-clone-backed search cache so regex grep stays mostly local while final correctness still reflects remote content.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Architecture_Invariants.md

1. **Local bare clone:** On project open, PM clones the remote repository into `.puppet-master/cache/r/{hash8}/git/`. Clone type follows project/global settings (full, shallow, partial). If the repository is reachable only from the remote network, PM streams a remote-initiated `git bundle` back to the local cache. If bare-clone setup fails for auth or topology reasons, PM falls back to the non-Git remote path.
2. **Submodules:** Bare clones do not support `--recurse-submodules`. PM parses `.gitmodules`, rejects paths containing `..`, clones each submodule into `.puppet-master/cache/r/{hash8}/git/m/{sub_hash8}/`, recurses to depth 5, treats removed submodules as deletions, and replaces clones when submodule URLs change.
   - **Path canonicalization security rule (general):** All paths received from `.gitmodules`, remote file-change notifications, dirty-staging writes, file watcher events, or any other inbound source are canonicalized and validated with `starts_with(project_root)` or `starts_with(cache_root)` before filesystem use. This applies to every inbound path source, not only submodule paths.
3. **Build reads:** The regex index builds from Git objects via `git cat-file --batch`; it never assumes a working tree exists in the bare clone.
4. **Verification path:** Candidate verification uses `git show {anchor_sha}:{path}` piped to ripgrep. Bare-clone results are never treated as authoritative without that verification pass.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

5. **Dirty staging and PM-mediated writes:**
   - Files <=1 MB arrive with content and are written immediately into `.puppet-master/cache/r/{hash8}/dirty/{relative_path}`.
   - Files >1 MB dirty-mark immediately, begin async prefetch, and may block up to 5 seconds before falling back to single-file SSH verification if prefetch is still incomplete.
   - PM-mediated writes MUST stage the updated content locally before returning success so write-then-grep freshness is preserved even before watcher round-trips arrive.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/Wiring_Matrix.md

6. **Fetch cadence and stale-snapshot rule:**
   - fetch on project open
   - fetch every 5 minutes after the previous fetch-plus-build cycle completes
   - fetch on explicit sync or pull actions
   - when HEAD advances, compute `git diff --name-only old_anchor..new_HEAD` and dirty-mark those paths before incremental rebuild starts
   - there is no stale-threshold disable rule; a stale-but-valid snapshot remains queryable while the refresh pipeline runs
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md

7. **Re-anchor, verification tolerance, and startup recovery:**
   - re-anchor merges staged dirty content into the rebuild before publication
   - staging and dirty records clear only after the new generation publishes, using generation-stamped clearing
   - startup recovery validates metadata, checksums, and anchor reachability before loading a snapshot; invalid or unreachable snapshots rebuild from current HEAD
   - per-file verification races are skip-and-continue conditions, not whole-query failures
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md

#### Remote non-Git project search cache

For non-Git remote projects, PM uses remote-build / local-query / remote-verify.

ContractRef: ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

1. **Remote indexer helper:** PM ships a standalone sparse-n-gram indexer binary for x86_64 and aarch64, detects architecture via `uname -m`, transfers the matching binary, integrity-checks it, and never executes binaries received from the remote host.
2. **Remote build:** The helper scans remote files locally on the remote host, computes the same blended frequency table as local builds, and emits `postings.bin`, `lookup.bin`, `file_map.bin`, `frequency_table.bin`, and `index_meta.json`.
3. **Local query + remote verify:** Queries use the local transferred snapshot, but verification runs over SSH only on candidate paths.
4. **Dirty-path correctness:** Locally tracked dirty paths remain part of remote verification until a rebuild has incorporated them. This rule closes the false-negative gap between change notification and rebuild completion.
5. **Rebuild triggers:** dirty-path threshold >1000 files, 30-minute periodic rebuild while the project stays open, or degraded-mode periodic full rebuild when watcher support is unavailable.
6. **Cleanup:** the helper binary is reused across sessions; cleanup is optional on disconnect and best-effort on uninstall.
ContractRef: ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md

#### Remote cache settings and administration

- project settings expose `shallow clone`, `partial clone`, per-project remote-cache size, and `Evict remote cache`
- both clone toggles default OFF and support global defaults plus per-project overrides
- global storage settings own remote-cache retention (default 30 days), global cache size limit (`min(50 GB, 10% of free disk at first cache creation)`), and `Clear All Remote Caches`
- caches are not evicted on ordinary project close; eviction is inactivity-driven, pressure-driven, or user-driven

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

### C.4 Tool & Provider Execution on Remote

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2

- **Git operations:** run via SSH command on the remote host as specified in §C.3.
  ContractRef: ContractName:Plans/WorktreeGitImprovement.md
- **File browsing:** uses SFTP when available, with SSH `find` / `ls` pipelines as fallback.
  ContractRef: PolicyRule:Decision_Policy.md§2
- **AI provider CLIs:** MUST be installed on the remote machine. Puppet Master invokes them via SSH subprocess and streams stdout/stderr back to the local UI in real time.
  ContractRef: PolicyRule:Decision_Policy.md§2
- **Grep (index-accelerated):**
  - Git-backed remote projects query the local index, verify base-snapshot candidates via local `git show ... | rg`, and verify dirty/staged paths from the local dirty cache first.
  - Non-Git remote projects query the local transferred index and verify only candidate paths over SSH.
  - Per-file verification races are skip-and-continue conditions; the query remains successful if other candidate files can still be checked.
  - Local candidate reduction MUST NOT be treated as a final answer without authoritative verification.
  ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md
- Error - provider CLI not found on remote: show `Provider CLI not found on remote - install <provider_name> on <host>` with a `Dismiss` action. MUST NOT attempt silent installation.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- Error - SSH session drops mid-run: show `SSH session lost - reconnecting...`, auto-retry once, then expose `Reconnect` for manual retry. MUST NOT silently swallow the disconnect.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

### C.4A Debug investigations on remote-mode projects

Remote-mode Debug investigations must honor the same remote project authority model as every other remote PM workflow.

Required rules:
- code edits, log reads, shell commands, tracer installs, test runners, provider CLIs, and cleanup actions execute on the remote host context
- PM must not silently mirror the project locally or fall back to local execution just because a Debug investigation is active
- supported remote Debug MVP target kinds are PM-managed `dev_session`, PM-managed browser targets exposed by the remote project (including forwarded ports or remote-served app URLs), and `imported_bundle`
- arbitrary ad-hoc attach to unmanaged remote processes or hosts is out of scope for MVP

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md

Browser and evidence rules:
- PM may capture browser evidence locally against a PM-managed remote project URL or forwarded port, but the resulting investigation must still preserve the owning remote project and host identity
- remote browser evidence, logs, and artifacts must remain linked to the remote project context rather than being rewritten as local-project evidence
- disconnects move the investigation into explicit degraded or blocked state after the one bounded reconnect attempt; they do not silently continue as local-only debugging

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Permissions_System.md

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

Source Control and remote project flows reserve the following command IDs:

| Command ID | Purpose |
|---|---|
| `cmd.source_control.show` | Reveal the Source Control side panel, optionally selecting a subview |
| `cmd.source_control.switch_subview` | Switch Source Control subviews within the side panel |
| `cmd.git.open_diff` | Open file diff/review |
| `cmd.git.diff_set_compare_target` | Change diff baseline/target |
| `cmd.git.diff_search` | Search within diff/review |
| `cmd.git.stage_hunks` | Stage selected hunks |
| `cmd.git.unstage_hunks` | Unstage selected hunks |
| `cmd.git.discard_hunks` | Discard selected hunks |
| `cmd.git.conflict_apply_resolution` | Apply a structured conflict-resolution action |
| `cmd.remote.reconnect` | Retry reconnect for the active remote-mode project context |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FinalGUISpec.md

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

Deferred or GitHub-seeded wizard/runtime flows must preserve blocked-state identity, recovery context, and local generated artifacts.

**recovery binding** record:
- `project_id`
- `focused_run_id?`
- `wizard_id?`
- `thread_id?`
- `run_id?`
- `node_id?`
- `attempt_id?`
- `account_id`
- `credential_ref`
- `login`
- `resume_url?`
- deferred payload ref
- `blocked_sequence?`
- `replan_generation?`
- clearing status

ContractRef: Plans/Contracts_V0.md#7.3 `route_target`, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)

Rules:
- deferred wizard launch paths must support both `attention_required` and `blocked`
- any stored `resume_url` or preloaded wizard payload must survive blocked-state recovery and deep-link reopening
- if a GitHub-seeded wizard becomes blocked, resume MUST return to the same wizard instance/context rather than creating a fresh blank flow
- if the blocked state is tied to a runtime node/attempt, the deferred GitHub context remains linked to that originating node/attempt
- auth-blocked GitHub actions surface canonical recovery actions rather than integration-specific fallback loops
- repo-import or workflow-generation flows that become blocked preserve local generated artifacts and mark remote steps as blocked explicitly
- the binding is created before handing control to deferred GitHub auth/import/launch flows
- if the deferred flow blocks, the runtime blocked episode references this binding
- the binding is cleared only when the deferred flow completes successfully, the owning blocked episode is abandoned, or the wizard/run context is cancelled or superseded
- approval or auth resolution wakes the scheduler/event consumer immediately; it is not a polling loop

ContractRef: Plans/Contracts_V0.md#7.3 `route_target`, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)

Acceptance criteria:
- no-wizard/deferred GitHub entry paths do not lose blocked-state recovery
- deep links and preloaded payloads remain stable across blocked/unblocked transitions

Required fields:
- project_id
- focused_run_id
- account_id
- credential_ref
- login
- resume_url

Canonical terms and values:
- route_target
- account_id
- credential_ref
- login
- resume_url

Labels:
- recovery binding

ContractRef: Plans/Contracts_V0.md#7.3 `route_target`, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)

Behavioral rules:
- Deep-link recovery must serialize canonical route identity rather than inventing a second routing model.
- GitHub reconnect context must use stable internal account identity rather than login-keyed recovery.