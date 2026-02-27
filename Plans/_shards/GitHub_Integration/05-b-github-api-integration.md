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

