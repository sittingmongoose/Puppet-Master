# Containers, Registry, and Unraid Integration

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

### 1. Settings > Advanced > Containers & Registry
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
Puppet Master must provide a first-class Docker management GUI surface that appears when a Docker-related project is in use. It may be implemented as a dedicated page, dockable panel, or another canonical GUI surface, but it must behave as a first-class management UI rather than a hidden advanced-only setting.

The surface must include:
- runtime status (engine reachable, buildx ready, compose status, container status)
- target image summary (`namespace/repository:tag`, privacy, last digest if pushed)
- build controls
- run/preview controls
- stop/teardown controls
- open-access actions so the user can open the running container or its web UI when available
- logs/health visibility for the running container
- publish controls
- Unraid XML generation/update status
- Unraid template repository status and one-click push action
- `ca_profile.xml` status and shortcut to edit it
- requested auth mode and effective capability chips
- explicit warnings when browser auth produced only partial capability (for example, browse-only or push-only)

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

### Requested vs effective auth state
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

### Default repository privacy
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

### Publish flow
- publish uses DockerHub-targeted image tags and namespace/repository selection
- push policy remains `manual` by default with optional `after_build`
- after successful push, capture and surface:
  - pushed tags
  - digest(s)
  - registry host
  - target namespace/repository
  - platform list
  - sanitized logs path

### Post-publish follow-on flow
After successful image publishing:
1. if `Generate/Update Unraid XML after successful publish` is enabled, generate or update the Unraid XML
2. if managed template-repo workflow is enabled, update the target template repo
3. auto-commit the template-repo change by default
4. do not auto-push by default
5. present a one-click push action from the UI

## Unraid XML generation and distribution model

### Distribution model
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
