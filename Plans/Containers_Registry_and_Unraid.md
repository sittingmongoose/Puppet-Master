# Containers, Registry, and Unraid Integration

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0087
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - docs involved: `Plans/Containers_Registry_and_Unraid.md`
  - Plans/Containers_Registry_and_Unraid.md
  - command registry
  - but `FinalGUISpec.md` already has project-scoped state containers like `project_state:v1:{project_id}`
  - FinalGUISpec.md
  - project_state:v1:{project_id}
  - `projects:v1` is a registry
  - projects:v1
  - registry identity
  - `projects:v1` currently mixes true registry fields with an under-defined `health status`.
  - health status
  - `Multi-Account.md` already distinguishes identities like `github_api`, registry identity, and Kubernetes context
  - Multi-Account.md
  - github_api
  - still treats tier identity as the filesystem and registry key, making lane-aware recovery and audit structurally unsafe.
  - Replace tier-keyed worktree path and registry assumptions before lane-named worktrees exist, or restart recovery will silently lose state.
  - `GATE-007` / `GATE-008` are still missing from the registry with no tombstone/reserved handling.
  - GATE-007
  - GATE-008
  - Reconcile command ownership around one enforceable registry boundary:
  - Command/event registry drift sharpened further:
  - Final GUI still requires side-panel targets like `Unraid` that the current canonical `cmd.panel.switch` payload cannot express.
  - Unraid
  - cmd.panel.switch
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `Plans/Containers_Registry_and_Unraid.md`
  - Container / Docker / Unraid ownership is still more fragmented than the main owner set suggested:
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Purpose and scope
This document makes Docker support first-class in the Puppet Master rewrite. The scope is broader than the current runtime/build defaults: Puppet Master must be able to build container images, run them for preview/testing, let the user open the running container when the project supports user-facing access, publish images to DockerHub, generate and maintain Unraid template XML, and manage the related Unraid template repository workflow.

This plan is the canonical SSOT for:
- DockerHub authentication UX and state modeling.
- Requested vs effective Docker auth capability.
- DockerHub namespace and repository discovery/selection/creation behavior.
- Protected repository-creation rules.
- First-class Docker management GUI behavior.
- Unraid template generation defaults and managed template-repository workflow.
- `ca_profile.xml` defaults, scope, editability, and image handling.

This plan does not replace the existing preview/build/runtime sections in `Plans/newtools.md`, the settings UI in `Plans/FinalGUISpec.md`, or the orchestrator control surface in `Plans/Orchestrator_Page.md`; it supplies the canonical detailed contract those docs must reference.

## Relationship to existing plans

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0090
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Relationship must be explicit, not inferred from same-project membership.
  - Existing UI docs have many local confirmation examples, but nothing yet defines how durable concern actions should differ from:
  - The existing `resume_url` pattern is a strong precedent.
  - resume_url
  - Once this is normalized, several existing `open in X` and `show in Y` actions may turn into thin wrappers instead of independent navigation systems.
  - open in X
  - show in Y
  - `GATE-010` needs an explicit relationship to:
  - GATE-010
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- `Plans/newtools.md` remains canonical for runtime/tool/preflight/evidence behavior, but must reference this plan for DockerHub browser auth, repository management, and Unraid template publishing.
- `Plans/FinalGUISpec.md` remains canonical for settings, controls, dialogs, and layout, but must reference this plan for Docker Manage surface requirements.
- `Plans/Orchestrator_Page.md` remains canonical for orchestrator control widgets and UICommand IDs, but must reference this plan for container-publish and template-repo actions.
- `Plans/feature-list.md` and `Plans/GUI_Rebuild_Requirements_Checklist.md` must register the new first-class GUI/runtime scope introduced here.

## Product goals
- Make Docker support a first-class workflow rather than a small extension of generic Preview/Build.
- Let the user authenticate to DockerHub using either browser-based login or a PAT, with explicit visibility into what capability is actually available.
- Let Puppet Master build and run containers for testing and user inspection from within the app.
- Let Puppet Master publish to DockerHub and safely create the missing repository when necessary.
- Let Puppet Master automatically generate/update Unraid XML after successful image publishing by default.
- Let Puppet Master manage a dedicated Unraid template repository by default, while allowing the user to disable managed template-repo handling.
- Keep secrets out of redb, project files, and evidence logs.
- Keep the GUI contextual so Docker-heavy controls appear when relevant without permanently cluttering non-container projects.

## User-visible surfaces

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0092
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - moving surfaces to canonical route payloads and runtime actions
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 1. Settings > Advanced > Containers & Registry

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

#### Source target target-0093
- Reconciliation action: stale_retirement
- Replace scope: exact_section
- Exact required items represented:
  - `[retired-token-1]` still preserves `[retired-token-2]` as both a page concept and a settings grouping label, which will keep reintroducing stale vocabulary.
  - [retired-token-1]
  - [retired-token-2]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The existing `Containers & Registry` settings area remains the primary configuration home, but it must be expanded to include:

- **Docker runtime controls**
  - runtime selector (`docker` default)
  - Docker binary path override
  - compose file/path defaults
  - compose project-name strategy (`auto`, `fixed`, `hash-based`)
  - build context path
  - Dockerfile path
  - target stage (optional)
  - target platforms and Buildx readiness status

- **DockerHub authentication controls**
  - browser-login button that opens the browser/device flow
  - PAT entry field
  - helper text that explicitly says PAT is recommended
  - inline guidance/link telling the user how to obtain a PAT
  - stored-auth status
  - account/namespace summary
  - validation button
  - clear/remove credentials action
  - requested auth mode vs effective capability display

- **DockerHub repository controls**
  - namespace selector/discovery
  - repository selector/discovery
  - refresh repositories action
  - create repository action
  - repository privacy control for creation flow
  - tag template defaults (`{commit}`, `{version}`, `{timestamp}` plus any future canonical tag variables)
  - push policy (`manual` default; optional `after_build`)

- **Unraid publishing controls**
  - `Generate/Update Unraid XML after successful publish` toggle (default: enabled)
  - `Manage Unraid template repository` toggle (default: enabled)
  - template repository path/remote settings
  - template repository setup flow (create-new or select-existing)
  - auto-push toggle (default: disabled)
  - one-click push action surfaced nearby even when auto-push is off
  - template repo status row (configured / missing / dirty / committed / ready-to-push)

- **Docker Manage visibility controls**
  - setting named exactly `Hide Docker Manage when not used in Project.`
  - default: enabled
  - behavior: when enabled, the contextual Docker Manage surface appears only when a Docker-related project is active; when disabled, the user may keep the Docker Manage surface available more broadly

- **Maintainer profile / `ca_profile.xml` controls**
  - scope selector: shared cross-project profile (default) vs per-project override
  - full edit form for all `ca_profile.xml` fields
  - profile image handling through upload/select or external URL
  - notice when the file was auto-generated and still needs review/configuration

### 2. Contextual Docker Manage surface

The canonical user-facing surface is **Docker Manager**.

Docker Manager is a first-class operational surface for containerized projects. It replaces `Docker Manage` as the canonical surface name and subsumes Publish / Unraid behavior.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/newtools.md

Required stable subviews:
- `Containers`
- `Images`
- `Compose`
- `Registries`
- `Build / Bake`
- `Publish / Unraid`
- advanced foldouts for `Networks`, `Volumes`, and `Contexts`
- project-focused `Kubernetes`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Orchestrator_Page.md

Surface rules:
- Docker is the default visible runtime mode when the project is Docker-related.
- Podman is an alternate runtime inside the same surface, not a separate panel.
- Kubernetes is a Docker Manager subview when manifests, Helm artifacts, kube-linked state, or explicit enablement are present.
- Unraid is integrated under `Publish / Unraid`; it does not require a separate top-level panel.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Permissions_System.md

Subview behavior minima:
- `Containers`: lifecycle, logs, inspect, attach/shell, stats, open app when an access URL exists
- `Images`: build, pull, push, tag, inspect, remove, prune, digest/tag visibility
- `Compose`: project/group lifecycle, service subsets, logs, restart, down/up, compose-group reopen state
- `Registries`: Docker Hub first, registry inventory/selection, reconnect, browse, pull, inspect
- `Build / Bake`: Dockerfile target selection, Buildx/Bake discovery, build-preview settings
- `Publish / Unraid`: requested vs effective auth state, protected repo creation, digest receipts, Unraid generation and template-repo follow-on
- `Kubernetes`: apply, diff, rollout status, logs, exec, port-forward, workload/resource view, Helm basics, image-to-cluster linkage

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 3. Orchestrator and dashboard integration
Docker-related actions must also remain available from orchestrator/dashboard build/preview surfaces when a Docker-related run is active. The contextual Docker Manage surface is not a replacement for orchestrator controls; it is a richer management layer that complements them.

## Docker project detection and visibility rules
A project is treated as Docker-related when Puppet Master detects a container-oriented workflow such as:
- a `Dockerfile`
- compose configuration
- container-based preview/build target
- container publish settings already configured for the project
- an existing managed Unraid template repository associated with the project

When detection is positive:
- show the contextual Docker Manage surface
- enable DockerHub repository, preview, publish, and Unraid template actions
- retain the user’s last-used Docker surface state for that project

When detection is negative and `Hide Docker Manage when not used in Project.` is enabled:
- hide the contextual Docker Manage surface from normal project navigation
- retain settings and state, but do not foreground Docker workflows

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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0094
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `abandoned` is not the same thing as simple failure
  - abandoned
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

If auth expires during image push, Puppet Master MUST emit `docker.publish.failed` with `reason_code: auth_expired`, preserve the local build result, and surface a re-auth + retry CTA without forcing a rebuild.

### Requested vs effective auth state

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0098
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - but snapshots still omit requested values, downgrade reasons, effective account/operational identity, and actor/surface scope
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
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
- evidence/log capture must redact credentials, auth headers, and token-bearing environment variables

## DockerHub repository discovery, selection, and creation

### Repository selection behavior
Puppet Master must let the user:
- view discovered namespaces
- select the target namespace
- view repositories within the selected namespace
- refresh repository lists on demand
- choose an existing repository for push
- create a missing repository if needed for first publish

DockerHub API behavior must be documented clearly:
- use Docker CLI / Buildx for local build, run, login, and push behavior
- use Docker Hub API for namespace/repository discovery and repository creation when app-managed listing/creation is needed
- do not conflate image registry push with template distribution

### Missing repository behavior
If the selected DockerHub repository does not exist:
- Puppet Master may offer to create it automatically as part of first-push preparation
- the creation step must be explicit and visible
- the confirmation step must show:
  - namespace
  - repository name
  - privacy
- the confirmation step is mandatory and cannot be bypassed by YOLO modes, agent autonomy, or any other fast-path setting

#### Repository creation confirmation flow

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0104
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - which actions need no confirmation
  - which need light confirmation
  - which need strong confirmation
  - classify actions by both `confirmation level` and `reversibility`
  - confirmation level
  - reversibility
  - actions that must go through a canonical approval/blocked flow and cannot be bypassed by generic UI confirmation
  - narrow Source Control panel means destructive actions there should likely route through compact but clear confirmation patterns, not giant forms
  - `strong` confirmation
  - strong
  - FileManager’s future `OpenArtifact`-style flow should resolve by:
  - OpenArtifact
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Repository creation is a two-step flow:

1. `cmd.docker.create_repository` validates the proposed namespace/repository/privacy tuple and emits `docker.repository.create.confirmation_requested`.
2. The confirmation modal shows namespace, repository name, privacy, and the private-by-default notice.
3. Confirm dispatches `cmd.docker.create_repository.confirm`.
4. Cancel dispatches `cmd.docker.create_repository.cancel`.

This confirmation is distinct from image-push approval. Approving an image push MUST NOT implicitly approve creation of a missing DockerHub repository.

### Default repository privacy

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0096
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - maybe `auto_return_to_live = false` by default
  - auto_return_to_live = false
  - bulk actions should default to navigation, triage, and low-risk state updates
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- default privacy for newly created repositories: private
- the confirmation dialog must make this default explicit
- the user may change privacy in the dialog before creation

## Build, run, preview, and publish flow

### Build flow
- use `docker buildx build` as the deterministic image-build path
- perform preflight before build: engine reachability, compose/config validity, buildx availability, required ports, target repo/auth when push is requested
- capture structured build results including artifacts, logs, and image identity
- surface build results in chat, orchestrator, and Docker Manage UI

### Run/preview flow
Puppet Master must be able to deploy and run project containers from within the app for testing workflows. When the project exposes user-facing access, Puppet Master must also provide a user-visible way to open/check the running container from within the UI.

Required actions:
- start preview/run
- stop preview/run
- open exposed web UI or endpoint when available
- open logs
- inspect health status
- show resolved access URL/port if one exists

#### Runtime access URL resolution

Access URL resolution order is:

1. explicit user override for this project
2. first published host-port mapping from compose / container inspect, preferring ports `443`, `80`, `3000`, `8080`, then the next published port
3. known web-UI metadata/label if present
4. no access URL

When no access URL is available, Docker Manage MUST show `No direct access URL detected` and disable the open action rather than guessing.

### Publish flow
#### Publish execution, approval, and blocked-outcome contract

The canonical publish path is a **two-step** model:

1. `cmd.orchestrator.build_run` performs local build / preview preparation only.
2. `cmd.orchestrator.push_image` performs remote DockerHub publication only.

Normative rules:
- `cmd.orchestrator.build_run` MUST NOT create DockerHub repositories, push images, create remote template repos, or push remote template repos.
- `push_policy = after_build` means Puppet Master automatically dispatches `cmd.orchestrator.push_image` **after** a successful local build result exists; it does **not** fold remote publish into `build_run`.
- A direct user click on **Build** approves build only.
- A direct user click on **Push image** approves image push only.
- If the target DockerHub repository is missing, repository creation remains a separate side effect and requires its own confirmation/approval.
- If managed Unraid template-repo push is later requested, that remote push is a separate side effect and requires its own approval.
- `docker.publish.failed` means Puppet Master attempted the publish operation and the operation failed at runtime.
- `docker.publish.blocked` means Puppet Master intentionally did not execute the remote side effect because confirmation or permission approval was missing, rejected, or cancelled.

#### Missing-repository interruption and resume contract

If `cmd.orchestrator.push_image` resolves a missing target repository:

1. Puppet Master MUST preserve the local build result and enter `awaiting_repo_creation_confirmation`.
2. Puppet Master MUST emit `docker.repository.create.confirmation_requested`.
3. Confirming creation dispatches `cmd.docker.create_repository.confirm`.
4. On successful repository creation, Puppet Master resumes the pending `cmd.orchestrator.push_image` attempt without forcing a rebuild.
5. If repository creation is cancelled, rejected, or blocked by policy, Puppet Master MUST emit `docker.publish.blocked` with:
   - `reason_code: repo_creation_not_confirmed`
   - `blocked_step: create_repository`
   - `recovery_options[]`
6. `docker.publish.blocked` MUST preserve the already-built local image/result so the user can retry without rebuilding.

- publish uses DockerHub-targeted image tags and namespace/repository selection
- push policy remains `manual` by default with optional `after_build`
- after successful push, capture and surface:
  - pushed tags
  - digest(s)
  - registry host
  - target namespace/repository
  - platform list
  - sanitized logs path

#### Tag template resolution contract

#### Auto-push approval and canonical publish-reference contract

Approval rules:
- `push_policy = after_build` does not grant standing approval for remote side effects.
- Clicking **Build** approves only local build execution.
- When a successful build reaches the auto-dispatch point, Puppet Master MUST evaluate `external_publish_side_effect` for `cmd.orchestrator.push_image`.
- If publish approval is not satisfied at that point, Puppet Master MUST emit `docker.publish.blocked` with `blocked_step: push_image`, preserve the local build result, and surface **Push image** as the recovery CTA.
- DockerHub repository creation and managed-template remote repo create/push remain separately approved side effects even when `push_policy = after_build` is enabled.

Canonical template source image selection:
- If the project sets `primary_publish_tag`, use it.
- Otherwise use the first tag emitted by the resolved tag-template list.
- Otherwise fall back to the lexicographically smallest tag only for legacy results that lack ordering metadata.
- If `docker_publish_result.digests[]` contains a manifest-list digest, that digest is the canonical `image_digest`; otherwise use the single pushed digest.
- The generated application template MUST use `<Repository>` = `<namespace>/<repository>:<primary_publish_tag>`.

| Variable | Resolution source | Format | Failure behavior |
|---|---|---|---|
| `{commit}` | HEAD commit of the active project repo | first 12 lowercase hex chars | block publish if the template references `{commit}` and no HEAD commit exists |
| `{version}` | detected canonical project version (`Cargo.toml`, `package.json`, then explicit user override) | lowercase value after Docker-tag sanitization | block publish if unresolved and no user override exists |
| `{timestamp}` | UTC publish-start time | `YYYYMMDD-HHMMSSZ` | never fails |

- Tag templates MAY combine literals and multiple variables.
- After substitution, tags MUST be lowercased.
- Characters outside `[a-z0-9_.-]` MUST be replaced with `-`.
- Consecutive `-` MUST be collapsed.
- An empty post-sanitization tag is invalid and MUST block publish with explicit remediation text.

### Post-publish follow-on flow
After successful image publishing:
1. if `Generate/Update Unraid XML after successful publish` is enabled, generate or update the Unraid XML
2. if managed template-repo workflow is enabled, update the target template repo
3. auto-commit the template-repo change by default
4. do not auto-push by default
5. present a one-click push action from the UI

## Unraid XML generation and distribution model

### Canonical generated-artifact contract

The managed Unraid flow produces three artifact classes:

1. **Application template XML** at `<maintainer_slug>/<project_slug>.xml`
2. **Maintainer profile XML** at `ca_profile.xml`
3. **Repo-managed image assets** under `assets/maintainer/` when the user uploads images instead of referencing external URLs

#### Artifact input provenance

| Canonical PM field | Primary source | Fallback / user override | Required for auto-commit | Required for auto-push |
|---|---|---|---|---|
| `project_slug` | Project identity | User override in template settings | Yes | Yes |
| `display_name` | Project display name | User override | Yes | Yes |
| `image_ref` | `docker_publish_result` (`namespace/repository:tag`) | None | Yes | Yes |
| `image_digest` | `docker_publish_result.digest[]` | None | No | No |
| `registry_host` | `docker_publish_result.registry_host` | None | Yes | Yes |
| `web_ui_url` | Resolved preview/runtime access URL | User-entered URL override | No | No |
| `support_url` | Project support/docs URL | User-entered maintainer URL | No | Yes |
| `overview_markdown` | Project summary / README excerpt / prior template content | User-edited value | No | Yes |
| `icon_source` | Repo-managed uploaded asset or external URL | User choice | No | Yes |
| `category_labels[]` | Project metadata / prior template content | User-edited value | No | Yes |
| `config_items[]` | Compose/runtime config + prior template content | User-edited value | No | No |
| `maintainer_slug` | DockerHub namespace by default | User override | Yes | Yes |
| `maintainer_profile` | Shared or per-project `ca_profile` state | None | Yes | Yes |

#### App-template minimum contract

The first implementation MUST support, at minimum, deterministic generation and round-trip update of these conceptual fields:

- display name
- image reference
- registry host
- overview/description content
- support URL
- web UI URL when present
- icon/image source
- category labels
- config entries derived from ports / volumes / environment / path mappings
- maintainer slug and owning template path

Implementation rule:
- Puppet Master MAY use an internal normalized model rather than hard-coding UI logic directly to raw XML tags.
- However, the normalized model MUST map 1:1 to emitted XML content and MUST be documented.
- Unknown fields present in an existing template MUST be preserved on update unless the user explicitly removes them.

#### `ca_profile.xml` round-trip rule
#### Explicit editability contract for all fields

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0102
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - likely still needs explicit cross-reference that only certain pages/tabs are widget-composed.
  - `unavailable`: route to record-backed fallback views or explicit recovery/refresh actions
  - unavailable
  - Add explicit successor/predecessor links where `superseded` is possible.
  - superseded
  - Likely source layers that need explicit labeling:
  - initial load should show a recent slice, with explicit load-older / jump controls
  - explicit identity fields
  - Historical-only projects need explicit protection against false alarm states.
  - No explicit `approval_scope_key` or equivalent exists to separate:
  - approval_scope_key
  - Add an explicit `execution_unit_context` section to `Executor_Protocol.md` that names:
  - execution_unit_context
  - Executor_Protocol.md
  - `GATE-010` has no explicit notion of:
  - GATE-010
  - Add an explicit command-catalog pattern for:
  - `FinalGUISpec.md` is especially explicit here:
  - FinalGUISpec.md
  - Add an explicit command-normalization model with three layers:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The statement "all `ca_profile.xml` fields are editable" is satisfied by a two-layer editor model:

1. **Structured editor** for the canonical known fields exposed in the standard UI.
2. **Advanced raw XML editor** for any field, element, attribute, or passthrough content not yet modeled by structured controls.

Normative rules:
- The structured editor MUST round-trip through the same normalized model used by generation/update.
- Unknown or currently unmodeled content MUST remain editable through the advanced raw XML surface.
- Saving from either surface MUST preserve unmodified passthrough content verbatim.
- Puppet Master MUST NOT claim "all fields editable" unless both layers exist.

`ca_profile.xml` editing is a **round-trip** contract, not a one-way generator.

Required behavior:
- Puppet Master MUST parse existing `ca_profile.xml` into a normalized editor model.
- The editor model MUST preserve all existing fields, including fields the current UI does not yet expose individually.
- The first implementation MUST expose editable controls for, at minimum:
  - maintainer display name
  - maintainer slug
  - overview/about text
  - support URL
  - icon/image source
- When the user uploads an image, Puppet Master MUST copy it into the managed template repo by default and rewrite the profile to reference that repo-managed asset.
- When the user selects external URL mode, Puppet Master MUST preserve the external URL exactly as entered.

#### Validation and review rules

- A successful Docker publish is required before Puppet Master may treat `image_ref` as final for generated template output.
- Missing `support_url`, `overview_markdown`, or `icon_source` MUST mark the generated result as `needs_review`.
- `needs_review` MUST NOT block local save or local auto-commit, but it MUST block auto-push and MUST surface a visible warning in Docker Manage.
- If Puppet Master updates an existing template and cannot map a field safely, it MUST preserve the existing field and mark the template result as `needs_review` rather than dropping data silently.

#### Known-field registry and XML mapping (first implementation)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

#### Source target target-0103
- Reconciliation action: stale_retirement
- Replace scope: exact_section
- Exact required items represented:
  - `[retired-token-1]` will keep reintroducing stale page assumptions until the owner docs are reconciled first.
  - [retired-token-1]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
#### XML emission minima for first implementation

The first implementation emits application templates with one canonical root shape:

```xml
<Container version="2">
  <Name>Example App</Name>
  <Repository>namespace/repository:tag</Repository>
  <Registry>https://registry-1.docker.io</Registry>
  <Network>bridge</Network>
  <MyIP/>
  <WebUI>http://[IP]:[PORT:8080]</WebUI>
  <Support>https://example.invalid/support</Support>
  <Overview><![CDATA[Markdown or HTML-safe overview text]]></Overview>
  <Category>Tools:Utilities</Category>
  <Icon>assets/maintainer/icon.png</Icon>
  <Config ... />
</Container>
```

Canonical rules:
- Root element is exactly `<Container version="2">`.
- Known child elements emit in this order: `Name`, `Repository`, `Registry`, `Network`, `MyIP`, `WebUI`, `Support`, `Overview`, `Category`, `Icon`, then repeated `Config`.
- `Overview` emits as CDATA.
- All other known text nodes emit as escaped text.
- Optional known elements are omitted when empty.
- Unknown elements, unknown attributes, and XML comments from an existing template MUST be preserved verbatim and re-emitted after the last known sibling in their original relative order unless the user explicitly removes them.
- Existing unknown root attributes MUST be preserved verbatim on round-trip update.

`Config` type mapping for first implementation:

| Normalized field | Emitted `Config` shape | Required attributes |
|---|---|---|
| Port mapping | `<Config Type="Port" ... />` | `Name`, `Target`, `Default`, `Mode`, `Display`, `Required`, `Mask="false"` |
| Path / bind mount | `<Config Type="Path" ... />` | `Name`, `Target`, `Default`, `Display`, `Required`, `Mask="false"` |
| Environment variable | `<Config Type="Variable" ... />` | `Name`, `Target`, `Default`, `Display`, `Required`, `Mask` |
| Device mapping | `<Config Type="Device" ... />` | `Name`, `Target`, `Default`, `Display`, `Required`, `Mask="false"` |

Attribute mapping rules:
- `Name` = stable user-visible label; fall back to `Target` when no label exists.
- `Target` = container-side port/path/variable/device identifier.
- `Default` = host-side or default value.
- `Display` = `always` for first implementation unless hidden by explicit user choice.
- `Required` = `true` only when the value is mandatory for a successful container run.
- `Mask` = `true` only for secret environment variables; otherwise `false`.
- `Mode` is required only for `Type="Port"` and is exactly `tcp` or `udp`.

If Puppet Master cannot map a source item into the required attribute set without inventing values, it MUST preserve the prior XML unchanged for that item and mark the result `needs_review`.

##### Application template XML

| Normalized field | XML element / shape | Required for local save | Required for auto-push |
|---|---|---|---|
| `display_name` | `<Name>` text | Yes | Yes |
| `image_ref` | `<Repository>` text | Yes | Yes |
| `registry_host` | `<Registry>` text | No | Yes |
| `web_ui_url` | `<WebUI>` text | No | No |
| `support_url` | `<Support>` text | No | Yes |
| `overview_markdown` | `<Overview>` CDATA | No | Yes |
| `icon_source` | `<Icon>` text | No | Yes |
| `category_labels[]` | `<Category>` text | No | Yes |
| `config_items[]` | repeated `<Config ... />` elements | No | No |

##### `ca_profile.xml` recognized fields

| Normalized field | XML element | Required for auto-push |
|---|---|---|
| `display_name` | `<Name>` | Yes |
| `overview_markdown` | `<Overview>` | Yes |
| `support_url` | `<Support>` | Yes |
| `icon_source` | `<Icon>` | Yes |

### Distribution model
### Unmanaged generation target contract

If `Generate/Update Unraid XML after successful publish` is enabled but managed template-repo handling is disabled, unconfigured, or invalid, Puppet Master MUST still generate a local artifact set under:

`.puppet-master/generated/unraid/<project_id>/<publish_result_id>/`

Required output:
- `template/<maintainer_slug>/<project_slug>.xml`
- `template/ca_profile.xml` when the active profile is projected into the result
- `template/assets/maintainer/**` for repo-managed uploaded assets referenced by the result

In this mode:
- `unraid.template.generation.completed` still fires
- `template_repo_id` is `null`
- `commit_status` is `not_attempted`
- `push_status` is `not_attempted`
- UI copy MUST describe the result as **generated locally / not attached to a managed repo**

The default distribution target for generated Unraid XML is a separate Unraid template repository / Community Applications-friendly template location. The main application repository may still be offered as an optional export target, but it is not the primary default.

Rationale that must be preserved in docs:
- DockerHub stores images, not Unraid XML
- public Unraid template distribution is commonly done through GitHub template repositories / Community Applications workflows
- installed copies are stored locally on the Unraid server under `/boot/config/plugins/dockerMan/templates-user`

### Generation default
- automatically generate/update Unraid XML after successful image publish by default
- nearby GUI toggle disables this behavior
- generation is part of the first-class Docker publish flow, not a hidden manual afterthought

### Managed template-repo workflow default
- Puppet Master should manage the Unraid template repository workflow itself by default
- the user can disable managed template-repo handling in settings

## Unraid template repository setup, layout, and publishing

### Managed template-repo identity and lifecycle contract

#### Default identity rules

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0101
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Higher-risk runtime actions should not default to global shortcuts unless they already pass the stronger action-policy rules.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

When the user chooses **create new template repo**, Puppet Master defaults to:

- **repo name:** `<project_slug>-unraid-template`
- **default branch:** `main`
- **local managed working copy:** `.puppet-master/unraid-template-repos/<project_id>/`
- **template path inside repo:** `<maintainer_slug>/<project_slug>.xml`
- **maintainer profile path:** `ca_profile.xml`

The user may override repo name, branch, local path, and maintainer slug during setup.

#### Existing-repo selection validation

When the user chooses **select existing template repo**, Puppet Master MUST validate:

1. the path/repo is reachable
2. the repo root is writable locally
3. the selected branch exists or can be created explicitly
4. the repo either already matches the required layout or can be migrated with explicit user confirmation
5. the repo does not contain uncommitted unrelated changes unless the user explicitly adopts the repo in its current state

If validation fails, Puppet Master MUST keep managed publishing disabled for that project and show the exact failing condition.

#### Template-repo status enum

The template-repo status row MUST use one canonical state model:

| State | Meaning | User-visible consequence |
|---|---|---|
| `unconfigured` | Managed publishing enabled but no repo has been set up yet | Show setup CTA |
| `config_invalid` | Repo/path/branch settings exist but validation failed | Block publish follow-on push; show remediation |
| `clean` | Repo is configured and has no pending local changes | Ready for next generation/update |
| `dirty_uncommitted` | Managed files changed locally and are not yet committed | Auto-commit may run if changes are PM-owned and safe |
| `committed_local_only` | Latest managed change is committed locally but not yet pushed | Show one-click push CTA |
| `push_in_progress` | Remote push is running | Disable duplicate push actions |
| `push_failed` | Remote push failed after local commit | Preserve local commit; show retry CTA and error |
| `diverged_remote` | Remote branch changed or local branch is behind/ahead unexpectedly | Block auto-push; require review/reconcile |
| `needs_review` | Generated template/profile content is incomplete or review-blocked | Allow local inspection/editing; block auto-push |

#### Transition rules

- After successful image publish, Puppet Master generates or updates the managed XML artifacts.
- If managed publishing is enabled and validation passes, Puppet Master MAY auto-commit the change by default.
- `needs_review` is entered when required review fields are missing (`support_url`, `overview_markdown`, `icon_source`) or when existing XML cannot be mapped safely without preserving passthrough content.
- `needs_review` is cleared only when a regeneration pass or explicit user save produces a template/profile with all review-required fields present and no unmapped-field warning remains.
- When `needs_review` clears, the next state is:
  - `dirty_uncommitted` if managed files changed locally
  - `clean` if no local managed diff remains
- PM-owned paths are exactly:
  - `ca_profile.xml`
  - `<maintainer_slug>/<project_slug>.xml`
  - `assets/maintainer/**` written in the current generation pass
- Auto-commit is allowed only when the working-tree diff is fully contained within the PM-owned path set for the current generation pass.
- Any unrelated tracked or untracked file change blocks auto-commit and surfaces a `Review repo state` CTA.
- Auto-commit MUST stop and surface review instead of committing when:
  - repo status is `config_invalid`, `diverged_remote`, or `needs_review`
  - unrelated uncommitted files exist in the repo
  - required managed paths cannot be updated deterministically
- A successful local auto-commit transitions the repo to `committed_local_only`.
- One-click push transitions `committed_local_only -> push_in_progress -> clean` on success.
- A failed push transitions `push_in_progress -> push_failed` and MUST preserve the local commit for retry.
- `diverged_remote` exits only after the user resolves the branch divergence externally or through a future dedicated reconcile flow and Puppet Master re-validates the repo state.

`commit_status` enum:
- `not_attempted`
- `committed`
- `skipped_review_required`
- `skipped_unrelated_changes`
- `failed`

`push_status` enum:
- `not_attempted`
- `skipped_auto_push_disabled`
- `push_in_progress`
- `completed`
- `failed`

#### Dirty-repo safety rule

If the selected repo already contains unrelated local modifications, Puppet Master MUST NOT silently fold managed template changes into that worktree state. It MUST require one of:

- user cleans the repo first
- user explicitly adopts the dirty repo state
- user switches to a different managed repo path

This prevents the managed workflow from mutating unrelated maintainer work without review.

### Setup flow
When managed Unraid template-repo publishing is enabled and no template repo is configured yet, Puppet Master must offer both:
- creating a new template repo automatically
- selecting an existing template repo

### Default repo shape
- default: one template repo per project

### Default layout
For managed per-project template repos, use:
- root-level `ca_profile.xml`
- maintainer folder
- `project-name.xml` inside that maintainer folder

### Maintainer folder source
- default the maintainer folder name to the project’s DockerHub namespace
- allow the user to override it with a custom maintainer slug

### Commit and push behavior
- auto-commit template-repo changes by default
- auto-push remains configurable but default disabled
- expose a one-click push action in the UI after commit
- present template-repo dirty / committed / ready-to-push status in the Docker Manage surface

## `ca_profile.xml` behavior

### Generation rule
If `ca_profile.xml` does not exist, Puppet Master must generate it and tell the user it still needs to be configured/reviewed.

### Scope model
- default scope: shared cross-project maintainer profile
- optional override: per-project maintainer profile

### Editability rule
All `ca_profile.xml` fields must be editable by the user.

### Image handling
The `ca_profile.xml` editor must support both:
- uploading/selecting an image that Puppet Master copies into the managed template repository
- referencing an external hosted image URL

Default for uploaded images:
- if the user uploads a picture through Puppet Master, copy it into the managed template repository by default and point `ca_profile.xml` at that repo-managed asset

### User-visible messaging
When `ca_profile.xml` was auto-generated, the UI must show a clear reminder that the user should configure public-facing maintainer metadata before treating the repo as final.

## Data/state model to preserve in implementation docs

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0088
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Prompt_Pipeline.md` and `Contracts_V0.md` preserve `requested_account_policy`
  - Prompt_Pipeline.md
  - Contracts_V0.md
  - requested_account_policy
  - destructive worktree/cleanup actions must preserve historical lineage even when the live object is removed
  - It should generally NOT try to preserve:
  - The Slint-facing `GraphNodeUI` and callbacks still preserve the same assumptions:
  - GraphNodeUI
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
### Canonical scope split and blocked-outcome state

To keep GUI, orchestrator, storage, and post-publish behavior aligned, the following scope rules are normative:

- `Hide Docker Manage when not used in Project.` is a **global** setting.
- Docker Manage navigation/dock/panel state is **project-scoped**.
- Shared `ca_profile` source state is **global** unless the project explicitly enables per-project override.
- Template-repo configuration and TemplateRepoStatus are **project-scoped**.
- Effective-auth snapshots are advisory cached state only until revalidation.
- Blocked remote side effects are first-class state transitions and MUST remain distinguishable from runtime failures in UI state, event state, and persisted results.

Implementation-facing docs should preserve the following state concepts so GUI, orchestration, and persistence agree on one model:
- Docker project detection state
- `Hide Docker Manage when not used in Project.` setting
- requested auth mode
- effective auth capability set
- validated DockerHub account identity
- selected namespace and repository
- selected repository privacy for first-time creation
- push policy
- image/tag template defaults
- auto-generate Unraid XML toggle
- managed template-repo enabled toggle
- template-repo location / remote / branch state
- auto-push toggle
- template-repo dirty/committed/pushed status
- shared vs per-project `ca_profile.xml` scope
- uploaded image asset mode vs external URL mode

## Safety and constraints
- repository creation confirmation is mandatory and non-bypassable
- secrets must not be written to redb, project files, YAML, or evidence
- publish/template-repo flows must redact secrets in logs/evidence
- docs must distinguish DockerHub image distribution from Unraid template distribution
- browser login and PAT must be documented as different inputs that may lead to different effective capability
- the UI must not claim full repository-management support when validation shows only partial capability

## Initial non-goals
The first-class scope above does **not** require initial automation for:
- Community Applications submission-form submission
- forum support-thread creation
- fully automatic remote template-repo push by default
- bypassing manual review for public maintainer metadata correctness

## Acceptance criteria
- The GUI exposes both browser login and PAT entry, with PAT-recommended helper text and clear guidance.
- The GUI shows requested auth mode and effective capability separately.
- DockerHub namespace and repository discovery works from supported auth inputs.
- Missing DockerHub repo creation is guarded by a mandatory non-bypassable confirmation showing namespace, repo name, and privacy.
- New repository creation defaults to private.
- Puppet Master can build and run project containers for testing and provide user-openable access points when available.
- Docker publish results surface digest/tag/registry info without leaking credentials.
- Unraid XML auto-generation/update is enabled by default after successful publish and can be disabled near DockerHub settings.
- Managed Unraid template-repo workflow is enabled by default and can be disabled.
- The default template-repo layout is root `ca_profile.xml` plus maintainer folder plus `project-name.xml`.
- The default maintainer folder source is the DockerHub namespace, but the user can override it.
- `ca_profile.xml` is generated if missing, all fields are editable, shared cross-project scope is default, and per-project override is available.
- Profile images can be either repo-managed uploaded assets or externally hosted URLs; uploaded images default to repo-managed assets.
- Template-repo changes auto-commit by default, do not auto-push by default, and expose a one-click push action in the UI.

## Remote Side-Effect Blocked Payload Normalization (2026-03-09)

The Docker/Unraid remote-side-effect contracts remain the reference pattern for blocked remote mutation and must use canonical runtime payload names.

Required runtime-facing rules:
- remote side effects blocked by confirmation/policy remain `blocked`, not `failed`
- preserve completed local work whenever remote publish/creation steps are blocked
- auth expiry during publish blocks the publish path without discarding the completed local build result
- remote-side-effect approval requirements remain blocked until explicitly resolved
- auth recovery alone does not auto-resubmit or auto-publish a blocked remote side effect; explicit resume/retry remains required
- UI must explain when a local artifact exists but remote publish remains blocked
- runtime-facing blocked payloads MUST use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`
- domain-specific `reason_code` values MAY remain internal detail, but MUST map into canonical runtime taxonomy at shared surfaces

Canonical runtime-facing blocked payload shape:
- `blocked_reason_code`
- ordered `allowed_action_ids[]`
- `preserved_local_work`
- `detail_ref?`

Legacy fields such as `reason_code` and `recovery_options[]` are non-canonical and MUST NOT be copied into new shared runtime contracts.
