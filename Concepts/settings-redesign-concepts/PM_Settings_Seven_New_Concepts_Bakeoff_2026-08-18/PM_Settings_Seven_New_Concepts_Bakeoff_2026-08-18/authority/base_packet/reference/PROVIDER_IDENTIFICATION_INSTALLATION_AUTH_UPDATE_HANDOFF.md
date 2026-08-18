# Puppet Master Provider Identification, Installation Detection, Authentication, and Update Handoff

**Date:** 2026-08-07  
**Status:** Architecture handoff only. No Settings, Assistant Chat, Usage, Prompt Complexity, Runtime, Project Sync, Plans, commands, wiring, DRY, or concept packets were updated by this handoff.

## 1. Purpose

This handoff defines how Puppet Master should:

1. Identify provider CLIs and server-backed provider runtimes already available on a host.
2. Determine exactly which installation PM is using and how it was installed.
3. Detect and verify existing authentication profiles without conflating authentication with readiness.
4. Guide the user through setup when no usable profile exists.
5. Keep provider installations current, including optional automatic updates, without updating the wrong binary or reporting false success.
6. Preserve requested/effective provider, account, connection, product, model, installation, and host identity for routing, Usage, diagnostics, and recovery.

The design combines three sources of direction:

- **T3 Code:** strongest reference for provider-specific CLI discovery, installation probing, authentication/readiness probing, and host/environment-specific status.
- **Oh My Pi:** strongest reference for onboarding choreography, exact authorization/API-key destinations, browser opening, provider-specific setup methods, and returning the user to the originating provider/model row.
- **Puppet Master:** adds proof-based installation ownership, multi-account/profile isolation, requested/effective identity, Project Sync boundaries, RuntimeResourceGovernor, ObservableWork, FileSafe, transactional updates, verification, rollback, and failure-loop suppression.

## 2. Core identity model

Provider identity, installation identity, account identity, billing/product identity, and model identity are separate.

```text
ProviderFamily
  ProviderInstallation[]             host/environment-local executable or server runtime
    AuthProfile[]                    CLI-owned or PM-owned authentication identity
      Account                        stable PM account identity
        Connection                   exact credential/profile/endpoint route
          ProductOrEntitlement       plan, subscription, API billing, free route, etc.
            Model[]                  catalog entries and capabilities
```

A provider family may have:

- Several installations on one host.
- Installations on several PM hosts/environments.
- Several accounts or profile roots using one installation.
- One human identity with separate subscription and API-billed connections.
- One installation shared by several threads, Goals, Crews, and agents.

### Critical invariant

**Updating a provider account is not a meaningful operation. PM updates a `ProviderInstallation` once, then revalidates every dependent profile, account, connection, and model route.**

## 3. Owner boundaries

### 3.1 BinaryLocator

The existing BinaryLocator remains a discovery and validation service. It may report candidates, resolution evidence, path traces, and health observations. It does not install, update, repair, or remove provider software.

### 3.2 Provider Installation Resolver

Owns installation candidate discovery, exact path resolution, wrapper/shim tracing, package-owner detection, duplicate detection, and confidence classification.

### 3.3 Provider Authentication/Profile Resolver

Owns provider-specific profile discovery and probes. It determines whether a selected installation/profile is authenticated, which account/product it represents, and whether it can actually serve PM.

### 3.4 Provider Onboarding Service

Owns setup-method presentation and execution when no usable profile exists. It opens the exact official authorization, device-code, API-key, service-account, CLI-login, or endpoint page and returns to the originating Settings/model/search row.

### 3.5 Provider Installation Lifecycle Manager

Owns installation, adoption into PM management, version checks, scheduling, update transactions, verification, rollback, repair, pinning, and removal of PM-owned installations.

### 3.6 Provider Readiness Aggregator

Combines installation, authentication, account/product, model discovery, adapter compatibility, capability, and Usage-telemetry state into an honest readiness projection. It does not collapse these into one Boolean.

## 4. Installation discovery and identification

Discovery runs on the **host/environment that will execute the provider**, not merely on the UI client. Native Windows, WSL, macOS, Linux, containers, remote PM hosts, and managed OpenCode servers are distinct execution boundaries.

### 4.1 Candidate sources

The resolver inspects, in precedence order:

1. Explicit executable or server endpoint bound to the PM provider instance.
2. Executable used by an already-running PM-owned provider process.
3. PM-managed installation registry.
4. Host PATH using the daemon/service environment.
5. Login-shell PATH where appropriate and safe.
6. Provider-specific standard locations.
7. Package-manager inventories.
8. Provider-native installation metadata or doctor commands.
9. User-selected executable or server endpoint.

It inventories **all plausible candidates** rather than stopping after the first command named `codex`, `claude`, `opencode`, `cursor-agent`, or similar.

### 4.2 Resolution chain

For each candidate PM records:

```text
configured command
PATH candidate
launcher or shim
symlink chain
resolved executable
canonical/real path
file identity and hash where useful
architecture
host/runtime boundary
version and release channel
publisher/signature or package provenance where available
package/formula/native identity
package-manager root, prefix, profile, or generation
```

The resolver understands:

- Unix symlinks.
- Shell wrappers.
- Node package `bin` links.
- Windows `.cmd` and PowerShell shims.
- Scoop shims.
- Windows App Execution Aliases.
- Provider-native launchers.
- Nix/profile generations.
- Container-image entrypoints.

When static inspection is insufficient, a bounded trusted diagnostic launch may identify the executable/runtime actually used. External catalogs may not supply arbitrary diagnostic shell commands.

### 4.3 Installation-owner adapters

Candidate owner classes include:

```text
pm_managed
provider_native
npm_global
pnpm_global
bun_global
vite_plus
homebrew_formula
homebrew_cask
windows_store_or_app_installer
winget
scoop
chocolatey
apt_or_dpkg
dnf_or_rpm
pacman
snap
flatpak
nix_or_guix
cargo_install
pipx_or_uv_tool
container_image
organization_managed
manual_standalone
unknown
```

Initial product support may cover only a subset, but the owner interface must be extensible.

### 4.4 Evidence order

PM prefers evidence in this order:

1. A package/installation database owns the exact resolved file.
2. Provider-native metadata confirms the exact installation.
3. Package identity, manager root, executable path, and version all agree.
4. Signature/manifest/provenance agrees.
5. Path-layout heuristics agree.

A path such as `/usr/local/bin/codex` is not enough to infer npm or Homebrew ownership.

### 4.5 Confidence states

```text
proven
strongly_identified
probable
ambiguous
unknown
```

Update eligibility follows the confidence:

| Confidence | Allowed maintenance behavior |
|---|---|
| Proven | Automatic update may be allowed if all other checks pass. |
| Strongly identified | Automatic update may be allowed under policy. |
| Probable | Ask first and show the evidence. |
| Ambiguous | Require the user to select or disambiguate the installation. |
| Unknown | Manual instructions only; never guess a package manager. |

### 4.6 Duplicate and shadowed installations

The Provider Installation Manager distinguishes:

```text
Used by Puppet Master
Selected for this profile
Found on PATH
Shadowed
Older duplicate
Different host/environment
Wrong architecture
Broken
Unknown owner
Organization managed
```

A provider instance remains bound to a stable `installation_id`. A restart or PATH-order change must not silently move it to another installation.

## 5. Authentication and profile detection

Installation state and authentication state are independent.

For every selected installation/profile, PM should be able to report:

```text
installation_found
executable_healthy
authentication_known
authenticated
account_identity_known
product_or_plan_known
model_catalog_available
adapter_handshake_ready
required_capabilities_ready
generation_verified
usage_telemetry_available
```

A provider can be authenticated but not ready. A provider can be ready while Usage telemetry is unavailable.

### 5.1 Existing credentials first

PM first attempts to discover and verify existing **supported** credentials or CLI profiles on the owning host. It should:

1. Detect provider-native profiles, approved configuration roots, PM vault references, and supported environment-backed credentials.
2. Avoid copying raw tokens when the native CLI can own and refresh them.
3. Resolve account identity and product/plan where the provider exposes them.
4. Run model/catalog and adapter probes.
5. Optionally run a minimal generation check when cost, quota, privacy, and policy permit it.
6. Present multiple plausible profiles for selection rather than silently choosing a route that changes account, product, billing, or privacy.

“Use credentials already on this computer” means **reuse and verify a supported credential/profile**, not scrape every credential file or silently adopt whichever environment key happens to exist.

### 5.2 Provider-specific probes

The adapter owns the authoritative probe. Examples include:

- Codex app-server initialization, account read, account type/email where available, model list, skills, and actual runtime handshake.
- Claude CLI initialization/auth-status/capability probe, profile-root isolation, account class, model support, and skills.
- OpenCode managed/external server health, authentication/connected upstream providers, version compatibility, and model catalog.
- ACP providers such as Cursor or Grok: initialize, authenticate with the selected method, and verify session/model capability.

Generic checks such as “a credential file exists” or “the CLI printed a version” are not sufficient readiness proof.

### 5.3 Authentication ownership rules

#### CLI-owned OAuth or native login

Claude CLI and Antigravity CLI may use their own OAuth/native login flows. PM may:

- Create/select isolated supported profile roots.
- Launch the CLI-owned login flow.
- Open the URL or device-code page returned by the CLI.
- Verify identity, product, models, and readiness afterward.
- Route future calls through that profile.

PM does **not** label these as PM-direct OAuth and should normally not copy the CLI’s raw OAuth token.

#### PM-direct OAuth

PM may offer direct OAuth only for providers for which PM is an approved direct client, such as supported OpenAI/Codex, GitHub, and GitHub Copilot connections.

#### API key or secret-backed connection

PM opens the exact official key-creation page, accepts the key through a secure secret-entry/vault flow, validates it, resolves the account/product when possible, and refreshes models.

#### Device code, service account, ADC, endpoint, or no-auth

The onboarding manifest explicitly describes each supported method. Unsupported methods are not rendered as generic options.

## 6. Onboarding when no usable connection is found

OMP is the reference for the choreography; T3-style probes determine whether setup is actually needed.

### 6.1 Flow

```text
Discover installations and existing profiles
→ show what is already usable
→ user selects provider/installation/profile or Add Connection
→ show only valid setup methods
→ obtain PM-owned validated official URL/domain
→ open exact page in the user’s default browser
→ complete callback, device-code, paste-code, CLI login, API-key, or endpoint flow
→ validate authentication
→ resolve account/product
→ refresh models/capabilities
→ optionally refresh Usage
→ return to the exact originating row
```

If PM runs on a remote host, the host owns the installation/profile, but the exact browser page opens on the active user client. The UI must identify which host will own the resulting connection.

### 6.2 Onboarding manifest

Each provider/setup method needs declarative PM-owned metadata:

```text
provider_id
setup_method_id
human label
credential owner: cli | pm | external service
account creation URL
exact authorization or key-creation URL/domain allowlist
instructions
required scopes/organization/region
secure input type
callback/device-code behavior
validation procedure ID
model refresh procedure ID
usage refresh procedure ID
return destination
known limitations
source and last verification date
```

The manifest selects trusted procedure IDs. It cannot inject arbitrary executable commands.

### 6.3 Search-provider onboarding

First-run onboarding also detects and configures search providers. `Automatic` selects the first ready route according to user policy. PM distinguishes official API search, subscription-backed search, browser-backed search, and credential-free fallback, with privacy/cost/reliability disclosure.

## 7. Readiness states shown to the user

Recommended normal states:

```text
Not installed
Found — not selected
Needs sign-in
Signing in
Authenticated — checking access
Needs setup
Ready
Ready — usage details unavailable
Temporarily limited
Update required for compatibility
Update available
Update scheduled
Updating
Verifying
Rolled back
Broken — repair required
Managed by your organization
```

The readiness projection should always retain the lower-level reason and evidence in Details.

## 8. Provider update policies

### 8.1 System defaults

```text
Check for provider updates
  Automatic — recommended default
  Manual
  Off

Install provider updates
  Ask first — recommended default
  Automatically when idle
  Never

Version policy
  Latest compatible — recommended default
  Latest stable
  Pinned
  Managed by organization

Roll back when verification fails
  On — default where reliable rollback exists
```

Each installation may inherit or override these defaults.

### 8.2 Meaning of automatic update

`Automatically when idle` does not mean running `@latest` in the background. It is allowed only when PM has proven:

- Exact installation ownership.
- Exact host/environment.
- Correct update procedure and channel.
- Adapter compatibility with the target version.
- No active request or persistent session is using the installation.
- No organization/project pin forbids the update.
- Permission, script-policy, network, proxy, registry, disk, and lock preflight passes.
- A reliable rollback or recovery path exists.
- Battery, metered network, maintenance-window, and resource policies permit it.

Otherwise PM schedules, asks, or reports manual-only status.

## 9. Transactional update state machine

```text
discovered
→ ownership_proven
→ update_available
→ preflight
→ awaiting_authority_or_idle
→ staged_or_updating
→ verifying
→ activated
```

Failure paths:

```text
verification_failed
→ rolling_back
→ rolled_back

rollback_unavailable_or_failed
→ recovery_required
```

Every nonterminal state is persisted and restart-reconcilable.

### 9.1 Preflight

PM checks:

- Installation identity has not changed since detection.
- Current and target versions and channels.
- PM-adapter compatibility and known-bad-version list.
- Exact manager/updater availability.
- Required install-script policy.
- Write permissions without automatic elevation.
- Package-manager locks and active provider processes.
- Disk space.
- Network, registry, proxy, TLS, and certificate path.
- Organization and project policy.
- Rollback or repair capability.
- Current last-known-good generation.

PM never silently invokes `sudo`, force-kills another application, or modifies an organization-managed installation.

### 9.2 Update planning

The user or scheduler sees:

```text
installation and host being updated
current → target version
source/channel
accounts and connections affected
active work and whether it must wait
expected restart/drain behavior
rollback availability
reason this version is compatible
```

PM targets `latest_compatible` by default, not universally `latest` from npm.

### 9.3 Drain and admission

- Existing requests keep their frozen installation generation.
- New requests stop binding during the commit window.
- PM waits for idle or checkpoints/pauses eligible work.
- Interruption requires explicit authority.
- Provider-request concurrency and installation-maintenance concurrency are separate resources.

### 9.4 Execution

The update runs through a trusted owner-specific procedure under `RuntimeResourceGovernor` and `ObservableWork`.

Locks include:

```text
installation_id
host/environment
package-manager root/prefix/profile/generation
```

Unrelated installation roots may proceed concurrently; unsafe shared roots serialize.

### 9.5 Verification

Installer exit code and version text are not sufficient. Required verification can include:

```text
configured command still resolves
real path still identifies the intended installation
version is the accepted target
binary launches
provider-native doctor/health passes
auth profile remains recognized
account identity is unchanged unless expected
model catalog loads
adapter protocol initializes
required capabilities remain available
dependent profiles/accounts/connections refresh
optional minimal model request succeeds
```

A model-backed validation call is separately recorded as `validation` Usage. If it cannot be run, PM reports a lower readiness confidence rather than pretending it passed.

### 9.6 Commit and rollback

PM marks the new generation active only after verification. When verification fails:

- PM-managed installations switch atomically back to the last-known-good generation.
- Package-manager/native installations use a supported downgrade/reinstall path when reliable.
- Failed target and logs remain available for diagnosis.
- In-flight session truth remains frozen.
- The installation becomes `rolled_back`, `broken`, or `recovery_required` honestly.

Automatic update is unavailable when the owner adapter cannot provide a sufficiently safe rollback/recovery contract, unless the user explicitly accepts that risk.

## 10. PM-managed installation option

PM may offer:

> **Let Puppet Master manage this CLI**

A PM-managed layout can keep side-by-side versions:

```text
provider-installations/<provider>/<version>/
provider-installations/<provider>/current -> <version>
```

Benefits:

- Exact ownership.
- Atomic activation.
- Reliable rollback.
- Per-host compatibility testing.
- No global package-manager collision.
- Stable binding independent of PATH.

Adopting the executable does not automatically adopt or copy CLI-owned OAuth/authentication data. Binary lifecycle and profile lifecycle remain separate.

## 11. Failure-loop suppression and recovery

Each failed attempt is fingerprinted by:

```text
installation_id
real path
host/environment
target version
installation owner/update procedure
failure class
relevant manager/registry/proxy state
```

PM does not repeat the same unchanged failed automatic attempt at every launch or show the same update notice forever.

Possible actions:

```text
Retry
Repair
Use manual instructions
Choose the correct installation
Adopt into PM management
Snooze
Stop checking
Keep current version
Pin this version
Open logs
```

Failure classes include:

```text
installation_owner_unknown
wrong_install_target
duplicate_path_shadow
permission_denied
manager_lock
active_process_lock
package_scripts_blocked
registry_or_proxy_mismatch
network_unavailable
download_or_integrity_failed
update_timeout
command_failed
version_unchanged
binary_launch_failed
doctor_or_health_failed
auth_identity_changed
model_discovery_failed
adapter_incompatible
known_bad_version
rollback_unsupported
rollback_failed
managed_or_pinned
cancelled
```

## 12. T3 failure modes PM must explicitly avoid

### Wrong installation

T3 can resolve a bare command to an unrecognized standalone binary and later fall back to an npm-global update. PM must keep unknown ownership as manual-only and never create/update a second installation as a guess.

### False success

An installer can exit zero while postinstall scripts are blocked or the resulting CLI is unusable. PM requires exact executable, auth, catalog, protocol, and capability verification.

### Duplicate installations

PM displays and binds the exact installation rather than trusting current PATH order.

### Shared installation/account mismatch

PM updates the installation once and refreshes every dependent account/profile instead of attaching update truth to one provider-account row.

### Latest-channel mismatch

The installation owner/channel or PM compatibility manifest supplies target metadata. A Homebrew/native installation is not compared blindly to npm `latest`.

### Interrupted work

PM schedules/drains rather than replacing a binary under an active request.

## 13. Settings presentation

The provider family workspace should separate:

```text
Overview
Accounts & connections
Installations
Models
Usage & extra usage
Routing
Advanced/support
```

An installation row might read:

```text
Codex CLI · This computer                         Update ready
0.146.1 → 0.147.0 · Native installation
Used by Personal ChatGPT and Work API
```

Normal view answers:

- Is the installation healthy?
- Which version/channel is active?
- Which accounts/connections use it?
- Is an update ready, scheduled, managed, failed, or rolled back?
- Will current work be interrupted?
- What is the next safe action?

Advanced details contain:

- Configured/resolved/real path.
- Wrapper/symlink chain.
- Installation owner evidence and confidence.
- Manager root/profile/generation.
- Exact update procedure ID.
- Compatibility range and pin.
- Verification stages.
- Redacted logs and receipts.

Provider setup and installation maintenance should use the same shared manager grammar but remain distinct workflows.

## 14. Assistant Chat, Usage, Prompt Pipeline, and Project Sync boundaries

### Assistant Chat

Chat shows compact consequences only:

```text
Provider needs sign-in
Update scheduled when idle
Update failed — current version remains active
Update failed and rolled back
This thread is still using the previous frozen generation
```

Chat does not become the installation manager.

### Usage

- Local update checks and installer work are maintenance activity, not model usage.
- A model-backed validation probe is a separate validation-purpose provider event.
- Provider readiness and Usage telemetry availability are separate.
- Requested/effective installation, profile, account, product, and model remain attributable.

### Prompt Pipeline

The model receives only a compact effective projection when relevant:

```text
Codex route ready
Installation update scheduled after current Goal
No action required
```

Raw detection traces, package-manager state, logs, and update policy do not enter normal prompts.

### Project Sync and multi-host

Host-local state:

- Executable and package-manager installation.
- CLI-owned OAuth/session profile.
- Real paths, process IDs, manager locks, and update transaction.

Synchronizable non-secret state:

- Provider/account binding references.
- Required/compatible version policy.
- User update policy.
- Installation requirement and health summary.
- Receipts and last-known outcome.

Another device resolves a binding to a compatible local installation/profile. It does not receive the other host’s raw OAuth token or binary. The active client may open a browser page for a remote host’s setup flow.

## 15. Candidate runtime records

### ProviderInstallation

```text
installation_id
provider_family_id
host_or_environment_id
configured_command
resolved_path
real_path
launcher_or_shim_chain
architecture
installation_owner_kind
owner_identity
manager_root_or_profile
channel
current_version
compatible_version_range
version_policy
update_policy
confidence
detection_evidence_refs
dependent_profile_ids
dependent_connection_ids
active_session_ids
health_state
last_checked_at
last_updated_at
last_good_version
last_good_generation_ref
```

### ProviderAuthProfile

```text
profile_id
installation_id
provider_family_id
host_or_environment_id
display_name
auth_owner: cli | pm | external
auth_method
profile_root_or_vault_ref
account_id
provider_native_identity
product_or_plan
status
last_verified_at
model_catalog_revision
usage_telemetry_state
```

### ProviderUpdateAttempt

```text
attempt_id
installation_id
requested_target
effective_target
procedure_id
policy_source
state
preflight_results
resource_lease_ids
started_at
installer_finished_at
verification_finished_at
failure_class
verification_results
rollback_state
log_artifact_ref
receipt_ref
```

## 16. Candidate commands and events

These are provisional names for the later command/wiring audit, not frozen canon.

### Commands

```text
provider.installation.rescan
provider.installation.select
provider.installation.adopt
provider.installation.open_details
provider.installation.check_update
provider.installation.update_now
provider.installation.schedule_update
provider.installation.cancel_update
provider.installation.rollback
provider.installation.repair
provider.installation.pin_version
provider.auth.discover_profiles
provider.auth.select_profile
provider.auth.start_setup
provider.auth.revalidate
provider.models.refresh
provider.usage.refresh
```

### Events

```text
provider_installation.discovered
provider_installation.selected
provider_installation.identity_changed
provider_auth.discovered
provider_auth.changed
provider_readiness.changed
provider_update.available
provider_update.scheduled
provider_update.started
provider_update.progress
provider_update.verifying
provider_update.activated
provider_update.failed
provider_update.rolling_back
provider_update.rolled_back
provider_update.recovery_required
```

## 17. Security and permission rules

- Only PM-owned/adapter-owned trusted procedure IDs may execute maintenance.
- URLs are PM-owned, provider-specific, official-domain allowlisted, and versioned.
- Secrets use secure entry/vault references and are redacted from logs, receipts, Project Sync, and prompts.
- No automatic elevation or arbitrary shell interpolation.
- No silent process termination.
- No mutation of ambiguous, unknown-owner, pinned, or organization-managed installations.
- FileSafe and Permissions govern installation directories, profile roots, external commands, downloads, and rollback.
- Downloaded PM-managed artifacts require provenance/signature/hash verification according to release-supply-chain policy.
- Setup, update, repair, and rollback have explicit receipts.

## 18. Required tests

### Discovery

- Bare command resolves to unknown standalone installation: no npm/Homebrew guess.
- Symlink, shell wrapper, Node bin link, Windows shim, and App Execution Alias chains.
- Duplicate PATH installations and persistent selected binding.
- Different architectures and hosts.
- Package database owns exact file.
- Conflicting package-owner evidence.
- Unknown/manual installation.

### Authentication

- Several existing profiles; user selection is required when route consequences differ.
- Claude CLI and Antigravity CLI OAuth remain CLI-owned.
- PM-direct OAuth only for supported direct providers.
- API key saved but entitlement/model access fails: Authenticated, not Ready.
- Provider Ready while Usage telemetry is unavailable.
- Auth identity changes unexpectedly after update.
- Profile isolation across concurrent threads and accounts.

### Onboarding

- Exact official URL opens.
- Callback, device code, paste code, CLI login, API key, and endpoint flows.
- Remote host opens browser on active client and stores auth on correct host.
- User cancels or browser cannot open.
- Return to exact originating model/free-model/search-provider row.
- URL/domain or manifest validation failure blocks safely.

### Updating

- npm, pnpm, Bun, Homebrew, provider-native, PM-managed, and manual-only owners.
- Package-manager command exits zero but resulting binary is broken.
- Permission, script-policy, manager-lock, active-process, disk, proxy, registry, offline, timeout, and integrity failures.
- Active provider request causes schedule/drain, not interruption.
- Several accounts share one installation: one update and all dependents refresh.
- Two installations on separate hosts update independently.
- Shared manager root serializes; unrelated roots proceed.
- Daemon restart at every nonterminal update state.
- Known-bad target quarantine.
- Failure-loop suppression.
- Managed/pinned installation reports compatibility without mutating.
- Automatic-when-idle under battery, metered network, poor connection, and usage pressure.
- Rollback supported, unsupported, and failed.
- No secrets enter logs or synchronized Project state.

## 19. Later packet/document impact

When packet updates resume, this handoff affects at least:

- Settings bakeoff and selected-concept audit packet.
- Remaining Runtime Systems.
- Assistant Chat status/demo states.
- Usage maintenance/validation attribution.
- Prompt Complexity compact operational projections.
- Performance and RuntimeResourceGovernor integration.
- Project Sync host-local/synchronized binding rules.
- BinaryLocator, Multi-Account, Models, provider adapters, Permissions, FileSafe, Release Supply Chain, Commands, Wiring, DRY, storage/events, and tests.

It should not be implemented as a giant provider-specific form or a giant model-facing instruction block.

## 20. Decisions fixed by this handoff

1. T3 is the primary reference for provider-specific discovery and readiness probes.
2. OMP is the primary reference for setup choreography and exact browser destinations.
3. BinaryLocator remains discovery-only.
4. Installation, profile/account, connection/product, and model are separate identities.
5. PM inventories all candidates and binds the exact selected installation.
6. Package-manager ownership is proof-based; unknown ownership is manual-only.
7. Existing supported profiles are discovered and verified before asking the user to sign in.
8. Claude CLI and Antigravity CLI OAuth are CLI-owned, not PM-direct OAuth.
9. Authentication, readiness, generation verification, and Usage telemetry are separate states.
10. Provider setup returns to the exact originating UI row.
11. Update target is the installation, not an account row.
12. Update checks may be automatic; installation defaults to Ask first.
13. Automatic installation is available only as verified `Automatically when idle`.
14. Default target is latest compatible, not universally latest.
15. Installer exit zero is not success; full post-update verification is required.
16. Active work is drained or scheduled, not interrupted silently.
17. Verification failure rolls back where supported and reports recovery honestly.
18. Repeated unchanged failures are cooled down and do not nag indefinitely.
19. PM-managed side-by-side installations are an optional high-reliability path.
20. Installations and CLI-owned profiles remain host-local; non-secret binding/policy state may synchronize.

## 21. Open decisions for the later planning agent

- Which installation-owner adapters are MVP versus later.
- Whether `Automatically when idle` is exposed globally at first release or only after adapter certification.
- Exact threshold for allowing automatic updates without guaranteed rollback.
- Whether minimal generation verification is default, opt-in, or provider-specific.
- How PM-managed adoption works for licenses that forbid redistribution or repackaging.
- How organization policy and managed installations are imported.
- Exact event/command names and canonical owner document.
- Exact retention period for update logs and failed staged installations.
- UI treatment for installations shared by multiple provider families or wrappers.

