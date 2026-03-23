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

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

### Current Branch

This subview shows workflow runs for the currently selected repo/worktree branch and supports:
- latest-run status
- rerun and cancel when permitted
- failing job / step drilldown
- direct pivot to the relevant Source Control diff or changed commit range

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/WorktreeGitImprovement.md

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
Generated workflows, required-secrets readiness, and validation outcomes MUST be discoverable from GitHub Actions rather than remaining settings-only state.

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/FinalGUISpec.md

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
- file browsing, file mutation, git operations, terminal launches, Search execution, Source Control projections, LSP execution, and provider-side project tools all run against the remote host context
- remote-mode projects MUST NOT silently fall back to local checkout, local git, local shell, local Search, or local LSP execution
- UI surfaces may retain stale snapshots while disconnected, but they must label them accurately and block new host-required mutations when the remote context is unavailable

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/storage-plan.md

Shared remote-state vocabulary:

| Axis | Values | Meaning |
|---|---|---|
| `freshness` | `current`, `refreshing`, `stale` | Whether the projection reflects current host state |
| `health` | `healthy`, `degraded`, `unavailable` | Whether the underlying host/service path is functioning |
| `write_availability` | `writable`, `pending_write`, `blocked`, `read_only` | Whether mutations may currently succeed |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Wiring_Matrix.md

Connection-loss rules:
- on unexpected disconnect, Puppet Master performs one bounded auto-retry
- if that retry does not recover the host context, the UI exposes an explicit `Reconnect` action
- local unsaved editor buffers may continue to exist, but they are disclosed as local recovery state rather than as confirmed remote writes
- Search, Source Control, Problems, and LSP may continue to show stale snapshots while new operations are blocked or degraded

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

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

