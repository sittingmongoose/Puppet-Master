# Shard 022: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/UI_Command_Catalog.md`

Source lines: L9535-L10452

Source SHA256: `013f1bc60b079da5946a981f2b9d7fe43d3eb1d14c36633974c9a1de5d66486d`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum absorbs the command-ID census of the winning Cozy Shelves left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, source lineage only; concept HTML defines no commands) into catalog canon, following the PMConcept aliases-and-retirements precedent (2026-07-02) and the PMConcept6 census addendum mechanism (2026-07-16). Every prototype token is adjudicated in the reconciliation table below as canonical, alias-of a recorded target, newly registered, or retired; new canonical rows carry the full section 2.0 metadata contract (`command_kind`, availability class, confirmation class for destructive rows, `disabled_reason` codes from the closed set at the UCC-049..106 schema overlay, and owning panel/domain). In-catalog contradictions (Docker container lifecycle naming, compose alias targets, K8s context verbs, GitHub Actions open-in-browser triplication, panel detach naming, terminal focus) are adjudicated by the new PlanUnits below; no existing PlanUnit block, preserved exact token, canonical text, or retired bridge is edited, and supersession is expressed only through the new units' explicit amendment notes. The implementation base is the c2 concept files patched in place (user decision 2026-07-27). Destructive confirmations route through the shared confirm surface referenced by the unified expander row contract, which is owned outside this catalog; blocked states carry `blocked_reason_code` plus ordered `allowed_action_ids[]` mapping to `cmd.runtime.*` per UCC-093/UCC-094. Every row registered here remains incomplete until a production Wiring_Matrix.md section 4.2 row binds command id to handler, UI surface, and acceptance checks. This addendum does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

Structural repair recorded here: the GitHub Actions command family table in section 2.4 was duplicated verbatim (a second copy differing only in em-dash keybind cells and lacking the legacy-alias rule). The duplicate copy without the legacy-alias rule has been deleted; the surviving table is the one carrying the `cmd.github_actions.*` legacy-alias rule. No row content changed.

Metadata legend for the registration tables: availability classes are `always` (enabled whenever the owning panel is visible), `selection` (requires a selected subject), `live_subject` (requires a queued/running/live subject), `record_only` (requires a terminal/recorded subject), and `capability` (gated on probe/config/auth capability state). Confirmation classes are `none`, `two_step` (arm/confirm per the settings category-reset precedent), and `strong` (strong confirmation for destructive deletion, through the shared confirm surface). `disabled_reasons` values come only from the closed set `unsupported`, `not_configured`, `unauthorized`, `unreachable`, `degraded`, `partial_capability`, `blocked_state_required`, `stale_projection`, `permission_required`.

### Cozy Shelves command reconciliation

| Token | Disposition | Canonical target and notes |
|---|---|---|
| `cmd.search.find_in_files` | canonical (existing) | Section 2.9 row; `scope` argument retained |
| `cmd.search.open_result` | canonical (existing) | `route_target` subject-open row |
| `cmd.search.next_result` | canonical (registered below) | id sanctioned by the 2026-07-02 aliases table; concrete row supplied here |
| `cmd.search.previous_result` | canonical (registered below) | same |
| `cmd.search.set_scope` | canonical (registered below) | standalone scope command; `find_in_files` scope arg unchanged |
| `cmd.search.rebuild_index` | canonical (existing) | Section 2.9 row |
| `cmd.search.replace_all` | canonical (existing) | destructive; preserved query-session payload; preview flow unchanged |
| `cmd.search.replace_selected` | canonical (existing) | |
| `cmd.search.toggle_regex` | newly registered | |
| `cmd.search.toggle_case` | newly registered | |
| `cmd.search.toggle_word` | newly registered | |
| `cmd.git.open_diff` | alias-of `cmd.git.diff_open` | recorded in the 2026-07-02 table |
| `cmd.git.show_commit` | alias-of `cmd.source_control.history_open_commit` | recorded in the 2026-07-02 table |
| `cmd.git.stage_hunks` / `cmd.git.unstage_hunks` / `cmd.git.discard_hunks` | canonical (existing) | discard keeps its destructive tiered confirmation |
| `cmd.git.diff_set_compare_target` | canonical (existing) | |
| `cmd.git.stash_pop` | retired -> `cmd.source_control.stash.pop` | markup migrates; row registered below |
| `cmd.git.stash_drop` | retired -> `cmd.source_control.stash.drop` | destructive; row registered below |
| `cmd.git.switch_branch` | retired -> `cmd.source_control.branch.switch` | row registered below (+ `branch.create`) |
| `cmd.source_control.generate_commit_message` | canonical (registered below) | |
| `panels.git_commit` | retired -> `cmd.git.commit` | row registered below |
| `git.create_pr` | retired -> `cmd.github.pr.create` | row registered below |
| `cmd.git.worktree.open` | canonical (existing) | UCC-054 family |
| `cmd.git.worktree.open_files` | alias-of `cmd.git.worktree.open` | open plus File Manager focus argument |
| `cmd.git.worktree.open_other` | retired -> `cmd.git.worktree.open` with target argument | select-then-open covers it; no new row |
| `cmd.git.worktree.compare` | canonical (existing) | |
| `cmd.git.worktree.merge` | canonical (registered below) | project scope; never reuses `cmd.chat.worktree.merge` |
| `cmd.git.worktree.remove` | canonical (existing) | destructive escalation ladder unchanged |
| `cmd.git.worktree.lock` / `cmd.git.worktree.unlock` | newly registered | |
| `cmd.git.pull` / `cmd.git.push` / `cmd.git.fetch` | newly registered | core remote verbs promised by the Source Control coverage prose; no prior concrete rows existed anywhere in the catalog; push inherits the force-push-with-lease ladder from WorktreeGitImprovement.md |
| `cmd.docker.browser_login` | cross-registered | behavior owned by Containers_Registry_and_Unraid.md (DockerHub browser/device login + `docker.auth.browser_login.*` events); this row supplies catalog registration only |
| `cmd.docker.save_pat` | cross-registered | behavior owned by Containers_Registry_and_Unraid.md; catalog registration only |
| `cmd.github.connect` | canonical (existing) | Section 2.1 |
| `cmd.github.actions.open_run` | canonical (existing) | Section 2.4 family row; metadata completed below |
| `cmd.github.actions.open_in_github` | canonical (registered below) | aliases recorded: `cmd.actions.open_in_browser`, `cmd.github.actions.open_run_in_browser` |
| `cmd.github.actions.compare_last_success` | canonical (existing) | Section 2.4 family row; metadata completed below |
| `cmd.actions.rerun` | alias-of `cmd.github.actions.rerun` | `cmd.actions.*` has no minting authority; canonical row registered below |
| `cmd.actions.rerun_failed` | alias-of `cmd.github.actions.rerun_failed` | canonical row registered below |
| `cmd.actions.cancel` | alias-of `cmd.github.actions.cancel` | canonical row registered below |
| `cmd.github.actions.dispatch` | newly registered | carries typed workflow_dispatch inputs payload |
| `cmd.github.actions.pin` / `cmd.github.actions.unpin` | canonical (existing) | |
| `cmd.docker.set_context` | alias-of `cmd.docker.context.select` | UCC-049 preserved token; the bare K8s-era `set_context` form still normalizes to `cmd.docker.k8s.select_context` per section 2.5B |
| `cmd.docker.run` (prototype start-stopped usage) | retired -> `cmd.docker.container.start` | `cmd.docker.run` itself stays live as create-from-image |
| `cmd.docker.container.stop` | canonical (registered below) | `cmd.docker.stop` becomes a recorded compatibility alias |
| `cmd.docker.container.restart` | canonical (registered below) | `cmd.docker.restart` becomes a recorded compatibility alias |
| `cmd.docker.container.start` | canonical (existing) | 2026-07-16 census row |
| `cmd.docker.container.view_logs` | canonical (existing) | UCC-105 |
| `cmd.docker.container.attach_shell` | canonical (registered below) | token existed in UCC-105 canonical text; concrete row supplied |
| `cmd.docker.container.inspect` | newly registered | |
| `cmd.docker.container.delete` | canonical (registered below) | UCC-049 preserved token; destructive |
| `cmd.docker.build` | alias-of `cmd.docker.build.image` (selected path) | existing section 2.5A alias |
| `cmd.docker.image.push` | alias (existing) | `domain.image_publish` class unchanged |
| `cmd.docker.image.tag` / `cmd.docker.image.inspect` / `cmd.docker.image.delete` | newly registered | delete is destructive |
| `cmd.docker.compose_up` | alias-of `cmd.docker.compose.up` | alias target adjudicated by UCC-137 below |
| `cmd.docker.compose.up` / `cmd.docker.compose.down` / `cmd.docker.compose.restart` | newly registered | whole-file group verbs beside the existing subset rows |
| `cmd.docker.compose.up_subset` / `cmd.docker.compose.down_subset` | canonical (existing) | |
| `cmd.docker.compose.scenario.save` / `.run` / `.edit` / `.delete` | canonical (existing) | flat `compose.save_scenario` / `compose.run_scenario` forms are recorded compatibility aliases |
| `cmd.docker.compose.open_file` | newly registered | compose YAML to editor handoff |
| `cmd.docker.cleanup.scan` | canonical (registered below) | token existed in UCC-105 canonical text |
| `cmd.docker.cleanup.prune` | canonical (registered below) | destructive |
| `cmd.docker.template.commit` / `cmd.docker.template.push` | canonical (existing) | 2026-07-16 census rows; `domain.image_publish` on push |
| `cmd.docker.open_dockerfile` | canonical (existing token) | UCC-049; build-pane wiring row required |
| `cmd.docker.k8s.select_context` / `cmd.docker.k8s.select_namespace` | canonical (existing) | `set_context` / `set_namespace` remain recorded compatibility aliases per section 2.5B |
| `cmd.testing.run` | canonical (existing) | run-scoped family |
| `cmd.testing.watch_run` | canonical (existing) | distinct from session-scoped `cmd.testing.session.watch` |
| `cmd.testing.open_receipt` | canonical (existing) | record-only availability |
| `cmd.testing.export_bundle` | canonical (existing) | |
| `cmd.testing.quarantine` | newly registered | plus `cmd.testing.quarantine.release` |
| `cmd.testing.session.redaction.inspect` | canonical (existing) | session-scoped family |
| `panels.show` (Open in Artifacts) | retired -> `cmd.panel.switch` with `panel_id: artifacts` | |
| `cmd.artifacts.sort` | newly registered | `shell_view` |
| `cmd.artifacts.play_recording` | newly registered | record-only availability |
| `cmd.artifacts.watch_recording` | newly registered | live-subject availability |
| `web.sources` | retired -> `cmd.artifacts.show_sources` | newly registered `navigation_wrapper` |
| `panels.open_chat` | retired -> `cmd.panel.switch` with `panel_id: chat` | |
| Show in Ledger / Show in Usage labels | canonical (existing) | `cmd.artifacts.show_in_ledger` / `cmd.artifacts.show_in_usage` |
| `cmd.file.open` | newly registered | subject-open over the `OpenFile{path,line?,range?,target_editor_panel_id?,target_editor_group_id?,target_group?}` route |
| `cmd.file.open_with` | canonical (existing) | |
| `cmd.file.open_in_system_default` | reserved (proposed) | stays disabled in MVP |
| `cmd.file.new_file` / `new_folder` / `rename` / `delete` / `copy_path` / `copy_nodes` / `cut_nodes` / `paste_nodes` / `save_local_copy` | canonical (existing) | CRUD closure; delete keeps its destructive class |
| `cmd.file.copy_full_path` / `cmd.file.copy_relative_path` | alias wrappers (existing) | `format = absolute` / `relative` over `cmd.file.copy_path` |
| `cmd.file.refresh` | newly registered | |
| `cmd.file.reveal` | newly registered | FileManager `/reveal` |
| `cmd.file.expand_capped` | newly registered | `shell_view` row-cap Show more |
| `cmd.editor.close_tab` | newly registered | `cmd.editor.*` prefix reserved here |
| `cmd.chat.add_file_reference` | canonical (existing) | signature lock unchanged |
| `cmd.panel.switch` | canonical (existing) | destination vocabulary proof row below |
| `cmd.panel.detach` | alias-of `cmd.panel.undock` | recorded compatibility alias |
| `cmd.terminal.open` (rail bare-focus usage) | markup migrates -> `cmd.terminal.show` | `cmd.terminal.open` row remains live and distinct; the two rows never collapse (see UCC-138) |
| `cmd.chat.open_at` | retired -> `cmd.chat.open_thread` | newly registered `navigation_wrapper` |
| `page.go` / `demo.toast` / `demo.reason` | demo fixtures (retired) | concept-shell fixtures; never registered |
| `cmd.agents.show` / `cmd.agents.open_thread` / `cmd.agents.open_node` | newly registered | `cmd.agents.*` prefix reserved here; mirror stays read-only |

### GitHub Actions registration and adjudication rows

`cmd.github.actions.*` is the sole minting namespace for hosted-run actions; `cmd.actions.*` retains no minting authority and its rerun/rerun_failed/cancel/open_in_browser rows become recorded compatibility aliases of the canonical ids below, following the pin/unpin alias precedent already in the section 2.4 table. `cmd.github.actions.open_in_github` is the single canonical open-on-GitHub command; `cmd.actions.open_in_browser` and `cmd.github.actions.open_run_in_browser` are recorded compatibility aliases and neither may become a second primary name. The `open_run` and `compare_last_success` rows below complete the metadata contract for the existing section 2.4 rows without changing their labels, descriptions, or preconditions.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.github.actions.open_run` | Open Run | `navigation_wrapper` | selection (`actions_panel_visible && selected_run`) | none | `unauthorized`, `unreachable` | github_actions |
| `cmd.github.actions.open_in_github` | Open in GitHub | `navigation_wrapper` | selection (`selected_run`) | none | `unauthorized`, `unreachable`, `not_configured` | github_actions |
| `cmd.github.actions.compare_last_success` | Compare Last Success | `navigation_wrapper` | selection (`selected_run && last_success_resolvable`) | none | `unreachable`, `degraded` | github_actions |
| `cmd.github.actions.rerun` | Rerun Workflow | `domain_action` | selection (`selected_run && rerun_allowed`) | none | `unauthorized`, `unreachable`, `stale_projection`, `permission_required` | github_actions |
| `cmd.github.actions.rerun_failed` | Rerun Failed Jobs | `domain_action` | selection (`selected_run && has_failed_jobs`) | none | `unauthorized`, `unreachable`, `stale_projection`, `permission_required` | github_actions |
| `cmd.github.actions.cancel` | Cancel Run | `domain_action` | live_subject (`run_in_progress`) | two_step | `unauthorized`, `unreachable`, `stale_projection` | github_actions |
| `cmd.github.actions.dispatch` | Dispatch Workflow | `domain_action` | capability (`workflow_dispatchable && dispatch_readiness_valid`) | two_step | `not_configured`, `unauthorized`, `unreachable`, `degraded` | github_actions |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

### Agents panel navigation rows

The `cmd.agents.*` prefix is reserved as a first-party family for the Agents rail panel. All three rows are read-only navigation over the agents/subagents mirror; the mirror mutates nothing, and agent lifecycle actions (pause, cancel, retry, reroute) remain owned by their runtime/orchestrator command owners rather than this family.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.agents.show` | Show Agents Panel | `navigation_wrapper` | always | none | `unsupported` | agents |
| `cmd.agents.open_thread` | Open Agent Thread | `navigation_wrapper` | selection (`agent_thread_ref_resolvable`) | none | `stale_projection` | agents |
| `cmd.agents.open_node` | Open Agent Node | `navigation_wrapper` | selection (`node_ref_resolvable`) | none | `stale_projection` | agents |

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Wiring_Matrix.md

### Runtime Artifacts panel rows

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.artifacts.sort` | Sort Artifacts | `shell_view` | always | none | `unsupported` | artifacts |
| `cmd.artifacts.play_recording` | Play Recording | `domain_action` | record_only (`recording_artifact_terminal`) | none | `degraded`, `stale_projection` | artifacts |
| `cmd.artifacts.watch_recording` | Watch Live Recording | `domain_action` | live_subject (`recording_in_progress`) | none | `degraded`, `unreachable` | artifacts |
| `cmd.artifacts.show_sources` | Show Sources | `navigation_wrapper` | selection (`artifact_source_refs_present`) | none | `stale_projection` | artifacts |

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md

### Source Control depth rows

These rows resolve the underdefined `cmd.source_control.stash.*` compatibility-family declaration into first-class commands (list/create/apply/pop/drop; pop is added because the declared family lacked it) and supply the branch selector commands the section 2.5 coverage prose promises. `cmd.git.commit` registers the commit action the prototype's `panels.git_commit` token retires into. Stash drop and pop route the shared confirm surface; all mutating rows inherit projection-freshness gating.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.git.commit` | Commit | `domain_action` | selection (`git_available && staged_changes_present`) | none | `blocked_state_required`, `stale_projection`, `permission_required` | source_control |
| `cmd.source_control.generate_commit_message` | Generate Commit Message | `domain_action` | selection (`changes_present && assistant_available`) | none | `not_configured`, `degraded`, `permission_required` | source_control |
| `cmd.source_control.branch.switch` | Switch Branch | `domain_action` | capability (`git_available && branch_exists && working_tree_safe`) | none | `blocked_state_required`, `stale_projection` | source_control |
| `cmd.source_control.branch.create` | Create Branch | `domain_action` | capability (`git_available`) | none | `stale_projection`, `permission_required` | source_control |
| `cmd.source_control.stash.list` | List Stashes | `shell_view` | capability (`git_available`) | none | `unreachable` | source_control |
| `cmd.source_control.stash.create` | Create Stash | `domain_action` | selection (`dirty_working_tree`) | none | `stale_projection` | source_control |
| `cmd.source_control.stash.apply` | Apply Stash | `domain_action` | selection (`stash_selected`) | none | `blocked_state_required`, `stale_projection` | source_control |
| `cmd.source_control.stash.pop` | Pop Stash | `domain_action` | selection (`stash_selected`) | two_step | `blocked_state_required`, `stale_projection` | source_control |
| `cmd.source_control.stash.drop` | Drop Stash | `domain_action` | selection (`stash_selected`) | two_step | `stale_projection`, `permission_required` | source_control |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Wiring_Matrix.md

### Worktree and GitHub PR rows

`cmd.git.worktree.merge` mints the project-scope worktree merge the UCC-054 family lacked; per UCC-122's negative constraint it never reuses the thread-bound `cmd.chat.worktree.merge`. Lock and unlock register the worktree lock flags from the worktree research and W-doc lineage. `cmd.github.pr.create` is the GitHub-domain, API-only PR creation command (per GitHub_API_Auth_and_Flows) that the prototype token `git.create_pr` retires into; it is distinct from, and does not alias or replace, the panel-scoped `cmd.source_control.pr.create` route command (UCC-122) or the thread-bound `cmd.chat.worktree.pr`. All three PR-creation scopes stay live with wiring recording which surface dispatches which.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.git.worktree.merge` | Merge Worktree | `domain_action` | selection (`worktree_selected && merge_target_resolvable && !merge_locked`) | two_step | `blocked_state_required`, `stale_projection`, `permission_required` | source_control |
| `cmd.git.worktree.lock` | Lock Worktree | `domain_action` | selection (`worktree_selected && !worktree_locked`) | none | `stale_projection` | source_control |
| `cmd.git.worktree.unlock` | Unlock Worktree | `domain_action` | selection (`worktree_locked`) | none | `stale_projection`, `permission_required` | source_control |
| `cmd.github.pr.create` | Create PR on GitHub | `domain_action` | capability (`github_auth_valid && github_remote_present`) | none | `unauthorized`, `unreachable`, `not_configured` | github domain |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Wiring_Matrix.md

### Search panel completion rows

Result navigation, standalone scope, and the three query-flag toggles get concrete rows; `find_in_files`, `open_result`, `replace_all`, `replace_selected`, and `rebuild_index` keep their existing section 2.9 rows and payloads unchanged (replace flows keep the preserved-query-session payload and preview-before-apply behavior; no re-registration here).

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.search.next_result` | Next Search Result | `shell_view` | selection (`query_session_active && results_present`) | none | `stale_projection` | search |
| `cmd.search.previous_result` | Previous Search Result | `shell_view` | selection (`query_session_active && results_present`) | none | `stale_projection` | search |
| `cmd.search.set_scope` | Set Search Scope | `shell_view` | always | none | `unsupported` | search |
| `cmd.search.toggle_regex` | Toggle Regex | `shell_view` | always | none | `unsupported` | search |
| `cmd.search.toggle_case` | Toggle Match Case | `shell_view` | always | none | `unsupported` | search |
| `cmd.search.toggle_word` | Toggle Whole Word | `shell_view` | always | none | `unsupported` | search |

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/Wiring_Matrix.md

### Testing quarantine rows and run/session scope split

The run-scoped family `cmd.testing.run` / `watch_run` / `cancel_run` / `open_receipt` / `open_failure` / `export_bundle` / `open_panel` is the canon for test runs; the session-scoped family `cmd.testing.session.open` / `watch` / `background` / `redaction.inspect` is a distinct canon for visible test sessions. Both families stay live, neither aliases the other, and `watch_run` versus `session.watch` is a scope split, not a duplication. Quarantine is a state mutation over test identity, not a run action, and releases only through its paired command.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.testing.quarantine` | Quarantine Test | `domain_action` | record_only (`failing_test_identified`) | two_step | `stale_projection`, `permission_required` | testing |
| `cmd.testing.quarantine.release` | Release From Quarantine | `domain_action` | selection (`quarantined_test_selected`) | two_step | `stale_projection`, `permission_required` | testing |

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Wiring_Matrix.md

### File Manager, editor, and chat navigation rows

`cmd.file.open` is the bare subject-open command over the canonical `OpenFile{path,line?,range?,target_editor_panel_id?,target_editor_group_id?,target_group?}` route; it does not duplicate `cmd.file.open_with` (explicit target picker) and does not touch the ten-row CRUD closure, which stays intact per UCC-108. `target_group` is compatibility-only and normalizes to `target_editor_group_id`; Panel 1..4 values belong to `target_editor_panel_id`, never to `cmd.file.open_with`. `cmd.editor.close_tab` reserves the `cmd.editor.*` prefix for editor tab lifecycle. `cmd.chat.open_thread` is the cross-surface thread entry wrapper the prototype token `cmd.chat.open_at` retires into; it carries route/OpenSubject identity, opens the chat panel when closed, and does not duplicate the chat-panel-local `cmd.chat.switch_thread` row, with wiring recording the seam. `cmd.chat.add_file_reference` keeps its existing row and canonical signature lock unchanged.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.file.open` | Open File | `navigation_wrapper` | selection (`file_node_selected`) | none | `blocked_state_required` | files |
| `cmd.file.refresh` | Refresh File Tree | `domain_action` | always | none | `unreachable`, `degraded` | files |
| `cmd.file.reveal` | Reveal in File Tree | `navigation_wrapper` | selection (`subject_resolvable`) | none | `stale_projection` | files |
| `cmd.file.expand_capped` | Show More Rows | `shell_view` | selection (`capped_rows_present`) | none | `unsupported` | files |
| `cmd.editor.close_tab` | Close Editor Tab | `shell_view` | selection (`tab_open`) | two_step when dirty, else none | `blocked_state_required` | files |
| `cmd.chat.open_thread` | Open Chat Thread | `navigation_wrapper` | selection (`thread_exists`) | none | `stale_projection` | chat |

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

### Docker Manager lifecycle, image, and cleanup rows

Container lifecycle naming is adjudicated in favor of the reserved `cmd.docker.container.*` subfamily per the UCC-121 direction: `cmd.docker.container.stop` and `cmd.docker.container.restart` are canonical beside the already-registered `cmd.docker.container.start`, and the section 2.5A `cmd.docker.stop` / `cmd.docker.restart` rows become recorded compatibility aliases of them; the UCC-105 preserved tokens survive as alias evidence, and no existing row or unit is edited. `attach_shell`, `cleanup.scan`, and `cleanup.prune` were already named as existing tokens in UCC-105 canonical text; the rows below supply their concrete metadata. Docker Manager keeps its six subview tabs with distinct glyphs and abbreviated mid-width labels (user decision 2026-07-27); no new tab-switch commands are minted and subview switching stays on the existing switch_subview view-state.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.docker.container.stop` | Stop Container | `domain_action` | live_subject (`container_running`) | none | `unreachable`, `stale_projection` | docker_manager |
| `cmd.docker.container.restart` | Restart Container | `domain_action` | selection (`container_selected`) | none | `unreachable`, `stale_projection` | docker_manager |
| `cmd.docker.container.attach_shell` | Attach Shell | `domain_action` | live_subject (`container_running && capability_snapshot_current`) | none | `unsupported`, `unauthorized`, `unreachable` | docker_manager |
| `cmd.docker.container.inspect` | Inspect Container | `navigation_wrapper` | selection (`container_selected`) | none | `unreachable` | docker_manager |
| `cmd.docker.container.delete` | Delete Container | `domain_action` | selection (`container_selected && !container_running`) | strong | `blocked_state_required`, `stale_projection`, `permission_required` | docker_manager |
| `cmd.docker.image.tag` | Tag Image | `domain_action` | selection (`image_selected`) | none | `stale_projection` | docker_manager |
| `cmd.docker.image.inspect` | Inspect Image | `navigation_wrapper` | selection (`image_selected`) | none | `unreachable` | docker_manager |
| `cmd.docker.image.delete` | Delete Image | `domain_action` | selection (`image_selected && !image_in_use`) | strong | `blocked_state_required`, `stale_projection`, `permission_required` | docker_manager |
| `cmd.docker.cleanup.scan` | Scan for Reclaimable Space | `domain_action` | capability (`docker_available`) | none | `unreachable`, `degraded` | docker_manager |
| `cmd.docker.cleanup.prune` | Prune Reclaimable Space | `domain_action` | record_only (`scan_results_present`) | strong | `stale_projection`, `permission_required` | docker_manager |

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Wiring_Matrix.md

### Docker compose and context adjudication rows

Whole-file compose group verbs join the existing subset and scenario rows. The prior note that `cmd.docker.compose_up` aliases a full-compose scenario run is superseded by UCC-137: `compose_up` (and any `compose_down` usage) are recorded compatibility aliases of `cmd.docker.compose.up` / `cmd.docker.compose.down`. The dotted `cmd.docker.compose.scenario.save/run/edit/delete` rows remain canonical and the flat `compose.save_scenario` / `compose.run_scenario` spellings are recorded compatibility aliases. `cmd.docker.k8s.select_context` / `select_namespace` remain canonical with `set_context` / `set_namespace` as recorded aliases (existing section 2.5B statement, restated as adjudicated canon); the Docker-engine context selector is `cmd.docker.context.select` with the prototype's `cmd.docker.set_context` recorded as its alias.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.docker.compose.up` | Compose Up | `domain_action` | selection (`compose_file_selected`) | none | `not_configured`, `unreachable` | docker_manager |
| `cmd.docker.compose.down` | Compose Down | `domain_action` | live_subject (`compose_running`) | none | `unreachable`, `stale_projection` | docker_manager |
| `cmd.docker.compose.restart` | Compose Restart | `domain_action` | live_subject (`compose_running`) | none | `unreachable`, `stale_projection` | docker_manager |
| `cmd.docker.compose.open_file` | Open Compose File | `navigation_wrapper` | selection (`compose_file_selected`) | none | `blocked_state_required` | docker_manager |

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FileManager.md, ContractName:Plans/Wiring_Matrix.md

### cmd.panel.switch destination vocabulary (route-owner proof)

`cmd.panel.switch` remains a `shell_view` side-panel command with a controlled destination vocabulary. The closed canonical `panel_id` set is exactly: `search`, `chat`, `files`, `source_control`, `github_actions`, `docker_manager`, `testing`, `agents`, `artifacts`, `run_debug`. Any other destination value is a dispatch error; object-targeting contexts continue to use route-consuming wrapper commands per the existing `cmd.panel.switch` boundary rule, and prototype tokens `panels.show` and `panels.open_chat` retire into `cmd.panel.switch` with `panel_id: artifacts` and `panel_id: chat` respectively. `cmd.panel.undock` / `cmd.panel.redock` remain the canonical float/dock pair with `cmd.panel.detach` recorded as a compatibility alias of `cmd.panel.undock`.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md

### Cozy Shelves Reconciliation PlanUnits

### UCC-127 - Cozy Shelves Reconciliation Adoption And Namespace Reservations

```yaml
plan_unit_id: UCC-127
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The Cozy Shelves command reconciliation table (2026-07-27) is catalog canon: every prototype token from
  Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html and c2-cozy-shelves-files.html is adjudicated as canonical,
  alias-of a recorded target, newly registered, or retired, and concept markup migrates to the adjudicated ids
  when the c2 files are patched in place as the implementation base (user decision 2026-07-27). The cmd.agents.*
  and cmd.editor.* prefixes are reserved first-party command families. page.go, demo.toast, and demo.reason are
  retired concept-shell demo fixtures and never become catalog rows. The verbatim-duplicated GitHub Actions
  command family table copy lacking the legacy-alias rule is deleted; the surviving section 2.4 table carrying
  the legacy-alias rule is the single canonical family table.
gui_related: true
gui_classification_reason: Governs which user-visible command ids the Cozy Shelves rail panels may dispatch.
depends_on: [UCC-002]
unblocks: []
acceptance_criteria:
  - Every prototype command token has exactly one recorded disposition in the reconciliation table.
  - cmd.agents.* and cmd.editor.* resolve as reserved first-party prefixes.
  - Only one GitHub Actions family table exists in section 2.4 and it carries the legacy-alias rule.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: ui_command_catalog_drift
reasoning_tier: standard
context_scope: cozy_shelves_command_reconciliation
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_command_reconciliation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (Cozy Shelves concept; source-lineage-only)"
  - "user decision 2026-07-27 (implementation base = c2 concept files patched in place)"
preserved_exact_tokens:
  - "cmd.agents.*"
  - "cmd.editor.*"
negative_constraints:
  - Do not copy Cozy Shelves HTML, CSS, or class names into spec canon; concept files are source lineage only.
  - Do not register page.go, demo.toast, or demo.reason as catalog rows.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

### UCC-128 - GitHub Actions Namespace Promotion And Open-In-GitHub Adjudication

```yaml
plan_unit_id: UCC-128
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.github.actions.rerun, cmd.github.actions.rerun_failed, cmd.github.actions.cancel, and
  cmd.github.actions.dispatch are canonical hosted-run mutation commands; cmd.actions.rerun,
  cmd.actions.rerun_failed, and cmd.actions.cancel are recorded compatibility aliases with no minting
  authority, following the pin/unpin alias precedent. cmd.github.actions.open_in_github is the single
  canonical open-on-GitHub command with cmd.actions.open_in_browser and
  cmd.github.actions.open_run_in_browser as recorded compatibility aliases. dispatch carries a typed
  workflow_dispatch inputs payload and requires dispatch readiness validation. open_run and
  compare_last_success keep their existing section 2.4 rows with metadata completed by this addendum.
gui_related: true
gui_classification_reason: Registers user-visible GitHub Actions panel rerun, cancel, dispatch, and open-in-GitHub controls.
depends_on: [UCC-047, UCC-048]
unblocks: []
acceptance_criteria:
  - cmd.actions.rerun, rerun_failed, and cancel normalize to their cmd.github.actions.* canonical targets through recorded alias metadata.
  - Exactly one canonical open-on-GitHub command exists and both legacy spellings are recorded aliases.
  - dispatch is blocked until dispatch readiness validation passes and carries typed inputs.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: github_actions_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_github_actions_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_github_actions_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (section 2.4 GitHub Actions command family)"
preserved_exact_tokens:
  - "cmd.github.actions.rerun"
  - "cmd.github.actions.rerun_failed"
  - "cmd.github.actions.cancel"
  - "cmd.github.actions.dispatch"
  - "cmd.github.actions.open_in_github"
negative_constraints:
  - Do not mint new commands under cmd.actions.*.
  - Do not let cmd.actions.open_in_browser or cmd.github.actions.open_run_in_browser become primary names.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
```

### UCC-129 - Agents Panel Navigation Command Family

```yaml
plan_unit_id: UCC-129
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.agents.show, cmd.agents.open_thread, and cmd.agents.open_node are the Agents rail panel navigation
  commands. cmd.agents.show normalizes to the side-panel switch route with panel_id agents per the UCC-014
  alias discipline; open_thread and open_node are route-consuming navigation wrappers over stable
  thread/node refs. The agents mirror is read-only: this family mutates no agent, run, node, or thread
  state, and agent lifecycle actions remain owned by their runtime and orchestrator command owners.
gui_related: true
gui_classification_reason: Registers user-visible Agents panel show and open navigation controls.
depends_on: [UCC-014]
unblocks: []
acceptance_criteria:
  - cmd.agents.show normalizes to the panel-switch route with panel_id agents.
  - open_thread and open_node consume route/OpenSubject identity and mutate nothing.
  - No agent lifecycle mutation command exists under cmd.agents.*.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: agents_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_agents_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_agents_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
preserved_exact_tokens:
  - "cmd.agents.show"
  - "cmd.agents.open_thread"
  - "cmd.agents.open_node"
negative_constraints:
  - Do not add mutation commands to the read-only agents mirror family.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
```

### UCC-130 - Runtime Artifacts Panel Command Rows

```yaml
plan_unit_id: UCC-130
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.artifacts.sort is a shell_view list-order command registered for palette parity; cmd.artifacts.play_recording
  plays a terminal recorded artifact (record-only availability); cmd.artifacts.watch_recording binds a live
  in-progress recording (live-subject availability); cmd.artifacts.show_sources is the navigation wrapper the
  prototype token web.sources retires into, opening source refs through route/OpenSubject identity. Artifact
  record schemas remain owned by Runtime_Artifacts_Panel.md and its contracts; these rows are projections over
  that owner truth.
gui_related: true
gui_classification_reason: Registers user-visible Runtime Artifacts sort, playback, watch, and sources controls.
depends_on: [UCC-109]
unblocks: []
acceptance_criteria:
  - play_recording enables only for terminal recorded artifacts; watch_recording only for live recordings.
  - show_sources consumes route/OpenSubject identity; web.sources appears nowhere in production markup.
  - sort mutates view projection state only.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: artifacts_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_artifacts_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_artifacts_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
preserved_exact_tokens:
  - "cmd.artifacts.sort"
  - "cmd.artifacts.play_recording"
  - "cmd.artifacts.watch_recording"
  - "cmd.artifacts.show_sources"
negative_constraints:
  - Do not let artifact command rows own artifact record schemas; Runtime_Artifacts_Panel.md owner contracts remain truth.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```

### UCC-131 - Source Control Branch Stash And Commit Rows

```yaml
plan_unit_id: UCC-131
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.source_control.branch.switch and cmd.source_control.branch.create register the branch selector the
  section 2.5 coverage prose promises. cmd.source_control.stash.list, stash.create, stash.apply, stash.pop,
  and stash.drop resolve the underdefined stash.* compatibility-family declaration into first-class rows,
  adding pop which the declared family lacked; the prototype tokens cmd.git.stash_pop and cmd.git.stash_drop
  retire into stash.pop and stash.drop. cmd.git.commit registers the commit action the prototype token
  panels.git_commit retires into. cmd.source_control.generate_commit_message registers the AI commit-message
  action. Stash pop and drop use two-step confirmation through the shared confirm surface; mutating rows
  inherit projection-freshness gating.
gui_related: true
gui_classification_reason: Registers user-visible Source Control branch, stash, commit, and commit-message controls.
depends_on: [UCC-044]
unblocks: []
acceptance_criteria:
  - Each stash flow (list, create, apply, pop, drop) resolves to exactly one first-class command row.
  - branch.switch is blocked with a reason on unsafe working trees instead of disappearing.
  - panels.git_commit, cmd.git.stash_pop, cmd.git.stash_drop, and cmd.git.switch_branch appear nowhere in production markup.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: source_control_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_source_control_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_source_control_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (section 2.5 stash compatibility-family declaration)"
preserved_exact_tokens:
  - "cmd.git.commit"
  - "cmd.source_control.generate_commit_message"
  - "cmd.source_control.branch.switch"
  - "cmd.source_control.branch.create"
  - "cmd.source_control.stash.list"
  - "cmd.source_control.stash.create"
  - "cmd.source_control.stash.apply"
  - "cmd.source_control.stash.pop"
  - "cmd.source_control.stash.drop"
negative_constraints:
  - Do not leave any stash flow resolving to the underdefined compatibility family instead of a first-class row.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
```

### UCC-132 - Project-Scope Worktree Merge Lock Unlock And GitHub PR Create

```yaml
plan_unit_id: UCC-132
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.git.worktree.merge mints the project-scope worktree merge the UCC-054 family lacked; per the UCC-122
  negative constraint it never reuses the thread-bound cmd.chat.worktree.merge. cmd.git.worktree.lock and
  cmd.git.worktree.unlock register worktree lock flags. cmd.github.pr.create is the GitHub-domain API-only
  PR creation command that the prototype token git.create_pr retires into, gated on github_auth_valid and
  github_remote_present; it is distinct from, and neither aliases nor replaces, the panel-scoped
  cmd.source_control.pr.create route command and the thread-bound cmd.chat.worktree.pr. All three PR-creation
  scopes stay live and wiring records which surface dispatches which.
gui_related: true
gui_classification_reason: Registers user-visible worktree merge, lock, unlock, and GitHub PR creation controls.
depends_on: [UCC-054, UCC-055, UCC-058, UCC-122]
unblocks: []
acceptance_criteria:
  - Worktree merge is project-scoped, two-step confirmed, and blocked with a reason on dirty, conflicted, or merge-locked worktrees.
  - Lock and unlock mutate only worktree lock state.
  - cmd.github.pr.create, cmd.source_control.pr.create, and cmd.chat.worktree.pr remain three distinct live commands with recorded scope boundaries.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: source_control_command_catalog_gap
reasoning_tier: high
context_scope: cozy_shelves_worktree_pr_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_worktree_pr_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (UCC-054/UCC-055 project-scope worktree family, UCC-122 PR rows)"
preserved_exact_tokens:
  - "cmd.git.worktree.merge"
  - "cmd.git.worktree.lock"
  - "cmd.git.worktree.unlock"
  - "cmd.github.pr.create"
negative_constraints:
  - Do not reuse thread-bound cmd.chat.worktree.merge or cmd.chat.worktree.pr for panel-scoped actions.
  - Do not alias cmd.github.pr.create to cmd.source_control.pr.create or collapse the two rows.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
```

### UCC-133 - Search Result Navigation Scope And Flag Toggle Rows

```yaml
plan_unit_id: UCC-133
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.search.next_result and cmd.search.previous_result register result navigation over the preserved query
  session; cmd.search.set_scope registers the standalone scope command (the scope argument on find_in_files
  and replace_in_files is unchanged); cmd.search.toggle_regex, cmd.search.toggle_case, and
  cmd.search.toggle_word register the query flag toggles. All six are shell_view rows that mutate search view
  state only. The existing find_in_files, open_result, replace_all, replace_selected, and rebuild_index rows
  and payloads are unchanged, including the destructive replace preview-before-apply behavior.
gui_related: true
gui_classification_reason: Registers user-visible Search panel navigation, scope, and flag toggle controls.
depends_on: [UCC-002]
unblocks: []
acceptance_criteria:
  - Result navigation operates only within an active preserved query session.
  - Flag toggles and scope changes never mutate file or index state.
  - Existing search rows keep their payload shapes unchanged.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: search_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_search_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/LSPSupport.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_search_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (2026-07-02 aliases table sanctioning set_scope/next_result/previous_result)"
preserved_exact_tokens:
  - "cmd.search.next_result"
  - "cmd.search.previous_result"
  - "cmd.search.set_scope"
  - "cmd.search.toggle_regex"
  - "cmd.search.toggle_case"
  - "cmd.search.toggle_word"
negative_constraints:
  - Do not let shell_view search rows mutate files, indexes, or replace state.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/LSPSupport.md
```

### UCC-134 - Testing Quarantine Rows And Run Session Scope Split

```yaml
plan_unit_id: UCC-134
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.testing.quarantine and cmd.testing.quarantine.release register the quarantine state mutation over test
  identity with two-step confirmation. The run-scoped family cmd.testing.run, watch_run, cancel_run,
  open_receipt, open_failure, export_bundle, and open_panel is the canon for test runs; the session-scoped
  family cmd.testing.session.open, watch, background, and redaction.inspect is a distinct canon for visible
  test sessions. Both families stay live, neither aliases the other, and watch_run versus session.watch is a
  scope split rather than a duplication.
gui_related: true
gui_classification_reason: Registers user-visible Testing quarantine controls and fixes the run/session family split.
depends_on: [UCC-108]
unblocks: []
acceptance_criteria:
  - Quarantine and release are separate commands with separate receipts and two-step confirmation.
  - No alias metadata links the run-scoped and session-scoped testing families.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: testing_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_testing_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_testing_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/Automated_Testing_System.md (GUI Result Surfacing)"
preserved_exact_tokens:
  - "cmd.testing.quarantine"
  - "cmd.testing.quarantine.release"
negative_constraints:
  - Do not alias run-scoped testing commands to session-scoped ones or collapse the two families.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
```

### UCC-135 - File Manager Editor And Chat Navigation Rows

```yaml
plan_unit_id: UCC-135
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.file.open is the bare subject-open command over the canonical OpenFile route contract, distinct from
  cmd.file.open_with and additive beside the intact ten-row CRUD closure. cmd.file.refresh rescans the file
  tree projection; cmd.file.reveal is the /reveal navigation wrapper; cmd.file.expand_capped is the shell_view
  row-cap expansion. cmd.editor.close_tab registers editor tab lifecycle under the reserved cmd.editor.*
  prefix with a dirty-state confirm. cmd.chat.open_thread is the cross-surface chat thread entry wrapper that
  cmd.chat.open_at retires into; it opens the chat panel when closed and does not duplicate the panel-local
  cmd.chat.switch_thread row. cmd.chat.add_file_reference keeps its existing row and signature lock unchanged.
gui_related: true
gui_classification_reason: Registers user-visible file open, refresh, reveal, row-cap, editor tab, and chat thread controls.
depends_on: [UCC-108, UCC-014]
unblocks: []
acceptance_criteria:
  - cmd.file.open resolves through the OpenFile route contract and does not duplicate any CRUD closure row.
  - expand_capped mutates only view projection state.
  - close_tab requires confirmation only for dirty tabs.
  - cmd.chat.open_at appears nowhere in production markup.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: file_manager_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_file_editor_chat_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/FileManager.md
  - Plans/assistant-chat-design.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_file_editor_chat_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/FileManager.md (/reveal, OpenFile route, CRUD closure)"
preserved_exact_tokens:
  - "cmd.file.open"
  - "cmd.file.refresh"
  - "cmd.file.reveal"
  - "cmd.file.expand_capped"
  - "cmd.editor.close_tab"
  - "cmd.chat.open_thread"
negative_constraints:
  - Do not duplicate the ten CRUD closure rows or the cmd.file.open_with row.
  - Do not collapse cmd.chat.open_thread and cmd.chat.switch_thread into one row.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FileManager.md
  - Plans/assistant-chat-design.md
```

### UCC-136 - Docker Container Lifecycle Adjudication Image And Cleanup Rows

```yaml
plan_unit_id: UCC-136
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Container lifecycle naming is adjudicated per the UCC-121 direction: cmd.docker.container.stop and
  cmd.docker.container.restart are canonical beside cmd.docker.container.start, and the section 2.5A
  cmd.docker.stop and cmd.docker.restart rows become recorded compatibility aliases of them. This amendment
  supersedes the bare-verb presentation without editing the UCC-105 preserved tokens, which survive as alias
  evidence. cmd.docker.container.attach_shell, cmd.docker.cleanup.scan, and cmd.docker.cleanup.prune receive
  concrete metadata rows for tokens already named existing in UCC-105 canonical text.
  cmd.docker.container.inspect, cmd.docker.container.delete, cmd.docker.image.tag, cmd.docker.image.inspect,
  and cmd.docker.image.delete register the expander actions; container and image delete are destructive with
  strong confirmation, and prune is destructive over scan results. Docker Manager keeps six subview tabs with
  distinct glyphs and abbreviated mid-width labels (user decision 2026-07-27); no tab-switch commands are
  minted.
gui_related: true
gui_classification_reason: Registers and adjudicates user-visible Docker container, image, and cleanup controls.
depends_on: [UCC-049, UCC-105, UCC-121]
unblocks: []
acceptance_criteria:
  - cmd.docker.stop and cmd.docker.restart dispatch only as recorded aliases normalizing to cmd.docker.container.stop and cmd.docker.container.restart.
  - Container and image delete require strong confirmation through the shared confirm surface.
  - Prune enables only after a scan and never deletes beyond the scan result set.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: docker_command_catalog_gap
reasoning_tier: high
context_scope: cozy_shelves_docker_lifecycle_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_docker_lifecycle_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (UCC-105 existing-token list; UCC-121 container subfamily direction)"
  - "user decision 2026-07-27 (Docker Manager keeps 6 subview tabs)"
preserved_exact_tokens:
  - "cmd.docker.container.stop"
  - "cmd.docker.container.restart"
  - "cmd.docker.container.attach_shell"
  - "cmd.docker.container.inspect"
  - "cmd.docker.container.delete"
  - "cmd.docker.image.tag"
  - "cmd.docker.image.inspect"
  - "cmd.docker.image.delete"
  - "cmd.docker.cleanup.scan"
  - "cmd.docker.cleanup.prune"
negative_constraints:
  - Do not mint further bare-verb cmd.docker.* container lifecycle commands.
  - Do not reuse cmd.docker.run for starting stopped containers.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
```

### UCC-137 - Docker Compose Group Verbs Scenario Aliases And Context Adjudication

```yaml
plan_unit_id: UCC-137
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.docker.compose.up, cmd.docker.compose.down, and cmd.docker.compose.restart register whole-file compose
  group verbs beside the existing subset and scenario rows; cmd.docker.compose_up (and any compose_down
  usage) are recorded compatibility aliases of them, superseding the earlier note aliasing compose_up to a
  full-compose scenario run. cmd.docker.compose.scenario.save, run, edit, and delete remain canonical with
  the flat compose.save_scenario and compose.run_scenario spellings recorded as compatibility aliases.
  cmd.docker.compose.open_file registers the compose YAML to editor handoff over the OpenFile route.
  cmd.docker.k8s.select_context and cmd.docker.k8s.select_namespace are canonical with set_context and
  set_namespace recorded aliases; cmd.docker.context.select is the canonical Docker-engine context selector
  with the prototype token cmd.docker.set_context recorded as its alias.
gui_related: true
gui_classification_reason: Registers and adjudicates user-visible Docker compose, scenario, and context controls.
depends_on: [UCC-049, UCC-121]
unblocks: []
acceptance_criteria:
  - compose_up dispatches only as a recorded alias normalizing to cmd.docker.compose.up.
  - Flat scenario spellings normalize to the dotted scenario family through recorded alias metadata.
  - open_file resolves through the OpenFile route and never edits compose state itself.
  - Exactly one canonical selector exists for Docker-engine context and one each for K8s context and namespace.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: docker_command_catalog_gap
reasoning_tier: standard
context_scope: cozy_shelves_docker_compose_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FileManager.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_docker_compose_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (section 2.5A compose rows and 2.5B context statement; UCC-049 preserved tokens)"
preserved_exact_tokens:
  - "cmd.docker.compose.up"
  - "cmd.docker.compose.down"
  - "cmd.docker.compose.restart"
  - "cmd.docker.compose.open_file"
negative_constraints:
  - Do not let flat scenario spellings or compose_up become primary names.
  - Do not mint a second Docker-engine or Kubernetes context selector.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
```

### UCC-138 - Panel Switch Destination Vocabulary Undock Alias And Terminal Focus Adjudication

```yaml
plan_unit_id: UCC-138
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.panel.switch carries a controlled destination vocabulary: the closed canonical panel_id set is exactly
  search, chat, files, source_control, github_actions, docker_manager, testing, agents, artifacts, and
  run_debug; other values are dispatch errors and object targeting stays in route-consuming wrappers.
  Prototype tokens panels.show and panels.open_chat retire into cmd.panel.switch with panel_id artifacts and
  chat. cmd.panel.undock and cmd.panel.redock remain the canonical float/dock pair with cmd.panel.detach a
  recorded compatibility alias of cmd.panel.undock. For the Cozy Shelves rail terminal-focus control,
  cmd.terminal.show is the canonical dispatch target and the prototype's cmd.terminal.open usage in that
  bare-focus context is recorded as an alias mapping for markup migration only; the cmd.terminal.open catalog
  row itself stays a live, distinct row and the two rows never collapse into one normalized target, per the
  existing non-collapse rule.
gui_related: true
gui_classification_reason: Fixes user-visible panel switching, undock naming, and terminal focus dispatch for the rail shell.
depends_on: [UCC-014, UCC-108]
unblocks: []
acceptance_criteria:
  - cmd.panel.switch rejects panel_id values outside the closed ten-id set.
  - cmd.panel.detach dispatches only as a recorded alias normalizing to cmd.panel.undock.
  - The rail terminal-focus control dispatches cmd.terminal.show; cmd.terminal.open remains a live distinct row and does not normalize to cmd.terminal.show.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: high
context_scope: cozy_shelves_shell_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_shell_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (UCC-014 alias discipline; panel undock/redock rows; terminal non-collapse rule)"
preserved_exact_tokens:
  - "cmd.panel.switch"
  - "panel_id"
  - "run_debug"
negative_constraints:
  - Do not extend the panel_id vocabulary without a new catalog adjudication row.
  - Do not collapse cmd.terminal.open and cmd.terminal.show into one normalized target.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
```
