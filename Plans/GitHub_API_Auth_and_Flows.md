# Puppet Master -- GitHub API Auth and Flows

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- PLAN DOC REWRITE HEADER

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

LOCKED DECISIONS (DO NOT CHANGE IN THIS DOC):
- GitHub operations: GitHub API only; GitHub CLI is not used
- Default auth flow: OAuth device-code
- No secrets in seglog/redb/Tantivy or logs; secrets live only in OS credential store

REWRITE METADATA:
- Doc updated by: GitHub Copilot CLI (deep review pass)
- Legacy intent preserved: YES
- Primary Target Primitives:
  - Provider (GitHub API)
  - Patch Pipeline (local git)
  - Policy Engine / Permissions (redaction, secrets)
  - Session Store (seglog events)
  - UI Surface (commands only; UI holds no business logic)
- Canonical sources referenced (DRY):
  - Plans/Spec_Lock.json
  - Plans/DRY_Rules.md
  - Plans/Contracts_V0.md
  - Plans/Glossary.md
  - Plans/Architecture_Invariants.md
  - Plans/Progression_Gates.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
  - Plans/Crosswalk.md
  - Plans/Decision_Policy.md
-->

## Purpose
Define the canonical GitHub API authentication contract and GitHub API call flows Puppet Master relies on for repository, fork, and pull request workflows.

This document also defines the hard boundary between:
- **Local Git operations** (performed via the local `git` binary), and
- **GitHub hosting operations** (performed via the GitHub HTTPS API).

ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline, Primitive:Provider

## Non-goals
- Using the GitHub CLI for any auth, repo, fork, or PR behavior. ContractRef: SchemaID:Spec_Lock.json#github_operations
- Storing GitHub OAuth tokens in Puppet Master's event store (`seglog`) or key/value stores (e.g., `redb`). ContractRef: PolicyRule:no_secrets_in_storage
- Defining implementation task plans, phase lists, or execution queues. ContractRef: Plans/Progression_Gates.md
- Defining a multi-provider Git hosting abstraction (GitHub only). ContractRef: SchemaID:Spec_Lock.json#github_operations

## SSOT references (DRY)
- DRY/SSOT rules: `Plans/DRY_Rules.md`
- Canonical contracts: `Plans/Contracts_V0.md`
- Canonical terms: `Plans/Glossary.md`
- Spec Lock (locked decisions): `Plans/Spec_Lock.json` -- `github_operations`, `auth_model`
- Architecture invariants: `Plans/Architecture_Invariants.md` -- INV-002 (no secrets in storage), INV-010 (platform name compliance)
- Progression gates: `Plans/Progression_Gates.md` -- GATE-003 (invariants), GATE-009 (ContractRef enforcement)
- Autonomous decision policy: `Plans/Decision_Policy.md`
- UI command catalog (canonical command IDs): `Plans/UI_Command_Catalog.md`
- Storage compatibility note (EventEnvelopeV1 vs EventRecord): `Plans/storage-plan.md` §2.2
- Crosswalk references (`GitHubApiTool`, `AuthState`): `Plans/Crosswalk.md` §3.1, §3.6

> This document intentionally does **not** redefine `AuthState`, `AuthPolicy`, or `AuthEvent`; it only specifies GitHub-specific behavior, payload fields, and deterministic flow rules that attach to those SSOT contracts.

---

> **Anti-Drift Compliance:**
> - Operational statements in this doc require `ContractRef:` annotations (ContractRef: Plans/DRY_Rules.md, Plans/Progression_Gates.md#GATE-009).
> - Evidence bundles for verification conform to `Plans/evidence.schema.json` (ContractRef: SchemaID:evidence.schema.json).
> - Architecture invariants apply, especially secrets and naming (ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010).
> - Ambiguity is resolved deterministically via `Plans/Decision_Policy.md` §2 (ContractRef: PolicyRule:Decision_Policy.md§2).

---

## Canonical boundary: Git vs GitHub

### Git operations (local)
All repository content and transport operations are executed via the local `git` binary. ContractRef: Primitive:PatchPipeline

**Current implementation (legacy integration note):** `puppet-master-rs/src/git/git_manager.rs` -- `GitManager` (`run_git_cmd()`, `push()`, `pull()`, etc.). ContractRef: Primitive:PatchPipeline

**Hard rules:**
- No secrets (tokens) may appear in git remote URLs, git config, or any plaintext credential files. ContractRef: PolicyRule:no_secrets_in_storage
- Any Git action log (e.g. `.puppet-master/git-actions.log`) must never contain secrets; apply redaction rules to command output and environment dumps. ContractRef: PolicyRule:redaction

**Git transport authentication (deterministic, no-secret-leak):**
- Default: use SSH remotes when available (no token required). ContractRef: PolicyRule:no_secrets_in_storage
- If HTTPS is used, authentication must be sourced from the OS credential store at runtime (never embedded in remote URLs, never written to disk). ContractRef: PolicyRule:no_secrets_in_storage
- Puppet Master must not rely on external GitHub CLI auth state for Git transport. ContractRef: SchemaID:Spec_Lock.json#github_operations

### GitHub operations (API)
All hosting operations use GitHub's HTTPS API with an OAuth access token. ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:Provider

**No GitHub CLI is permitted** for any GitHub auth/status/repo/fork/PR behavior. ContractRef: SchemaID:Spec_Lock.json#github_operations

**Current implementation (legacy integration; non-canonical):**
- `puppet-master-rs/src/platforms/auth_actions.rs`: `spawn_login(AuthTarget::GitHub)` shells out to a GitHub CLI login.
- `puppet-master-rs/src/platforms/auth_status.rs`: `check_github()` shells out to GitHub CLI commands.
- `puppet-master-rs/src/app.rs`: wizard path shells out to GitHub CLI for repo creation.

ContractRef: SchemaID:Spec_Lock.json#github_operations

---

## GitHub OAuth device-code flow (default UX)

### Deterministic defaults
- Default auth model is OAuth device-code flow for interactive "Connect GitHub". ContractRef: SchemaID:Spec_Lock.json#auth_model, ContractName:Contracts_V0.md#AuthState
- Target host is GitHub.com (`github.com`). ContractRef: SchemaID:Spec_Lock.json#github_operations
- Scope string is fixed: `repo read:user user:email read:org`. ContractRef: SchemaID:Spec_Lock.json#auth_model

**Fixed constants (deterministic; not user-configurable):**
- `github_host = "github.com"`
- `github_api_base_url = "https://api.github.com"`
- `device_flow_scope = "repo read:user user:email read:org"`
- Puppet Master attempts to open the system browser to `verification_uri` automatically; failure to open the browser must not fail the auth flow. ContractRef: SchemaID:Spec_Lock.json#auth_model

ContractRef: SchemaID:Spec_Lock.json#github_operations, PolicyRule:Decision_Policy.md§2

### Endpoints (GitHub.com)
- Device code: `POST https://github.com/login/device/code`
- Token polling: `POST https://github.com/login/oauth/access_token`
- Identity validation: `GET https://api.github.com/user`

ContractRef: SchemaID:Spec_Lock.json#auth_model

### Required configuration (contract) ContractRef: ConfigKey:github.client_id
Puppet Master must have a registered GitHub OAuth App. ContractRef: ConfigKey:github.client_id, SchemaID:Spec_Lock.json#auth_model
- **Client ID** (required): `ContractRef: ConfigKey:github.client_id` -- must not be hard-coded.
- **No client secret** is used for device flow. ContractRef: SchemaID:Spec_Lock.json#auth_model

### ConfigKey: github.api_version

**Default:** `"2022-11-28"`
**Storage:** redb `config:github.api_version`
**Purpose:** The GitHub REST API version header (`X-GitHub-Api-Version`) sent with all API requests.
**Override:** Set via environment variable `GITHUB_API_VERSION` or in `.puppet-master/config.json` under `github.api_version`.

ContractRef: ConfigKey:github.api_version, ToolID:GitHubApiTool

### UI commands (contract)
This flow is initiated by a UI command; the UI must not perform auth logic directly. ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#7

**Reserved UI command IDs required by this plan (must be added to `Plans/UI_Command_Catalog.md` before implementation):** ContractRef: Primitive:UICommand, Plans/UI_Command_Catalog.md
- `UICommand:cmd.github.connect` -- start device-code auth flow. Expected events: `auth.github.device_code.issued` then `auth.github.token.polling` stream; terminal: `auth.github.authenticated` or `auth.github.failed`. ContractRef: UICommand:cmd.github.connect, EventType:auth.github.device_code.issued, EventType:auth.github.token.polling, EventType:auth.github.authenticated, EventType:auth.github.failed
- `UICommand:cmd.github.disconnect` -- disconnect and delete token. Expected events: `auth.github.disconnected`. ContractRef: UICommand:cmd.github.disconnect, EventType:auth.github.disconnected

> Note: Until those command IDs exist in the catalog, any implementation that uses ad-hoc commands is non-canonical. ContractRef: Primitive:UICommand

### AuthState / AuthEvent binding
Use the SSOT types from `Plans/Contracts_V0.md`.

GitHub binds as follows:
- `AuthPolicy` selects device-code as the default interactive method for GitHub. ContractRef: ContractName:Contracts_V0.md#AuthPolicy, SchemaID:Spec_Lock.json#auth_model
- `AuthEvent` emits device-code initiation, polling progress, success, and failure with GitHub-specific payload. ContractRef: ContractName:Contracts_V0.md#AuthEvent, SchemaID:pm.event.v0

### Canonical GitHub auth event kinds
Events are persisted as `EventRecord` in seglog (see `Plans/Contracts_V0.md` §1.1). This doc only specifies the stable `kind` strings. ContractRef: ContractName:Contracts_V0.md#1.1

| Event kind | When emitted |
|---|---|
| `auth.github.device_code.issued` | Device code request succeeds; `GitHubDeviceCode` payload attached |
| `auth.github.token.polling` | Each poll interval while awaiting user action |
| `auth.github.authenticated` | Token acquired and verified; `GitHubTokenMeta` payload attached |
| `auth.github.failed` | Any auth failure; `GitHubAuthFailure` payload attached |
| `auth.github.disconnected` | Disconnect complete; credential-store entry deleted |

ContractRef: EventType:auth.github.device_code.issued, EventType:auth.github.token.polling, EventType:auth.github.authenticated, EventType:auth.github.failed, EventType:auth.github.disconnected

### GitHub-specific auth payload fields (attachments)
These payloads are GitHub-specific attachments carried inside the SSOT auth events/states.

**`GitHubDeviceCode` (attached to `auth.github.device_code.issued`):**
- `verification_uri`
- `user_code`
- `device_code` (never shown in UI). ContractRef: PolicyRule:redaction
- `expires_at`
- `interval_secs`
- `requested_scopes`

**`GitHubTokenMeta` (attached to `auth.github.authenticated`):**
- `login` (from `GET /user`)
- `granted_scopes` (from `X-OAuth-Scopes`)
- `token_fingerprint` (short hash prefix, display-only)

**`GitHubAuthFailure` (attached to `auth.github.failed`):**
- `kind` (see Failure kinds table)
- `http_status` (optional)
- `retry_after_secs` (optional)
- `rate_limit_reset_at` (optional)
- `missing_scopes` (optional list)

ContractRef: SchemaID:pm.event.v0, PolicyRule:redaction

---

## Device-flow polling semantics (deterministic)
Polling behavior MUST follow GitHub's documented device flow semantics. ContractRef: SchemaID:Spec_Lock.json#auth_model

**Polling algorithm (deterministic):**
1) Request device code; record `issued_at = now()` and compute `expires_at = issued_at + expires_in` from GitHub response. ContractRef: EventType:auth.github.device_code.issued
2) Poll the token endpoint no faster than the server-provided `interval`.
3) On token endpoint response:
   - `authorization_pending` → sleep `interval` seconds; emit `auth.github.token.polling`. ContractRef: EventType:auth.github.token.polling
   - `slow_down` → increase interval by **+5 seconds** and sleep; emit `auth.github.token.polling`. ContractRef: EventType:auth.github.token.polling
   - `access_denied` → fail as `UserDenied`. ContractRef: EventType:auth.github.failed
   - `expired_token` → fail as `DeviceCodeExpired`. ContractRef: EventType:auth.github.failed
   - `incorrect_device_code` → fail as `DeviceCodeExpired` (treat as non-retryable). ContractRef: EventType:auth.github.failed
   - `device_flow_disabled` → fail as `DeviceFlowDisabled`. ContractRef: EventType:auth.github.failed
4) Stop polling when `now() >= expires_at` and fail as `DeviceCodeExpired`. ContractRef: EventType:auth.github.failed

Source: GitHub OAuth device flow docs (see References). ContractRef: PolicyRule:Decision_Policy.md§2

---

## Token handling and storage (hard rules)

### Storage location
- Persist tokens only in the OS credential store. ContractRef: PolicyRule:no_secrets_in_storage
- Never persist tokens to Puppet Master state stores (seglog, redb, Tantivy) or to any plaintext file. ContractRef: PolicyRule:no_secrets_in_storage, Plans/Architecture_Invariants.md#INV-002
- Never place tokens in logs (stdout/stderr, structured logs, debug dumps, evidence bundles). ContractRef: PolicyRule:redaction

### Credential store keying (canonical)
- **Service:** `Puppet Master` (stable, not user-editable). ContractRef: PolicyRule:no_secrets_in_storage
- **Account:** `github.com/<login>` (example: `github.com/octocat`). ContractRef: SchemaID:Spec_Lock.json#github_operations
- **Secret payload:** JSON string containing:
  - `access_token`
  - `issued_at`
  - `granted_scopes` (array)
  - `token_fingerprint`

ContractRef: PolicyRule:no_secrets_in_storage

### Token lifecycle
- On successful token acquisition, Puppet Master must: ContractRef: EventType:auth.github.authenticated, PolicyRule:no_secrets_in_storage
  1) store the token in the OS credential store, ContractRef: PolicyRule:no_secrets_in_storage
  2) validate the token by calling `GET /user`,
  3) verify scopes (see next section),
  4) emit `auth.github.authenticated`.

ContractRef: EventType:auth.github.authenticated

- On disconnect, Puppet Master must delete the credential-store entry and clear any cached non-secret metadata; then emit `auth.github.disconnected`. ContractRef: EventType:auth.github.disconnected, PolicyRule:no_secrets_in_storage

ContractRef: EventType:auth.github.disconnected

### Credential-store unavailable
If the OS credential store cannot be accessed, Puppet Master MUST: ContractRef: EventType:auth.github.failed, PolicyRule:no_secrets_in_storage
- Continue with an in-memory token for the current session only (no disk writes), and
- Emit `auth.github.failed` with kind `CredentialStoreUnavailable` **only if** the user explicitly attempted to persist, and
- Require reconnect after restart.

ContractRef: EventType:auth.github.failed, PolicyRule:no_secrets_in_storage

---

## Scope verification and permission checks

### Scope verification
After receiving an access token, Puppet Master verifies effective scopes by reading `X-OAuth-Scopes` from a successful GitHub API response (e.g., `GET /user`). ContractRef: Primitive:Provider

If any scopes required by the active GitHub features are missing, Puppet Master must transition to an auth failure state with: ContractRef: EventType:auth.github.failed
- `kind = MissingScopes`
- `missing_scopes = [...]`

ContractRef: EventType:auth.github.failed

### Repo permission checks
Before deciding between same-repo PR vs fork-based PR, Puppet Master checks push permissions:
- `GET /repos/{owner}/{repo}` and evaluate permissions, OR
- interpret a push failure from `git` as a fallback signal.

ContractRef: Primitive:Provider, Primitive:PatchPipeline

---

## GitHub API request envelope (contract)

### Base URL
- Base URL is fixed to GitHub.com API: `https://api.github.com`. ContractRef: SchemaID:Spec_Lock.json#github_operations

### Required headers ContractRef: SchemaID:Spec_Lock.json#github_operations
- `Accept: application/vnd.github+json`
- `User-Agent: puppet-master/<version>`
- `Authorization: Bearer <access_token>` (never logged). ContractRef: PolicyRule:redaction
- `X-GitHub-Api-Version: 2022-11-28` (default; configurable)

ContractRef: PolicyRule:redaction, ConfigKey:github.api_version

### Rate limiting (deterministic handling)
Puppet Master must differentiate: ContractRef: EventType:auth.github.failed
- **Primary rate limit:** `X-RateLimit-Remaining: 0` with `X-RateLimit-Reset`.
- **Secondary rate limit:** throttling responses (commonly 403/429) sometimes with `Retry-After`.

For both cases, emit `auth.github.failed` with the failure kinds below, including `retry_after_secs` or `rate_limit_reset_at` when available.

ContractRef: EventType:auth.github.failed

---

## Call flows

### A) Connect GitHub (device-code flow)
**UI action:** dispatch `UICommand:cmd.github.connect`. ContractRef: UICommand:cmd.github.connect

**Flow (canonical):**
1) Request device code (`POST /login/device/code`) using `ConfigKey:github.client_id` and deterministic default scopes; emit `auth.github.device_code.issued` with payload. ContractRef: ConfigKey:github.client_id, EventType:auth.github.device_code.issued
2) Present `verification_uri`, `user_code`, `expires_at`.
3) Attempt to open the system browser to `verification_uri`. If opening the browser fails, continue without failing the auth flow. ContractRef: SchemaID:Spec_Lock.json#auth_model
4) Begin polling (`POST /login/oauth/access_token`) using the deterministic polling algorithm; emit `auth.github.token.polling` per poll attempt. ContractRef: EventType:auth.github.token.polling
5) On token receipt:
   - store token to OS credential store, ContractRef: PolicyRule:no_secrets_in_storage
   - call `GET /user`,
   - verify scopes via `X-OAuth-Scopes`,
   - emit `auth.github.authenticated`.

ContractRef: EventType:auth.github.authenticated

**Current GUI wiring (legacy integration note):**
- `puppet-master-rs/src/views/login.rs`: `build_github_card()` uses message handlers for login/logout.
- `puppet-master-rs/src/app.rs`: routes those messages.

ContractRef: SchemaID:Spec_Lock.json#github_operations

### B) Disconnect GitHub
**UI action:** dispatch `UICommand:cmd.github.disconnect`. ContractRef: UICommand:cmd.github.disconnect

**Flow (canonical):**
1) Delete token entry from OS credential store. ContractRef: PolicyRule:no_secrets_in_storage
2) Emit `auth.github.disconnected` and transition to not-authenticated state. ContractRef: EventType:auth.github.disconnected
3) Clear any cached GitHub identity display values.

ContractRef: PolicyRule:redaction

### C) Create repository (wizard)
**Canonical behavior:** GitHub API creates the repository; `git` configures remotes and pushes.

**API:** `POST /user/repos`.
- Inputs: `name`, `description?`, `private`.

**Git:**
- `git remote add origin <clone_url>`
- `git push -u origin <branch>`

ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline

### D) Fork and fork-based PR
**When:** user lacks push permission.

**API:**
- Fork: `POST /repos/{owner}/{repo}/forks`
- Poll for fork readiness until the fork repo is visible; then proceed.

**Git:**
- Configure remotes:
  - `origin` → fork
  - `upstream` → original

ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline

### E) Create PR
**API:** `POST /repos/{base_owner}/{base_repo}/pulls`.
- Inputs: `title`, `head` (`<fork_owner>:<branch>` or `<owner>:<branch>`), `base`, `body?`.

ContractRef: SchemaID:Spec_Lock.json#github_operations

---

## Failure states and UX copy (canonical)
The auth service must map failures into SSOT auth events/states with a GitHub-specific `GitHubAuthFailure.kind` and use the following user-facing copy. ContractRef: EventType:auth.github.failed

ContractRef: EventType:auth.github.failed, SchemaID:pm.event.v0

| Failure kind | Trigger condition | Title | Body | Actions |
|---|---|---|---|---|
| `DeviceCodeExpired` | device code expired (poll deadline elapsed) OR token endpoint returns `expired_token` OR `incorrect_device_code` | GitHub code expired | That sign-in code has expired. Click "Try again" to get a new code. | Try again, Cancel |
| `UserDenied` | token endpoint returns `access_denied` | GitHub sign-in was cancelled | GitHub didn't grant access. If you want to connect, start sign-in again. | Try again, Close |
| `DeviceFlowDisabled` | token endpoint returns `device_flow_disabled` | GitHub sign-in is unavailable | Device sign-in is disabled for this GitHub OAuth App. Contact your admin or use a different app registration. | Close |
| `MissingScopes` | `X-OAuth-Scopes` missing required scopes | GitHub needs additional permissions | Your GitHub token is missing: {missing_scopes}. Click "Reconnect" to grant them. | Reconnect, Disconnect (ContractRef: EventType:auth.github.failed) |
| `TokenInvalidOrRevoked` | GitHub API returns 401 for authenticated requests | GitHub connection expired | Your GitHub token is no longer valid. Reconnect to continue. | Reconnect, Disconnect |
| `RateLimitedPrimary` | `X-RateLimit-Remaining: 0` and reset is in the future | GitHub rate limit reached | GitHub is temporarily rate limiting requests. Try again after {reset_time}. | Retry, Dismiss |
| `RateLimitedSecondary` | GitHub throttles (403/429) and/or provides `Retry-After` | GitHub is slowing requests | GitHub asked us to slow down. Wait a moment, then retry. | Retry, Dismiss |
| `NetworkError` | DNS/TLS/connectivity errors | GitHub is unavailable | We couldn't reach GitHub. Check your connection and try again. | Retry, Dismiss |
| `GitHubOutage` | GitHub 5xx or sustained upstream failures | GitHub is unavailable | GitHub appears to be having an outage. Try again later. | Retry, Dismiss |
| `CredentialStoreUnavailable` | OS credential store cannot be accessed | Can't save GitHub credentials | Puppet Master can't access your system credential store. You can continue for this session, but you'll need to reconnect next time. | Continue for this session, Cancel |

---

## Acceptance criteria (testable)

> Verification proof for each criterion must conform to `Plans/evidence.schema.json`. Invariant checks are validated per `Plans/Progression_Gates.md` GATE-003 (architecture invariants) and GATE-009 (ContractRef enforcement). ContractRef: SchemaID:evidence.schema.json, Plans/Progression_Gates.md#GATE-003, Plans/Progression_Gates.md#GATE-009

ContractRef: SchemaID:evidence.schema.json, Plans/Progression_Gates.md#GATE-003, Plans/Progression_Gates.md#GATE-009

### Auth and security
1) **No GitHub CLI dependency:** no GitHub CLI subprocess invocation exists for GitHub auth/status, repo create, fork, or PR operations. ContractRef: SchemaID:Spec_Lock.json#github_operations
2) **Device-code default UX:** `UICommand:cmd.github.connect` initiates device flow and surfaces `verification_uri` + `user_code` + expiry. ContractRef: UICommand:cmd.github.connect, EventType:auth.github.device_code.issued
3) **Polling semantics:** polling deterministically handles `authorization_pending` and `slow_down` (interval +5s) and terminates with `DeviceCodeExpired` at expiry. ContractRef: EventType:auth.github.failed
4) **Credential-store-only persistence:** tokens are persisted only in the OS credential store; they never appear in seglog events, redb projections, Tantivy indexes, logs, `.puppet-master/git-actions.log`, state files, or evidence bundles. ContractRef: PolicyRule:no_secrets_in_storage, Plans/Architecture_Invariants.md#INV-002
5) **Scope verification:** granted scopes are verified via `X-OAuth-Scopes`, and missing scopes transition to `MissingScopes` with the specified UX copy. ContractRef: EventType:auth.github.failed

### Repo / fork / PR flows
6) **Repo create via API:** wizard repo creation uses `POST /user/repos` with Git push via local git; no GitHub CLI usage. ContractRef: SchemaID:Spec_Lock.json#github_operations
7) **Fork flow via API:** forks use `POST /forks`; remotes configured via local git. ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline
8) **PR create via API:** PRs use `POST /pulls` and do not require any GitHub CLI interaction. ContractRef: SchemaID:Spec_Lock.json#github_operations

---

## References
- `Plans/Spec_Lock.json`
- `Plans/DRY_Rules.md`
- `Plans/Contracts_V0.md`
- `Plans/Glossary.md`
- `Plans/Architecture_Invariants.md` -- INV-002, INV-010
- `Plans/Progression_Gates.md` -- GATE-003, GATE-009
- `Plans/Decision_Policy.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/storage-plan.md` §2.2
- GitHub OAuth device flow docs: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
