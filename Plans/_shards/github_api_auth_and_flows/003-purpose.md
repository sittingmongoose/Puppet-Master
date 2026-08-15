# Shard 003: Purpose

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L47-L107

Source SHA256: `9a1b15ff570170004e106ad168572e399378dfbe596bbd6d66b10f9e5437e899`

---

## Purpose
Define the canonical GitHub API authentication contract and GitHub API call flows Puppet Master relies on for repository, fork, and pull request workflows.

This document also defines the hard boundary between:
- **Local Git operations** (performed via the local `git` binary), and
- **GitHub hosting operations** (performed via the GitHub HTTPS API).

`github_api` is the auth realm for GitHub REST `/platform` operations such as repo create, fork, PR, and permission checks; GitHub Copilot auth does not authorize these repository/platform mutations.

Git transport auth and GitHub API auth are separate systems. `github_api` tokens never transfer to SSH remotes, local Git credential helpers, or Source Control SSH operations, and an expired or insufficient GitHub API credential is a canonical blocked/runtime condition with owner routing through GitHub Actions or GitHub API auth recovery rather than a panel-local refresh case.

`Plans/GitHub_Integration.md` remains the consumer cross-reference for `/remote` GitHub surfaces: hosted and SSH remote mutations consume FileSafe.md mutation-safety, write-scope, and durability contracts rather than bypassing the FileSafe owner.

Generic API key, HTTP auth, OAuth 2.0, OpenID Connect, and mTLS mechanisms are transport-layer auth families only when an owning provider/runtime contract explicitly maps them into a GitHub operation. They do not replace the `github_api` OAuth device-code flow or OS credential-store token boundary.

### OAuth device-code flow contract

The `github_api` realm uses GitHub OAuth device flow only for constrained local/headless contexts. The app must have device flow enabled before PM presents this route.

Device-code steps:
1. Start auth with `POST https://github.com/login/device/code`, passing `client_id` and requested space-delimited `scope`.
2. Store only the non-secret pending auth record: `device_code_ref`, `user_code`, `verification_uri`, `expires_at`, `poll_interval_seconds`, requested scopes, host, and account binding.
3. Show `verification_uri` and `user_code` to the user, with expiry and requested scopes visible.
4. Poll `POST https://github.com/login/oauth/access_token` with `client_id`, `device_code`, and `grant_type = urn:ietf:params:oauth:grant-type:device_code`.
5. Poll no faster than the returned `interval`; on `slow_down`, increase the interval by 5 seconds and persist the new poll cadence.
6. Terminal success stores the access token only in the OS credential store and persists `credential_ref`, scopes, host, account_id, and expiry/refresh metadata outside the token secret.

Device-code polling errors are closed to `authorization_pending`, `slow_down`, `expired_token`, `unsupported_grant_type`, `incorrect_client_credentials`, `incorrect_device_code`, `access_denied`, and `network_or_rate_limited`. `authorization_pending` keeps polling until expiry. `slow_down` adjusts cadence. `expired_token`, `incorrect_client_credentials`, `incorrect_device_code`, `unsupported_grant_type`, and `access_denied` stop polling and surface a retry/start-over action.

Scope matrix:
- Repository create/fork/PR, private repo reads, branch/commit/status mutations: request `repo`.
- GitHub Actions workflow dispatch, run rerun/cancel, and workflow-file mutation: request `workflow` in addition to repo access.
- Organization/team membership lookup and org-owned repo routing: request `read:org`.
- User email disclosure for account labeling only: request `user:email` when the label cannot be derived from non-email identity.
- Webhook management: request `admin:repo_hook` only for hook create/update/delete flows and never for ordinary PR/issue operations.

Missing scopes produce `blocked_reason_code = missing_scopes` with `missing_scopes[]`, `credential_ref`, `account_id`, `operation_ref`, and `allowed_action_ids[]` that include reconnect with expanded scopes or choose another account when permitted.

Credential storage:
- PM uses the platform OS credential store through the Rust `keyring` crate abstraction: macOS Keychain, Windows Credential Manager, and Linux Secret Service/libsecret where available.
- Credential service names use `puppet-master.github_api`.
- Credential keys use `github_api/{host}/{account_id}/{credential_ref}`; `host` is `github.com` or the normalized enterprise host, `account_id` is PM's stable internal account id, and `credential_ref` is the durable pointer stored in PM records.
- Seglog, redb, Tantivy, logs, prompts, exports, and runtime artifacts may store only `credential_ref`, scope metadata, account metadata, and redacted health state, never the raw token or device_code secret.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Permissions_System.md

ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline, Primitive:Provider

#### Cross-owner command and routing dependencies

- `Plans/Permissions_System.md` / `/Permissions_System.md` owns scope-keyed approval semantics, de-tiered gating language, and permission snapshots consumed by GitHub API mutation gates.
- `Plans/UI_Command_Catalog.md` / `/UI_Command_Catalog.md` owns governance command families, typed route-payload normalization, and projection-freshness gating for GitHub command surfaces.
- `Plans/WorktreeGitImprovement.md` / `/WorktreeGitImprovement.md` owns lane and `/worktree` lifecycle vocabulary, cleanup semantics, gating checks, and transition rules for repository worktree state.
- `Plans/Progression_Gates.md` / `/Progression_Gates.md` owns the replacement of tier-scoped gate logic with package-completion and seam-transition gates that GitHub orchestration consumes.
- Wizard-blocked and thread-blocked flows may serialize `resume_url`, including wizard-step restoration detail, but `/open` behavior normalizes through canonical object identity and scope identity before using that URL.

GitHub API OAuth callback listeners are loopback-only: they bind only to the configured loopback `bind-address` / `bind-host` for the active local, WSL, container, or remote-dev context, and wildcard/public-interface callback binds are invalid.

### GitHub host policy and enterprise availability

`github_host_policy` distinguishes at least `github.com_only` and `enterprise_allowed`. If the MVP remains `github.com_only`, GHES repositories and GitHub Enterprise Server URLs receive deterministic disabled-state UX rather than hidden fallback or accidental downgraded behavior.
