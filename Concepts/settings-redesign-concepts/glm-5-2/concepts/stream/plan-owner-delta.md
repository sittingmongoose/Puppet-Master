# Plan-Owner Delta — Concept 04 Stream (GLM-5.2)

IA metaphor: **landmark-river + scroll-linked flow**. Deep-owns the C4 bucket (Storage & Retention, Backup & Restore, Settings Lifecycle, History & Sessions, Runtime Artifacts, Source Control/Worktrees, GitHub Actions, Containers & Registries, Web/Search/Fetch, Project Search Index, Workspace Cleanup) and the deferred Future Server/Project Sync insertion shell. Demonstrates core (Settings Home, Search, Workspace, Provider/Account/Model/Installation manager, ordinary setting-row grammar). Other families are sibling-owned and reachable via `shared_grammar`.

This file is a provisional concept artifact. It does not edit canon. Each `### impact` block names the owner doc, the Stream-relevant change, and `gui_related`. Deferred Server modules keep named canonical owners and insertion contracts; no backend state machine is invented here. Server-first topology (Home Server default host; container hosts execution-capable; WSL optional) and PM-native Browser Program only are reflected throughout.

---

## Plans/FinalGUISpec.md

### impact
Stream replaces the old Settings chip/bloom/right-side-panel contract with a landmark-river Settings Workspace: a single scrolling content river with landmark anchors (Storage & Retention, Backup & Restore, Settings Lifecycle, History & Sessions, Runtime Artifacts, Source Control & Worktrees, GitHub Actions, Containers & Registries, Web/Search/Fetch, Project Search Index, Workspace Cleanup) plus a deferred Server-region insertion shell. `CategoryNavigation` and `SubcategoryScrollspy` drive scroll-linked active-landmark highlighting; deep links `Open setting: {id}` land on a river anchor and scroll rather than opening a detached panel. Search indexes metadata without eagerly hydrating all C4 managers (FinalGUISpec.md:963 search-owner index control surface; FinalGUISpec.md:989 Settings > Branching/Health owns global git/worktree policy; Settings > Advanced owns GitHub Actions + Docker defaults). Server-first topology is reflected in human-language status cards only (Home Server Connected, Processing on this server, Clients N paired, Hosted On, Project Files, Run Work); no raw server catalogs, kubeconfigs, package roots, or credential realms are exposed by default (07_SERVER_HOST_AND_OWNER_BOUNDARIES.md). Stale right-side-panel language and the chip/bloom/no-sidebar contract are supersession targets.

`gui_related: true`

---

## Plans/settings_inventory.json

### impact
Stream exercises the C4-heavy inventory ids: `system.advanced.export-settings`, `system.advanced.import-settings`, `system.advanced.reset-defaults`, `system.advanced.request-storage-compaction`, `system.advanced.inspect-holds-quarantine`, `system.advanced.runtime-artifacts`, `system.advanced.chat-history-retention`, `system.advanced.runtime-history-days`, `system.advanced.released-safe-point-days`, `branching.worktrees.*` (worktree-cleanup, evidence-retention-days, force-push-policy, github-pinned-workflows, github-actions-auto-refresh, pre-merge-tests, recovery-tools, source-control-sections, clean-workspace-now, clean-all-worktrees), `code.execution.*` (container-runtime, docker-binary-path, default-registry, cleanup-aggressiveness, cleanup-scan-cadence, disk-threshold), `web.index.*`, `web.fetch.*`, `web.providers.*`. Each is classified action/setting/status/manager so `SettingRow` renders the correct affordance. `system.advanced.config-format` is flagged invalid-as-primary (format is an export parameter, not an export identity or primary lifecycle affordance) and is a migration target.

`gui_related: false`

---

## Plans/settings_inventory.schema.json

### impact
Stream requires the schema to distinguish `action` vs `setting` vs `status` vs `manager` rows (candidate `action_setting_status` enum) so `SettingRow` can render button/toggle/badge/card correctly on lifecycle and storage rows. Copy Settings From is a ONE-TIME transactional copy across ~10 categories; the schema must NOT introduce a universal inheritance/parent-child link for it — `ValueSourceBadge` remains the only inheritance disclosure surface. Deferred Server region ids are reserved/placeholder only; the schema must not encode server-backend state machine fields (kubeconfig realms, package roots) into inventory rows.

`gui_related: false`

---

## Plans/storage-plan.md

### impact
Stream's Storage & Retention and Backup & Restore landmarks project `#Case-L-3` concepts: legal hold (managed, suspends deletion + compaction), non-destructive compaction (receipts, append-only successor records, never rewrites closed seglog in place — storage-plan.md:479), quarantine, project/data deletion (irreversible, tombstone + receipt), encryption-at-rest, periodic test-restore. The concept keeps internal snapshots / settings backup / project backup / full server backup / workspace cleanup visually and operationally distinct. Backup/restore/compaction/import-apply acquire the aggregate canonical-store lock (storage-plan.md:1487); `ObservableOperation` must show truthful wait phases when contended, never fake liveness. Receipt retention classes (durable / bounded-cache / discardable, storage-plan.md:966) are respected. GUI is a projection only; it does not re-own storage key registration.

`gui_related: true`

---

## Plans/WorktreeGitImprovement.md

### impact
Stream's Source Control/Worktrees landmark surfaces changes/history/graph/worktrees, branch/bookmark/revision, Git/Jujutsu/LFS, forge connection, SSH source, test-before-merge, push/force-push policy (deny main), leases, recovery/cleanup, and exact tool installation health. Worktree safety is the precondition for Workspace Cleanup: cleanup dry-run must run first and must not destroy evidence below the `branching.worktrees.evidence-retention-days` floor. Worktrees are part of the patch/apply/verify/rollback pipeline (WorktreeGitImprovement.md:39), not just a Git feature.

`gui_related: true`

---

## Plans/GitHub_Integration.md

### impact
Stream's GitHub Actions landmark surfaces pinned workflows, current-branch readiness, refresh, run/job/log browsing, starter workflow, account capability, and setup/health. It reuses `catalog.github_actions_*` and `catalog.actions_*` command ids and `catalog.orchestrator_open_github_actions` deep links. The shell-surface owner boundary stops at the hosted workflow/admin contract owned by GitHub_Integration.md (FinalGUISpec.md:953); Stream keeps shell summaries, disabled-state copy, cross-surface CTAs, and panel restore behavior aligned.

`gui_related: true`

---

## Plans/Containers_Registry_and_Unraid.md

### impact
Stream's Containers & Registries landmark shows human top-level Docker/Podman/Kubernetes with detail (Engine/CLI/Compose/Buildx/socket/kubectl/Helm/clusters/kubeconfig-contexts/registries/Unraid/SSH-remotes/versions/auth/health). Domain-specific capability probes reuse the shared tool lifecycle. Container start reuses `catalog.docker_container_start`; engine switch reuses `catalog.docker_context_select`; host instance start/stop reuse `catalog.docker_host_instance_*`. The `code.execution.*` inventory ids are the setting surface. Health-gated start on a stopped Podman engine is a required fixture.

`gui_related: true`

---

## Plans/Runtime_Artifacts_Panel.md

### impact
Stream's Runtime Artifacts landmark shows type/location/version/retention/receipts/redaction/open/reveal/export/cleanup with PM-owned vs provider-native identity. Opens resolve by `artifact_id` identity first, never fake repo paths (Runtime_Artifacts_Panel.md:110-115). Bundles preserve canonical IDs and must not mint shadow/surrogate IDs; `Show in Usage`/`Show in Ledger` pivot by receipt + attempt + `usage_event_ref`, not run/tier only (supersedes tier_id-centric pivots). Storage key registration stays storage-owned; this panel owns payload/open semantics only.

`gui_related: true`

---

## Plans/Project_Output_Artifacts.md

### impact
Stream's Runtime Artifacts / output rows align with Project_Output_Artifacts ownership of generated output taxonomy and the manifest contract so `ArtifactRow` open/reveal/export stay identity-preserving and manifest-backed. Attribution is shared across tool events, runtime artifacts, receipts, and usage records.

`gui_related: false`

---

## Plans/Release_Supply_Chain.md

### impact
Stream's deferred Updates insertion shell (inside the deferred Server region) reserves grammar for PM application/content update state machines without implementing them here (07_SERVER_HOST_AND_OWNER_BOUNDARIES.md: do not implement PM update here). Pinned-workflow and starter-workflow surfaces in the GitHub Actions landmark stay within GitHub_Integration.md ownership and do not implement PM self-update. The `system.advanced.auto-update` / `catalog-updates` / `update-frequency` / `release-channel` inventory rows remain Release_Supply_Chain-owned; Stream only binds a reserved status card + `SetupFlowLauncher` grammar to them.

`gui_related: false`

---

## Plans/BinaryLocator_Spec.md

### impact
Stream's Containers/Git/Web tool health and Provider CLI installation rows reuse the shared installation lifecycle (scan/select/install/update/repair/rollback/verify). Provider CLI initial acquisition remains the strict explicit exception (manual install path), honoring the CLI-owned vs PM-direct OAuth boundary (07_SERVER_HOST_AND_OWNER_BOUNDARIES.md). The 7 installation lifecycle fixtures are demonstrated in the core Provider manager. Tool health badges reuse `HealthSummary` + the shared tool lifecycle; capability probes are bounded, cached, coalesced, and ResourceGovernor-governed.

`gui_related: false`

---

## Plans/Commands_System.md

### impact
Stream's lifecycle commands (`cmd.settings.export`, `import.preview`/`import.apply`/`import.rollback`, `reset.preview`/`reset.apply`, `copy_from_project.preview`/`apply`) and storage commands (`backup.open`, `backup_now`, `compact`) introduce new command families that must follow the command entry contract: `command_kind` (one of `shell_view`/`navigation_wrapper`/`domain_action`), `normalization.kind`, `normalizes_to_contract`, and `alias_of_command_id` (UI_Command_Catalog.md 2.0). One-shot actions (Back Up Now, Compact, Copy Settings From, Clean) must be classified `domain_action`, not `shell_view`; manager opens are `shell_view`; navigation is `navigation_wrapper`. Each action carries typed payload, result, error, idempotency/revision, permission, receipt, and recovery semantics.

`gui_related: false`

---

## Plans/UI_Command_Catalog.md

### impact
Stream reuses existing catalog ids: `catalog.settings_bloom_open` (retire -> alias to `cmd.settings.navigate`), `catalog.settings_category_reset` (supersede by `reset.preview`+`reset.apply` with alias preservation), `catalog.nav_open_subject`/`nav_focus_route` (navigation), `catalog.docker_container_start`/`docker_context_select` (containers), `catalog.git_worktree_*` family (source control — a coarse `worktree.manage` is flagged `conflict` and rejected in favor of granular ids), `catalog.search_rebuild_index`/`search_evict_remote_cache` (search index), `catalog.file_reveal`/`file_open` (artifact reveal fallback), `catalog.chat_web_*` (runtime web ops), `catalog.actions_*`/`github_actions_*` (GitHub Actions). New candidate families (provisional, audit-adjudicated): settings lifecycle (export/import.preview/import.apply/import.rollback/reset.preview/reset.apply/copy_from_project.preview/apply), storage (backup.open/backup_now/compact/hold.manage), artifact (manager.open/open/export/cleanup), webfetch clear_cache, cleanup (dry_run/clean). No duplication of provider/account/usage/auth/notification actions.

`gui_related: false`

---

## Plans/Server_Backbone.md (reserved; reference owner for the deferred Server region)

### impact
Stream reserves a deferred Server-region insertion shell with NAMED canonical owners and insertion contracts. It does NOT invent any backend state machine. Named owners and their insertion contracts:

- **Servers** -> `Plans/Server_Backbone.md` (reserved). Stream reserves a Server landmark/region with human-language cards (Home Server Connected, Processing on this server, Clients N paired). Grammar: `ManagerShell` + `ResourceCard` + `HealthSummary` + `ReceiptLink`. Deep-link target reserved. When authored, Server_Backbone.md owns host identity, connection lifecycle, and receipts; Stream binds the reserved destinations.
- **Execution Hosts** -> `Plans/Server_Backbone.md` (reserved, Execution Host section). Reserves a human-language Run Work / execution-host destination. Home Server is default Execution Host when capability-compatible; native Windows/macOS/Linux, Docker, TrueNAS, Unraid, Kubernetes are execution-capable forms; WSL optional and does not replace native Windows (WSL Off is healthy; setup shown only when a selected capability requires it). Stream binds grammar only; capability matching + host lifecycle owned by Server_Backbone.md.
- **Clients** -> `Plans/Server_Backbone.md` (reserved, Clients section). Reserves a Clients card (N paired) and client-pairing grammar. No client state machine in Stream; pairing/auth lifecycle owned by Server_Backbone.md.
- **Project Hosting & Files** -> `Plans/Server_Backbone.md` (reserved) + `Plans/Release_Supply_Chain.md`. Reserves Hosted On / Project Files human-language project cards. Project Sync, Project Move, and PM application/content update state machines are explicitly NOT implemented here. Stream binds card grammar only.
- **Remote Access** -> `Plans/Server_Backbone.md` (reserved, Remote Access section). Reserves Remote Access / SSH-remote grammar for execution environments and container SSH remotes. SSH source/cert/credential realms are never exposed as raw config by default; human-language connection cards only.
- **Updates** -> `Plans/Release_Supply_Chain.md`. Reserves an Updates insertion point for PM app/content update flows. Stream binds the reserved shell grammar (status card + `SetupFlowLauncher`) only.

Server-first topology: Home Server is the default Execution Host when capability-compatible; container hosts are execution-capable; WSL is optional. Stream renders the shell; it does not implement host/sync/move/update state machines.

`gui_related: true`

---

## Cross-cutting notes

- **Browser**: PM-native Browser terminology only — BrowserWorkspace, Browser Program, Expert Browser Program. A protected AuthBrowserSession is human-only and never shown as an ordinary browser workspace; agents cannot inspect its DOM/screenshots/video/console/network. No Playwright terminology anywhere. (`gui_related: true`)
- **Action vs setting vs status vs manager**: Backup & Restore keeps Back Up Now (action) / schedule (setting) / last-backup (status) / manager / log (diagnostic) distinct. This distinction propagates into the inventory `action_setting_status` classification and the `command_kind` of each command. (`gui_related: true`)
- **Copy Settings From**: ONE-TIME transactional copy across ~10 categories; destination independent after. NOT a universal inheritance system. `ValueSourceBadge` reads `custom` after copy, never `inherited`. (`gui_related: true`)
- **Retention/hold/compaction/quarantine**: managed legal hold suspends deletion + compaction; compaction is non-destructive (receipts, append-only successor records, no closed-segment rewrite); project/data deletion is irreversible with receipt. (`gui_related: true`)
- **No SQLite; no Playwright terminology; CLI-owned OAuth boundary respected; Server modules stay DEFERRED with named owners.**
