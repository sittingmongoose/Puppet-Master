# Shard 007: Authentication model

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L263-L352

Source SHA256: `fdbce2e83dc53773be18beff37e23dcc26b1e0ec557067d1ae39b9b20e162d2b`

---

## Authentication model

### Supported authentication inputs
Puppet Master must support both of these DockerHub authentication paths:
1. **Browser/device login**
   - the GUI launches Docker’s browser/device login flow
   - intended for low-friction interactive sign-in
   - preferred when the user wants guided sign-in from the desktop UI
2. **Personal Access Token (PAT)**
   - explicit token entry in the GUI
   - helper text explains that PAT is recommended
   - helper text explains where/how the user can obtain a PAT
   - intended to be the most explicit and durable advanced-user path

PAT support remains mandatory even though browser login is supported.

### Browser/device login execution contract

- `cmd.docker.browser_login` MUST launch the DockerHub browser/device login flow and immediately emit `docker.auth.browser_login.started`.
- When the device/browser flow is initialized, Puppet Master MUST emit `docker.auth.browser_login.device_code_issued` with `verification_uri`, `user_code`, and `expires_in_seconds`.
- While awaiting completion, Puppet Master MUST emit `docker.auth.browser_login.polling` every 5 seconds until a terminal outcome occurs.
- Terminal outcomes are exactly one of:
  - `docker.auth.capability_validated`
  - `docker.auth.browser_login.cancelled`
  - `docker.auth.browser_login.timed_out`
  - `docker.auth.failed`
- PAT entry MUST be written through `cmd.docker.save_pat`; PAT format MAY fail locally before network validation runs.

### Credential storage precedence and scope

- Browser-login credentials MUST be read from Docker's credential-helper / `~/.docker/config.json` chain.
- PAT credentials MUST be read from the OS credential store only.
- DockerHub credentials are **global per OS user account**.
- `requested_auth_mode`, selected namespace/repository, and last validation snapshot remain **project-scoped UI state**.
- Clearing credentials MUST declare whether the action clears browser-login credentials, PAT credentials, or both.

### Auth-expiry failure rule


If auth expires during image push, Puppet Master MUST emit `docker.publish.failed` with `reason_code: auth_expired`, preserve the local build result, and surface a re-auth + retry CTA without forcing a rebuild.

### Requested vs effective auth state


#### Canonical DockerHub effective capability enum

`effective_capabilities[]` is a closed enum for the first implementation:

- `namespaces:list`
- `repositories:list`
- `repositories:create`
- `images:push`
- `repositories:read_private`

Surface gating rules:
- Namespace discovery requires `namespaces:list`.
- Repository discovery / refresh requires `repositories:list`.
- Create Repository requires `repositories:create`.
- Push Image requires `images:push`.
- Validation of a private target repository requires `repositories:read_private` or a successful push-capable validation path.
- If a surface requires a capability the effective set does not contain, the control MUST remain visible but disabled, with inline explanation that cites the missing capability and `degraded_reason` when present.

Puppet Master must model requested auth mode separately from effective capability.

Required state concepts:
- `requested_auth_mode`: `browser`, `pat`, or another future explicit auth mode
- `effective_auth_provider_state`: authenticated / unauthenticated / degraded / expired
- `effective_capabilities[]`: a set of effective capabilities such as:
  - browse namespaces
  - browse repositories
  - create repository
  - push image
  - read private repository state
- `effective_account_identity`: visible DockerHub account/namespace identity
- `last_validation_timestamp`
- `last_validation_host`
- `degraded_reason` when requested mode and effective capability do not match

User-visible rule:
- the UI must never imply that browser login or PAT automatically grants full repository-management capability
- the UI must explicitly show what is actually available after validation

### Browser login capability rule
If browser-based DockerHub login can support namespace/repository browsing and repository creation, Puppet Master should allow those management actions through browser login as well. PAT remains the recommended explicit fallback, but it is not required when browser login yields equivalent effective capability.

### Credential storage rule
- store tokens/credentials only in OS credential storage or Docker’s credential-helper path as appropriate
- never persist secrets to redb, YAML, project files, or evidence logs
- Docker Hub auth secret material remains out of redb; only validated identity/capability snapshots persist
- evidence/log capture must redact credentials, auth headers, and token-bearing environment variables
