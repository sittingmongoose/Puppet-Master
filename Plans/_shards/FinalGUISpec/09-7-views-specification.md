## 7. Views Specification

### 7.1 Orchestrator
Orchestrator is the operational surface for rewrite-era execution.

Rules:
- Orchestrator remains tab-first with `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- only `Progress` is widget-composed
- `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native views

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Widget_System.md, ContractName:Plans/Crosswalk.md

### 7.2 Source Control

#### 7.2.1 Accordion layout

Source Control uses a vertically stacked collapsible accordion layout instead of horizontal tabs. Section order: Changes, Worktrees, Branches/Stash, History, Graph. Full specification in `Plans/GitHub_Integration.md` §A.1.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

Source Control is the side-panel owner for Git-native repository work in the rewrite shell.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md

Required subviews:
- `Changes`
- `History`
- `Graph`
- `Worktrees`
- `Branches / Stash`

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

Rules:
- The `Changes` subview owns staged, unstaged, untracked, and conflicted lists, compare-target defaults, per-file diff entrypoints, hunk actions, and conflict review entrypoints.
- The `History` and `Graph` subviews are MVP and own commit browsing, changed-file pivots, commit-detail compare selection, and lineage overlays.
- Diff-local search belongs to the Source Control diff/review surface; it is not routed through the Search side panel.
- Package, lane, run, or remediation lineage appear as metadata where relevant, not as the primary grouping axis.
- Git-native actions remain Source Control owned and MUST NOT be described as editor undo.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

### 7.3 Shared route and open behavior
Views consume the canonical navigation/source-open primitives.

Rules:
- routed opens resolve through `route_target`
- source opens resolve through `OpenSubject` or `OpenFile` as appropriate
- `resume_url` is serialized transport only and must not outgrow the canonical route contract
- shell realization such as docked/floating state, widths, and local panel layout remains shell state rather than route identity

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md, ContractName:Plans/Crosswalk.md

#### Thread context detail realization

Thread context details are a reusable editor-tab surface rather than a chat-side-panel usage view.

Rules:
- `More Details` from the chat context hover module opens or focuses a thread-scoped Context Detail Pane in the editor-tab host
- there is one open Context Detail Pane tab per thread; repeated opens focus the existing tab
- route selection reveals the correct shell destination and focus target
- generated-document or subject realization for the tab follows the canonical route/open split rather than a chat-local special case
- the shell must not treat a detached pop-out or side-panel usage panel as the canonical destination for this surface

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md
### 7.4 Settings and inspectors

#### 7.4.0A Runtime usage, lock, and MCP readiness alignment

Usage, storage-lock, and MCP readiness disclosures in Settings/inspectors must align with their owner docs rather than invent local semantics.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md

Required inspector/UI rules:
- Adaptive cost display precision:
  - amounts below `$0.01`: show 6 decimal places (micro-dollar visibility)
  - amounts from `$0.01` to below `$1.00`: show 4 decimal places
  - amounts at or above `$1.00`: show 2 decimal places
  - always show the currency label
  - when pricing is estimated rather than authoritative, label the surface `Estimated Cost`
- when startup flock on `pm.lock` places PM into read-only/viewer mode, the owning inspector explicitly says so and explains why writes are unavailable
- MCP settings cards surface `healthy`, `degraded`, and `unavailable` startup/readiness states and reflect `startup_timeout_ms` behavior rather than pretending the server is instantly ready

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md

**Global agent concurrency limits are NOT defined in this section.** The authoritative source for `maxConcurrentCrewsPerPlatform`, `maxConcurrentAgentsPerCrew`, `maxTotalActiveAgents`, `maxNestingDepth`, and related execution limits is `Plans/orchestrator-subagent-integration.md` §Subagent Configuration `executionLimits`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md

#### 7.4.1 Assistant Worktrees settings subsection

Settings > Branching tab includes a new subsection `Assistant Worktrees` below existing branching controls. It contains 10 project-level settings organized in three visual sub-groups:

- **Creation:** Auto-create worktree for new threads (bool, default off), Base branch for assistant worktrees (string, inherits from `base_branch`), Creation timeout (integer stepper, 5-300s, default 30s)
- **Merge & Testing:** Run tests before merging (bool, default on), Pre-merge test command (string, empty = auto-detect), Test timeout (integer stepper, 30-1800s, default 300s), What to test (enum: `merged_result | branch_only`, default `merged_result`)
- **Behavior:** Thread delete cleanup (enum: `ask | keep | remove`, default `ask`), File manager follows thread worktree (bool, default on), Worktree count warning threshold (integer stepper, 0-100, default 10, 0 = disabled)

Full setting-key definitions remain canonical in `Plans/assistant-chat-design.md` and are persisted via `Plans/storage-plan.md`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

#### 7.4.2 Indexing settings subsection

Settings > Project tab includes a dedicated **Indexing** section for sparse-n-gram index controls. This section is separate from search settings and general settings.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md

**Local project settings** (always visible):

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Enable regex index | bool toggle | ON | Master toggle. Per-project with a global default. Turning it off cancels any in-progress build and cleans partial generation output |
| Large file threshold | integer stepper | 10 MB | Files above this size are excluded from the index but remain searchable via ripgrep fallback. Range: 1-100 MB |
| Index exclusion patterns | editable list | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `*.min.js`, `*.min.css`, `*.map`, `*.generated.*`, `*.g.dart`, `*.pb.go` | Files matching these patterns are excluded from the index but remain searchable via ripgrep fallback. Separate from grep ignore rules |
| Follow symlinks | bool toggle | OFF | When ON, index traversal follows symlinks after canonicalization and root validation. When OFF, symlinks are not followed |
| Rebuild Index | button | - | Triggers a full rebuild. Non-destructive because the index is a cache |
| Index disk usage | read-only label | - | Shows the local regex-index footprint |
| Index state | read-only badge | - | Surfaces `building`, `ready`, `refreshing`, `stale`, `disabled`, or `error` for the active project |

**Remote SSH project settings** (shown in addition to local settings; greyed out for local projects):

| Setting | Type | Default | Scope | Description |
|---------|------|---------|-------|-------------|
| Shallow clone | bool toggle | OFF | Global default + per-project override | Uses `--depth=1` for the bare clone. Lower disk footprint, reduced history |
| Partial clone | bool toggle | OFF | Global default + per-project override | Uses `--filter=blob:none`. Smaller initial footprint, slower first full build |
| Remote cache disk usage | read-only label | - | - | Shows `Remote cache: {total} - Index: {index}, Git: {git}` |
| Evict remote cache | button + confirmation | - | - | Deletes the selected project's remote cache. Next open performs clone/build again |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

#### 7.4.3 Global storage / remote-cache administration subsection

Settings > Storage includes a global **Remote Cache Administration** subsection for cross-project cache policy.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Remote cache retention | integer stepper (days) | 30 | Evict project caches after inactivity exceeds this threshold |
| Remote cache size limit | size field | `min(50 GB, 10% of free disk at first cache creation)` | Global disk-pressure trigger for LRU remote-cache eviction |
| Total remote cache usage | read-only label | - | Shows aggregate disk usage across all remote project caches |
| Clear All Remote Caches | destructive button + confirmation | - | Deletes every `r/{hash8}` remote cache root. Projects rebuild on next open |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md

#### 7.4.4 Settings (Unified) panel specification

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The global provider stack is user-changeable in Settings, while per-operation priority reordering is not MVP and the MVP priority order must not be treated as immutable product policy.
- The provider capability matrix must preserve capability tier separately from routing posture: Firecrawl, Tavily, and Exa retain real webfetch capability and must not be flattened to fallback-only merely because Site Reader is preferred.
- DuckDuckGo capability rows must preserve native-ish search, PM-composed research/fetch/extract, and partial crawl behavior instead of flattening those cells to unsupported.
- Google must remain a pluggable adapter slot with display label Google, and its ledger support semantics must not be collapsed away.
- The Firecrawl configuration field set must preserve proxy_mode with the exact supported enum values and the self-hosted Fire Engine limitation note.
- Routing must remain cost-aware when multiple providers offer similar capability; static priority alone is insufficient, and the >100 credits warning plus 500 credits cap must remain aligned with routing.
- PM must not silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl, and deployment-mode disclosure must remain visible.
- GUI/help canon must preserve row-level health/error disclosure, last-failure messaging, inline contextual help, and availability/support-tier visibility in Settings and /web help/autocomplete.
- The Firecrawl owner section must preserve the base configuration fields and default-disabled state already restored in the live owner doc.
- The Firecrawl credit and disclosure contract must preserve the warning threshold, hard cap, and self-hosted billing exception already restored in the owner section.
- Retire stale cited-search ownership residue from reference sections; provider-capability and web-routing canon is owned by Plans/Tools.md sections 11-12, while Plans/newtools.md#8.2.1 is non-normative consumer guidance only.
- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.
- MCP owner canon must preserve the exact auth and effective-state enums, canonical naming, and credential binding or invalidation behavior.

Fields:
- proxy_mode
- basic
- enhanced
- auto
- Fire Engine
- enabled
- api_key
- base_url
- timeout_ms
- cache_enabled
- Firecrawl is disabled by default until explicitly enabled in Settings
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed
- LoggedIn | LoggedOut | AuthExpired | AuthFailed
- {server_slug}_{tool_name}

Labels and values:
- Firecrawl
- Google
- DuckDuckGo
- Anthropic
- OpenAI
- Settings
- requested availability
- effective availability
- credential binding

Rules:
- global provider stack is user-changeable in Settings
- per-operation priority reordering is NOT MVP
- global MVP provider priority is not immutable product policy
- Firecrawl `webfetch` capability is not erased by Site Reader primacy
- Tavily `webfetch` capability is not erased by Site Reader primacy
- Exa `webfetch` capability is not erased by Site Reader primacy
- fallback-only
- webfetch
- DuckDuckGo `websearch` is `native-ish`
- DuckDuckGo `webresearch` is `pm-composed`
- DuckDuckGo `webfetch` / `webextract` remain PM-composed or partial rather than flattened to `unsupported`
- DuckDuckGo partial crawl behavior must not disappear
- display label `Google`
- Google is a pluggable adapter slot
- Google official search is not a strategic backend
- Google `webfetch` keeps the pm-composed support semantics from the ledger
- cost-aware selection when providers offer similar capability
- >100 credits
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl
- no silent switch between self-hosted Firecrawl and hosted/cloud Firecrawl
- deployment-mode disclosure remains visible
- self-hosted Firecrawl does not use hosted credit billing
- row-level health/error disclosure
- last-failure messaging
- contextual help text
- availability plus support-tier visibility in Settings
- availability plus support-tier visibility in `/web` help/autocomplete
- self-hosted Firecrawl does not use credit billing
- Provider ID
- `firecrawl`
- Display name
- `Firecrawl`
- Default priority
- below Exa, Tavily; above DDG (user-adjustable)
- Default state
- disabled (requires API key or self-hosted URL)
#### 7.4.5 Workspace, editor, and remote-host settings

Settings MUST expose durable configuration for workspace behavior, editor policies, and remote editing.

This subsection owns:
- SSH remote definitions, connection testing, path mapping disclosure, and reconnection policy for remote editing.
- File Manager behavior, editor rendering defaults, unsaved-buffer recovery policy, diff defaults, and preview handling.
- Project-scoped workspace preferences such as language detection, indexing, file-watch policies, and local-vs-remote execution disclosures.

#### 7.4.6 Run, debug, and runtime integration settings

Settings MUST expose durable controls for run/debug presets and runtime-adjacent developer surfaces.

This subsection owns:
- launch configuration templates and per-language debug defaults
- terminal/browser tab policies, hot reload controls, and port auto-open behavior
- debugger adapter settings, evidence capture defaults, and investigation retention
- runtime-output routing preferences for Problems, Output, Ports, and Debug Console

#### 7.4.7 Agent-Config panel specification
This section defines the canonical contract for this surface.

Core rules:
- Agent behavior management is locked under Agent Config, with Skills as a tab inside it, while Settings retains system-level dependencies and rules.
- Skills management is locked to explicit catalog and import UX, fixed source and readiness vocabularies, store-vs-management separation, and visible source/readiness badges including pm_enhanced.

Fields:
- bundled
- catalog_installed
- manual_import
- project_local
- global_local
- pm_enhanced
- ready_with_warnings

Labels and values:
- Agent Config
- Skills
- Personas

Rules:
- Agent Config owns: agent-behavior artifacts (personas, skills)
- Settings keeps: system-level dependencies (authentication, models, permissions, rules, health)
- Agent Config is NOT replacement for Settings
- drag-and-drop skill folders/files
- file-browser import
- No remote URL/git import in v1
#### 7.4.8 Container, Docker, and Kubernetes settings

Settings MUST expose a dedicated container/runtime settings area for Docker and Kubernetes-related defaults.

Required tab coverage:
- Docker daemon connection and context selection
- default registry / namespace selection
- image build and publish defaults
- Kubernetes cluster/context management for project-scoped container workflows
- resource limits, polling disclosures for external status checks, and local-vs-remote container execution rules

#### 7.4.8A Docker Manager Panel Spec

- **Template repo status row:** bind directly to canonical `TemplateRepoStatus` (`unconfigured`, `config_invalid`, `clean`, `dirty_uncommitted`, `committed_local_only`, `push_in_progress`, `push_failed`, `diverged_remote`, `needs_review`). Presentation copy may translate those values, but the GUI must not invent a second status model.
- **Unraid controls:** when shared-profile scope is active, expose `Apply shared profile to this repo` as an explicit action in addition to generate/update and push controls.
- **`ca_profile.xml` editor:** default to shared cross-project maintainer profile with per-project override option, and provide two editing layers: (1) structured controls for known fields and (2) advanced raw XML editing for unknown / passthrough content. Saving from either layer MUST preserve unmodified passthrough XML verbatim. Support picture upload or external URL; uploaded pictures default to repo-managed assets.

Add a contextual **Docker Manager** GUI surface for Docker-related projects. This surface may be implemented as a page or dockable panel, but it MUST behave as a first-class management surface and not merely as a hidden advanced-only dialog.

- **Visibility rule:** show the Docker Manager surface when a Docker-related project is active. Add a setting named **Hide Docker Manager when not used in Project.** Default: enabled.
- **Auth controls:** place a browser-login button near DockerHub settings, retain PAT entry, show helper text that PAT is recommended, and explain/link how to obtain a PAT.
- **Auth state presentation:** show requested auth mode separately from effective capability, along with validated account identity, namespace access, and degraded reason when capability is partial.
- **Repository management controls:** namespace selector, repository selector, refresh action, create-repository action, and create-repository confirmation dialog that displays namespace, repository name, and privacy. Privacy defaults to private and must be visibly labeled as the default.
- **Runtime controls:** build, run/preview, stop, open running container/web UI, open logs, and health/access state.
- **Publish controls:** push image, show digest/tag results, and expose target DockerHub repo summary.
- **Unraid controls:** toggle to auto-generate/update Unraid XML after successful publish (default enabled), toggle to manage template repo (default enabled), template-repo status row, one-click push action, and shortcut into `ca_profile.xml` editing.
- **Template repo setup flow:** allow both create-new and select-existing when no template repo is configured.
- **`ca_profile.xml` editor:** default to shared cross-project maintainer profile with per-project override option; all fields editable; support picture upload or external URL; uploaded pictures default to repo-managed assets.
- **Auto-generated metadata warning:** when `ca_profile.xml` is created automatically, show a visible notice that the user still needs to configure/review the profile.
- **Safety copy:** make it explicit that repository creation cannot be auto-approved by YOLO or autonomy modes.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md#147-docker-runtime--dockerhub-contract, ContractName:Plans/Permissions_System.md

#### 7.4.9 Settings tab catalog

The unified Settings surface uses a two-level navigation model: category headers in the sidebar, then tabs within the selected category. The minimum tab set is:

| Tab | Key settings |
|---|---|
| General | App behavior, launch, notifications, minimize-to-tray, shell defaults |
| Editor | Editor behavior, indentation, diff defaults, autosave, preview behavior |
| Terminal | Terminal appearance, shell defaults, transcript retention, layout defaults |
| Providers | Provider list, add/remove, default selection |
| Models | Model preferences, role assignments, context limits |
| Permissions | Permission rules, approval history, preset selection |
| Accounts | Account management, credential rotation |
| Extensions | Installed extensions, enable/disable, settings |
| Themes | Theme selection, custom colors, font settings |
| Keybindings | Keyboard shortcut customization |
| Privacy | Telemetry, data collection, local-only mode |
| Updates | Update channel, auto-update, version info |
| Advanced | Debug logging, experimental features, reset |
| LSP | Language server configuration, per-language settings |
| Git | Git configuration, merge tool, diff tool |
| Docker | Docker connection, default registry, resource limits |
| Kubernetes | Cluster configuration, context management |
| Budget | Token budget, cost limits, alerts |
| Plugins | Plugin management, marketplace |
| Interview | Interview preferences, round caps, detail level |
| Memory | Memory/context management, retention policies |
| Shortcuts | Quick actions, custom shortcuts |

Navigation rules:
- tab count is large enough that group headers and in-sidebar search are mandatory
- commands such as `Open setting: {name}` must jump to the correct tab and field
- hidden/unsupported tabs must explain why they are unavailable rather than disappearing silently

Settings and inspectors separate requested state, effective state, inherited defaults, and repaired or degraded runtime outcomes.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md

Required inspector rule:
- compact surfaces may show only material deltas, but the full inspector tier always exposes provider entry, model, auth family, account or server profile, billing/entity context when relevant, and the reason PM selected that runtime.
- historical views use frozen captured state and do not recompute from current settings.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

### Terminal settings ownership

Terminal layout controls belong to the terminal workspace and its inspector, not to ad-hoc chat-only widgets.

Rules:
- workgroups, subtabs, pane trees, and editor panel references persist as terminal workspace state.
- detached terminal windows preserve section identity and reconnect to the same logical workspace records when reattached.
- editor terminal panel controls act on the referenced pane rather than inventing parallel session ownership.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md

Settings owns durable terminal preferences and discoverability. Live session controls remain in terminal chrome and are not hidden inside durable settings.

Terminal settings must include:
- appearance and theme preset selection for the terminal surface
- font size, line height, cursor style, cursor blink, and contrast-safe defaults
- renderer preference and disclosure of effective renderer mode when degraded
- default shell profile and default working-directory policy
- transcript retention limits and shell-integration preference disclosure
- copy, paste, selection, and bell behavior
- terminal shortcut reference, shortcut remapping, and a built-in terminal cheat sheet
- defaults for dock position, second-section behavior, and detach behavior

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

### Terminal inspector rules

Terminal inspectors must expose:
- active workgroup
- focused leaf pane
- bound terminal session id
- linked dev-session id when present
- editor embedding state
- restore outcome / degraded capability state for historical sessions

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-chat-design.md

Detailed terminal inspectors and banners must disclose, where relevant:
- `terminal_session_id`
- `dev_session_id?`
- session status and exit or stop reason
- requested and effective renderer mode
- shell-integration tier
- capability degradations
- cwd snapshot and shell profile label
- restore outcome and transcript-retention tier

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

Chat runtime-inspector rules:
- the message-under-row compact summary shows resolved mode label, model, and assistant duration or user timestamp
- the message info popover shows `Mode`, `Provider`, `Model`, `Effort`, `Persona`, `Worker`, `Tokens`, and `Context`
- compact chat-facing surfaces omit version and omit `current` / `frozen` wording
- the fuller requested/effective/runtime disclosure tier lives in the Context Detail Pane and other detailed inspectors

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

Context Detail Pane inspector rules:
- default view is curated, with a visible raw toggle
- curated view exposes overview, breakdown, and per-message inspection
- raw view exposes thread-level and message-level serialized payloads suitable for debugging, audits, and provider/runtime inspection
- thread-scoped estimated cost and token/context summaries must stay aligned with the canonical usage pipeline

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md
### 7.5 Project and attention surfaces

Project cards and the attention center consume project-summary and project-attention projections.

Rules:
- project cards surface activity, attention, and health separately
- blocked ownership is summarized by the strongest active item when one exists
- attention rows, palette opens, and cross-surface pivots resolve through the same internal route contract

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md

#### Search side-panel owner

Search is the persistent project text-search and replace-in-files surface.

Rules:
- Search owns query text, replacement text, include/exclude globs, regex/case/whole-word toggles, result grouping, and replace preview/apply flow.
- `cmd.search.show` is the canonical shortcut and command-palette entrypoint for this surface.
- Search result opens route through the canonical open-file contract rather than through feature-local payloads.
- File Manager search remains a local tree filter or type-ahead only.
- LSP symbol/reference results may visually resemble Search, but their ownership and fallback rules remain LSP-specific.
- When the regex toggle is ON, Search uses the same sparse n-gram backend as agent `grep`.
- Search inherits the same dirty-layer freshness guarantee as agent `grep`; recently edited files must remain searchable even when the base snapshot is stale.
- A stale-but-valid regex snapshot remains eligible for acceleration while background refresh runs. Show `(unindexed)` only when the query actually fell back to raw ripgrep.
- When the index is unavailable, disabled, corrupted, or skipped for query-specific reasons, Search falls back to raw ripgrep on all files.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

Remote and degraded rules:
- Search may keep prior remote results as an explicitly stale snapshot.
- New remote queries or replace operations that need host round-trips must surface `stale`, `degraded`, or `unavailable` state explicitly instead of silently re-running locally.
- Replace-in-files MUST respect remote write availability before presenting a success-shaped UI.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

#### GitHub Actions side-panel owner

GitHub Actions is the persistent workflow-operations side panel for repository-connected projects.

Layout:
- **Left column:** workflow list with status filters, pins, and freshness/health badges
- **Right column:** selected run details, job tree, logs preview, action toolbar, and current requested/effective GitHub identity disclosure

Surface-summary rules:
- `Current Branch`, `Workflows`, and `Settings` are the stable subviews; detailed workflow/admin lifecycle semantics remain owned by `Plans/GitHub_Integration.md`
- the panel surfaces the shared freshness axes (`freshness`, `health`, `write_availability`) and disables mutating actions when the owning GitHub context is stale or blocked
- requested/effective GitHub identity, account binding, and branch/worktree scope are imported from owner docs rather than renamed in the shell spec
- panel state persists in `gha_panel_state.v1:{project_id}`; receipts and durable workflow/admin state remain owned by storage/GitHub owner docs

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md

#### Artifacts side-panel owner

Artifacts is the persistent side panel for runtime, build, browser, and review artifacts.

Layout:
- **Artifact tree:** grouped by run, then job/session, then artifact family
- **Detail strip:** preview metadata, comparison target, retention info, and actions for the selected artifact

Features:
- download
- preview
- compare
- delete

State:
- persist expanded groups, selected artifact, compare target, and preview mode in `artifact_panel_state.v1:{project_id}`
- artifact content identity and lineage remain owned by `artifacts_index.v1:*`

#### Run & Debug side-panel owner

Run & Debug is the persistent side panel for investigations, debug entrypoints, and runtime diagnostics.

Layout:
- **Top region:** investigation list with target summary, state, investigation phase, verification state, and last update time
- **Bottom region:** active or historical investigation detail showing breakpoints, evidence, variables, cleanup/revalidation status, and linked runtime surfaces

Surface-summary rules:
- the panel binds to canonical debug-investigation records and their linked artifact/evidence refs
- chat owns debug narrative, inline approval/blocked/investigation cards, and thread-local conversation flow
- Run & Debug owns the pinned diagnostic/detail presentation, focus state, and cross-surface pivots into Debug Console / Problems / Output / Runtime Artifacts
- historical investigations remain visible, but only explicitly resumable investigations surface live resume controls; other historical opens are read-only by default
- freshness and revalidation state must remain visible so users can tell whether a shown investigation is current, restoring, stale, or awaiting explicit revalidation

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md

### 7.16 Chat Panel

The Chat Panel is the canonical threaded assistant workspace for Ask, Agent, Debug, Plan, and Deep Plan modes.

Layout:
- vertical split with **message stream** in the top 70% and **composer** in the bottom 30%
- optional collapsible **Plan panel** appears as a side panel within the chat surface when the thread is in Plan or Deep Plan mode
- header remains sticky while the message stream scrolls independently

#### 7.16.1 Thread header and message stream

Thread header content:
- editable thread title
- mode badge
- persona indicator
- model indicator
- token-count summary
- quick actions for thread search, rename, duplicate, archive, and thread settings

Message stream requirements:
- scrollable virtualized list of user, assistant, system, tool, approval, and activity message blocks aligned with the taxonomy in `Plans/assistant-chat-design.md`
- stable message identity so streaming updates mutate existing rows rather than replacing the full list
- inline activity cards for tool calls, file operations, subagent activity, approvals, run-state transitions, and linked artifacts
- sticky unread marker and `New messages below` affordance when the user is scrolled away from the bottom

#### 7.16.2 Composer, commands, and plan mode affordances

Composer requirements:
- multiline text input
- mode selector exposing at minimum `Steer` and `Queue`
- attachment button
- send / stop button
- visible disabled-state explanation when sending is unavailable

Plan-mode affordances:
- collapsible Plan panel showing the current plan, plan steps, status, and linked artifacts
- plan panel supports focusing the active step and jumping to linked documents or evidence
- when not in a planning mode, the plan panel stays hidden rather than showing an empty placeholder

Commands and approvals:
- slash commands, mode switches, and tool approvals remain routed through the canonical chat/runtime command catalog
- tool approval dialogs launched from Chat must preserve thread context and return focus to the composer after completion
- chat-local controls must not duplicate ownership of Problems, Output, Ports, or Debug Console; they link to those shell surfaces instead

### 7.17 File Manager Panel

The File Manager Panel is the persistent project-tree side panel and defers detailed tree, drag-and-drop, and open-file behavior to `Plans/FileManager.md`.

Required behavior summary:
- project tree with local filter, expand/collapse persistence, and current-file reveal
- click-to-open and context-menu actions route through canonical open-file and file-tree action contracts
- external drag-and-drop, ignored-file visibility rules, and detached-panel behavior remain aligned with `Plans/FileManager.md`
- File Manager owns tree navigation and file discovery, but not semantic search, diff-local search, or runtime artifact browsing

### 7.18 File Editor

The File Editor is the canonical in-app code and document editing surface.

Required behavior summary:
- tabbed editor groups with shared buffers, diff view, preview modes, and detach / re-dock support
- LSP-backed diagnostics, hover, completion, signature help, inlay hints, code actions, code lens, semantic highlighting, and go-to-definition
- SSH remote editing, stale-write disclosure, and recoverable unsaved local buffer persistence
- embedded rendering for markdown, mermaid, HTML, SVG, and image documents through the shared preview pipeline

#### 7.18.1 Inline Note Mode

Inline Note Mode enables targeted feedback and annotation inside the editor.

Activation:
- user selects code in the editor
- `Add Note` appears in the context menu for the selection

Note creation:
- captures selection range
- captures note text
- optional category: `bug`, `improvement`, `question`, or `style`

Display and persistence:
- inline annotation markers appear in the editor gutter
- hover reveals note content and status
- notes persist via `note_record.v1:{bundle_id}:{note_id}` and remain linkable from bundle review surfaces

### 7.19 Agent Activity

The Agent Activity surface is the canonical inspection view for delegated work, investigations, bundle review progress, and embedded review documents.

Required behavior summary:
- active and historical child-run / subagent activity list with status, owning thread, target, and outcome
- clear distinction between running, queued, blocked, remediation, and completed activity
- direct links to related chat messages, artifacts, investigation records, and review bundles

### 7.19A Dedicated log and audit inspector

PM ships two complementary audit surfaces: lightweight in-thread transparency and a dedicated searchable log/audit inspector.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

Inspector requirements:
- summary rows use a 5-item compact format: operation label, short query/url/task preview, success/failure status, fallback note when present, and source/page counts when present
- full payload dereference is on-demand only; the inspector does not eagerly expand large refs or blobs
- supported interactions include filter by event family, search by tool or operation, time-range queries, drill-down, and export
- `logsearch` and `logread` have explicit GUI surfacing rather than remaining CLI-only affordances

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

#### 7.19.1 Embedded document pane

The embedded document pane is a shared-buffer review/document surface used by Interview, Builder, and bundle-review workflows.

Rules:
- document selection, scroll position, active review stage, and approval state persist through `document_pane_state:v1:{project_id}:{page_context}`
- the pane shares source-of-truth buffers with File Editor rather than maintaining divergent document copies
- findings summaries and approval gates render adjacent to the document, not inside unrelated chat-local controls

#### 7.19.2 Bundle controls and review gate

Bundle Controls govern revision loops and approval readiness for reviewed document/file bundles.

Required behavior:
- `Resubmit` in bundle review sends all unresolved notes as revision context
- final approval is blocked until every note is resolved, responded to, or dismissed
- bundle status progression is `draft -> in_review -> all_notes_resolved -> approved -> merged`
- bundle-level persistence uses `bundle_registry.v1:{project_id}:{bundle_id}` with linked `note_record.v1:*` entries

### 7.20 Bottom runtime zone

The bottom runtime zone is the canonical host for Terminal, Problems, Output, Debug Console, Ports, and linked runtime-adjacent panes.

Required behavior summary:
- tabbed runtime panes with stable identity and restore behavior
- terminal/browser/editor integrations reveal the owning pane rather than minting parallel per-feature consoles
- linked dev-session state, historical/live badges, and recovery outcomes stay visible across pane switches

#### 7.20.1 Terminal and browser tab management

Terminal sections, terminal tabs, browser tabs, and detached previews remain identity-stable across docking, focus changes, and restart recovery.

Rules:
- runtime tabs persist selection, order, labels, and pin state
- browser and preview tabs route through canonical browser-session identities and never silently migrate ownership to chat
- hot reload, output routing, and preview refresh status appear in the owning runtime or preview pane

#### 7.20.2 Debug, Problems, Output, and Ports

The runtime zone must provide:
- **Problems:** aggregated diagnostics, file links, and source ownership disclosure
- **Output:** task/build/dev output streams with source tags and search within stream
- **Debug Console:** adapter and evaluation output for the active debug session
- **Ports:** detected ports, local/remote accessibility, open-in-browser actions, and hot-reload controls

`Run & Debug` side-panel actions reveal and focus these bottom-panel panes rather than creating duplicate runtime records.

