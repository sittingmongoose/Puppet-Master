# Commands System (Canonical SSOT)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status


### 0.1 Command scope and legacy retirements

This document is the **single canonical source of truth** for the Puppet Master User Commands system — user-authored command presets that inject templated prompts into a run. All other plan documents MUST reference this document by anchor (e.g., `Plans/Commands_System.md#COMMAND-SCHEMA`) rather than restating command definitions, discovery paths, template syntax, or execution semantics.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

Command-system reconciliation also covers chat UX, context `/compaction`, Commands, skills `/plugins`, and provider-mapping seams only where they affect User Command invocation, validation, or child-run launch. Plugin installation and skill runtime ownership remain with their own SSOTs; this document owns only whether commands can surface, invoke, or validate those entries without rebinding provider or plugin identity.

User Commands may surface `/resume` only by reference to the Assistant Chat and storage SSOTs; they MUST NOT define a separate restore/resume storage schema.

Legacy `phase_subagents` and provider-native `command-name` assumptions are `/replace`-only migration labels. They MUST NOT remain active beside the Persona-stage command contract.

### SSOT references (DRY)


- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- UICommand dispatch IDs: `Plans/UI_Command_Catalog.md`
- Reserved slash commands: `Plans/assistant-chat-design.md` §5
- Run modes: `Plans/Run_Modes.md`
- Persona system: `Plans/Personas.md`
- Permissions system: `Plans/Permissions_System.md`
- Tool permissions + tool events: `Plans/Tools.md`
- OpenCode baseline (commands): `Plans/OpenCode_Deep_Extraction.md` §7D
- GUI specification: `Plans/FinalGUISpec.md`

### 0.2 Cross-owner consumer boundaries

User Commands consume, but do not re-own, several adjacent runtime and provider contracts. For MCP prompt or tool OAuth flows, command loading and invocation defer to `Plans/Tools.md` `### Schema isolation and OAuth state`; Commands may surface the selected provider/scope and stable `client-id`, but `/token` custody, refresh, retry, and shared local HTTP listener ownership remain keyed by provider+scope semantics in the Tools/MCP owner docs rather than by User Command file or server identity.

For context behavior, Commands defer to `Plans/Run_Modes.md` `## 0. Scope and SSOT status`, `### SSOT references (DRY)`, and `## 7. Mode effects on context management`: `LF-006` and `LF-007` are treated as stale-residue / wrong-owner-routing failures whenever command prose sends detailed context-compilation or `/compaction` readers to `Plans/FileSafe.md` instead of the `Plans/Prompt_Pipeline.md` owner. FileSafe remains the guard over compiled output, not the context-compilation SSOT.

For storage and migration paths, `config > $PUPPET_MASTER_DATA_DIR > project dir > global dir` selects only a `logical_root` candidate. It does not prove continuity or writer authority. Before any command may rely on that candidate, the storage owner must reconcile the out-of-root bootstrap binding with the in-root `storage_instance_id`, `logical_root_fingerprint`, and `root_generation`, select the `active_root`, and publish `storage_access_mode = writer | viewer | blocked` with its closed `storage_mode_reason`. Commands may display redacted root identity/status or pass stable refs through execution context, but User Command files and frontmatter cannot accept, relocate, initialize, merge, overwrite, or switch storage roots. Persistence, continuity, relocation, unsafe fallback, migration, and path-resolution semantics stay in `Plans/storage-plan.md`.

For retry and failure recovery, Commands may expose status and recovery actions, but `429`, `402`, and `/breaker` behavior are owned by the bridge/runtime failure taxonomy in `Plans/CLI_Bridged_Providers.md`, `Plans/Executor_Protocol.md`, and `Plans/Run_Modes.md`. A User Command cannot override no-retry, rate-limit, quota, or circuit-breaker decisions with command-local retry text.

For Assistant Chat message actions, Commands consume the owner-defined `Resend` semantics from `Plans/assistant-chat-design.md` and `Plans/UI_Command_Catalog.md`: `Resend` replays the latest user-authored message and discards later generated history/work, while command presets must not redefine it as a generic retry, rewind, or file-restore action.

For clarification-request and `question-flow` behavior, command presets and wizard entry points defer to the shared question system in `Plans/assistant-chat-design.md` and the planning flow consumer rules in `Plans/chain-wizard-flexibility.md`; Commands may launch or reference those flows but do not define a separate question lifecycle.

For process coordination, Commands consume the aggregate canonical-store `pm.lock` and storage access result from the storage owner. The lock lives under the owner-selected `active_root`; if unsafe fallback is active, all canonical stores and the aggregate lock move together. User Commands and handlers must not inspect PID, mtime, heartbeat, file existence, or a copied lock path as authority, invent an alternate lock directory, delete/rename `pm.lock`, or persist a stale path beside the owner-derived value.

Command-visible provider context is a projection of provider owners. For bridged providers, `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`) owns the versioned correlation `/context` block and account-health semantics; Commands may surface those values when a command launches or resumes work, but account-health is stronger than auth lifecycle alone and must not be collapsed into command-local credential state. For OpenCode, `Plans/Provider_OpenCode.md` (`/Provider_OpenCode.md`) owns canonical `thread_id` mapping and upstream-account opacity; Commands may pass through the selected `thread_id`, but it cannot infer upstream-account identity when the provider marks it opaque.

Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording, and `/session-scope` wording as stale compatibility labels that cannot define command-local runtime identity.

Command-contract reconciliation is registry-facing, not prose-only. `Commands_System.md`, `Wiring_Matrix.md`, and `UI_Wiring_Rules.md` must keep command-contract `IDs` and validation hooks aligned: `/compact` stays reserved when `cmd.chat.compact_context` exists, `cmd.chat.run_user_command` cannot claim a phantom `chat.message.submitted` event unless the event owner registers it, and `AC-CMD02`, `AC-CMD07`, and `AC-CMD10` all enforce the same `override_builtin`, reserved-name, `/catalog`, `/actions`, `/mutation`, and projection-freshness boundaries instead of leaving git/actions prefix prohibition as prose-only guidance. Case L commands `cmd.chat.create_restore_point`, `cmd.chat.branch_from_restore`, and `cmd.chat.delete_restore_point` now have canonical catalog rows plus one-handler production wiring/reverse coverage. Their dispatch remains fail-closed on current catalog/wiring mismatch or an unavailable owner family; this current registration must not be replaced by a hand-maintained ghost-command example. The same registry boundary owns slash-command reservation, the command execution seam for User Commands, runtime vs overlay mode semantics, and reverse-coverage enforcement for every normative `cmd.*` reference.

Route-like UICommands may be surfaced beside User Commands, but Commands does not let feature-local labels become private target models. In `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`), `/UI` rows that still expose graph HITL `request_id` or `hitl_request_id` commands are a same-file contradiction when the same catalog centers canonical runtime recovery commands; those rows must resolve to runtime `blocked_sequence` before acting. First-class object-selection/navigation commands such as `cmd.source_control.select_worktree` must not remain `layout/UI state only` when they perform object-first worktree selection or object-selection. `cmd.artifacts.open_panel`, `cmd.artifacts.show_in_ledger`, `cmd.artifacts.show_in_usage`, `cmd.orchestrator.open_in_source_control`, `cmd.orchestrator.open_in_github_actions`, `cmd.orchestrator.open_in_docker_manager`, graph `/filter` focus commands, chat usage `/open` commands, and `cmd.source_control.select_worktree` must normalize through a shared `/route` route-target / `route_target` / `/subject` subject-open family before they carry object identity. Navigation commands that restore scope must carry `project_id`, `focused_run_id`, `thread_id`, or an equivalent derivation rule instead of being labeled `/UI-state` only. If `cmd.nav` or `cmd.nav.*` is introduced, surface-specific commands either wrap it with explicit `normalizes_to_contract` metadata or remain typed `navigation_wrapper` / `domain_action` specializations; pure `layout/UI state only` shell commands must not silently become object-first navigation commands. `cmd.panel.switch` and `cmd.source_control.switch_subview` stay pure `/view` /view-state commands with controlled destination vocabularies: they may consume normalized routing context, but they must not replace the canonical `route_target` model. `Plans/Contracts_V0.md` (`/Contracts_V0.md`) owns the route-target / `route_target` and subject-open contract family above individual surface commands, while this document owns whether a User Command can invoke or display repo-state inspection, hosted workflow inspection, or chat `/navigation` commands without rebinding them.

Command taxonomy is a three-way split, not a binary split: pure shell/view-state commands, route-consuming navigation commands, and domain mutation/runtime commands. Pure shell/view-state commands stay local and lightweight: they change what panel/subview/layout is visible, but they do not own canonical target identity. Route-consuming navigation commands reveal a specific object or scope and normalize through `route_target`; domain mutation/runtime commands act on canonical runtime or domain identity. `UICommand` remains the dispatch envelope, but `args` must carry a normalized target model when a command is navigation/open/focus-oriented instead of smuggling object identity through generic command-local payloads.

Command palette object results follow the same route model. Because `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`) already defines the global command palette, Commands treats palette exposure as a consumer boundary. The command palette may expose Orchestrator object results, not just commands/pages or `/pages`, but selecting an object result must route through the same `deep-link` contract as Orchestrator search and through the shared `/route` `route_target` / `/subject` subject-open family, not through command-local argument shapes. When those results reference run graph items, `Plans/Run_Graph_View.md` (`/Run_Graph_View.md`) owns the distinction between base `view-model` shape and `runtime-lineage` evidence; Commands may surface the result, but it does not redefine graph state. `Run_Graph_View.md` remains a strong internal contradiction site when later addenda prove the old `tier_id` model is no longer enough, so command results must treat graph context as owner-projected runtime lineage rather than command-local graph state.

Subject-open and route-payload commands exposed from the palette must carry schema-level `argument-contract` requirements from `Plans/Contracts_V0.md`, `Plans/UI_Command_Catalog.md`, and `Plans/UI_Wiring_Rules.md` instead of hiding target identity in generic `args`. Commands may declare that a User Command invokes or displays those route-like UICommands, but the machine-verifiable argument shape remains owned by those route and wiring owners, not by User Command frontmatter.

`UI_Wiring_Rules.md` remains the wiring owner for reusable navigation commands and subject-open commands; Commands treats those as first-class wiring shapes with schema-level route-payload and `argument-contract` obligations, not as generic `args` smuggling.

Command-facing runtime identity is only a consumer of the owner split. `Plans/Prompt_Pipeline.md` defines requested/effective field meaning, `/runtime`, and dispatch presence; `Plans/storage-plan.md` defines persistence and `/projection`; executor docs define required dispatch/runtime boundaries; `Multi-Account.md` owns switch notification and `/history` semantics; and bridged-provider streams own bridged-provider account evidence. Projection trust/freshness and `/freshness` vocabulary must stay separate from preview `/browser` `trust_tier` language so command surfaces do not create a semantic collision between projection health and browser preview trust. Commands may pass or display those values, but it must not invent alternate requested/effective account history or erase switch notifications when launching a command, child run, or route-consuming UICommand.

`persona_override_owner_id` and requested account context are owner-projected runtime identity, not command-local state: shared runtime docs must not let `persona_override_owner_id` preserve `tier_id`-style ownership while wizard/interview flows move to non-tier execution semantics, and command consumers must read `requested_account_binding` so hard-vs-soft account intent is explicit instead of inferred from UI context or switch reasons.

Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native execution constructs, including stale dispatch, agent tracking, and remediation paths plus scheduler and worktree isolation interaction. Commands may launch or display execution actions, but package/seam/corroboration/concern-aware execution hooks, lane/worktree-aware scheduling context, singular Overseer / Builder / Verifier retirement, and lane-awareness repairs belong to those runtime owners rather than to command frontmatter. Orchestrator live-context structs must rebase around node/attempt/worktree/permission-aware execution envelopes instead of tier-keyed adapters, and the runtime owners must introduce node/actor/lane-aware execution context into orchestrator runtime structs and active-agent tracking before Commands treats runtime context as canonical command input.

orchestration-core reconciliation is execution-core owner work, not command-surface cleanup. `Executor_Protocol.md` and `orchestrator-subagent-integration.md` are the execution-core outliers when they retain tier-era, tier-shaped `TierContext`, or `tier_runtime_record` canon; Commands treats graph/package/seam/lane/runtime-record and `/package/seam/lane/runtime-record` language, node-native execution, runtime blocked overlays, and `execution_unit_context` as upstream runtime owner contracts so runtime seams do not reappear as surface problems. `TierContext` and `tier_runtime_record` may survive only as derived decomposition/grouping/view/current-view, current-view/runtime-overlay, or `/runtime-overlay` projections; they must not act as the rewrite-era canonical execution context, a canonical execution owner, or a collapse of planner/decomposition helpers with runtime/audit objects.

Widget and native-surface state remains owner-routed when Commands exposes a command or checklist entry. `Plans/Widget_System.md` (`/Widget_System.md`) and `Widget_System` own chrome slots for `/trust-state`, projection-trust semantics, hostability, and tab-boundary direction. They also own the acceptable widget config / risky widget config boundary: acceptable widget config includes compact vs expanded view, item count, sort mode, and whether to show durations or cost; risky widget config includes a custom object model, custom state classification rules, widget-local definitions of blocked/completed/integration status, and slash-form `/completed/integration` labels. `Orchestrator_Page.md` and `Orchestrator_Page` own /page/native-surface behavior, no-active-run and `/historical-run` rendering, and any `/column/widget` table shape that still carries tier-era scoping. Commands may invoke or display these entries, but it must not define a parallel widget trust schema, widget-local state classification, or revive `Tiers` scope through command metadata.

Runtime artifact panels are also owner-routed when Commands exposes an artifact action. `Runtime_Artifacts_Panel.md` and `Runtime_Artifacts_Panel` own artifact-type semantics, panel behavior, schema family references, and the artifact evidence/provenance model; Commands may open or invoke the panel, but it must not redefine those families through command metadata.

Checklist references remain freshness-checked consumers. `Plans/Section15_MVP_Promoted_Features_Spec.md` (`/Section15_MVP_Promoted_Features_Spec.md`) is verification-only unless upstream reconciliation reveals direct stale references that require edits; it is not the storage, command, permission, or widget SSOT. Commands only relies on it for SSOT discipline and `/fail` checklist surfacing, and stale pass/fail references must be refreshed when upstream command, permission, storage, or widget specs move. `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`) stays a GUI consumer for top-level navigation, so stale `Tiers`, `7.7 Tiers`, page-table, or settings-grouping references must be treated as GUI freshness issues rather than command-owned structure.

Mutation and deprecation gates are first-class command constraints. `GATE-010` must evaluate subject-open commands, wrapper commands over canonical navigation, route-payload completeness, alias `/deprecation`, blocked-action admissibility against `allowed_action_ids` and `allowed_action_ids[]`, and stale or `/degraded` projection revalidation before mutation. Commands reuse the event-side alias discipline from `Contracts_V0.md` and `Contracts_V0` for command `/migration` and deprecation states instead of inventing a weaker prose-only alias pattern.

Command availability and summary vocabulary are consumer constraints, not local decorations. Command definitions and UICommands must declare whether each action is `live-run only`, `historical-safe`, or `record-only/export-only` / `/export-only` before palette, shortcut, or route dispatch; Commands must not infer historical safety from a label alone. Project summaries and command-palette summaries preserve the distinction between user-attention problems and internal degraded-trust warnings, so title-bar project badges, Projects page cards, command-palette summaries, and attention-center rows reuse the same status vocabulary and precedence rules. Runtime-detail, queue-analysis, remediation-lineage, and safe-point-history commands remain surface-specific commands, not a generalized subject-open family; they may normalize through route/subject contracts only as typed wrappers.

Discoverability does not weaken confirmation. Any command palette, shortcut surface, or User Command surface that invokes a `strong`, `hard_gate`, `non_reversible`, or `compensating_action_only` action must preserve the owner-defined confirmation, gating, preview, and blocked-action checks before dispatch.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md

### 0.3 Case L storage, restore, and recovery command boundary

This section is the Commands consumer propagation for approved Case L decisions. It owns command-dispatch admission and owner-routing only. `Plans/storage-plan.md` owns root, lock, viewer, I/O, backup, and persistence behavior; `Plans/FileSafe.md` owns exact-replace restore/equality/rollback/restart; `Plans/WorktreeGitImprovement.md` owns baseline filesystem/Git effects; `Plans/Executor_Protocol.md` owns blocked-episode and successor-attempt admission; `Plans/Contracts_V0.md` owns EventRecord v2, restore outcomes/reasons, and lifecycle events; Assistant Chat owns conversation restore-point lifecycle; and `Plans/UI_Command_Catalog.md` remains the sole command-registration and machine argument-contract owner.

ContractRef: ContractName:Plans/storage-plan.md#Case-L-4, ContractName:Plans/FileSafe.md#11.1.2b, ContractName:Plans/WorktreeGitImprovement.md#approved-exact-baseline-target-SCM-contract, ContractName:Plans/Executor_Protocol.md#approved-baseline-target-retry-and-restore-lifecycle, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/UI_Command_Catalog.md

#### Storage access gate, viewer envelope, and root navigation

Every invocation path, including direct handler dispatch, evaluates the storage-owner access result before command-local permission, projection, or business validation can authorize a side effect. An unknown/missing access result fails closed; a label, visible enabled control, cached projection, stale heartbeat, or available lock file never substitutes for `storage_access_mode = writer`.

In `viewer` mode, Commands allows only operations that stay inside the storage-owner frozen/manual-refresh envelope: canonical/history/receipt/artifact inspection, read-only search, copying text or stable identifiers, redacted diagnostics, view-local in-memory state, and explicitly permitted read/export/navigation against the captured high-water mark. A User Command preview is allowed only when expansion itself performs no shell injection, provider/tool call, child launch, persistence, or external mutation. User Command invocation that creates chat/history, changes settings, dispatches a run/agent/provider/tool, writes a receipt/checkpoint/index, changes project files/SCM, or performs an external side effect is disabled. Every mutation-capable command and direct handler returns the owner token `storage_read_only`; commands remain discoverable when useful and do not masquerade as unavailable for an unrelated reason.

`Retry storage` and `Try write mode` are owner-defined recovery action labels, not command IDs minted here. `Retry storage` is available only for the storage-owned explicit probe after `storage_io_exhausted`; `Try write mode` is available only for a compatible lock-conflict viewer. Neither action auto-resumes a blocked attempt. The later catalog/wiring wave must either register stable commands for these labels with owner preconditions/results or keep them as non-command recovery controls; this document and GUI consumers must not reference an invented `cmd.storage.*` ID.

Storage-value viewing and root-opening are read/navigation operations only when they carry the owner-resolved stable root/store/family/value identity plus the shared `route_target`/`OpenSubject` contract. A raw filesystem path is display/local handoff data, never root continuity, lock, or value authority. Opening `logical_root`, `active_root`, a retained relocation source, or a fallback recovery copy may reveal that exact redacted target but cannot select it as authoritative, promote it, clear a hold, or establish writer mode. A viewer that cannot safely open one captured value/root remains `blocked`; it must not fall back to an empty surface.

Root mismatch exposes only the owner actions `Use previous location`, `Choose location`, `Copy and switch to selected location`, and strongly confirmed `Start a new storage instance`. Fallback reconciliation keeps `cmd.storage.fallback.return_fast_forward` separate and admits it only while the immutable base still matches. `fallback_diverged` exposes exactly the registered visible dispositions `cmd.storage.fallback.keep_logical_root`, `cmd.storage.fallback.fork_new_instance`, and `cmd.storage.fallback.export_both`; User Command frontmatter cannot invoke them. Each disposition consumes the storage/Contracts-owned shared closed `StorageFallbackDispositionRequest` envelope, including its exact command-specific `confirmation`, full eight-component CAS set, lowercase 64-hex hashes, actor/idempotency identity, and sole storage handler; `Plans/UI_Command_Catalog.md` registers and consumes that envelope and the closed `StorageFallbackDispositionResult` but does not own either payload. Fork returns only an inactive `candidate_binding` without changing active bootstrap selection; export returns exact-byte encrypted `export_custody`, whose non-secret `manifest_ref` is output evidence rather than request input. All three retain both roots and record only `StorageFallbackResolutionReceipt`, with no EventRecord family, automatic merge, overwrite, deletion, or silent switch.

The storage command gate consumes the closed owner families exactly:

- `storage_access_mode = writer | viewer | blocked`;
- `storage_mode_reason = normal | lock_held | lock_indeterminate | unsupported_store_version | unsafe_filesystem_no_fallback | storage_io_exhausted | root_mismatch | root_unavailable | fallback_diverged`;
- `storage_io_class = interrupted | transient_busy | capacity_exhausted | quota_exhausted | read_only_media | permission_denied | device_unavailable | lock_conflict | integrity_failure | invalid_path`.

Only `interrupted` and `transient_busy` receive the owner automatic retry budgets. Commands cannot add a generic retry, translate unknown I/O to a retryable class, or turn returned writer access into an automatic replay of the blocked command. Unknown storage I/O maps owner-side to `device_unavailable`; unknown/malformed command-side state remains blocked without mutation.

#### Compatibility, maintenance, retention, and required-family availability

A newer or otherwise unsupported store is not a live viewer target. Commands may surface only the storage-owner metadata diagnostics and the state-valid startup recovery intents `check_for_update | choose_compatible_backup | open_diagnostics | quit`; they cannot expose `try_anyway`, force-open, live inspection of unsupported values, downgrade-in-place, or mutation. Migration and backup-restore progress remains journal-derived owner state. Cancellation is legal only in migration `preflight`; after that boundary a command surface must preserve the owner do-not-interrupt/recovery-resumes-on-next-launch disclosure and cannot invent force-cancel, rollback-now, skip-step, or an ETA.

The approved MVP has no generic user- or support-invocable live verify/repair/salvage command, Doctor mutation mode, in-place store editor, or bypass token. `Retry storage` and retry-recovery actions rerun closed admission/verification gates; they do not repair bytes. Backup restore stays offline and journaled. Migration, restore, compaction, quarantine, and any future salvage algorithm remain coordinator-owned maintenance under the aggregate lock and maintenance lease. User Command frontmatter, direct handlers, and command aliases cannot expose those internals as mutation verbs.

Retention/compaction is likewise owner-routed. Commands cannot infer expiry or destructive eligibility from prefix, key, path, filename, mtime, UI sort order, or focus. An unknown `retention_policy_ref` is indefinite/no-count-eviction and `materially_incomplete`, not permission to clean up. Storage & Retention settings may request only owner-admitted windows at or above owner minima. Legal-hold set/clear remains the protected `storage.legal_hold.manage` action with actor, reason, and durable receipt; manual compaction remains an owner-routed maintenance request. Neither can bypass holds, recovery/recent-run/live/backup/rollback/maintenance refs, the maintenance lease, or the storage access gate, and neither is a User Command ID registered by this document.

Command discoverability and registration never substitute for machine storage-family materialization. Safe-point restore, restore-point create/branch/delete, migration history, retention/anchor/maintenance, quarantine, and deletion actions remain unavailable when their required `Plans/storage_value_registry.json` family/value schema is absent, deferred, ambiguous, or unsupported. Compatibility aliases are coordinator-owned read/copy-forward inputs only; ordinary command handling cannot lazily rewrite them or route one family into another.

#### Safe-point restore, retry, Chat revert, and SCM consequences

The canonical runtime recovery commands remain `cmd.runtime.restore_safe_point_then_retry`, `cmd.runtime.retry_now`, and `cmd.runtime.start_fresh_attempt`. `cmd.orchestrator.safe_point_retry` is a UI/catalog wrapper and `cmd.orchestrator.restore_safe_point_then_retry` is its compatibility alias. Both accept the same wrapper input: the exact canonical safe-point fields plus optional `permission_snapshot_id`. Admission validates that optional evidence against current permission state, consumes it, and deterministically produces the exact canonical payload for the sole domain/handler pair `cmd.runtime.restore_safe_point_then_retry` / `handlers::runtime::restore_safe_point_then_retry`. Both share the runtime result, `safe_point.restored` producer, effects, idempotency identity, and admission; no orchestrator handler or receipt-only/no-event peer execution path exists.

Command admission consumes the exact blocked episode `{run_id, node_id, blocked_sequence, prior_attempt_id?}`, its ordered `allowed_action_ids[]`, and exact repo/worktree/baseline identity. When `requires_safe_point_restore = true`, only `cmd.runtime.restore_safe_point_then_retry` is legal, its `baseline_target` is exactly `safe_point`, and it requires the named `safe_point_id`, `repo_id`, and `worktree_id`. `retry_now`, `start_fresh_attempt`, resume, and wrapper aliases cannot bypass that rule. A missing/corrupt/unanchored safe point keeps the episode `recovery_unavailable`; recovery hold, local work, and worktree ownership remain preserved.

For `cmd.runtime.retry_now` and `cmd.runtime.start_fresh_attempt`, `baseline_target` is closed to `safe_point | historical_commit | worktree_head` only when the owning blocked/retry policy allows the verb and all target-specific fields are present. `safe_point` exact-replaces the named worktree through FileSafe. `historical_commit` requires the full immutable `historical_commit_oid`, preserves the source worktree byte-for-byte, and creates a new isolated clean worktree. `worktree_head` requires `expected_head_oid` plus `expected_state_sha256`, performs no checkout/reset/stash/clean/file mutation, and binds only after exact revalidation. No command may infer a target from focus, substitute another worktree/safe point/ref, resolve a moving/abbreviated ref, or treat `cmd.git.worktree.open` navigation as baseline preparation. The created historical worktree becomes openable only after its durable baseline receipt and identity exist; opening it does not prove it runnable.

`cmd.chat.revert` remains registered as file-mutation restore, not conversation rewind. Assistant Chat resolves one immutable eligible assistant-turn whole-mutation manifest; FileSafe exact-replaces that complete scope using recorded canonical identities and the same target verification, rollback snapshot, durable operation journal, CAS, equality, restart reconciliation, remote custody, and holds as safe-point restore. Omitted target resolution remains Chat-owned. Commands must not reinterpret paths through current `working_directory`, revert a subset of a multi-file turn, emit partial success, change transcript state, or weaken the operation into merge.

The closed Contracts/FileSafe results are consumed exactly:

- `restored_clean` or `restore_skipped` may continue to successor-attempt admission only with the required equality proof and durable baseline/restore receipt;
- `restore_refused` is pre-mutation and mints no successor;
- `restore_failed` means verified rollback equality, not target success, and mints no successor;
- `restore_recovery_required` retains the mutation fence, restore transaction, recovery hold, blocked episode, and worktree ownership;
- `restored_with_conflicts` is invalid for safe-point restore and `cmd.chat.revert` and is treated as an owner-contract violation.

Permission denial, `storage_read_only`, `storage_io_exhausted`, `snapshot_missing`, `snapshot_corrupt`, `snapshot_scope_unsupported`, `concurrent_edit_conflict`, `historical_commit_missing`, `baseline_stale`, `restore_recovery_required`, in-progress operation identity, and stale blocked/baseline identity remain distinct reasons. Command consumers must not collapse them to generic `restore_failed`, `unknown`, or retry. If an unknown result or reason reaches dispatch, fail closed, retain every fence/hold, emit no success, and route to diagnostics.

#### Conversation restore-point registered command boundary

Approved `PD-RSP-08` defines immutable conversation-boundary restore points under `rp:{project_id}:{restore_point_id}`. Applying one branches the frozen conversation state into a new `thread_id` and conversation `branch_id`; it leaves the source thread and source worktree unchanged, and an optional `safe_point_id` is lineage only. It never silently restores files.

The approved command set `cmd.chat.create_restore_point`, `cmd.chat.branch_from_restore`, and `cmd.chat.delete_restore_point` is registered by `Plans/UI_Command_Catalog.md` and has one-handler reverse coverage in `Plans/Wiring_Matrix.production.json`. Commands consumes that live registration; a current catalog/wiring mismatch, unknown command, or unavailable `restore_point_record` family still fails closed.

- create consumes `project_id`, `thread_id`, `source_message_id`, and `idempotency_key` and produces the owner `restore_point.created` record/event;
- branch consumes `project_id`, `restore_point_id`, `source_thread_id`, `expected_restore_point_sha256`, and optional `new_thread_title`, requires source-boundary/new-target disclosure, and only `branched` creates new thread/branch identity plus exactly one `restore_point.applied`;
- delete consumes `project_id`, `restore_point_id`, and `expected_restore_point_sha256` and follows owner retention/hold and expected-hash rules.

Status is `available | expired | deleted | corrupt`; application result is `branched | refused | failed`. Replay returns the recorded result and the same target IDs for `branched` without a second `restore_point.applied`. Refused/failed and expired/deleted/corrupt/stale-hash, permission, storage, hold, or in-progress states return no target IDs and no application event. First execution and replay preserve the source thread, source conversation branch, worktree, files, Git/index state, queue, and runtime safe points. Successful application does not consume the restore point. Commands cannot release descendant/preserve/legal holds, substitute a safe point, or combine conversation branching with FileSafe restore; a future combined operation requires a separately registered and confirmed composite transaction.

#### EventRecord v2 and command-originated evidence

Commands never creates a local event envelope. Any command-originated persisted event or domain event named above uses the Contracts-owned EventRecord `schema_version = 2.0.0`, required `scope_kind`, and conditional project identity. Command events for safe-point, FileSafe, worktree, attempt, receipt, and restore-point lifecycles are project-scoped with non-empty `project_id`; app-root storage recovery/compatibility evidence remains application-scoped with `project_id = null`. No User Command, wrapper, or handler may fabricate a project for application scope. Read-only inspection of an EventRecord `2.0.0` root is admitted only when the reader validates `2.0.0`; otherwise the command refuses open rather than constructing a partial or best-effort projection.

Command retries preserve the app-root-global `event_id` rule and the store-lifetime `(scope_partition, event_type, idempotency_key)` rule. `scope_partition` is exactly `app` for application scope and `project~{base64url_no_pad(UTF8(project_id))}` for project scope. Any command/view that resolves an event through the canonical `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` key requires zero-padded unsigned-decimal `sequence_id_20` and treats key/value scope mismatch as corruption. A replayed command identity returns the original semantic result only when the producer semantic digest agrees; a conflict or `dedupe_unavailable` appends nothing. Normal command dispatch cannot construct or request `projector_replay_only`; normal append rejects `replay_only_not_appendable`, and compatibility replay cannot execute commands, tools, providers, network, notifications, usage charging, safe-point mutation, or external side effects.

`persisted_at_utc` does not by itself authorize command success. Where the owner requires durable event/receipt evidence before mutation or successor dispatch, Commands requires the matching synced `AppendReceipt`/owner receipt. `StorageCompatibilityStatus` for an unsupported/newer store is diagnostic-only and is never appended into that incompatible target. Command arguments, diagnostics, copy/export, and EventRecord payloads cannot persist or disclose raw secrets, tokens, passwords, credentials, API keys, OAuth values, local credential paths, or local-machine secrets. Raw root/worktree paths remain local/redacted in exported EventRecord content; stable non-secret refs and identities carry cross-surface authority.

#### Case L command acceptance boundary

Required command-level oracles are: complete viewer/direct-handler inventory with zero durable/runtime/external mutation; `Retry storage` and `Try write mode` full revalidation with no automatic blocked-command replay; unsupported-store and migration inventory with no force-open/try-anyway/generic repair/salvage/Doctor mutation; retention/hold/compaction requests with no inferred eligibility or bypass; required-family materialization before command availability; root mismatch and fallback divergence with no silent initialization/merge/overwrite; exact target fields and no-substitution for every `baseline_target`; kill/failure restore outcomes matching proven equality; durable recovery holds surviving cleanup; whole-turn Chat revert parity; restore-point create/branch/delete registration and source preservation; EventRecord v2 reader/scope/index/dedupe/no-secret checks; and command/catalog/wiring reverse coverage for every stable ID. These are future fixture obligations, not runtime evidence or completeness certification from this prose.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md, DecisionID:PD-RSP-07, DecisionID:PD-RSP-08, DecisionID:PD-RSP-09

### Debug and launcher command boundary

Command-facing Debug terminology must distinguish classical DAP debugging, agentic app/runtime investigation, and assistant-session inspection so slash commands, palette labels, and help text do not collapse them into one ambiguous "Debug" surface.

Debug instrumentation that edits wrapper scripts, `/launcher` files, or `/launch-command/env` state must record the exact revert path and restore from a restore point or generated revert patch during cleanup; command templates may request that workflow, but they do not themselves become persistent launcher owners.

External directory access outside the active policy `/allowlist`, and any action unavailable or degraded for the active runtime or `/browser` health state, must resolve through the central permission/capability gates before a User Command can inject file contents, shell output, or debug evidence.

---

## 1. Definitions

<a id="DEF-USER-COMMAND"></a>
### 1.1 User Command (preset)


A **User Command** is a user-authored or catalog-installed command preset stored as a Markdown file with YAML frontmatter. When invoked, the template body is resolved (placeholders expanded, file includes loaded, shell output injected) and submitted as a prompt to the active chat thread or run. User Commands are the user-facing automation surface — they let users package repeatable prompt workflows without writing code.

<a id="DEF-UICOMMAND-DISTINCTION"></a>
### 1.2 UICommand (internal dispatch) — distinction


A **UICommand** (`Plans/Contracts_V0.md#7-uicommand`, `Plans/UI_Command_Catalog.md`) is an internal UI dispatch identifier (e.g., `cmd.chat.model`, `cmd.lsp.goto_definition`). UICommands are stable IDs that bind UI elements to handlers. They are **not** user-authored; they are developer-defined, code-registered, and wiring-matrix-verified.

User Commands and UICommands are orthogonal:
- User Commands are **content presets** (prompt templates).
- UICommands are **internal dispatch actions** (UI handler bindings).

A User Command's invocation through the chat slash-command surface or command palette ultimately dispatches a UICommand (`cmd.chat.run_user_command`) to trigger execution, but the User Command itself is not a UICommand.

ContractRef: ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md

### 1.3 Invocation surfaces

Project-scoped universal search, left-panel content search, and file-manager search remain product/search surfaces, not User Commands. The command palette may expose runnable commands as one category inside project-local `/symbols/commands/other` search, but implementation-readiness seams such as desktop to `/file-manager` `/drop`, diff heat maps or scrollbar change markers, ignored-file dimming or `/hiding`, generated-vs-workspace-file distinctions, and `/open/save/export` behavior are owned by the file/editor/search/GUI specs named in `Plans/00-plans-index.md`.

File tree actions and editor/file operations use canonical UICommands, not user-authored command presets. `Plans/FileManager.md` owns tree context-menu and action semantics; `Plans/UI_Command_Catalog.md` owns `cmd.file.*` and `cmd.chat.add_file_reference`; this document only owns whether a user-authored command can invoke or appear beside those actions without rebinding their IDs.

`Commands_System` / `Commands_System.md` owns this user-authored slash and `/palette` boundary only. Internal `UICommand` modeling, registration, route arguments, and command-catalog migration remain separate from user command presets even when the same palette displays both categories.

User Commands are invocable from three surfaces:

| Surface | Mechanism | Details |
|---------|-----------|---------|
| **Assistant chat** | Slash-command prefix `/` | User types `/<command-name>` (or `/x-<command-name>` for custom). Autocomplete popup lists available commands alongside reserved slash commands (`Plans/assistant-chat-design.md` §5). |
| **Command palette** | Palette entry | Commands exposed to the palette appear as "Run command: \<name\>". |
| **Orchestrator shortcut trigger** | Optional keybinding | A User Command may be bound to a keyboard shortcut via Settings > Shortcuts. |

ContractRef: ContractName:Plans/assistant-chat-design.md#5, ContractName:Plans/FinalGUISpec.md

---

## 2. Storage and discovery

<a id="STORAGE-LAYOUT"></a>

User Command files are stored in a deterministic two-tier layout. Project-local commands override global commands by name.

ContractRef: PolicyRule:Decision_Policy.md§2

### 2.1 Project-local

```
<project_root>/.puppet-master/commands/<name>.md
```

Scoped to the project workspace root. Available only when that project is active.

### 2.2 Global

```
~/.config/puppet-master/commands/<name>.md
```

Available across all projects. Overridden by a project-local command with the same name.

### 2.3 Resolution order


When resolving a command by name:
1. Check `.puppet-master/commands/<name>.md` in the active project root.
2. If not found, check `~/.config/puppet-master/commands/<name>.md`.
3. If not found, the command is unresolved. The invocation surface MUST display an error: "Unknown command: \<name\>".

### 2.4 Name collision rules


### 2.4.1 Reserved namespace retirements

Reserved built-ins and their families cannot be overridden by provider, skill, or extension naming.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

Collision rules:
- `/web` reserves the family namespace for `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, and `/web map`
- `override_builtin: true` is `/forbid` for reserved Assistant Chat built-ins; if it survives for extension design, it is limited to `non-core` command namespaces and cannot override `/web`, `/skill`, `/cancel`, `/clear`, `/stop`, or other canonical chat commands.
- `/web` commands are network `/external-read` operations, not `/shell` mutation commands. Approval/help copy routes URL-host scoped `For Session` examples for `/web extract`, `/web crawl`, `/web map`, and the `/crawl/map` follow-on family through `Plans/Permissions_System.md`, while `/web search` and `/web research` use `tool-wide` session grants only for that web tool.
- `/worktree` is reserved and cannot be re-bound by a custom command
- `/skill` is part of the reserved built-in slash-command set and remains a built-in helper surface for skill discovery or invocation; it cannot be rebound by User Commands or `override_builtin`
- `/plugins` remains a plugin-management/navigation surface, not a User Command namespace that a project command may redefine
- natural-language and slash dispatch share the same underlying dispatcher, so collision handling is consistent across both entry points
- Slash, palette, natural-language, agent-initiated, subagent, Goal Runtime, PRD Builder, and Planning Wizard web/browser intents normalize to the active `cmd.chat.web.*` command IDs and PM WebOperation / BrowserAction dispatcher; `/web` slash forms are entrypoints only, not the capability boundary. Command dispatch records `invocation_source`, optional `agent_reason`, and source IDs before the tool call; URL-reading phrases route to `cmd.chat.web.fetch` / `webfetch`, while visual, dynamic-page, iframe, console, network, screenshot, or PDF evidence requests attach BrowserAction/Site Reader requirements to the same command dispatch.

Reserved-name validation is a command-system boundary shared with chat-design, chat-overlay, and command-catalog consumers. The runtime rejects command files, palette entries, or plugin/skill projections that collide with the reserved-name set before they can emit a canonical-event, and `/mode` must be disambiguated by owner context so chat-overlay display mode, runtime run mode, and User Command frontmatter do not share an untyped payload slot. GPT-era registry audits do not create new event names by observation: `chat.thread.created` and `chat.thread_created` cannot both be active names for the same event, and `chat.message.submitted` is not valid support for `cmd.chat.run_user_command` until the event registry owns that name.

Ask `/Plan` behavior for command-triggered tools follows `Plans/Run_Modes.md` (`/Run_Modes.md`) and `Plans/Permissions_System.md`: Plan remains read-only for project mutation, but information-gathering `/tool` families such as web search, fetch, extract, research, crawl, and map are ask-gated or policy-denied by explicit permission rows rather than blanket auto-denied as if they were shell/file mutation.

### 2.5 Name validation

**Name regex:** `^[a-z][a-z0-9_-]{0,48}[a-z0-9]$`
- Starts with a lowercase letter.
- Contains only lowercase letters, digits, hyphens, and underscores.
- Ends with a lowercase letter or digit.
- Length: 2–50 characters.

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 3. Command schema

<a id="COMMAND-SCHEMA"></a>

A User Command file (`<name>.md`) consists of YAML frontmatter followed by a Markdown template body.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/DRY_Rules.md

### 3.1 YAML frontmatter

```yaml
---
description: "Run the project's test suite and report results"
persona: "rust-engineer"
mode: "regular"
model: "anthropic/claude-sonnet-4"
subtask: false
permissions_profile_override: null
override_builtin: false
---
```

### 3.2 Field definitions

| Field | Required | Type | Meaning |
|---|---|---|---|
| `name` | Required | `string` | Invocation name. Must pass validation and MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes. |
| `description` | Required | `string` | Short user-facing description. |
| `arguments` | Optional | `array<object>` | Positional argument schema for validation/help. |
| `persona_override` | Optional | `string` | Requested Persona override for the command execution context. |
| `mode_override` | Optional | `string` | Requested runtime mode override when allowed by the owning surface. |
| `model_override` | Optional | `string` | Requested model override. |
| `permissions_profile_override` | Optional | `string` | Permissions profile override, subject to the central permission system. |
| `override_builtin` | Optional | `boolean` | Reserved for future non-chat extension points. It MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes. |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md

### 3.3 Template body

The Markdown body following the frontmatter is the prompt template. It supports three dynamic features: placeholders, file includes, and shell output injection.

<a id="TEMPLATE-PLACEHOLDERS"></a>
#### 3.3.1 Placeholders

| Placeholder | Meaning |
|-------------|---------|
| `$ARGUMENTS` | All remaining text after the command name. |
| `$1`, `$2`, ... `$N` | Positional arguments, space-separated from the invocation text. |

Placeholder extraction: At load time, the template is scanned for `$ARGUMENTS` and `$N` patterns. The extracted list is stored as `hints` for autocomplete display.

Unresolved placeholders (no value provided) are replaced with empty string.

<a id="TEMPLATE-FILE-INCLUDE"></a>
#### 3.3.2 File includes (`@path`)

The pattern `@path/to/file` in the template body causes the referenced file's contents to be included at that position during template resolution. Directory references (`@path/to/dir`) include a listing of the directory contents.

**Permission guard:** File inclusion is checked against the `read` permission key (`Plans/Permissions_System.md` §5). If the active permission resolves to `deny` for the referenced path, the include is blocked and an error message is substituted. If `ask`, the approval UI is shown.

ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys

<a id="TEMPLATE-SHELL-INJECTION"></a>
#### 3.3.3 Shell output injection (`` !`command` ``)


The pattern `` !`shell-command` `` in the template body executes the shell command and injects its stdout at that position during template resolution.

**Permission guard:** Shell injection is checked against the `bash` permission key (`Plans/Permissions_System.md` §5). If the active permission resolves to `deny`, the injection is blocked and an error message is substituted. If `ask`, the approval UI is shown and the user's response (`deny`/`once`/`for session`/`always`) is respected per `Plans/Permissions_System.md` §6.

ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys, ContractName:Plans/Permissions_System.md#ASK-FLOW

---

## 4. Execution semantics


<a id="EXECUTION"></a>

### 4.1 Working directory

The active working directory for command execution resolves as follows:

1. If the active context has a bound worktree (`is_worktree` is true in execution context), use the **worktree root path**
2. Otherwise, use the **active project root**

This applies to all command execution contexts: Assistant Chat (all modes), Orchestrator DAE, terminal sessions, and file operations.

When a thread with a bound worktree is active in Assistant Chat, all `cmd.chat.*` commands execute against the worktree root. When no worktree is bound, they execute against the project root.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md

Assistant worktree commands share the orchestrator worktree directory family but use thread-derived names. Existing orchestrator worktrees keep `.puppet-master/worktrees/{tier_id}` style directory names; Assistant thread worktrees use `.puppet-master/worktrees/thread-{short_id}`, where `short_id` is derived from the bound `thread_id`. If `thread-{short_id}` already exists, command handling appends a numeric suffix such as `thread-{short_id}-2` instead of silently reusing a stale directory.

For worktree-bound threads, edit and file cards display paths relative to the resolved `working_directory`; for example, `src/main.rs (+12 −3)` is shown relative to the worktree root and opens by resolving that relative path under `working_directory`, with no special path rewriting layer. Terminal commands opened from the same thread set terminal `cwd` to the worktree path, not the main project root, and persist that worktree path as `cwd_snapshot` on the `terminal_session_record`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md

### 4.2 Subtask execution

command-subtask behavior is not a lighter-weight exception to the canonical child-run contract. When `subtask: true` is set, the command launches a canonical child run through the same delegated-run contract used everywhere else.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

`subtask: true` is not a lighter-weight interpretation of a normal prompt submission. It creates a child-session / `/delegation` boundary with required parent-child lineage, storage, `/permission/capability`, and runtime evidence.

Required behavior:
- resolve requested and effective Persona/runtime/model/effort state using the same pipeline as any other child run.
- classify the child dependency as `required` or `/optional`; `required` is the safer default for command subtasks unless the command explicitly declares advisory behavior.
- inherit and then narrow the parent permission ceiling and compatible capability universe, including child capability narrowing before dispatch.
- record the parent-child linkage in canonical event and storage records.
- do not silently fallback when the command explicitly requested a runtime surface that is unavailable or incompatible; this is the command-level `no-silent-fallback` rule.
- record the requested-vs-effective (`/effective`) provider `/runtime` surface when policy, availability, compatibility, or account binding changes the launched child.
- borrow provider child-session/delegation patterns where useful, but never require provider-native `session-tree` semantics on direct providers. PM canonical child-run identity remains the SSOT even when the provider has no native session tree.
- source-code evidence such as OpenCode `task.ts` is upstream evidence only; PM enforces its own `provider-family` / TOS guard for native subagent routing instead of assuming upstream task launch behavior is sufficient.
- permission resolution for command-launched child work defers to `Plans/Permissions_System.md` (`/Permissions_System.md`) for lane, package, `/package/account-bounded`, account-bounded approval scope, and multi-lane orchestrator runs; Commands may request or display the selected approval scope, but must not synthesize a weaker command-local policy.
- generalized projection freshness uses storage and owner vocabulary: `storage-plan.md` and `storage-plan` reserve `trust_tier` for Preview and `/browser` semantics, so Commands uses projection-freshness and `/degraded` state for stale command projections rather than reusing `trust_tier` as a generic trust/degraded label.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md
### 4.3 Persona selection

Command subtasks follow the canonical child Persona resolution order.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md

Rules:
- explicit command Persona override wins.
- otherwise the command-provided task or child type resolves Persona through the normal child Persona pipeline.
- parent Persona is at most a weak hint.
- child Persona does not silently copy the parent Persona.
### 4.4 Mode and model overrides

Provider, model, account, Persona, and worker-policy overrides, including the `/model/account/worker-policy` family, use the same requested/effective display grammar: command UI shows the requested override, effective result, inheritance source, and policy remap reason instead of deriving it from ad hoc color, disappearance, or current-settings winner state.


Command overrides are explicit child requests, not bypasses around the runtime model.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md

Rules:
- command mode overrides are capped by parent mode authority.
- command model/runtime surface overrides become explicit child requests.
- explicit requests do not silently fallback.
- requested versus effective runtime/model/effort fields remain visible when remaps occur because of compatibility or policy.

### 4.5 Current Working Set

Command cards, command-launched child runs, and command-produced blocks remain in the current `working-set` while they are the latest active result in the current branch of work, directly support the next intended action, participate in unresolved comparison `/approval/question/validation` state, or are explicitly focused or `/pinned` by the user. They leave the working set when a newer result supersedes the same purpose, the finding has been carried forward, or execution clearly moves to a different branch of work.

### 4.6 Template resolution order

Template resolution proceeds in this order:
1. Parse YAML frontmatter; extract field values.
2. Extract placeholder hints (`$ARGUMENTS`, `$1`, `$2`, ...) from body.
3. Substitute placeholders with invocation arguments.
4. Resolve `@path` file includes (permission-checked).
5. Resolve `` !`command` `` shell injections (permission-checked).
6. The fully resolved body is the prompt submitted to the run.

ContractRef: ContractName:Plans/Commands_System.md#EXECUTION

---

## 5. Permissions integration

<a id="PERMISSIONS"></a>

### 5.1 Shell injection permission check

Shell injection (`` !`command` ``) is evaluated against the `bash` permission key using the resolution algorithm in `Plans/Permissions_System.md` §8. The shell command string is the invocation context for granular pattern matching.

If the resolution yields `ask`, the approval UI is shown with the full shell command displayed. The user's response follows `Plans/Permissions_System.md` §6 semantics:
- `once`: Execute this injection only.
- `for session`: Insert a session-scoped allow rule for the command pattern.
- `always`: Create the durable allow defined by `Plans/Permissions_System.md` §6.
- `deny`: Block this injection for the current blocked episode.

Command permission prompts inherit parallel actor scoping. HITL/tool and `/tool` approval semantics normalize onto one blocked-episode model with explicit scope keying, field-family cleanup, and durable provenance. When resolving command-launched work, template file inclusion, or shell injection, the invocation must pass `actor/lane/run/account` and `/lane/run/account` scope so `session-scoped` `always` approvals, `reject-cascade` rules, and doom-loop `three consecutive times` counters are evaluated per actor/lane/run/account instead of across unrelated interleaved concurrent execution. If that context is under-specified, the command must present the blocked-overlay/HITL route instead of pretending a global approval or denial is safe. The legacy headless `ask -> deny unless HITL at current tier boundary` phrase is tier-era shorthand and resolves to normal blocked-overlay routing.

The same permission algorithm owns `ask/plan` and `external_publish_side_effect` semantics. A command that would publish externally, mutate durable state, or ask the user to approve a plan must resolve both concepts through one canonical approval calculation, not through separate command-template text.

ContractRef: ContractName:Plans/Permissions_System.md#ASK-FLOW, ContractName:Plans/Permissions_System.md#RESOLUTION

### 5.2 File inclusion permission check

File inclusion (`@path`) is evaluated against the `read` permission key. The file path is the invocation context. Same `ask` flow semantics apply.

ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys

### 5.3 `permissions_profile_override`

If a command specifies `permissions_profile_override`, the named profile is loaded from `~/.config/puppet-master/permission-profiles/<profile_id>.toml` and applied as an additional precedence layer between Persona overrides and project-level rules (effectively replacing the Persona's profile for this command's run).

ContractRef: ContractName:Plans/Permissions_System.md#PRECEDENCE-LAYERS

---

## 6. GUI requirements
### 6.6 Catalog-installed command lifecycle

Catalog-installed commands are still canonical User Commands after installation.

Rules:
- installation creates or updates a command in the same canonical command roots described in §2
- updates follow the same validation rules as manual edits
- removal of an installed command is blocked or deferred when the command is actively referenced by an open edit session or another subsystem requires explicit replacement/confirmation
- the GUI must show whether a command is local/manual, catalog-installed, or catalog-installed with local override
- uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it

<a id="GUI-COMMANDS"></a>

The Commands settings screen is part of the **Rules & Commands** tab in the unified Settings page (`Plans/FinalGUISpec.md` §7.4). All GUI surfaces described here are normative; `Plans/FinalGUISpec.md` references this section as the SSOT for Commands GUI behavior.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### 6.1 Commands management section

A **Commands** section within Settings > Rules & Commands MUST provide the following.

ContractRef: ContractName:Plans/Commands_System.md#GUI-COMMANDS

#### 6.1.1 Scope selector


A toggle at the top of the Commands section:
- **Global** — manages commands in `~/.config/puppet-master/commands/`.
- **Project** (visible when a project is active) — manages commands in `<project_root>/.puppet-master/commands/`.

#### 6.1.2 Command list

A table listing all resolved commands (project + global, project-local indicated with badge). Columns:
- **Name** (bold, with `/x-` prefix shown)
- **Scope** badge (project / global)
- **Description** (truncated to 1 line)
- **Persona** (if set; otherwise "—")
- **Mode** (if set; otherwise "inherit")
- **Model** (if set; otherwise "inherit")
- **Subtask** indicator (checkbox icon if `true`)

Sorted alphabetically by name; project-local entries sort before global when names match (indicating override).

#### 6.1.3 Create

"New Command" button opens an editor form with:
- **Name** (text input; validated per §2.5; collision check per §2.4)
- **Description** (text input; required; max 200 chars)
- **Persona** (dropdown populated from Persona registry, or null)
- **Mode** (dropdown: inherit / ask / plan / regular / yolo)
- **Model** (dropdown populated from model discovery, or null/inherit)
- **Subtask** (toggle; default off)
- **Permissions profile override** (dropdown populated from permission profiles, or null)
- **Override built-in** (toggle; default off; visible only in Expert mode; reserved Assistant Chat slash commands fail validation even if this toggle is enabled, because `override_builtin` does not apply to canonical reserved chat commands.)
- **Template body** (Markdown editor with syntax highlighting for `$ARGUMENTS`, `$N`, `@path`, `` !`cmd` `` patterns)

Scope selector: project-local or global.

#### 6.1.4 Edit

Row click or edit button opens the same editor pre-populated. Editing a global command while a project is active offers "Save as project override" (creates project-local copy) or "Save globally."

#### 6.1.5 Delete

Delete button with confirmation modal. Deleting a project-local command that overrides a global one reveals the global version. Deleting a global command with no project override removes it entirely.

#### 6.1.6 Schema validation on save

On every save, validate the command file against the schema (§3). Display inline errors for: reserved name collision, invalid name format, missing description, invalid mode value, and invalid model format. If `override_builtin: true` is set while the command name matches a reserved Assistant Chat slash command, display a validation error explaining that `override_builtin` does not apply to canonical reserved chat commands. Block save until errors are resolved.

### 6.2 Dry-run preview

<a id="DRY-RUN"></a>

A **"Preview"** button in the command editor resolves the template with sample arguments and displays the fully rendered prompt without submitting it. The preview:
- Shows placeholder substitutions highlighted.
- Shows file-include results (or permission-blocked placeholders).
- Shows shell-injection results (or permission-blocked placeholders).
- Uses a read-only rendered Markdown view.

The preview does NOT execute any run. Shell injections in preview mode execute the shell command (subject to `bash` permission) but do not submit the result to any agent.

### 6.3 Shortcut binding

## 7. Reserved built-in slash commands

This section owns `## 7. Reserved built-in slash commands` as the locked reserved-set contract. The same built-in slash-command family must stay visible here and in consumers: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`, `/doctor`, `/help`, `/web`, `/skill`, and `/cancel` remain reserved built-ins; `/clear` is removed; `/cancel` is a deprecated alias to `/stop`; and traceability for this reserved command family includes `obl-046` and `obl-047`.

Packet regeneration treats this owner as a `replace_section` unit: repairs for the reserved-set contract replace `## 7. Reserved built-in slash commands` itself rather than appending raw material after `### 6.3 Shortcut binding`, so stale-residue child/parent packet material cannot survive beside the canonical `/web`, `/skill`, and `/cancel` rules.

The `/web` family is reserved as one command family, not flattened into independent top-level commands. Bare `/web` has no-default execution behavior: it opens help/autocomplete only, and execution requires a subcommand such as `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, or `/web map`. The stale rule `Bare /web (with query argument) routes to cmd.web.search by default` is retired; `cmd.web.search` is not the implicit destination for bare `/web`.

The reserved `/web` slash family is one entrypoint into the shared PM WebOperation / BrowserAction dispatcher. Slash, command palette, natural-language user intent, autonomous assistant/subagent initiation, Goal Runtime, PRD Builder, and Planning Wizard requests resolve to the same `cmd.chat.web.search`, `cmd.chat.web.fetch`, `cmd.chat.web.extract`, `cmd.chat.web.research`, `cmd.chat.web.crawl`, or `cmd.chat.web.map` IDs before tool dispatch. Dispatch payloads preserve `invocation_source`, optional `agent_reason`, and source IDs, and reading a URL always normalizes to `webfetch` rather than search.

This section is the slash-command SSOT for the single canonical set of reserved chat slash commands; consumers mirror these commands rather than defining local variants.

`override_builtin` is /forbid for every reserved built-in slash command. If `override_builtin` survives for extension design, it is narrowed to non-core command namespaces only and cannot override `/web`, `/skill`, `/cancel`, `/clear`, `/stop`, or other canonical Assistant Chat built-ins.

Exact reserved-command behavior: bare /web has no default action, bare /skill is discovery or invocation only, /rewind dispatches conversation-only rewind, /revert dispatches file-mutation restore, /share/settings/doctor/help route to their owning surfaces, /cancel remains a deprecated alias to /stop, and /clear stays removed rather than a thread-clear command.


This section defines the canonical contract for this surface.

Core rules:
- The reserved built-in slash-command set is locked and non-overridable; bare /web has no default action, bare /skill is discovery or invocation only, /cancel remains a deprecated alias to /stop, and /clear stays removed.
- The /web family is locked as one slash-command family with stable command IDs, bare /web help behavior, and no flattening into separate top-level families.

Fields:
- slash prototype
- stable command ID
- subcommand-required parsing

Labels and values:
- /new
- /model
- /effort
- /mode
- /export
- /compact
- /stop
- /resume
- /rewind
- /revert
- /share
- /settings
- /doctor
- /help
- /web
- /skill
- /cancel
- /goal
- /goal again
- reserved built-ins

Rules:
- /web search <query>
- /web extract <url>
- /web research <task>
- /web crawl <url>
- /web map <url>
- cmd.chat.web.search
- cmd.chat.web.extract
- cmd.chat.web.research
- /web fetch <url>
- cmd.chat.web.fetch
- cmd.chat.web.crawl
- cmd.chat.web.map
- bare /web shows help/autocomplete only
- do not flatten /web into separate slash families
- subcommand is required for execution
- URL normalization applies
- parse failure shows usage
- /cancel resolves internally to cmd.chat.stop
- /goal resolves internally to cmd.chat.goal.start.
- /goal again resolves internally to cmd.chat.goal.update.
- /rewind dispatches `cmd.chat.rewind` and remains conversation-only
- /revert dispatches `cmd.chat.revert` and remains file-mutation restore, not conversation rewind
- /share, /settings, /doctor, and /help are reserved built-in slash entries that route to their owning thread, settings, health, and help surfaces rather than user-defined commands
- /clear stays removed and must not return as a `thread-clear` command
- Source cleanup shorthand `/de-duplication`, `/research-focused`, `/risky`, and `thread-clear` normalizes to reserved-command alias policy plus ask-gated web permission posture; it does not create extra slash commands.
- /web remains discoverable in catalog
- deprecated aliases shown distinctly from active commands
- reserved commands shown as non-editable in catalog

Goal Mode reserved slash commands:
- `/goal` starts Goal Mode through `cmd.chat.goal.start`.
- `/goal again` updates the active goal through `cmd.chat.goal.update`.
- These are reserved Assistant Chat built-ins and cannot be overridden by User Commands.

## 8. UICommand catalog entry

<a id="UICOMMAND-ENTRY"></a>

The following UICommand ID is the required dispatch bridge for User Command execution from any invocation surface. Registration remains owned by `Plans/UI_Command_Catalog.md`; this document does not make `cmd.chat.run_user_command` registered by assertion.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.chat.run_user_command` | `{ command_name, arguments? }` | `tool.invoked` when `subtask: true`; otherwise the canonical chat message event registered by the event owner, not `chat.message.submitted` unless that event is explicitly registered | Assistant chat, Command palette |

Reserved slash-command UICommand IDs (`cmd.chat.new`, `cmd.chat.model`, etc.) are defined in `Plans/UI_Command_Catalog.md` §2.7 and are distinct from User Command execution.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md#7-uicommand

### 7.1 Debug Mode dispatch family

Debug Mode actions use a separate canonical UICommand family, `cmd.debug.*`, for assistant-thread investigation control. These dispatch IDs are internal wiring identifiers, not User Commands, and they let Assistant Chat, the editor, and debug-adjacent surfaces invoke investigation lifecycle actions without overloading the User Command namespace.

| command_id | label | description | precondition |
|---|---|---|---|
| `cmd.debug.start` | Start Investigation | Begins a new debug investigation in current thread | `chat_active && !investigation_active` |
| `cmd.debug.stop` | End Investigation | Concludes the active investigation | `investigation_active` |
| `cmd.debug.pause` | Pause Investigation | Pauses evidence collection | `investigation_active` |
| `cmd.debug.resume` | Resume Investigation | Resumes paused investigation | `investigation_paused` |
| `cmd.debug.add_breakpoint` | Add Breakpoint | Adds a breakpoint at current editor position | `editor_active && investigation_active` |
| `cmd.debug.remove_breakpoint` | Remove Breakpoint | Removes selected breakpoint | `breakpoint_selected` |
| `cmd.debug.clear_breakpoints` | Clear All Breakpoints | Removes all breakpoints | `investigation_active && has_breakpoints` |
| `cmd.debug.view_evidence` | View Evidence | Opens evidence panel for current investigation | `investigation_active` |
| `cmd.debug.step` | Step Through | Advances to next execution point | `investigation_active && at_breakpoint` |
| `cmd.debug.collect_snapshot` | Collect Snapshot | Captures current state as evidence | `investigation_active` |

These Debug Mode dispatch IDs complement, rather than replace, the reserved slash-command surface described in `Plans/assistant-chat-design.md` and the broader UI command catalog in `Plans/UI_Command_Catalog.md`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Glossary.md

---

## 9. OpenCode baseline and Puppet Master deltas

OpenCode command material is external reference input used for ALIGNED/RECONCILED/ADOPTED/REFERENCE categorization only; it does not override Puppet Master command names, dispatch rules, storage paths, or reserved slash-command policy.


<a id="BASELINE-DELTAS"></a>

Per `Plans/OpenCode_Deep_Extraction.md` §7D and §9D:

### 9.1 Baseline

OpenCode loads commands from four sources: built-in commands (`init`, `review`), config-defined commands, MCP prompts (converted to commands), and skills (registered as commands if no name collision). Discovery paths: `.opencode/commands/<name>.md` (project) and `~/.config/opencode/commands/<name>.md` (global). Template features: `$ARGUMENTS`, `$1`/`$2` positional args, `` !`shell` `` injection, `@file` inclusion. `subtask: true` runs as a subagent task. `model` override uses `provider_id/model_id` format. Custom commands can override built-in commands by name; when a user-defined command has the same name as a built-in command, the user-defined version takes precedence.

### 9.2 Puppet Master deltas

1. **Discovery paths:** Puppet Master uses `.puppet-master/commands/<name>.md` (project) and `~/.config/puppet-master/commands/<name>.md` (global) instead of `.opencode/` paths.
2. **Persona integration:** OpenCode commands specify `agent` (agent name). Puppet Master commands specify `persona` (Persona ID per `Plans/Personas.md`), which is a higher-level role definition decoupled from provider-native agent concepts.
3. **Permissions profile override:** OpenCode commands have no per-command permissions override. Puppet Master adds `permissions_profile_override` for fine-grained control.
4. **No built-in commands:** OpenCode bundles `init` and `review` as built-in commands. Puppet Master does not bundle built-in User Commands; equivalent functionality is provided through reserved slash commands (`Plans/assistant-chat-design.md` §5) and Orchestrator actions.
5. **MCP prompt integration:** OpenCode auto-converts MCP prompts to commands. Puppet Master treats MCP prompts as a separate mechanism; they are not auto-registered as User Commands.
6. **GUI management:** OpenCode has no GUI for command management. Puppet Master provides a full Commands settings screen (§6).
7. **Built-in command override policy:** OpenCode allows custom commands to freely override built-in commands by name. Puppet Master does not allow User Commands to override canonical reserved Assistant Chat slash commands. The `override_builtin` field is reserved for future non-chat extension points and MUST NOT be used to bypass reserved chat-command or reserved git/GitHub prefix rules.
8. **Provider and capability identity limits:** OpenCode final-pass evidence from `OpenCode_Deep_Extraction.md`, `OpenCode_Coverage_Matrix.md`, `Provider_OpenCode`, and `Provider_OpenCode.md` remains external reference input for command behavior only. Puppet Master still requires its own SSE filter discriminator, stable mapping of OpenCode session IDs into provider-native identity fields, requested `/auth` versus `/effective` account identity parity, and command ID registration before adopting OpenCode-specific behavior. Capability discovery such as `capabilities.get` is a live provider/runtime contract, not a command-local cache; `Media_Generation_and_Capabilities.md`, `Media_Generation_and_Capabilities`, `Contracts_V0.md`, and `Contracts_V0` own the frozen orchestrator capability snapshot and event-registration boundaries.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 10. Acceptance criteria

<a id="ACCEPTANCE"></a>

These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/Progression_Gates.md

<a id="AC-CMD01"></a>
**AC-CMD01:** Project-local commands MUST override global commands with the same name. Resolution order (§2.3) MUST be deterministic.

<a id="AC-CMD02"></a>
**AC-CMD02:** User Commands MUST NOT use any reserved slash-command name (§2.4). The runtime MUST reject creation of commands with reserved names.

<a id="AC-CMD03"></a>
**AC-CMD03:** Template resolution (§4.6) MUST follow the defined order: frontmatter parse → placeholder extraction → placeholder substitution → file includes → shell injection.

<a id="AC-CMD04"></a>
**AC-CMD04:** Shell injection (`` !`command` ``) MUST be permission-checked against the `bash` key before execution. If denied, the injection MUST be blocked and an error substituted.

<a id="AC-CMD05"></a>
**AC-CMD05:** File inclusion (`@path`) MUST be permission-checked against the `read` key. If denied, the inclusion MUST be blocked and an error substituted.

<a id="AC-CMD06"></a>
**AC-CMD06:** When `subtask: true`, the command MUST execute as a child run via the `task` tool, and the parent MUST record the linkage in the event ledger.

<a id="AC-CMD07"></a>
**AC-CMD07:** The GUI Commands management section (§6) MUST validate command names on save and block saves with validation errors (reserved names, invalid format, missing description).

<a id="AC-CMD08"></a>
**AC-CMD08:** The dry-run preview (§6.2) MUST render the fully resolved template without submitting it to any agent run.

<a id="AC-CMD09"></a>
**AC-CMD09:** Every User Command MUST appear in the command palette and the chat slash-command autocomplete unless the command is unresolved.

<a id="AC-CMD10"></a>
**AC-CMD10:** User Commands MUST NOT override reserved Assistant Chat slash commands. `override_builtin` MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Commands_System.md#COMMAND-SCHEMA

---

*Document created for planning only; no code changes.*

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Commands_System.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### CS-002 - Command SSOT Authority and Legacy Retirements

```yaml
plan_unit_id: CS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Commands_System.md is the single canonical source of truth for Puppet Master
  User Commands, and adjacent docs must reference its anchors rather than
  restating command definitions, discovery paths, template syntax, or execution
  semantics; legacy phase_subagents and provider-native command-name assumptions
  remain replace-only migration labels.
gui_related: false
gui_classification_reason: Command SSOT authority and legacy retirement constraints are canonical ownership semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: [CS-003, CS-010, CS-012]
acceptance_criteria:
  - Commands_System.md remains the single canonical source of truth for User Commands.
  - Other plan documents reference command definitions, discovery paths, template syntax, and execution semantics by anchor.
  - User Commands may surface /resume only by reference to Assistant Chat and storage SSOTs.
  - User Commands MUST NOT define a separate restore/resume storage schema.
  - Legacy phase_subagents and provider-native command-name assumptions remain /replace-only migration labels and do not remain active beside the Persona-stage command contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_ssot_drift
reasoning_tier: high
context_scope: commands_system_authority
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_ssot_authority
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0003
preserved_exact_tokens:
  - "Puppet Master"
  - "single canonical source of truth"
  - "Plans/Commands_System.md#COMMAND-SCHEMA"
  - "/resume"
  - "phase_subagents"
  - "provider-native `command-name`"
  - "/replace"
negative_constraints:
  - "User Commands MUST NOT define a separate restore/resume storage schema."
  - "Legacy phase_subagents and provider-native command-name assumptions MUST NOT remain active beside the Persona-stage command contract."
owner_hints:
  - Plans/Commands_System.md
```

### CS-003 - Command SSOT Reference Map

```yaml
plan_unit_id: CS-003
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Commands System reference map names the external owner documents that
  command behavior consumes, including locked decisions, contracts, DRY rules,
  glossary terms, deterministic ambiguity handling, UICommand IDs, reserved
  slash commands, run modes, Personas, permissions, tools, OpenCode extraction,
  and GUI specification.
gui_related: true
gui_classification_reason: The reference map includes user-visible slash commands, UICommand dispatch IDs, and GUI specification consumers.
split_recommended: false
depends_on: [CS-002]
unblocks: [CS-004, CS-006, CS-011]
acceptance_criteria:
  - SSOT references include Spec_Lock, Contracts_V0, DRY_Rules, Glossary, Decision_Policy, and auto_decisions.
  - UICommand dispatch IDs are routed to Plans/UI_Command_Catalog.md.
  - Reserved slash commands are routed to Plans/assistant-chat-design.md section 5.
  - Run modes, Personas, Permissions, Tools, OpenCode baseline, and FinalGUISpec remain referenced instead of duplicated.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_reference_map_drift
reasoning_tier: standard
context_scope: commands_system_references
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: command_ssot_reference_map
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0004
preserved_exact_tokens:
  - "Plans/Spec_Lock.json"
  - "Plans/Contracts_V0.md"
  - "Plans/DRY_Rules.md"
  - "Plans/Glossary.md"
  - "Plans/Decision_Policy.md"
  - "Plans/UI_Command_Catalog.md"
  - "Plans/assistant-chat-design.md"
  - "Plans/Run_Modes.md"
  - "Plans/Personas.md"
  - "Plans/Permissions_System.md"
  - "Plans/Tools.md"
  - "Plans/OpenCode_Deep_Extraction.md"
  - "Plans/FinalGUISpec.md"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-004 - Backend and Provider Owner Deferral

```yaml
plan_unit_id: CS-004
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  User Commands consume but do not re-own adjacent MCP, context, storage, retry,
  provider, OpenCode, launcher, and binary-location runtime contracts; command
  loading and invocation may surface owner-projected values without rebinding
  credential custody, context compilation, persistence, recovery taxonomy,
  account health, thread mapping, or launcher identity.
gui_related: false
gui_classification_reason: Owner deferral for provider, storage, context, retry, and launcher semantics is backend/runtime governance.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes backend owner boundaries with chat, route, palette, widget, and GUI-facing consumer constraints.
depends_on: [CS-002, CS-003]
unblocks: [CS-005, CS-006, CS-007, CS-009]
acceptance_criteria:
  - MCP prompt and tool OAuth flows defer /token custody, refresh, retry, and shared local HTTP listener ownership to Tools/MCP owner docs.
  - Context behavior treats LF-006 and LF-007 as stale-residue or wrong-owner-routing failures when detailed context compilation is routed to FileSafe instead of Prompt_Pipeline.
  - Storage and migration paths use the owner detection order config > $PUPPET_MASTER_DATA_DIR > project dir > global dir without moving path-resolution semantics out of storage-plan.
  - 429, 402, and /breaker behavior remains owned by CLI_Bridged_Providers, Executor_Protocol, and Run_Modes.
  - Provider account-health and OpenCode thread_id opacity remain owner-projected and are not collapsed into command-local credential state.
  - Launcher and binary-location context treats four-tier, process-scope wording, and /session-scope wording as stale compatibility labels.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_owner_boundary_drift
reasoning_tier: high
context_scope: command_provider_runtime_boundaries
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Tools.md
  - Plans/Run_Modes.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: command_backend_provider_owner_deferral
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "/token"
  - "LF-006"
  - "LF-007"
  - "config > $PUPPET_MASTER_DATA_DIR > project dir > global dir"
  - "429"
  - "402"
  - "/breaker"
  - "client-id"
  - "thread_id"
  - "four-tier"
  - "/session-scope"
negative_constraints:
  - "Commands may not re-own credential custody, context compilation, persistence, retry taxonomy, provider account-health, OpenCode account identity, or launcher identity."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
```

### CS-005 - Chat Message and Question-Flow Command Boundaries

```yaml
plan_unit_id: CS-005
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command presets consume Assistant Chat message actions and shared question
  lifecycle behavior without redefining Resend, retry, rewind, file restore, or
  clarification-request semantics.
gui_related: true
gui_classification_reason: Resend and question-flow behavior are user-visible chat and wizard interaction semantics.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes visible chat/question behavior with backend owner boundaries.
depends_on: [CS-004]
unblocks: [CS-006, CS-011]
acceptance_criteria:
  - Resend replays the latest user-authored message and discards later generated history/work.
  - Command presets do not redefine Resend as generic retry, rewind, or file-restore.
  - Clarification-request and question-flow behavior defer to assistant-chat-design and chain-wizard-flexibility.
  - Commands may launch or reference question flows but do not define a separate question lifecycle.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_command_boundary_drift
reasoning_tier: high
context_scope: command_chat_question_boundaries
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: command_chat_question_flow_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "Resend"
  - "question-flow"
  - "clarification-request"
negative_constraints:
  - "Command presets must not redefine Resend as generic retry, rewind, or file-restore."
  - "Commands do not define a separate question lifecycle."
owner_hints:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
```

### CS-006 - Registry Route Palette and Argument Contracts

```yaml
plan_unit_id: CS-006
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command-contract reconciliation is registry-facing: User Commands may invoke
  or display route-like UICommands, palette object results, navigation wrappers,
  and subject-open commands only when cmd.* IDs, validation hooks, route_target
  payloads, /subject semantics, and argument-contract requirements remain owned
  by Contracts_V0, UI_Command_Catalog, and UI_Wiring_Rules.
gui_related: true
gui_classification_reason: Route-like UICommands, command palette object results, navigation wrappers, and subject-open commands drive visible UI surfaces.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes registry, route, palette, navigation, and backend runtime owner constraints.
depends_on: [CS-003, CS-005]
unblocks: [CS-007, CS-008, CS-011, CS-013]
acceptance_criteria:
  - /compact stays reserved when cmd.chat.compact_context exists.
  - cmd.chat.run_user_command cannot claim chat.message.submitted unless the event owner registers it.
  - Live-derived command validation confirms cmd.chat.branch_from_restore has one current catalog row and one sole-handler production-wiring row; stale hand-maintained ghost examples do not override that result.
  - Route-like commands normalize object identity through route_target, /route, or /subject contracts before carrying object identity.
  - cmd.panel.switch and cmd.source_control.switch_subview remain pure /view state commands with controlled destination vocabularies.
  - Palette object results route through the deep-link contract and shared route_target or subject-open family.
  - Schema-level argument-contract requirements are not hidden in generic args.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_registry_route_drift
reasoning_tier: high
context_scope: command_registry_route_contracts
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: command_registry_route_palette_contracts
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "cmd.chat.run_user_command"
  - "chat.message.submitted"
  - "cmd.chat.branch_from_restore"
  - "route_target"
  - "/subject"
  - "argument-contract"
  - "cmd.panel.switch"
  - "cmd.source_control.switch_subview"
negative_constraints:
  - "Commands must not let feature-local labels become private target models."
  - "Object identity must not be smuggled through generic command-local payloads."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
```

### CS-007 - Runtime Identity and Execution-Core Projection

```yaml
plan_unit_id: CS-007
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command-facing runtime identity is owner-projected from Prompt_Pipeline,
  storage, executor, multi-account, bridged-provider, and execution-core owners;
  Commands may launch or display execution actions but must not revive tier-era
  execution context, TierContext, tier_runtime_record, requested/effective
  account history, or runtime ownership through command frontmatter.
gui_related: false
gui_classification_reason: Runtime identity and execution-core projection are backend execution-context semantics.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes runtime identity projection with route and GUI-facing consumer rules.
depends_on: [CS-004, CS-006]
unblocks: [CS-008, CS-020]
acceptance_criteria:
  - Requested/effective field meaning, /runtime, dispatch presence, persistence, /projection, and account history stay with their owner docs.
  - Projection trust/freshness and /freshness vocabulary remain separate from preview /browser trust_tier language.
  - persona_override_owner_id and requested_account_binding are owner-projected runtime identity, not command-local state.
  - TierContext and tier_runtime_record may survive only as derived decomposition, grouping, view, current-view, current-view/runtime-overlay, or /runtime-overlay projections.
  - Execution-core owners must reconcile node-native execution, graph/package/seam/lane/runtime-record language, blocked overlays, and execution_unit_context before Commands treats runtime context as canonical command input.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_runtime_identity_drift
reasoning_tier: high
context_scope: command_runtime_projection
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
  - Plans/Multi-Account.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: command_runtime_identity_projection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "requested/effective"
  - "/runtime"
  - "/projection"
  - "trust_tier"
  - "/browser"
  - "persona_override_owner_id"
  - "requested_account_binding"
  - "TierContext"
  - "tier_runtime_record"
  - "execution_unit_context"
negative_constraints:
  - "Commands must not invent alternate requested/effective account history or erase switch notifications."
  - "TierContext and tier_runtime_record must not act as rewrite-era canonical execution context."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/Executor_Protocol.md
```

### CS-008 - Widget Artifact Checklist Availability and Confirmation Consumers

```yaml
plan_unit_id: CS-008
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Commands may expose widget, native-surface, artifact, checklist, availability,
  summary, and mutation entries only as owner-routed consumers that preserve
  widget trust, artifact provenance, checklist freshness, availability classes,
  alias/deprecation gates, stale or degraded projection revalidation, and
  confirmation requirements for strong or non-reversible actions.
gui_related: true
gui_classification_reason: Widgets, native surfaces, artifact panels, command-palette summaries, badges, and confirmation gates are visible user-facing surfaces.
split_recommended: true
split_recommendation_reason: Source span S0005 mixes GUI-facing consumer constraints with backend mutation and availability gates.
depends_on: [CS-006, CS-007]
unblocks: [CS-013]
acceptance_criteria:
  - Widget_System owns chrome slots, /trust-state, projection-trust semantics, hostability, tab-boundary direction, and risky widget config boundaries.
  - Runtime_Artifacts_Panel owns artifact-type semantics, panel behavior, schema family references, and artifact evidence/provenance.
  - Section15_MVP_Promoted_Features_Spec remains verification-only unless upstream reconciliation requires direct edits.
  - GATE-010 evaluates subject-open commands, wrappers, route-payload completeness, alias /deprecation, blocked-action admissibility, allowed_action_ids, and stale or /degraded projection revalidation.
  - Command definitions and UICommands declare live-run only, historical-safe, or record-only/export-only before palette, shortcut, or route dispatch.
  - strong, hard_gate, non_reversible, and compensating_action_only actions preserve owner-defined confirmation, gating, preview, and blocked-action checks before dispatch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_consumer_surface_drift
reasoning_tier: high
context_scope: command_widget_artifact_confirmation_consumers
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Widget_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: command_widget_artifact_confirmation_consumers
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0005
preserved_exact_tokens:
  - "/trust-state"
  - "/completed/integration"
  - "/historical-run"
  - "GATE-010"
  - "allowed_action_ids"
  - "live-run only"
  - "historical-safe"
  - "record-only/export-only"
  - "strong"
  - "hard_gate"
  - "non_reversible"
  - "compensating_action_only"
negative_constraints:
  - "Commands must not define a parallel widget trust schema, widget-local state classification, artifact schema family, or stale Tiers scope through command metadata."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Widget_System.md
  - Plans/Runtime_Artifacts_Panel.md
```

### CS-009 - Debug and Launcher Command Boundary

```yaml
plan_unit_id: CS-009
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command-facing Debug terminology distinguishes DAP debugging, agentic
  app/runtime investigation, and assistant-session inspection; any command that
  requests wrapper-script, launcher-file, launch-command/env, external-directory,
  degraded-runtime, or browser-health-sensitive actions must preserve revert
  paths and central permission/capability gate routing.
gui_related: false
gui_classification_reason: Debug terminology, launcher mutation cleanup, and permission/capability gates are runtime and policy behavior.
split_recommended: false
depends_on: [CS-004]
unblocks: []
acceptance_criteria:
  - Debug terminology does not collapse classical DAP debugging, agentic app/runtime investigation, and assistant-session inspection.
  - Wrapper script, /launcher file, or /launch-command/env edits record an exact revert path.
  - Cleanup restores from a restore point or generated revert patch.
  - External directory access outside the active policy /allowlist resolves through central permission/capability gates.
  - Actions unavailable or degraded for the active runtime or /browser health state resolve through central permission/capability gates before command injection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_launcher_boundary_drift
reasoning_tier: high
context_scope: command_debug_launcher_boundary
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: command_debug_launcher_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0006
preserved_exact_tokens:
  - "Debug"
  - "/launcher"
  - "/launch-command/env"
  - "/allowlist"
  - "/browser"
negative_constraints:
  - "Command templates may request launcher cleanup workflow, but they do not themselves become persistent launcher owners."
owner_hints:
  - Plans/Commands_System.md
```

### CS-010 - User Command Definition

```yaml
plan_unit_id: CS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  A User Command is a user-authored or catalog-installed Markdown preset with
  YAML frontmatter whose resolved template body is submitted to the active chat
  thread or run as a repeatable prompt workflow.
gui_related: false
gui_classification_reason: The User Command definition is data/model semantics for command presets.
split_recommended: true
split_recommendation_reason: Source span S0008 includes the next anchor for UICommand distinction, so lineage is shared with CS-011.
depends_on: [CS-002]
unblocks: [CS-011, CS-014]
acceptance_criteria:
  - DEF-USER-COMMAND remains the anchor for the User Command definition.
  - User Commands are user-authored or catalog-installed command presets stored as Markdown files with YAML frontmatter.
  - Invocation resolves placeholders, file includes, and shell output injection before submission.
  - User Commands package repeatable prompt workflows without requiring code.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: user_command_definition_drift
reasoning_tier: standard
context_scope: command_definitions
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: user_command_definition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0007
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0008
preserved_exact_tokens:
  - "DEF-USER-COMMAND"
  - "User Command"
  - "YAML frontmatter"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-011 - UICommand Distinction and Invocation Surfaces

```yaml
plan_unit_id: CS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  UICommands are developer-defined internal dispatch identifiers distinct from
  user-authored User Commands; User Commands may be invoked from Assistant chat,
  the command palette, and optional Orchestrator shortcut triggers through the
  command execution seam without becoming UICommand definitions.
gui_related: true
gui_classification_reason: UICommand dispatch, slash autocomplete, command palette entries, and shortcut triggers are visible UI interaction surfaces.
split_recommended: true
split_recommendation_reason: Source spans S0008 and S0010 mix definition anchors with visible invocation surfaces.
depends_on: [CS-006, CS-010]
unblocks: [CS-013, CS-022]
acceptance_criteria:
  - DEF-UICOMMAND-DISTINCTION remains the anchor for UICommand distinction.
  - UICommands are stable IDs that bind UI elements to handlers and are developer-defined, code-registered, and wiring-matrix-verified.
  - User Commands are content presets and UICommands are internal dispatch actions.
  - User Command invocation ultimately dispatches cmd.chat.run_user_command without making the User Command itself a UICommand.
  - Assistant chat uses slash-command prefix / with custom /x-<command-name> support.
  - Command palette entries appear as Run command: <name>.
  - Orchestrator shortcut trigger keybindings remain optional via Settings > Shortcuts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: uicommand_user_command_conflation
reasoning_tier: high
context_scope: command_invocation_surfaces
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: uicommand_distinction_invocation_surfaces
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0008
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0009
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0010
preserved_exact_tokens:
  - "DEF-UICOMMAND-DISTINCTION"
  - "UICommand"
  - "cmd.chat.run_user_command"
  - "project-local `/symbols/commands/other`"
  - "Run command: <name>"
  - "Settings > Shortcuts"
negative_constraints:
  - "User Commands are not user-authored UICommands."
  - "File tree actions and editor/file operations use canonical UICommands, not user-authored command presets."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

### CS-012 - Command Storage Roots and Resolution

```yaml
plan_unit_id: CS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  User Command files use a deterministic project-local and global two-tier
  layout where project-local commands override global commands by name and
  unresolved command names surface the exact Unknown command error.
gui_related: false
gui_classification_reason: Command file storage roots and resolution order are filesystem and lookup semantics.
split_recommended: false
depends_on: [CS-002]
unblocks: [CS-013, CS-014]
acceptance_criteria:
  - STORAGE-LAYOUT remains the anchor for User Command storage layout.
  - Project-local commands live at <project_root>/.puppet-master/commands/<name>.md and are available only when that project is active.
  - Global commands live at ~/.config/puppet-master/commands/<name>.md and are overridden by a project-local command with the same name.
  - Resolution checks project-local commands first, global commands second, and returns unresolved when neither path exists.
  - Unresolved invocation surfaces display "Unknown command: <name>".
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_storage_resolution_drift
reasoning_tier: standard
context_scope: command_storage_discovery
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: command_storage_roots_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0011
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0014
preserved_exact_tokens:
  - "STORAGE-LAYOUT"
  - "<project_root>/.puppet-master/commands/<name>.md"
  - "~/.config/puppet-master/commands/<name>.md"
  - "Unknown command: <name>"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
  - Plans/storage-plan.md
```

### CS-013 - Reserved Names Collisions and Name Validation

```yaml
plan_unit_id: CS-013
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Reserved built-in slash commands and their families cannot be overridden by
  provider, skill, plugin, extension, natural-language, or custom User Command
  names; command creation also enforces the canonical lowercase name regex and
  disambiguates /mode by owner context.
gui_related: false
gui_classification_reason: Reserved-name collision handling and regex validation are command registry and schema constraints.
split_recommended: false
depends_on: [CS-011, CS-012]
unblocks: [CS-014, CS-016]
acceptance_criteria:
  - /web reserves the family namespace for /web search, /web fetch, /web extract, /web research, /web crawl, and /web map.
  - override_builtin: true is /forbid for reserved Assistant Chat built-ins and cannot override /web, /skill, /cancel, /clear, /stop, or canonical chat commands.
  - /web commands are network /external-read operations, not /shell mutation commands.
  - /worktree is reserved and cannot be re-bound by a custom command.
  - /skill cannot be rebound by User Commands or override_builtin.
  - /plugins remains plugin-management/navigation, not a User Command namespace.
  - Natural-language and slash dispatch share the same dispatcher collision handling.
  - GPT-era registry audits do not create new event names by observation.
  - Ask /Plan behavior for command-triggered tools follows Run_Modes and Permissions_System permission rows.
  - Names match ^[a-z][a-z0-9_-]{0,48}[a-z0-9]$ and length 2-50 characters.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_reserved_name_drift
reasoning_tier: high
context_scope: command_name_validation
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: command_reserved_name_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0017
preserved_exact_tokens:
  - "/web"
  - "/web search"
  - "/web fetch"
  - "/web extract"
  - "/web research"
  - "/web crawl"
  - "/web map"
  - "override_builtin: true"
  - "/forbid"
  - "/worktree"
  - "/skill"
  - "/plugins"
  - "chat.thread.created"
  - "chat.thread_created"
  - "chat.message.submitted"
  - "^[a-z][a-z0-9_-]{0,48}[a-z0-9]$"
negative_constraints:
  - "Reserved built-ins and their families cannot be overridden by provider, skill, or extension naming."
  - "GPT-era registry audits do not create new event names by observation."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
```

### CS-014 - Command File Schema and Frontmatter Fields

```yaml
plan_unit_id: CS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  A User Command file consists of YAML frontmatter plus a Markdown template body,
  with canonical fields for name, description, arguments, persona/model/mode
  overrides, permissions_profile_override, and override_builtin.
gui_related: false
gui_classification_reason: Command schema and frontmatter field definitions are file-format semantics.
split_recommended: false
depends_on: [CS-013]
unblocks: [CS-015, CS-018, CS-020]
acceptance_criteria:
  - COMMAND-SCHEMA remains the anchor for User Command file structure.
  - Frontmatter examples preserve description, persona, mode, model, subtask, permissions_profile_override, and override_builtin.
  - name is required, must pass validation, and MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes.
  - description is required and remains a short user-facing description.
  - arguments remains an optional array<object> for positional argument schema.
  - persona_override, mode_override, model_override, and permissions_profile_override remain requested overrides subject to their owner systems.
  - override_builtin remains reserved for future non-chat extension points and MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_schema_drift
reasoning_tier: standard
context_scope: command_file_schema
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/Permissions_System.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: command_file_schema_frontmatter
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0019
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0020
preserved_exact_tokens:
  - "COMMAND-SCHEMA"
  - "YAML frontmatter"
  - "description"
  - "persona"
  - "mode"
  - "model"
  - "subtask"
  - "permissions_profile_override"
  - "override_builtin"
negative_constraints:
  - "name MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes."
  - "override_builtin MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes."
owner_hints:
  - Plans/Commands_System.md
```

### CS-015 - Template Body and Placeholder Semantics

```yaml
plan_unit_id: CS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Markdown template body supports placeholders, file includes, and shell
  output injection; placeholder extraction scans for $ARGUMENTS and $N patterns,
  stores extracted hints for autocomplete display, and replaces unresolved
  placeholders with an empty string.
gui_related: false
gui_classification_reason: Template body and placeholder expansion are command template processing semantics.
split_recommended: true
split_recommendation_reason: Source span S0022 also carries the TEMPLATE-FILE-INCLUDE anchor consumed by CS-016.
depends_on: [CS-014]
unblocks: [CS-016, CS-017, CS-024]
acceptance_criteria:
  - TEMPLATE-PLACEHOLDERS remains the anchor for placeholder semantics.
  - The template body supports placeholders, file includes, and shell output injection.
  - $ARGUMENTS represents all remaining text after the command name.
  - $1, $2, and $N represent positional arguments from invocation text.
  - Load-time extraction scans for $ARGUMENTS and $N patterns and stores the extracted list as hints for autocomplete display.
  - Unresolved placeholders are replaced with empty string.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_template_placeholder_drift
reasoning_tier: standard
context_scope: command_template_resolution
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_template_placeholders
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0021
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0022
preserved_exact_tokens:
  - "TEMPLATE-PLACEHOLDERS"
  - "$ARGUMENTS"
  - "$1"
  - "$2"
  - "$N"
  - "hints"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-016 - File Include Resolution and Read Permission Guard

```yaml
plan_unit_id: CS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Template file includes use @path and directory listing expansion, then enforce
  the Permissions System read permission key so denied includes are blocked,
  ask results show approval UI, and blocked includes substitute an error.
gui_related: true
gui_classification_reason: File include permission handling can surface approval UI and visible blocked-include errors.
split_recommended: true
split_recommendation_reason: Source spans S0022, S0023, and S0034 share anchors and permission behavior with placeholder and shell-injection units.
depends_on: [CS-013, CS-015]
unblocks: [CS-017, CS-024]
acceptance_criteria:
  - TEMPLATE-FILE-INCLUDE remains the anchor for file include semantics.
  - "@path/to/file includes the referenced file contents during template resolution."
  - "@path/to/dir includes a directory listing."
  - File inclusion checks the read permission key from Permissions_System section 5.
  - deny blocks the include and substitutes an error message.
  - ask shows the approval UI and applies the same ask flow semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_file_include_permission_drift
reasoning_tier: high
context_scope: command_template_permission_guards
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: command_file_include_permission_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0034
preserved_exact_tokens:
  - "TEMPLATE-FILE-INCLUDE"
  - "@path"
  - "@path/to/file"
  - "@path/to/dir"
  - "read"
  - "ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys"
negative_constraints:
  - "Denied file inclusion must be blocked and substituted with an error message."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
```

### CS-017 - Shell Injection Resolution and Bash Permission Guard

```yaml
plan_unit_id: CS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Template shell output injection uses the !`shell-command` pattern and enforces
  the Permissions System bash key and ask flow, including actor/lane/run/account
  scope, blocked-overlay/HITL routing for underspecified context, and unified
  ask/plan plus external_publish_side_effect approval calculation.
gui_related: true
gui_classification_reason: Shell injection permission prompts and blocked overlays are visible approval/HITL UI behavior.
split_recommended: true
split_recommendation_reason: Source spans S0023, S0024, S0032, and S0033 share template and permission-section anchors with adjacent units.
depends_on: [CS-015, CS-016]
unblocks: [CS-024]
acceptance_criteria:
  - TEMPLATE-SHELL-INJECTION remains the anchor for shell output injection.
  - The pattern !`shell-command` executes the shell command and injects stdout during template resolution.
  - Shell injection checks the bash permission key from Permissions_System section 5.
  - deny, once, for session, and always responses follow Permissions_System ask flow semantics.
  - The shell command string is the invocation context for granular pattern matching.
  - Command-launched work, template file inclusion, and shell injection pass actor/lane/run/account and /lane/run/account scope.
  - Underspecified context presents blocked-overlay/HITL routing rather than pretending a global approval or denial is safe.
  - ask/plan and external_publish_side_effect resolve through one canonical approval calculation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_shell_permission_drift
reasoning_tier: high
context_scope: command_template_permission_guards
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: command_shell_injection_permission_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0024
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0032
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0033
preserved_exact_tokens:
  - "TEMPLATE-SHELL-INJECTION"
  - "!`shell-command`"
  - "bash"
  - "once"
  - "for session"
  - "always"
  - "deny"
  - "actor/lane/run/account"
  - "/lane/run/account"
  - "ask/plan"
  - "external_publish_side_effect"
negative_constraints:
  - "A command must not resolve publish, durable mutation, or plan approval through separate command-template text."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
```

### CS-018 - Command Working Directory Resolution

```yaml
plan_unit_id: CS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command execution resolves the active working directory to the bound worktree
  root when execution context has is_worktree true and otherwise to the active
  project root, applying consistently to Assistant Chat, Orchestrator DAE,
  terminal sessions, and file operations.
gui_related: false
gui_classification_reason: Working directory resolution is command execution runtime behavior.
split_recommended: true
split_recommendation_reason: Source span S0026 also includes visible path-card and terminal cwd behavior covered by CS-019.
depends_on: [CS-014]
unblocks: [CS-019, CS-020]
acceptance_criteria:
  - EXECUTION remains the anchor for command execution semantics.
  - If active context has a bound worktree with is_worktree true, commands use the worktree root path.
  - Otherwise commands use the active project root.
  - Assistant Chat, Orchestrator DAE, terminal sessions, and file operations share this resolution rule.
  - cmd.chat.* commands execute against the worktree root when a thread has a bound worktree, and against project root otherwise.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_working_directory_drift
reasoning_tier: high
context_scope: command_execution_context
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Executor_Protocol.md
  - Plans/assistant-chat-design.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: command_working_directory_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0026
preserved_exact_tokens:
  - "EXECUTION"
  - "is_worktree"
  - "worktree root path"
  - "active project root"
  - "cmd.chat.*"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-019 - Assistant Worktree Naming Path Display and Terminal CWD

```yaml
plan_unit_id: CS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Assistant worktree commands use thread-derived worktree directory names,
  append numeric suffixes for collisions, show edit and file-card paths relative
  to the resolved working_directory, and persist terminal cwd snapshots from
  the worktree path.
gui_related: true
gui_classification_reason: Edit and file-card path display is user-visible, and terminal sessions expose cwd behavior.
split_recommended: true
split_recommendation_reason: Source span S0026 mixes backend working-directory resolution with visible path display and terminal session behavior.
depends_on: [CS-018]
unblocks: []
acceptance_criteria:
  - Assistant thread worktrees use .puppet-master/worktrees/thread-{short_id}, where short_id derives from the bound thread_id.
  - If thread-{short_id} already exists, command handling appends a numeric suffix such as thread-{short_id}-2.
  - Existing orchestrator worktrees keep .puppet-master/worktrees/{tier_id} style directory names as compatibility lineage.
  - Worktree-bound edit and file cards display paths relative to the resolved working_directory.
  - File cards open by resolving the displayed relative path under working_directory with no special path rewriting layer.
  - Terminal commands opened from the same thread set terminal cwd to the worktree path and persist cwd_snapshot on terminal_session_record.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_command_drift
reasoning_tier: high
context_scope: command_execution_context
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/WorktreeGitImprovement.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_command_display_cwd
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0026
preserved_exact_tokens:
  - ".puppet-master/worktrees/{tier_id}"
  - ".puppet-master/worktrees/thread-{short_id}"
  - "thread-{short_id}-2"
  - "working_directory"
  - "cwd_snapshot"
  - "terminal_session_record"
negative_constraints:
  - "Worktree-bound file cards must not use a special path rewriting layer."
owner_hints:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
```

### CS-020 - Command Subtask Child-Run Contract

```yaml
plan_unit_id: CS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  When subtask: true is set, command execution launches a canonical child run
  through the shared delegated-run contract with required lineage, storage,
  permission/capability narrowing, requested-vs-effective runtime evidence, and
  no silent fallback for unavailable or incompatible runtime surfaces.
gui_related: false
gui_classification_reason: Command-launched child-run behavior is runtime delegation and storage evidence semantics.
split_recommended: false
depends_on: [CS-007, CS-018]
unblocks: [CS-021, CS-022, CS-023]
acceptance_criteria:
  - subtask: true is not a lighter-weight interpretation of normal prompt submission.
  - subtask: true creates a child-session and /delegation boundary with parent-child lineage, storage, /permission/capability, and runtime evidence.
  - Persona/runtime/model/effort state resolves through the same pipeline as other child runs.
  - Child dependency classification is required by safer default unless the command declares advisory behavior.
  - Child execution inherits and narrows parent permission ceiling and compatible capability universe before dispatch.
  - Parent-child linkage is recorded in canonical event and storage records.
  - The no-silent-fallback rule applies when a command explicitly requests an unavailable or incompatible runtime surface.
  - Requested-vs-effective provider /runtime surface is recorded when policy, availability, compatibility, or account binding changes the launched child.
  - PM canonical child-run identity remains the SSOT even when a provider has no native session tree.
  - Command-launched permission resolution defers lane, package, /package/account-bounded, account-bounded approval scope, and multi-lane orchestrator semantics to Permissions_System.
  - Commands uses projection-freshness and /degraded state rather than trust_tier for stale command projections.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_subtask_delegation_drift
reasoning_tier: high
context_scope: command_child_run_contract
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: command_subtask_child_run_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0027
preserved_exact_tokens:
  - "subtask: true"
  - "child-session"
  - "/delegation"
  - "/permission/capability"
  - "no-silent-fallback"
  - "/effective"
  - "/runtime"
  - "session-tree"
  - "provider-family"
  - "/package/account-bounded"
  - "trust_tier"
  - "/degraded"
negative_constraints:
  - "Command subtasks are not a lighter-weight exception to the canonical child-run contract."
  - "Commands must not synthesize a weaker command-local permission policy."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/Permissions_System.md
```

### CS-021 - Command Persona Resolution

```yaml
plan_unit_id: CS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command subtasks follow the canonical child Persona resolution order: explicit
  command Persona override wins, otherwise task or child type resolves through
  the normal child Persona pipeline, parent Persona is only a weak hint, and
  child Persona does not silently copy the parent Persona.
gui_related: false
gui_classification_reason: Persona selection is runtime child-run resolution semantics.
split_recommended: false
depends_on: [CS-020]
unblocks: [CS-022]
acceptance_criteria:
  - Command subtasks follow canonical child Persona resolution order.
  - Explicit command Persona override wins.
  - Otherwise command-provided task or child type resolves Persona through the normal child Persona pipeline.
  - Parent Persona is at most a weak hint.
  - Child Persona does not silently copy the parent Persona.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_persona_resolution_drift
reasoning_tier: standard
context_scope: command_child_run_contract
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Personas.md
  - Plans/Tools.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: command_persona_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0028
preserved_exact_tokens:
  - "Persona"
  - "parent Persona"
negative_constraints:
  - "Child Persona does not silently copy the parent Persona."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Personas.md
```

### CS-022 - Mode Model Account Requested-Effective Overrides

```yaml
plan_unit_id: CS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command provider, model, account, Persona, worker-policy, mode, and runtime
  surface overrides are explicit child requests capped by parent authority, with
  UI-visible requested/effective fields and policy remap reasons whenever
  compatibility, availability, policy, or account binding changes the launched
  runtime/model/effort result.
gui_related: true
gui_classification_reason: The requested/effective override grammar is explicitly displayed in command UI.
split_recommended: false
depends_on: [CS-020, CS-021]
unblocks: [CS-023]
acceptance_criteria:
  - Command UI shows requested override, effective result, inheritance source, and policy remap reason.
  - Command overrides are explicit child requests, not bypasses around the runtime model.
  - Command mode overrides are capped by parent mode authority.
  - Command model/runtime surface overrides become explicit child requests.
  - Explicit requests do not silently fallback.
  - Requested versus effective runtime/model/effort fields remain visible when remaps occur because of compatibility or policy.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_override_visibility_drift
reasoning_tier: high
context_scope: command_child_run_contract
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Models_System.md
  - Plans/Run_Modes.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: command_requested_effective_overrides
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0029
preserved_exact_tokens:
  - "/model/account/worker-policy"
  - "requested/effective"
  - "runtime/model/effort"
negative_constraints:
  - "Explicit requests do not silently fallback."
owner_hints:
  - Plans/Commands_System.md
```

### CS-023 - Current Working Set Retention

```yaml
plan_unit_id: CS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command cards, command-launched child runs, and command-produced blocks remain
  in the current working-set while they are latest active results, support the
  next intended action, participate in unresolved comparison, approval, question,
  or validation state, or are focused or pinned; they leave when superseded,
  carried forward, or execution moves to another branch.
gui_related: true
gui_classification_reason: Command cards, focus, pinned state, and working-set membership are user-visible interaction and state presentation.
split_recommended: true
split_recommendation_reason: Span map inferred S0030 as non-GUI, but the source text governs visible command cards, focus, /pinned, and working-set behavior.
depends_on: [CS-020, CS-022]
unblocks: []
acceptance_criteria:
  - Command cards remain in the current working-set while they are latest active results in the current branch of work.
  - Command-launched child runs and command-produced blocks remain while they support the next intended action.
  - Items remain while participating in unresolved comparison, /approval/question/validation state.
  - Items remain while explicitly focused or /pinned by the user.
  - Items leave when a newer result supersedes the same purpose, the finding has been carried forward, or execution clearly moves to a different branch of work.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_working_set_drift
reasoning_tier: standard
context_scope: command_working_set
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_current_working_set_retention
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0030
preserved_exact_tokens:
  - "working-set"
  - "/approval/question/validation"
  - "/pinned"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-024 - Template Resolution Order

```yaml
plan_unit_id: CS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Template resolution parses YAML frontmatter, extracts placeholder hints,
  substitutes invocation arguments, resolves permission-checked file includes,
  resolves permission-checked shell injections, and submits the fully resolved
  body to the run in that order.
gui_related: false
gui_classification_reason: Template resolution order is deterministic backend command processing.
split_recommended: false
depends_on: [CS-015, CS-016, CS-017]
unblocks: []
acceptance_criteria:
  - Template resolution first parses YAML frontmatter and extracts field values.
  - Placeholder hints for $ARGUMENTS and positional patterns are extracted before substitution.
  - Invocation arguments substitute placeholders before file includes and shell injections.
  - "@path file includes resolve with permission checks before shell injections."
  - "!`command` shell injections resolve with permission checks after file includes."
  - The fully resolved body is the prompt submitted to the run.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_template_order_drift
reasoning_tier: standard
context_scope: command_template_resolution
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_template_resolution_order
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0031
preserved_exact_tokens:
  - "$ARGUMENTS"
  - "$1"
  - "$2"
  - "@path"
  - "!`command`"
  - "ContractRef: ContractName:Plans/Commands_System.md#EXECUTION"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-025 - Permissions Profile Override Precedence

```yaml
plan_unit_id: CS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  A command permissions_profile_override loads the named permission profile from
  ~/.config/puppet-master/permission-profiles/<profile_id>.toml and applies it
  as an additional precedence layer between Persona overrides and project-level
  rules, effectively replacing the Persona profile for that command run.
gui_related: false
gui_classification_reason: Permissions profile override precedence is policy resolution behavior, not visual presentation.
split_recommended: false
depends_on: [CS-014, CS-020, CS-021]
unblocks: [CS-030, CS-033, CS-045]
acceptance_criteria:
  - permissions_profile_override loads the named profile from ~/.config/puppet-master/permission-profiles/<profile_id>.toml.
  - The profile applies as an additional precedence layer between Persona overrides and project-level rules.
  - For this command run, the override effectively replaces the Persona profile.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_permission_precedence_drift
reasoning_tier: high
context_scope: command_permission_profile_resolution
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: command_permissions_profile_override_precedence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0035
preserved_exact_tokens:
  - "permissions_profile_override"
  - "~/.config/puppet-master/permission-profiles/<profile_id>.toml"
  - "Persona"
  - "project-level rules"
  - "ContractRef: ContractName:Plans/Permissions_System.md#PRECEDENCE-LAYERS"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
```

### CS-026 - Catalog-Installed Command Lifecycle and Override Safety

```yaml
plan_unit_id: CS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Catalog-installed commands remain canonical User Commands after installation:
  installation writes through the same command roots, updates follow manual edit
  validation, removal is blocked or deferred when active references require it,
  and uninstalling a catalog item never silently deletes a user-authored project
  override that intentionally shadows it.
gui_related: false
gui_classification_reason: Catalog installation, update, and deletion safety are lifecycle and storage semantics.
split_recommended: true
split_recommendation_reason: Source span S0037 mixes lifecycle/storage constraints with GUI provenance display and Settings ownership.
depends_on: [CS-012, CS-013, CS-014]
unblocks: [CS-027, CS-032]
acceptance_criteria:
  - Catalog-installed commands are still canonical User Commands after installation.
  - Installation creates or updates a command in the same canonical command roots described in section 2.
  - Updates follow the same validation rules as manual edits.
  - Removal is blocked or deferred when the command is actively referenced by an open edit session or another subsystem requires explicit replacement/confirmation.
  - Uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: catalog_command_lifecycle_drift
reasoning_tier: high
context_scope: command_catalog_lifecycle
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: catalog_installed_command_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0037
preserved_exact_tokens:
  - "Catalog-installed commands"
  - "canonical User Commands"
  - "same canonical command roots"
negative_constraints:
  - "Uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it."
owner_hints:
  - Plans/Commands_System.md
```

### CS-027 - Commands GUI SSOT and Catalog Provenance Display

```yaml
plan_unit_id: CS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Commands settings screen is part of Settings > Rules & Commands, this
  document is the SSOT for Commands GUI behavior, and the GUI shows whether each
  command is local/manual, catalog-installed, or catalog-installed with local
  override.
gui_related: true
gui_classification_reason: This PlanUnit governs the visible Commands settings screen and catalog provenance display.
split_recommended: true
split_recommendation_reason: Source span S0037 mixes visible GUI provenance with lifecycle and storage safety covered by CS-026.
depends_on: [CS-026]
unblocks: [CS-028, CS-029, CS-030, CS-040, CS-046, CS-049]
acceptance_criteria:
  - GUI-COMMANDS remains the anchor for Commands GUI behavior.
  - The Commands settings screen is part of the Rules & Commands tab in the unified Settings page.
  - All GUI surfaces described in Commands_System.md remain normative.
  - FinalGUISpec references this section as the SSOT for Commands GUI behavior.
  - The GUI shows whether a command is local/manual, catalog-installed, or catalog-installed with local override.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_ssot_drift
reasoning_tier: standard
context_scope: commands_gui_settings
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: commands_gui_ssot_catalog_provenance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0036
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0037
preserved_exact_tokens:
  - "GUI-COMMANDS"
  - "Rules & Commands"
  - "local/manual"
  - "catalog-installed"
  - "catalog-installed with local override"
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
```

### CS-028 - Commands Settings Scope Selector

```yaml
plan_unit_id: CS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Settings > Rules & Commands includes a Commands section with a top scope
  selector that manages Global commands from ~/.config/puppet-master/commands/
  and Project commands from <project_root>/.puppet-master/commands/ when a
  project is active.
gui_related: true
gui_classification_reason: Scope selection is a visible control in the Commands settings section.
split_recommended: false
depends_on: [CS-012, CS-027]
unblocks: [CS-029, CS-046]
acceptance_criteria:
  - The Commands section within Settings > Rules & Commands provides a top-level scope selector.
  - Global manages commands in ~/.config/puppet-master/commands/.
  - Project is visible when a project is active and manages commands in <project_root>/.puppet-master/commands/.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_scope_drift
reasoning_tier: standard
context_scope: commands_gui_settings
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_scope_selector
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0039
preserved_exact_tokens:
  - "Settings > Rules & Commands"
  - "Global"
  - "Project"
  - "~/.config/puppet-master/commands/"
  - "<project_root>/.puppet-master/commands/"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-029 - Resolved Command List

```yaml
plan_unit_id: CS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Commands GUI lists resolved project and global commands in a table with
  name, scope, description, Persona, Mode, Model, and Subtask columns, shows
  project-local badges and /x- prefixes, and sorts alphabetically with
  project-local overrides before matching global commands.
gui_related: true
gui_classification_reason: The resolved command list is a visible table in Settings.
split_recommended: false
depends_on: [CS-012, CS-021, CS-022, CS-027, CS-028]
unblocks: [CS-046]
acceptance_criteria:
  - The table lists all resolved project and global commands.
  - Project-local commands are indicated with a badge.
  - Columns include Name, Scope, Description, Persona, Mode, Model, and Subtask.
  - Name is bold with /x- prefix shown.
  - Description is truncated to one line.
  - Persona, Mode, and Model show unset inherited states as specified.
  - Subtask true is indicated with a checkbox icon.
  - The table sorts alphabetically by name with project-local entries before global entries when names match.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_list_drift
reasoning_tier: standard
context_scope: commands_gui_settings
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_resolved_command_list
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0040
preserved_exact_tokens:
  - "/x-"
  - "Scope"
  - "Persona"
  - "Mode"
  - "Model"
  - "Subtask"
  - "inherit"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-030 - Command Create Editor Form

```yaml
plan_unit_id: CS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  New Command opens an editor form for name, description, Persona, mode, model,
  subtask, permissions profile override, override built-in, template body, and
  project-local or global save scope, using canonical validation and syntax
  highlighting for command template patterns.
gui_related: true
gui_classification_reason: The create editor form is a visible command authoring UI.
split_recommended: true
split_recommendation_reason: Source span S0041 mixes editor controls with save-time validation covered by CS-033.
depends_on: [CS-013, CS-014, CS-015, CS-021, CS-022, CS-025, CS-027]
unblocks: [CS-031, CS-033, CS-034, CS-046]
acceptance_criteria:
  - New Command opens an editor form.
  - Name is validated per section 2.5 and collision-checked per section 2.4.
  - Description is required and has max 200 chars.
  - Persona, Mode, Model, Subtask, Permissions profile override, and Override built-in controls are present as specified.
  - Override built-in is visible only in Expert mode.
  - Reserved Assistant Chat slash commands fail validation even if Override built-in is enabled.
  - Template body uses a Markdown editor with syntax highlighting for $ARGUMENTS, $N, @path, and !`cmd` patterns.
  - Scope selector supports project-local or global.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_create_form_drift
reasoning_tier: standard
context_scope: commands_gui_editor
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_create_editor_form
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0041
preserved_exact_tokens:
  - "New Command"
  - "override_builtin"
  - "Expert mode"
  - "$ARGUMENTS"
  - "$N"
  - "@path"
  - "!`cmd`"
negative_constraints:
  - "Reserved Assistant Chat slash commands fail validation even if override_builtin is enabled."
owner_hints:
  - Plans/Commands_System.md
```

### CS-031 - Command Edit Save Targets

```yaml
plan_unit_id: CS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Row click or edit button opens the command editor pre-populated; editing a
  global command while a project is active offers Save as project override or
  Save globally.
gui_related: true
gui_classification_reason: Edit entry points and save-target options are visible editor interactions.
split_recommended: false
depends_on: [CS-012, CS-030]
unblocks: [CS-032]
acceptance_criteria:
  - Row click opens the same editor pre-populated.
  - Edit button opens the same editor pre-populated.
  - Editing a global command while a project is active offers Save as project override.
  - Editing a global command while a project is active offers Save globally.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_edit_target_drift
reasoning_tier: standard
context_scope: commands_gui_editor
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_edit_save_targets
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0042
preserved_exact_tokens:
  - "Save as project override"
  - "Save globally"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-032 - Command Delete and Reveal Behavior

```yaml
plan_unit_id: CS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Delete uses a confirmation modal; deleting a project-local command that
  overrides a global command reveals the global version, while deleting a global
  command with no project override removes it entirely.
gui_related: true
gui_classification_reason: Delete confirmation and reveal behavior are visible settings interactions.
split_recommended: false
depends_on: [CS-012, CS-026, CS-031]
unblocks: []
acceptance_criteria:
  - Delete button uses a confirmation modal.
  - Deleting a project-local command that overrides a global one reveals the global version.
  - Deleting a global command with no project override removes it entirely.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_delete_drift
reasoning_tier: standard
context_scope: commands_gui_editor
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_delete_reveal_behavior
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0043
preserved_exact_tokens:
  - "confirmation modal"
  - "project-local command"
  - "global version"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-033 - Command Save Schema Validation

```yaml
plan_unit_id: CS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Every command save validates the file against the command schema, displays
  inline errors for reserved names, invalid formats, missing description,
  invalid mode, invalid model, and invalid override_builtin use, and blocks save
  until all errors are resolved.
gui_related: true
gui_classification_reason: Inline save validation errors and blocked saves are visible editor behavior.
split_recommended: true
split_recommendation_reason: Span map inferred S0044 as non-GUI, but the source text governs visible inline errors and save blocking.
depends_on: [CS-013, CS-014, CS-025, CS-030]
unblocks: [CS-049]
acceptance_criteria:
  - Every save validates the command file against section 3 schema.
  - Inline errors are displayed for reserved name collision, invalid name format, missing description, invalid mode value, and invalid model format.
  - If override_builtin: true is set while the command name matches a reserved Assistant Chat slash command, inline validation explains that override_builtin does not apply to canonical reserved chat commands.
  - Save is blocked until errors are resolved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_save_validation_drift
reasoning_tier: high
context_scope: commands_gui_editor_validation
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_save_schema_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0041
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0044
preserved_exact_tokens:
  - "override_builtin: true"
  - "reserved name collision"
  - "invalid name format"
  - "missing description"
  - "invalid mode value"
  - "invalid model format"
negative_constraints:
  - "override_builtin does not apply to canonical reserved chat commands."
  - "Block save until errors are resolved."
owner_hints:
  - Plans/Commands_System.md
```

### CS-034 - Dry-Run Preview Rendering

```yaml
plan_unit_id: CS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The command editor Preview resolves a template with sample arguments and
  renders the fully resolved prompt in a read-only Markdown view with
  highlighted placeholder substitutions, file-include results, shell-injection
  results, or permission-blocked placeholders.
gui_related: true
gui_classification_reason: Dry-run preview is a visible editor preview surface.
split_recommended: true
split_recommendation_reason: Source span S0045 mixes preview rendering with execution safety covered by CS-035.
depends_on: [CS-015, CS-016, CS-017, CS-024, CS-030]
unblocks: [CS-035, CS-046, CS-049]
acceptance_criteria:
  - DRY-RUN remains the anchor for dry-run preview behavior.
  - Preview resolves the template with sample arguments.
  - Preview displays the fully rendered prompt without submitting it.
  - Placeholder substitutions are highlighted.
  - File-include and shell-injection results appear, or permission-blocked placeholders appear.
  - Preview uses a read-only rendered Markdown view.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dry_run_preview_rendering_drift
reasoning_tier: standard
context_scope: commands_gui_preview
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: commands_gui_dry_run_preview_rendering
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0045
preserved_exact_tokens:
  - "DRY-RUN"
  - "Preview"
  - "permission-blocked placeholders"
  - "read-only rendered Markdown view"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-035 - Dry-Run Preview Execution Safety

```yaml
plan_unit_id: CS-035
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Dry-run preview does not execute any run; shell injections in preview mode may
  execute the shell command only under bash permission and must not submit the
  result to any agent.
gui_related: false
gui_classification_reason: Preview execution safety is command execution policy, not visual presentation.
split_recommended: true
split_recommendation_reason: Source span S0045 mixes GUI rendering and backend execution-safety requirements.
depends_on: [CS-017, CS-024, CS-034]
unblocks: []
acceptance_criteria:
  - The preview does NOT execute any run.
  - Shell injections in preview mode execute the shell command only subject to bash permission.
  - Preview-mode shell results are not submitted to any agent.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dry_run_preview_execution_drift
reasoning_tier: high
context_scope: commands_gui_preview
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: command_dry_run_preview_execution_safety
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0045
preserved_exact_tokens:
  - "does NOT execute any run"
  - "bash"
  - "do not submit the result to any agent"
negative_constraints:
  - "Dry-run preview must not submit the result to any agent."
owner_hints:
  - Plans/Commands_System.md
```

### CS-036 - Shortcut Binding Section Anchor

```yaml
plan_unit_id: CS-036
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The 6.3 Shortcut binding heading is preserved as source lineage only in this
  window; it does not add behavior beyond invocation-surface shortcut rules
  already covered by earlier PlanUnits and owner docs.
gui_related: false
gui_classification_reason: This is structural lineage for a heading-only span.
split_recommended: false
depends_on: [CS-011, CS-027]
unblocks: []
acceptance_criteria:
  - The 6.3 Shortcut binding heading remains covered by migration artifacts.
  - No new shortcut behavior is inferred from this heading-only span.
  - Shortcut behavior continues to defer to invocation-surface and UI owner contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: shortcut_heading_overinterpretation
reasoning_tier: low
context_scope: commands_gui_settings
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_shortcut_binding_section_anchor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0046
preserved_exact_tokens:
  - "6.3 Shortcut binding"
negative_constraints:
  - "Do not infer new shortcut behavior from the heading-only span."
owner_hints:
  - Plans/Commands_System.md
```

### CS-037 - Reserved Slash-Command Set Lock

```yaml
plan_unit_id: CS-037
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Section 7 is the locked slash-command SSOT for reserved chat slash commands:
  the canonical reserved set remains visible to consumers, /clear is removed,
  /cancel is a deprecated alias to /stop, traceability includes obl-046 and
  obl-047, and repairs replace the reserved section rather than appending
  stale packet residue.
gui_related: false
gui_classification_reason: Reserved command set locking and stale-residue replacement are command registry governance.
split_recommended: true
split_recommendation_reason: Source span S0047 is dense and mixes reserved-set lock, /web parsing, aliases, override policy, and catalog presentation.
depends_on: [CS-002, CS-013]
unblocks: [CS-038, CS-039, CS-040, CS-041, CS-042, CS-045, CS-047]
acceptance_criteria:
  - Section 7 remains the slash-command SSOT for the single canonical set of reserved chat slash commands.
  - Reserved commands include /new, /model, /effort, /mode, /export, /compact, /stop, /resume, /rewind, /revert, /share, /settings, /doctor, /help, /web, /skill, and /cancel.
  - /clear is removed.
  - /cancel remains a deprecated alias to /stop.
  - Traceability for the reserved command family includes obl-046 and obl-047.
  - Packet regeneration treats this owner as a replace_section unit.
  - Repairs replace section 7 rather than appending stale-residue child/parent packet material after section 6.3.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reserved_slash_set_drift
reasoning_tier: high
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: reserved_slash_command_set_lock
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0047
preserved_exact_tokens:
  - "/new"
  - "/model"
  - "/effort"
  - "/mode"
  - "/export"
  - "/compact"
  - "/stop"
  - "/resume"
  - "/rewind"
  - "/revert"
  - "/share"
  - "/settings"
  - "/doctor"
  - "/help"
  - "/web"
  - "/skill"
  - "/cancel"
  - "/clear"
  - "obl-046"
  - "obl-047"
  - "replace_section"
negative_constraints:
  - "/clear stays removed."
  - "Stale-residue child/parent packet material cannot survive beside the canonical /web, /skill, and /cancel rules."
owner_hints:
  - Plans/Commands_System.md
```

### CS-038 - Web Slash Family Parsing and IDs

```yaml
plan_unit_id: CS-038
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The /web family remains one reserved slash-command family with bare /web
  opening help/autocomplete only, execution requiring explicit subcommands, and
  stable cmd.chat.web.* IDs for search, fetch, extract, research, crawl, and map;
  slash, palette, natural-language, autonomous agent, subagent, Goal, PRD, and
  Planning Wizard web/browser intents enter the same WebOperation / BrowserAction
  dispatcher with invocation_source, optional agent_reason, and URL reads
  normalized to webfetch.
gui_related: false
gui_classification_reason: Web slash parsing and command IDs are dispatcher semantics.
split_recommended: true
split_recommendation_reason: Source span S0047 mixes web-family parsing with reserved aliases and visible catalog presentation.
depends_on: [CS-013, CS-037]
unblocks: [CS-039]
acceptance_criteria:
  - /web is one command family and is not flattened into separate top-level families.
  - Bare /web shows help/autocomplete only.
  - Execution requires /web search, /web fetch, /web extract, /web research, /web crawl, or /web map.
  - The stale rule that bare /web with query routes to cmd.web.search by default is retired.
  - cmd.web.search is not the implicit destination for bare /web.
  - Stable command IDs include cmd.chat.web.search, cmd.chat.web.fetch, cmd.chat.web.extract, cmd.chat.web.research, cmd.chat.web.crawl, and cmd.chat.web.map.
  - Slash, palette, natural-language, autonomous agent, subagent, Goal Runtime, PRD Builder, and Planning Wizard entrypoints converge on the same WebOperation / BrowserAction dispatcher.
  - Dispatch records invocation_source, optional agent_reason, and source IDs before tool execution.
  - URL reads normalize to cmd.chat.web.fetch / webfetch rather than websearch.
  - URL normalization applies and parse failure shows usage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_slash_family_drift
reasoning_tier: high
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: web_family_subcommand_required_parsing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0047
preserved_exact_tokens:
  - "/web search <query>"
  - "/web fetch <url>"
  - "/web extract <url>"
  - "/web research <task>"
  - "/web crawl <url>"
  - "/web map <url>"
  - "cmd.chat.web.search"
  - "cmd.chat.web.fetch"
  - "cmd.chat.web.extract"
  - "cmd.chat.web.research"
  - "cmd.chat.web.crawl"
  - "cmd.chat.web.map"
  - "WebOperation / BrowserAction dispatcher"
  - "invocation_source"
  - "agent_reason"
  - "webfetch"
  - "bare /web shows help/autocomplete only"
negative_constraints:
  - "Do not flatten /web into separate slash families."
  - "cmd.web.search is not the implicit destination for bare /web."
owner_hints:
  - Plans/Commands_System.md
```

### CS-039 - Reserved Dispatch Aliases and Override Policy

```yaml
plan_unit_id: CS-039
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  override_builtin is forbidden for every reserved built-in slash command, may
  survive only for non-core command namespaces, and cannot override /web, /skill,
  /cancel, /clear, /stop, or other canonical Assistant Chat built-ins; reserved
  aliases keep /cancel mapped to stop, /rewind conversation-only, /revert file
  restore, and /clear removed rather than thread-clear.
gui_related: false
gui_classification_reason: Override policy and dispatch alias mapping are dispatcher and registry constraints.
split_recommended: true
split_recommendation_reason: Source span S0047 mixes dispatch alias policy with web parsing and catalog presentation.
depends_on: [CS-013, CS-037, CS-038]
unblocks: [CS-040, CS-041, CS-047]
acceptance_criteria:
  - override_builtin is /forbid for every reserved built-in slash command.
  - If override_builtin survives for extension design, it is narrowed to non-core command namespaces only.
  - override_builtin cannot override /web, /skill, /cancel, /clear, /stop, or other canonical Assistant Chat built-ins.
  - /cancel resolves internally to cmd.chat.stop.
  - /rewind dispatches cmd.chat.rewind and remains conversation-only.
  - /revert dispatches cmd.chat.revert and remains file-mutation restore, not conversation rewind.
  - /share, /settings, /doctor, and /help route to their owning surfaces rather than user-defined commands.
  - /clear stays removed and must not return as a thread-clear command.
  - Source cleanup shorthand normalizes to reserved-command alias policy plus ask-gated web permission posture and does not create extra slash commands.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reserved_alias_override_drift
reasoning_tier: high
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: reserved_slash_dispatch_override_policy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0047
preserved_exact_tokens:
  - "override_builtin"
  - "/forbid"
  - "cmd.chat.stop"
  - "cmd.chat.rewind"
  - "cmd.chat.revert"
  - "thread-clear"
  - "/de-duplication"
  - "/research-focused"
  - "/risky"
negative_constraints:
  - "/clear stays removed and must not return as a thread-clear command."
  - "override_builtin cannot override canonical Assistant Chat built-ins."
owner_hints:
  - Plans/Commands_System.md
```

### CS-040 - Reserved Command Catalog Presentation

```yaml
plan_unit_id: CS-040
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Reserved commands remain visible as non-editable catalog entries, /web remains
  discoverable in catalog, and deprecated aliases are shown distinctly from
  active commands.
gui_related: true
gui_classification_reason: Reserved command catalog presentation is visible catalog UI behavior.
split_recommended: true
split_recommendation_reason: Source span S0047 mixes visible catalog presentation with backend reserved-set and alias rules.
depends_on: [CS-027, CS-037, CS-039]
unblocks: []
acceptance_criteria:
  - /web remains discoverable in catalog.
  - Deprecated aliases are shown distinctly from active commands.
  - Reserved commands are shown as non-editable in catalog.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reserved_command_catalog_drift
reasoning_tier: standard
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: reserved_command_catalog_presentation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0047
preserved_exact_tokens:
  - "/web remains discoverable in catalog"
  - "deprecated aliases shown distinctly from active commands"
  - "reserved commands shown as non-editable in catalog"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-041 - User Command UICommand Dispatch Bridge

```yaml
plan_unit_id: CS-041
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.chat.run_user_command is the required UICommand dispatch bridge for User
  Command execution from every invocation surface, with registration owned by
  UI_Command_Catalog and event naming owned by the event owner rather than by
  assertion in this document.
gui_related: false
gui_classification_reason: The dispatch bridge and event ownership are internal command wiring semantics.
split_recommended: false
depends_on: [CS-011, CS-020, CS-039]
unblocks: [CS-042, CS-045, CS-049]
acceptance_criteria:
  - UICOMMAND-ENTRY remains the anchor for the User Command UICommand catalog entry.
  - cmd.chat.run_user_command is the required dispatch bridge for User Command execution from any invocation surface.
  - Args schema preserves command_name and optional arguments.
  - Expected events are tool.invoked when subtask: true, otherwise the canonical chat message event registered by the event owner.
  - chat.message.submitted is not expected unless that event is explicitly registered.
  - This document does not make cmd.chat.run_user_command registered by assertion.
  - Reserved slash-command UICommand IDs remain defined in UI_Command_Catalog section 2.7 and distinct from User Command execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_uicommand_bridge_drift
reasoning_tier: high
context_scope: command_dispatch_bridge
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: run_user_command_uicommand_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0048
preserved_exact_tokens:
  - "UICOMMAND-ENTRY"
  - "cmd.chat.run_user_command"
  - "{ command_name, arguments? }"
  - "tool.invoked"
  - "subtask: true"
  - "chat.message.submitted"
  - "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md#7-uicommand"
negative_constraints:
  - "This document does not make cmd.chat.run_user_command registered by assertion."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

### CS-042 - Debug Mode UICommand Family

```yaml
plan_unit_id: CS-042
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Debug Mode actions use a separate canonical cmd.debug.* UICommand family for
  assistant-thread investigation control, allowing Assistant Chat, editor, and
  debug-adjacent surfaces to invoke investigation lifecycle actions without
  overloading the User Command namespace.
gui_related: true
gui_classification_reason: Debug Mode commands affect visible Assistant Chat, editor, evidence, and investigation surfaces.
split_recommended: false
depends_on: [CS-009, CS-011, CS-037]
unblocks: []
acceptance_criteria:
  - Debug Mode actions use a separate canonical cmd.debug.* UICommand family.
  - The family includes start, stop, pause, resume, add_breakpoint, remove_breakpoint, clear_breakpoints, view_evidence, step, and collect_snapshot commands.
  - Preconditions for each command remain preserved.
  - Debug Mode dispatch IDs are internal wiring identifiers, not User Commands.
  - Debug Mode dispatch IDs complement rather than replace the reserved slash-command surface and broader UI command catalog.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_uicommand_namespace_drift
reasoning_tier: high
context_scope: debug_mode_command_dispatch
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Glossary.md
node_compile_hint:
  mode: debug_mode_uicommand_family
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0049
preserved_exact_tokens:
  - "cmd.debug.*"
  - "cmd.debug.start"
  - "cmd.debug.stop"
  - "cmd.debug.pause"
  - "cmd.debug.resume"
  - "cmd.debug.add_breakpoint"
  - "cmd.debug.remove_breakpoint"
  - "cmd.debug.clear_breakpoints"
  - "cmd.debug.view_evidence"
  - "cmd.debug.step"
  - "cmd.debug.collect_snapshot"
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Glossary.md"
negative_constraints:
  - "Debug Mode dispatch IDs are internal wiring identifiers, not User Commands."
  - "Debug Mode actions must not overload the User Command namespace."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

### CS-043 - OpenCode Reference Boundary

```yaml
plan_unit_id: CS-043
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  OpenCode command material is external reference input used only for
  ALIGNED/RECONCILED/ADOPTED/REFERENCE categorization and does not override
  Puppet Master command names, dispatch rules, storage paths, or reserved
  slash-command policy.
gui_related: false
gui_classification_reason: OpenCode reference boundary is migration/evidence governance.
split_recommended: false
depends_on: [CS-002, CS-003]
unblocks: [CS-044, CS-045]
acceptance_criteria:
  - BASELINE-DELTAS remains the anchor for OpenCode baseline and Puppet Master deltas.
  - OpenCode command material is external reference input.
  - OpenCode material is used for ALIGNED/RECONCILED/ADOPTED/REFERENCE categorization only.
  - OpenCode material does not override Puppet Master command names.
  - OpenCode material does not override Puppet Master dispatch rules, storage paths, or reserved slash-command policy.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: opencode_reference_boundary_drift
reasoning_tier: standard
context_scope: command_external_reference
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: opencode_reference_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0050
preserved_exact_tokens:
  - "BASELINE-DELTAS"
  - "ALIGNED/RECONCILED/ADOPTED/REFERENCE"
  - "OpenCode"
negative_constraints:
  - "OpenCode reference input does not override Puppet Master command names, dispatch rules, storage paths, or reserved slash-command policy."
owner_hints:
  - Plans/Commands_System.md
```

### CS-044 - OpenCode Command Baseline Reference

```yaml
plan_unit_id: CS-044
unit_type: reference
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The OpenCode baseline records external command behavior for comparison,
  including built-ins, config-defined commands, MCP prompt conversion, skill
  registration, .opencode discovery paths, template features, subtask task
  launch, provider_id/model_id model override format, and built-in override
  precedence.
gui_related: false
gui_classification_reason: OpenCode baseline is external reference material, not Puppet Master GUI behavior.
split_recommended: false
depends_on: [CS-043]
unblocks: [CS-045]
acceptance_criteria:
  - OpenCode loads commands from built-in commands, config-defined commands, MCP prompts, and skills when no name collision exists.
  - Discovery paths include .opencode/commands/<name>.md and ~/.config/opencode/commands/<name>.md.
  - Template features include $ARGUMENTS, $1/$2 positional args, !`shell` injection, and @file inclusion.
  - subtask: true runs as a subagent task in the OpenCode baseline.
  - model override uses provider_id/model_id format in the OpenCode baseline.
  - Custom commands can override built-in commands by name in the OpenCode baseline.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: opencode_baseline_misuse
reasoning_tier: standard
context_scope: command_external_reference
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: opencode_command_baseline_reference
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0051
preserved_exact_tokens:
  - ".opencode/commands/<name>.md"
  - "~/.config/opencode/commands/<name>.md"
  - "init"
  - "review"
  - "MCP prompts"
  - "skills"
  - "$ARGUMENTS"
  - "provider_id/model_id"
negative_constraints:
  - "OpenCode baseline behavior remains reference material and does not override Puppet Master command policy."
owner_hints:
  - Plans/Commands_System.md
```

### CS-045 - Puppet Master Command Backend Deltas

```yaml
plan_unit_id: CS-045
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Puppet Master command backend deltas from OpenCode include .puppet-master
  discovery paths, Persona integration, per-command permissions profile override,
  no built-in User Commands, separate MCP prompt handling, non-overridable
  reserved slash commands, and provider/capability identity limits owned by
  provider, media capability, contracts, and event-registration owners.
gui_related: false
gui_classification_reason: Backend deltas cover discovery paths, Persona mapping, permissions, reserved policy, and provider capability ownership.
split_recommended: true
split_recommendation_reason: Source span S0052 mixes backend deltas with GUI management delta covered by CS-046.
depends_on: [CS-012, CS-021, CS-025, CS-037, CS-041, CS-043, CS-044]
unblocks: [CS-046]
acceptance_criteria:
  - Puppet Master uses .puppet-master/commands/<name>.md and ~/.config/puppet-master/commands/<name>.md instead of .opencode paths.
  - Puppet Master commands specify persona per Plans/Personas.md rather than provider-native agent names.
  - Puppet Master adds permissions_profile_override for fine-grained control.
  - Puppet Master does not bundle built-in User Commands.
  - Equivalent functionality is provided through reserved slash commands and Orchestrator actions.
  - Puppet Master treats MCP prompts as a separate mechanism and does not auto-register them as User Commands.
  - override_builtin is reserved for future non-chat extension points and MUST NOT bypass reserved chat-command or reserved git/GitHub prefix rules.
  - OpenCode final-pass evidence remains external reference input for command behavior only.
  - Puppet Master still requires SSE filter discriminator, stable OpenCode session-ID mapping, requested /auth versus /effective account identity parity, and command ID registration before adopting OpenCode-specific behavior.
  - Capability discovery such as capabilities.get is a live provider/runtime contract, not a command-local cache.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_command_delta_drift
reasoning_tier: high
context_scope: command_external_reference
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/OpenCode_Deep_Extraction.md
  - Plans/Personas.md
  - Plans/Provider_OpenCode.md
  - Plans/Contracts_V0.md
  - Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: puppet_master_command_backend_deltas
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0052
preserved_exact_tokens:
  - ".puppet-master/commands/<name>.md"
  - "~/.config/puppet-master/commands/<name>.md"
  - "persona"
  - "permissions_profile_override"
  - "MCP prompts"
  - "override_builtin"
  - "capabilities.get"
  - "requested `/auth` versus `/effective`"
  - "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md"
negative_constraints:
  - "Puppet Master does not allow User Commands to override canonical reserved Assistant Chat slash commands."
  - "override_builtin MUST NOT be used to bypass reserved chat-command or reserved git/GitHub prefix rules."
  - "Capability discovery is a live provider/runtime contract, not a command-local cache."
owner_hints:
  - Plans/Commands_System.md
  - Plans/Provider_OpenCode.md
```

### CS-046 - Puppet Master Commands GUI Delta

```yaml
plan_unit_id: CS-046
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Puppet Master differs from OpenCode by providing a full GUI Commands settings
  screen for command management.
gui_related: true
gui_classification_reason: The delta is explicitly the GUI command management screen.
split_recommended: true
split_recommendation_reason: Source span S0052 mixes GUI management delta with backend OpenCode/Puppet Master deltas.
depends_on: [CS-027, CS-028, CS-029, CS-030, CS-034, CS-045]
unblocks: []
acceptance_criteria:
  - OpenCode has no GUI for command management.
  - Puppet Master provides a full Commands settings screen.
  - The GUI delta routes through section 6 Commands GUI requirements.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commands_gui_delta_drift
reasoning_tier: standard
context_scope: command_external_reference
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: puppet_master_commands_gui_delta
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0052
preserved_exact_tokens:
  - "GUI management"
  - "full Commands settings screen"
negative_constraints: []
owner_hints:
  - Plans/Commands_System.md
```

### CS-047 - Acceptance Storage and Reserved Names

```yaml
plan_unit_id: CS-047
unit_type: acceptance
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command acceptance requires deterministic project-local override resolution,
  runtime rejection of reserved slash-command names, and a ban on reserved
  Assistant Chat slash-command overrides through override_builtin.
gui_related: false
gui_classification_reason: Storage resolution and reserved-name acceptance are runtime validation requirements.
split_recommended: true
split_recommendation_reason: Source span S0053 mixes backend acceptance criteria with GUI acceptance criteria.
depends_on: [CS-012, CS-013, CS-037, CS-039]
unblocks: []
acceptance_criteria:
  - AC-CMD01 remains covered: project-local commands MUST override global commands with the same name and resolution order MUST be deterministic.
  - AC-CMD02 remains covered: User Commands MUST NOT use any reserved slash-command name and runtime MUST reject creation of commands with reserved names.
  - AC-CMD10 remains covered: User Commands MUST NOT override reserved Assistant Chat slash commands.
  - override_builtin MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_acceptance_reserved_name_drift
reasoning_tier: standard
context_scope: command_acceptance
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_acceptance_storage_reserved_names
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0053
preserved_exact_tokens:
  - "ACCEPTANCE"
  - "AC-CMD01"
  - "AC-CMD02"
  - "AC-CMD10"
  - "ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/Progression_Gates.md"
  - "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Commands_System.md#COMMAND-SCHEMA"
negative_constraints:
  - "User Commands MUST NOT use any reserved slash-command name."
  - "User Commands MUST NOT override reserved Assistant Chat slash commands."
  - "override_builtin MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes."
owner_hints:
  - Plans/Commands_System.md
```

### CS-048 - Acceptance Template Permissions and Subtasks

```yaml
plan_unit_id: CS-048
unit_type: acceptance
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command acceptance requires template resolution order, bash permission checks
  for shell injection, read permission checks for file inclusion, and canonical
  child-run execution with parent event-ledger linkage when subtask: true.
gui_related: false
gui_classification_reason: Template, permission, and child-run acceptance criteria are runtime behavior.
split_recommended: true
split_recommendation_reason: Source span S0053 mixes runtime acceptance with GUI acceptance.
depends_on: [CS-016, CS-017, CS-020, CS-024]
unblocks: []
acceptance_criteria:
  - AC-CMD03 remains covered: template resolution MUST follow frontmatter parse, placeholder extraction, placeholder substitution, file includes, then shell injection.
  - AC-CMD04 remains covered: shell injection MUST be permission-checked against bash before execution.
  - If shell injection is denied, it MUST be blocked and an error substituted.
  - AC-CMD05 remains covered: file inclusion MUST be permission-checked against read.
  - If file inclusion is denied, it MUST be blocked and an error substituted.
  - "AC-CMD06 remains covered: when subtask: true, the command MUST execute as a child run via the task tool and parent MUST record linkage in the event ledger."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_acceptance_runtime_drift
reasoning_tier: standard
context_scope: command_acceptance
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/Permissions_System.md
  - Plans/Tools.md
node_compile_hint:
  mode: command_acceptance_template_permission_subtask
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0053
preserved_exact_tokens:
  - "AC-CMD03"
  - "AC-CMD04"
  - "AC-CMD05"
  - "AC-CMD06"
  - "bash"
  - "read"
  - "subtask: true"
  - "task"
  - "event ledger"
negative_constraints:
  - "Denied shell injection or file inclusion must be blocked and substituted with an error."
owner_hints:
  - Plans/Commands_System.md
```

### CS-049 - Acceptance GUI Validation Preview Invocation

```yaml
plan_unit_id: CS-049
unit_type: acceptance
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command GUI acceptance requires save-time name validation with blocked saves,
  dry-run rendering of the fully resolved template without submitting to an
  agent run, and User Command exposure in command palette and chat slash
  autocomplete unless unresolved.
gui_related: true
gui_classification_reason: These acceptance criteria govern visible validation, preview, palette, and autocomplete behavior.
split_recommended: true
split_recommendation_reason: Source span S0053 mixes GUI acceptance with backend acceptance criteria.
depends_on: [CS-011, CS-027, CS-033, CS-034, CS-041]
unblocks: []
acceptance_criteria:
  - AC-CMD07 remains covered: the GUI Commands management section MUST validate command names on save.
  - AC-CMD07 blocks saves with validation errors for reserved names, invalid format, and missing description.
  - AC-CMD08 remains covered: dry-run preview MUST render the fully resolved template without submitting it to any agent run.
  - AC-CMD09 remains covered: every User Command MUST appear in command palette and chat slash-command autocomplete unless unresolved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_acceptance_gui_drift
reasoning_tier: standard
context_scope: command_acceptance
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: command_acceptance_gui_preview_invocation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0053
preserved_exact_tokens:
  - "AC-CMD07"
  - "AC-CMD08"
  - "AC-CMD09"
  - "command palette"
  - "chat slash-command autocomplete"
negative_constraints:
  - "Dry-run preview must render without submitting it to any agent run."
owner_hints:
  - Plans/Commands_System.md
```

### CS-001 - Commands System Source-Preserving Bridge Retired

```yaml
plan_unit_id: CS-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after Phase
  2B atomized Commands_System-S0001 through Commands_System-S0053 into CS-002
  through CS-049. CS-001 remains only as migration lineage for the retired bridge
  span and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- CS-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by CS-002 through CS-049.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 027 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Commands_System.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Commands_System-S0056
preserved_exact_tokens:
- Commands System (Canonical SSOT)
- 0. Scope and SSOT status
- 0.1 Command scope and legacy retirements
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- 0.2 Cross-owner consumer boundaries
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md'
- Debug and launcher command boundary
- 1. Definitions
- 1.1 User Command (preset)
- 1.2 UICommand (internal dispatch) — distinction
- 'ContractRef: ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md'
- 1.3 Invocation surfaces
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#5, ContractName:Plans/FinalGUISpec.md'
- 2. Storage and discovery
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
- 2.1 Project-local
- 2.2 Global
- 2.3 Resolution order
- 2.4 Name collision rules
- 2.4.1 Reserved namespace retirements
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md'
- 2.5 Name validation
- 3. Command schema
negative_constraints:
- User Commands may surface `/resume` only by reference to the Assistant Chat and storage SSOTs; they MUST NOT define a separate restore/resume storage schema.
- Legacy `phase_subagents` and provider-native `command-name` assumptions are `/replace`-only migration labels. They MUST NOT remain active beside the Persona-stage command contract.
- 'For Assistant Chat message actions, Commands consume the owner-defined `Resend` semantics from `Plans/assistant-chat-design.md` and `Plans/UI_Command_Catalog.md`: `Resend` replays the latest user-authored message and discards later generated history/work, while command presets must not redefine it a'
- For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock direc
- Command-visible provider context is a projection of provider owners. For bridged providers, `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`) owns the versioned correlation `/context` block and account-health semantics; Commands may surface those values when a command launches or resume
- Route-like UICommands may be surfaced beside User Commands, but Commands does not let feature-local labels become private target models. In `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`), `/UI` rows that still expose graph HITL `request_id` or `hitl_request_id` commands are a same-file con
- Command-facing runtime identity is only a consumer of the owner split. `Plans/Prompt_Pipeline.md` defines requested/effective field meaning, `/runtime`, and dispatch presence; `Plans/storage-plan.md` defines persistence and `/projection`; executor docs define required dispatch/runtime boundaries; `M
- '`persona_override_owner_id` and requested account context are owner-projected runtime identity, not command-local state: shared runtime docs must not let `persona_override_owner_id` preserve `tier_id`-style ownership while wizard/interview flows move to non-tier execution semantics, and command cons'
- orchestration-core reconciliation is execution-core owner work, not command-surface cleanup. `Executor_Protocol.md` and `orchestrator-subagent-integration.md` are the execution-core outliers when they retain tier-era, tier-shaped `TierContext`, or `tier_runtime_record` canon; Commands treats graph/p
- Widget and native-surface state remains owner-routed when Commands exposes a command or checklist entry. `Plans/Widget_System.md` (`/Widget_System.md`) and `Widget_System` own chrome slots for `/trust-state`, projection-trust semantics, hostability, and tab-boundary direction. They also own the acce
- Runtime artifact panels are also owner-routed when Commands exposes an artifact action. `Runtime_Artifacts_Panel.md` and `Runtime_Artifacts_Panel` own artifact-type semantics, panel behavior, schema family references, and the artifact evidence/provenance model; Commands may open or invoke the panel,
- 'Command availability and summary vocabulary are consumer constraints, not local decorations. Command definitions and UICommands must declare whether each action is `live-run only`, `historical-safe`, or `record-only/export-only` / `/export-only` before palette, shortcut, or route dispatch; Commands '
- '| `name` | Required | `string` | Invocation name. Must pass validation and MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes. |'
- '| `override_builtin` | Optional | `boolean` | Reserved for future non-chat extension points. It MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes. |'
- '- permission resolution for command-launched child work defers to `Plans/Permissions_System.md` (`/Permissions_System.md`) for lane, package, `/package/account-bounded`, account-bounded approval scope, and multi-lane orchestrator runs; Commands may request or display the selected approval scope, but'
- '- uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it'
- '- /clear stays removed and must not return as a `thread-clear` command'
- 7. **Built-in command override policy:** OpenCode allows custom commands to freely override built-in commands by name. Puppet Master does not allow User Commands to override canonical reserved Assistant Chat slash commands. The `override_builtin` field is reserved for future non-chat extension point
- '**AC-CMD02:** User Commands MUST NOT use any reserved slash-command name (§2.4). The runtime MUST reject creation of commands with reserved names.'
- '**AC-CMD10:** User Commands MUST NOT override reserved Assistant Chat slash commands. `override_builtin` MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes.'
compatibility_only_notes:
- '### 0.1 Command scope and legacy retirements'
- Legacy `phase_subagents` and provider-native `command-name` assumptions are `/replace`-only migration labels. They MUST NOT remain active beside the Persona-stage command contract.
- Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording,
- Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native executio
- '- record the requested-vs-effective (`/effective`) provider `/runtime` surface when policy, availability, compatibility, or account binding changes the launched child.'
- '- requested versus effective runtime/model/effort fields remain visible when remaps occur because of compatibility or policy.'
- Command permission prompts inherit parallel actor scoping. HITL/tool and `/tool` approval semantics normalize onto one blocked-episode model with explicit scope keying, field-family cleanup, and durable provenance. When resolving command-launched work, template file inclusion, or shell injection, th
stale_retired_dispositions:
- 'For context behavior, Commands defer to `Plans/Run_Modes.md` `## 0. Scope and SSOT status`, `### SSOT references (DRY)`, and `## 7. Mode effects on context management`: `LF-006` and `LF-007` are treated as stale-residue / wrong-owner-routing failures whenever command prose sends detailed context-com'
- For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock direc
- Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording,
- Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native executio
- Checklist references remain freshness-checked consumers. `Plans/Section15_MVP_Promoted_Features_Spec.md` (`/Section15_MVP_Promoted_Features_Spec.md`) is verification-only unless upstream reconciliation reveals direct stale references that require edits; it is not the storage, command, permission, or
- 'Mutation and deprecation gates are first-class command constraints. `GATE-010` must evaluate subject-open commands, wrapper commands over canonical navigation, route-payload completeness, alias `/deprecation`, blocked-action admissibility against `allowed_action_ids` and `allowed_action_ids[]`, and '
- Assistant worktree commands share the orchestrator worktree directory family but use thread-derived names. Existing orchestrator worktrees keep `.puppet-master/worktrees/{tier_id}` style directory names; Assistant thread worktrees use `.puppet-master/worktrees/thread-{short_id}`, where `short_id` is
- '- generalized projection freshness uses storage and owner vocabulary: `storage-plan.md` and `storage-plan` reserve `trust_tier` for Preview and `/browser` semantics, so Commands uses projection-freshness and `/degraded` state for stale command projections rather than reusing `trust_tier` as a generi'
- 'This section owns `## 7. Reserved built-in slash commands` as the locked reserved-set contract. The same built-in slash-command family must stay visible here and in consumers: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`'
- 'Packet regeneration treats this owner as a `replace_section` unit: repairs for the reserved-set contract replace `## 7. Reserved built-in slash commands` itself rather than appending raw material after `### 6.3 Shortcut binding`, so stale-residue child/parent packet material cannot survive beside th'
- 'The `/web` family is reserved as one command family, not flattened into independent top-level commands. Bare `/web` has no-default execution behavior: it opens help/autocomplete only, and execution requires a subcommand such as `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web craw'
- 'Exact reserved-command behavior: bare /web has no default action, bare /skill is discovery or invocation only, /rewind dispatches conversation-only rewind, /revert dispatches file-mutation restore, /share/settings/doctor/help route to their owning surfaces, /cancel remains a deprecated alias to /sto'
- '- The reserved built-in slash-command set is locked and non-overridable; bare /web has no default action, bare /skill is discovery or invocation only, /cancel remains a deprecated alias to /stop, and /clear stays removed.'
- '- deprecated aliases shown distinctly from active commands'
owner_boundary_notes:
- '# Commands System (Canonical SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for the Puppet Master User Commands system — user-authored command presets that inject templated prompts into a run. All other plan documents MUST reference this document by anchor (e.g., `Plans/Commands_System.md#COMMAND-SCHEMA`) rather than
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '### 0.2 Cross-owner consumer boundaries'
- User Commands consume, but do not re-own, several adjacent runtime and provider contracts. For MCP prompt or tool OAuth flows, command loading and invocation defer to `Plans/Tools.md` `### Schema isolation and OAuth state`; Commands may surface the selected provider/scope and stable `client-id`, but
- 'For context behavior, Commands defer to `Plans/Run_Modes.md` `## 0. Scope and SSOT status`, `### SSOT references (DRY)`, and `## 7. Mode effects on context management`: `LF-006` and `LF-007` are treated as stale-residue / wrong-owner-routing failures whenever command prose sends detailed context-com'
- For storage and migration paths, command execution uses the storage owner detection order `config > $PUPPET_MASTER_DATA_DIR > project dir > global dir`; Commands may display the resolved storage-root or pass it through execution context, but migration, persistence, and path-resolution semantics stay
- 'For Assistant Chat message actions, Commands consume the owner-defined `Resend` semantics from `Plans/assistant-chat-design.md` and `Plans/UI_Command_Catalog.md`: `Resend` replays the latest user-authored message and discards later generated history/work, while command presets must not redefine it a'
- For clarification-request and `question-flow` behavior, command presets and wizard entry points defer to the shared question system in `Plans/assistant-chat-design.md` and the planning flow consumer rules in `Plans/chain-wizard-flexibility.md`; Commands may launch or reference those flows but do not
- For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock direc
- Command-visible provider context is a projection of provider owners. For bridged providers, `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`) owns the versioned correlation `/context` block and account-health semantics; Commands may surface those values when a command launches or resume
- Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording,
- 'Command-contract reconciliation is registry-facing, not prose-only. `Commands_System.md`, `Wiring_Matrix.md`, and `UI_Wiring_Rules.md` must keep command-contract `IDs` and validation hooks aligned: `/compact` stays reserved when `cmd.chat.compact_context` exists, `cmd.chat.run_user_command` cannot c'
- Route-like UICommands may be surfaced beside User Commands, but Commands does not let feature-local labels become private target models. In `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`), `/UI` rows that still expose graph HITL `request_id` or `hitl_request_id` commands are a same-file con
- 'Command taxonomy is a three-way split, not a binary split: pure shell/view-state commands, route-consuming navigation commands, and domain mutation/runtime commands. Pure shell/view-state commands stay local and lightweight: they change what panel/subview/layout is visible, but they do not own canon'
- Command palette object results follow the same route model. Because `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`) already defines the global command palette, Commands treats palette exposure as a consumer boundary. The command palette may expose Orchestrator object results, not just commands/pages or
- '`UI_Wiring_Rules.md` remains the wiring owner for reusable navigation commands and subject-open commands; Commands treats those as first-class wiring shapes with schema-level route-payload and `argument-contract` obligations, not as generic `args` smuggling.'
- Command-facing runtime identity is only a consumer of the owner split. `Plans/Prompt_Pipeline.md` defines requested/effective field meaning, `/runtime`, and dispatch presence; `Plans/storage-plan.md` defines persistence and `/projection`; executor docs define required dispatch/runtime boundaries; `M
- '`persona_override_owner_id` and requested account context are owner-projected runtime identity, not command-local state: shared runtime docs must not let `persona_override_owner_id` preserve `tier_id`-style ownership while wizard/interview flows move to non-tier execution semantics, and command cons'
- Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native executio
owner_hints:
- Plans/Commands_System.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `25a6e3b81358a85e8b09ffd86c6d84019ac390ad9efa76b67f48deae697dd1a3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B atomized `Commands_System-S0001` through `Commands_System-S0053` into fine-grained PlanUnits `CS-002` through `CS-049`. `CS-001` is retained only as a retired migration-lineage bridge and must not re-own atomized source coverage. This phase did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### CS-050 - Duplicate Section Seven Recovery Compile Addendum

```yaml
plan_unit_id: CS-050
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Commands_System duplicate Section 7 headings are structural anchor defects. Recovery should preserve command semantics and existing command
  PlanUnits while assigning one canonical Section 7 anchor and demoting duplicate heading text to compatibility/source-lineage where needed.
gui_related: false
gui_classification_reason: Command document section numbering is structural documentation cleanup, not GUI presentation.
depends_on: [CS-001]
unblocks: []
acceptance_criteria:
  - There is one canonical Section 7 command-system anchor after cleanup.
  - Existing command identifiers and command-owner refs are not renamed by heading repair.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual heading/anchor review
risk_class: command_anchor_ambiguity
reasoning_tier: low
context_scope: commands_doc_structure
implementation_surfaces: [Plans/Commands_System.md]
node_compile_hint: {mode: structural_heading_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0035
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0036
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0039
preserved_exact_tokens: ["Commands_System has two \"## 7\" sections", "command-owner"]
negative_constraints:
  - Do not change command semantics during heading repair.
owner_hints: [Plans/Commands_System.md]
```

### CS-051 - Goal Slash Reservation And Override Boundary

```yaml
plan_unit_id: CS-051
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Commands_System reserves `/goal` and `/goal again` as Assistant Chat built-in slash commands. `/goal` resolves to `cmd.chat.goal.start`; `/goal again` resolves to `cmd.chat.goal.update`. User Commands and `override_builtin` cannot override these Goal Mode slash commands.
gui_related: false
gui_classification_reason: Slash-command reservation and override policy are command registry behavior, not visual presentation.
depends_on:
  - CS-037
  - CS-039
  - UCC-096
unblocks: []
acceptance_criteria:
  - "`/goal` and `/goal again` are present in the reserved Assistant Chat slash-command set."
  - "`/goal` maps to `cmd.chat.goal.start`."
  - "`/goal again` maps to `cmd.chat.goal.update`."
  - User Commands cannot override these reserved Goal Mode slash commands.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future command registry validation
risk_class: goal_slash_override_drift
reasoning_tier: standard
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: goal_slash_reservation
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0017
  - pldg-20260616-001-goal-runtime-system:atom-0024
  - pldg-20260616-001-goal-runtime-system:atom-0025
  - pldg-20260616-001-goal-runtime-system:atom-0030
  - pldg-20260616-001-goal-runtime-system:dec-0008
  - source_ref:audit-20260616-006-goal-runtime-system:SR-018
preserved_exact_tokens:
  - "/goal"
  - "/goal again"
  - "cmd.chat.goal.start"
  - "cmd.chat.goal.update"
  - "override_builtin"
negative_constraints:
  - Do not allow User Commands to override `/goal` or `/goal again`.
  - Do not make Commands_System the semantic owner for Goal Runtime lifecycle behavior.
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### CS-052 - Planning Command State And Recovery Semantics

```yaml
plan_unit_id: CS-052
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: 'Commands_System may expose user-authored command presets, slash-command shortcuts, or palette entries that invoke Planning Wizard and Plan Compile UICommands, but UI_Command_Catalog owns the typed command payloads, results, permission and enablement guards, disabled reason codes, receipt effects, idempotency, stale-projection behavior, and recovery routes. For topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting build, Commands_System records only invocation/display boundaries and must reference the UI command contract rather than restating or weakening it.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves the command invocation/display surface without treating Commands_System as the UICommand semantic owner.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Planning_Wizard.md
- Plans/Orchestrator_Page.md
- Plans/prd_planning_runtime_contracts.json
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0154
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0154
decision_refs: []
correction_refs: []
preserved_exact_tokens:
- Approve And Build
- pause
- cancel
- resume
- inspect evidence
negative_constraints:
- Do not define UICommand payload/result schemas in Commands_System.
- Do not allow user-authored command presets to bypass UI_Command_Catalog enablement or stale-projection guards.
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Planning_Wizard.md
- Plans/Orchestrator_Page.md
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### CS-053 - Teach Invocation Command Routes

```yaml
plan_unit_id: CS-053
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: Teach/Teacher can be summoned through /teach, help icon launches, and varied natural-language phrases
  such as asking PM to teach, explain, show how, walk me through, or help me do something. Summon phrase resolution
  disambiguates Teach guidance from implementation/build requests, carries current-surface context into a new or
  selected Teacher thread, and exposes Help icon/summon phrase guidance in Help/Glossary entries.
gui_related: true
gui_classification_reason: Defines user-facing /teach and natural-language invocation routes into Assistant Chat.
depends_on:
- UCC-102
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_invocation_gap
reasoning_tier: standard
context_scope: teach_invocation_commands
implementation_surfaces:
- Plans/Commands_System.md
- future command parser
- future command palette
node_compile_hint:
  mode: teach_invocation_commands
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0096
- pldg-20260626-001-feature-name:atom-0129
- pldg-20260626-001-feature-name:atom-0140
- chat:teacher-feature-initial-framing
- chat:teach-teacher-correction
- Plans/assistant-chat-design.md#6-Teach
- Plans/Commands_System.md#7-Reserved-built-in-slash-commands
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/assistant-chat-design.md#6-teach
- Plans/FinalGUISpec.md#19.6-natural-language-invocation-feedback
source_atom_ids:
- atom-0096
- atom-0129
- atom-0140
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0024
correction_refs:
- corr-0003
preserved_exact_tokens:
- summoned by the user in assistant chat with a variety of phrases
- /teach
- teach me
- show me how
- walk me through
- explain this
- how do I
- what does this mean
- help me understand this
- help icon
- new Assistant Chat thread
- Teacher mode
- current surface/control context
- Teacher badge
- context chip
- model chip
- continue with Teacher
- explain this screen
- remember that
- for this repo always
- compact disambiguation
negative_constraints:
- Do not route every `/teach` or teaching-like phrase to durable memory persistence without classifying intent and
  asking for confirmation when persistence is involved.
- Do not leave Teach invocation as a single slash command with no natural-language path.
- Do not allow user-defined commands to override reserved Teach/Assistant Chat command behavior if promoted into
  the reserved set.
- Do not silently switch an existing assistant conversation into Teacher mode.
- Do not launch Teacher without preserving current surface/control context when available.
- Do not require users to know slash commands before discovering Teach.
- Do not turn every help request into durable memory capture.
- Do not persist natural-language instructions without explicit confirmation.
- Do not guess between one-off teaching and Teach capture when the user intent is ambiguous.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Personas.md
- Plans/FinalGUISpec.md
```

## Case L Command Consumer Propagation Addendum - 2026-07-17

This addendum propagates approved Case L owner contracts into Commands-owned dispatch admission and owner routing. It does not register UI commands, edit the Command Catalog or wiring, create runtime implementation, run durability/restore fixtures, generate governance artifacts, or certify finding/repository completeness.

### CS-054 - Storage Access And Viewer Command Gate

```yaml
plan_unit_id: CS-054
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Every User Command, UICommand wrapper, and direct handler consumes the storage-owned
  writer/viewer/blocked access result before side-effect admission. Viewer permits only
  frozen-snapshot read, inspect, search, copy, redacted diagnostic, explicitly permitted
  export/navigation, and ephemeral view-local actions; durable, runtime, filesystem/SCM,
  provider/tool, receipt-producing, and external mutation remains discoverable but disabled
  with storage_read_only. Retry storage and Try write mode are owner actions that require
  full revalidation and never auto-replay blocked work.
gui_related: true
gui_classification_reason: Viewer mode changes visible command availability, disabled reasons, refresh, recovery, and ephemeral-state disclosure.
split_recommended: false
depends_on: [CS-004, CS-007, CS-011, SP-238, SP-239]
unblocks: []
acceptance_criteria:
  - Every command and direct handler is classified against writer, viewer, and blocked access before a side effect can start.
  - Viewer inventory proves zero durable, runtime, filesystem/SCM, provider/tool, receipt-producing, or external mutation, including direct-dispatch bypass attempts.
  - User Command preview remains available only when expansion performs no shell injection, provider/tool call, child launch, persistence, or external mutation.
  - storage_read_only is preserved as the shared disabled result; unknown/missing access state fails closed without a second vocabulary.
  - Retry storage and Try write mode rerun owner gates and do not automatically resume or replay a blocked command.
validation_surfaces:
  - future Case L viewer command-inventory and direct-handler fixtures
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_viewer_command_gate_bypass
reasoning_tier: high
context_scope: case_l_storage_access_command_admission
implementation_surfaces: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
node_compile_hint:
  mode: case_l_storage_viewer_command_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-012
  - Case-L:L-014
  - Case-L:L012-C1..L012-C4
  - Case-L:L014-C1..L014-C4
preserved_exact_tokens:
  - storage_access_mode
  - storage_mode_reason
  - storage_io_class
  - storage_read_only
  - Retry storage
  - Try write mode
negative_constraints:
  - Do not use PID, mtime, heartbeat, visible control state, or lock-file existence as writer authority.
  - Do not invent a cmd.storage command ID in Commands_System.
  - Do not auto-resume blocked work when storage returns to writer mode.
owner_hints: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md]
```

### CS-055 - Root Continuity Fallback And Value-Navigation Consumer

```yaml
plan_unit_id: CS-055
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Storage precedence selects only a logical-root candidate; Commands consumes bootstrap-binding,
  storage_instance_id, root-generation, active-root, and fallback-base continuity before dispatch.
  Storage-value viewers and root-opening actions use stable owner identity plus route_target/OpenSubject,
  while raw paths remain display-local and cannot select authority. Root mismatch, relocation, and
  fallback divergence uses exactly three registered visible disposition commands with no
  command-frontmatter acceptance, initialization, merge, overwrite, or silent empty-root fallback.
gui_related: true
gui_classification_reason: Root and value navigation, mismatch actions, retained recovery copies, and fallback dispositions are user-visible command surfaces.
split_recommended: false
depends_on: [CS-004, CS-006, CS-012, SP-240]
unblocks: []
acceptance_criteria:
  - config, PUPPET_MASTER_DATA_DIR, project-dir, and global-dir precedence never bypasses continuity proof or silently initializes a known-prior empty candidate.
  - Root/value open actions carry stable root/store/family/value identity and shared route targets; raw paths do not become authority.
  - Use previous location, Choose location, Copy and switch to selected location, and Start a new storage instance cannot be invoked from User Command frontmatter.
  - fallback_diverged never dispatches automatic merge/overwrite and preserves both stores through keep_logical_root, fork_new_instance, or export_both until separate cleanup.
  - The three divergence commands require exact component CAS, lowercase 64-hex hashes, independent permission/confirmation, one storage handler each, idempotent owner receipts, and production-wiring reverse coverage.
  - Fork returns a candidate binding without changing active bootstrap selection; export is encrypted exact-byte custody with explicit destination, non-secret manifest, and key refs.
validation_surfaces:
  - future Case L storage-root continuity, relocation, fallback-divergence, and root-navigation fixtures
  - python3 scripts/pm-plan-index.py validate
risk_class: root_continuity_command_authority_drift
reasoning_tier: high
context_scope: case_l_root_and_value_navigation
implementation_surfaces: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/Contracts_V0.md, Plans/UI_Command_Catalog.md]
node_compile_hint:
  mode: case_l_root_continuity_command_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-011
  - Case-L:L-018
  - Case-L:L011-C1..L011-C3
  - Case-L:L018-C1..L018-C3
preserved_exact_tokens:
  - logical_root
  - active_root
  - storage_instance_id
  - root_generation
  - fallback_branch_id
  - fallback_base
  - fallback_diverged
  - cmd.storage.fallback.keep_logical_root
  - cmd.storage.fallback.fork_new_instance
  - cmd.storage.fallback.export_both
  - route_target
  - OpenSubject
negative_constraints:
  - Root precedence cannot replace continuity proof.
  - A root-opening/navigation command cannot select writer authority or clear a recovery hold.
  - Fallback never automatically merges, overwrites, or claims cross-host writer exclusion.
owner_hints: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md]
```

### CS-056 - Exact Restore Retry Revert And SCM Command Admission

```yaml
plan_unit_id: CS-056
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Runtime restore/retry and Chat revert commands consume exact blocked, safe-point, repo,
  worktree, baseline, equality, and receipt identity. restore_safe_point_then_retry accepts
  only the named safe_point when restore is required; historical_commit creates a separate
  clean worktree at a full immutable OID; worktree_head performs no mutation and binds only
  to the exact OID/state digest; and cmd.chat.revert exact-replaces one complete immutable
  whole-turn mutation manifest through FileSafe without conversation rewind or partial success.
gui_related: true
gui_classification_reason: Recovery and revert commands expose visible preconditions, confirmation, disabled reasons, outcomes, and worktree navigation consequences.
split_recommended: false
depends_on: [CS-005, CS-018, CS-039, F2-200, F2-201, F2-202, F2-203, F2-204, EP-072]
unblocks: []
acceptance_criteria:
  - requires_safe_point_restore admits only cmd.runtime.restore_safe_point_then_retry with baseline_target safe_point and exact safe-point/repo/worktree/blocked identity.
  - safe_point, historical_commit, and worktree_head enforce their target-specific fields and postconditions without focus/ref/worktree substitution.
  - Safe-point and restore command admission stays unavailable until the required machine registry families and exact value schemas are materialized; compatibility aliases never trigger lazy ordinary-command rewrite.
  - A successor attempt is impossible before a proved target and durable owner receipt; refused, failed, recovery-required, unavailable, or unknown results mint none.
  - cmd.chat.revert uses the recorded whole-turn scope and canonical identities, never current working_directory, merge, partial per-file success, or conversation rewind.
  - Recovery-required and recovery-unavailable retain mutation fence, blocked episode, holds, local work, and worktree ownership.
validation_surfaces:
  - RSP-ATOMIC-001
  - RSP-ATOMIC-002
  - RSP-ATOMIC-003
  - RSP-BASELINE-001
  - RSP-BASELINE-002
  - RSP-BASELINE-003
  - RSP-BASELINE-004
  - RSP-CHAT-001
risk_class: command_restore_or_baseline_substitution
reasoning_tier: high
context_scope: case_l_restore_retry_revert_commands
implementation_surfaces: [Plans/Commands_System.md, Plans/FileSafe.md, Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md, Plans/UI_Command_Catalog.md]
node_compile_hint:
  mode: case_l_restore_retry_command_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-010
  - Case-L:L-020
  - Case-L:L-024
  - Case-L:PD-RSP-01..PD-RSP-07
  - Case-L:PD-RSP-09
preserved_exact_tokens:
  - cmd.runtime.restore_safe_point_then_retry
  - cmd.runtime.retry_now
  - cmd.runtime.start_fresh_attempt
  - cmd.chat.revert
  - safe_point
  - historical_commit
  - worktree_head
  - restore_refused
  - restore_failed
  - restore_recovery_required
negative_constraints:
  - Do not emit restored_with_conflicts from safe-point restore or Chat revert.
  - Do not treat cmd.git.worktree.open navigation as baseline preparation or runnable proof.
  - Do not release a recovery hold or clean preserved work because restore material is missing or corrupt.
owner_hints: [Plans/Commands_System.md, Plans/FileSafe.md, Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md]
```

### CS-057 - Conversation Restore-Point Registered Command Boundary

```yaml
plan_unit_id: CS-057
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Conversation restore-point commands create_restore_point, branch_from_restore, and
  delete_restore_point have canonical UI Command Catalog rows and one-handler production-wiring
  reverse coverage. Branch application creates new thread and conversation-branch identity only
  for branched, emits exactly one restore_point.applied, returns the same result and target IDs on
  replay without a duplicate event, and leaves source conversation/worktree/SCM/runtime state unchanged.
gui_related: true
gui_classification_reason: Restore-point create, branch, delete, disclosure, unavailable states, and resulting thread/branch are visible command behavior.
split_recommended: false
depends_on: [CS-005, CS-006, CS-041, CV-320, SP-242]
unblocks: []
acceptance_criteria:
  - cmd.chat.create_restore_point, cmd.chat.branch_from_restore, and cmd.chat.delete_restore_point each have one catalog row, conditional args, and one-handler production-wiring reverse coverage.
  - Catalog registration cannot enable restore-point actions until the restore_point_record family and exact value schema are materialized in the machine storage registry.
  - Registered branch consumes exact project/restore-point/source-thread/expected-hash identity and discloses source boundary plus new target before creation.
  - Only branched creates new thread/conversation-branch identity and exactly one restore_point.applied; refused/failed/expired/deleted/corrupt/stale/permission/storage/hold states return no target IDs and emit no event.
  - Replay returns the recorded result and same target IDs without a duplicate restore_point.applied.
  - Source thread, source conversation branch, source worktree, files, Git/index, queue, and runtime safe points remain unchanged on first execution and replay; successful application does not consume the restore point, and optional safe_point_id is lineage only.
validation_surfaces:
  - RSP-RP-001
  - RSP-RP-002
  - RSP-RP-003
  - RSP-RP-004
  - RSP-CMD-001
risk_class: restore_point_ghost_or_composite_command
reasoning_tier: high
context_scope: case_l_restore_point_command_registration
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/assistant-chat-design.md]
node_compile_hint:
  mode: case_l_restore_point_registration_dependency
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-022
  - Case-L:PD-RSP-08
preserved_exact_tokens:
  - cmd.chat.create_restore_point
  - cmd.chat.branch_from_restore
  - cmd.chat.delete_restore_point
  - available
  - expired
  - deleted
  - corrupt
  - branched
  - refused
  - failed
negative_constraints:
  - Do not replace live-derived fail-closed catalog/wiring validation with a stale hand-maintained ghost-command list.
  - Do not combine conversation branching with FileSafe/workspace restore.
  - Do not let Commands_System own command registration or the conversation lifecycle.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/assistant-chat-design.md]
```

## Shared Runtime Command Reconciliation Addendum - 2026-08-13

This addendum adjudicates the corrected remaining-runtime packet's 34 candidate UICommand IDs against the live catalog. It owns family semantics only; row-level catalog metadata remains in `Plans/UI_Command_Catalog.md`. It does not mint an EventRecord family, imply Event Authority denominator closure, or authorize a handler to emit an unregistered event.

### Candidate census and alias dispositions

| Candidate token | Disposition | Canonical command |
|---|---|---|
| `cmd.lsp.server.restart` | compatibility spelling, not registered | `cmd.lsp.restart_server` |
| `cmd.lsp.server.diagnose` | compatibility intent, not registered | `cmd.lsp.open_problems`; existing diagnostics/status projections supply the detail without a second diagnose command |
| `cmd.debug.session.start` | compatibility spelling, not registered | `cmd.run_debug.start` |
| `cmd.debug.session.stop` | compatibility spelling, not registered | `cmd.run_debug.stop` |
| `cmd.debug.session.action` | rejected generic dispatcher | the exact concrete `cmd.run_debug.*` verb |
| `cmd.worktree.provision` | compatibility spelling, not registered | `cmd.git.worktree.create` |
| `cmd.worktree.release` | compatibility spelling, not registered | `cmd.git.worktree.release` |
| `cmd.context.receipt.open` | compatibility intent, not registered | `cmd.nav.open_subject` for a document/artifact subject, or `cmd.nav.open_usage_subject` only for event-backed Usage/Ledger identity carrying stable `usage_event_ref`; current PMConcept7 aggregate provider/account/panel cards stay local |
| `cmd.remote.reconnect` | retained existing remote-surface wrapper | normalizes to `cmd.environment.reconnect` only after resolving an exact `ExecutionEnvironmentId`; it is not the generalized command |

The remaining 26 IDs below are the only new canonical IDs from the 34-row candidate register. Chat, Settings, Onboarding, Doctor, provider, and panel surfaces reuse these IDs rather than minting local peers.

The retained `cmd.remote.reconnect` wrapper accepts `RemoteReconnectWrapperRequest{project_id, remote_id, execution_environment_id, expected_remote_revision, expected_connection_epoch, idempotency_key}` and returns the underlying `EnvironmentConnectionCommandResult`. Its state selector is the remote row's resolved `online|degraded|offline|auth_blocked` environment projection; disabled reasons are `target_missing`, `stale_projection`, `topology_unavailable`, `auth_state_mismatch`, `breaker_open`, `permission_required`, and `policy_denied`. `handlers::remote::reconnect` performs resolution only and then calls the sole `handlers::environment::reconnect` domain handler. It does not maintain a second connection lifecycle, and its recovery, accessibility, tests, receipts, and no-unregistered-event rule are identical to the generalized command.

### Shared envelope, response, and fail-closed effect

Every new request type below includes `command_instance_id`, `idempotency_key`, `expected_revision_or_epoch`, `project_id`, `project_home_server_id`, `execution_host_id`, `execution_environment_id`, nullable `source_location_id`, `topology_generation`, `actor_ref`, `permission_snapshot_ref`, optional `goal_id`, `plan_id`, `run_id`, `thread_id`, `agent_id`, `crew_id`, `deadline_utc`, and `recovery_of_operation_id`. A command whose subject does not use one optional lineage field carries it as absent; it never substitutes a path or display label for exact topology identity.

Every result type includes `operation_id`, `command_instance_id`, `outcome` (`accepted`, `no_change`, `blocked`, `cancelled`, `failed`, or `recovery_required`), `observable_work_id?`, `current_revision_or_epoch`, `projection_ref`, `receipt_refs[]`, `artifact_refs[]`, `disabled_reason?`, `recovery_actions[]`, and `replayed`. `accepted` means admitted or durably queued, not domain success. Terminal success requires the typed owner result/receipt and owner verification. Replay returns the original result identity without a second side effect.

Until Event Authority individually admits a producer family, these commands have `event_effect = none_pending_event_authority`; they update only owner-authorized redb state and return the typed result/receipt/projection references below. A missing event registration is an explicit blocked integration edge, never permission to invent an EventRecord name.

### Canonical 26-row shared-runtime command family

| Command ID | Typed payload -> result | State selector and disabled reasons | Sole handler | Receipt/projection effect |
|---|---|---|---|---|
| `cmd.environment.connect` | `EnvironmentConnectionCommandRequest{action=connect, environment_id, expected_supervisor_generation, expected_connection_epoch}` -> `EnvironmentConnectionCommandResult` | `offline`, `closed`; `stale_projection`, `already_in_state`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::environment::connect` | `EnvironmentConnectionState`, `ObservableWork`; no EventRecord pending authority |
| `cmd.environment.reconnect` | `EnvironmentConnectionCommandRequest{action=reconnect, environment_id, expected_supervisor_generation, expected_connection_epoch, reason}` -> `EnvironmentConnectionCommandResult` | `online`, `degraded`, `offline`, `auth_blocked`; same as connect plus `auth_state_mismatch`, `breaker_open` | `handlers::environment::reconnect` | replacement epoch plus `EnvironmentConnectionState`; no EventRecord pending authority |
| `cmd.environment.disconnect` | `EnvironmentConnectionCommandRequest{action=disconnect, environment_id, expected_supervisor_generation, expected_connection_epoch, drain_policy}` -> `EnvironmentConnectionCommandResult` | not `closed`; `stale_projection`, `already_in_state`, `operation_in_progress`, `permission_required` | `handlers::environment::disconnect` | closing/closed projection and work result; no EventRecord pending authority |
| `cmd.thread.outbox.retry` | `ThreadOutboxRetryRequest{outbox_entry_id, thread_id, expected_outbox_revision, expected_target_generation}` -> `ThreadOutboxCommandResult` | retryable unacknowledged entry; `outbox_state_mismatch`, `stale_projection`, `deadline_expired`, `topology_unavailable`, `permission_required` | `handlers::thread_outbox::retry` | same logical command/idempotency identity, new bounded attempt; no EventRecord pending authority |
| `cmd.thread.outbox.cancel` | `ThreadOutboxCancelRequest{outbox_entry_id, thread_id, expected_outbox_revision, cancellation_reason}` -> `ThreadOutboxCommandResult` | cancellable uncommitted entry; `outbox_state_mismatch`, `stale_projection`, `already_in_state`, `permission_required` | `handlers::thread_outbox::cancel` | durable cancellation intent/result; no EventRecord pending authority |
| `cmd.thread.request` | `ThreadRequestCommandRequest{request_id, parent_thread_id?, requested_thread_kind, bounded_request_ref, target_generation}` -> `ThreadRequestCommandResult` | target current and request admissible; `stale_projection`, `topology_unavailable`, `policy_denied`, `resource_blocked`, `permission_required` | `handlers::thread::request` | durable outbox entry and stable request/thread reconciliation refs; no EventRecord pending authority |
| `cmd.thread.spawn` | `ThreadSpawnCommandRequest{spawn_request_id, parent_thread_id, requested_role, bounded_context_ref, target_generation}` -> `ThreadSpawnCommandResult` | parent current and spawn allowed; `stale_projection`, `policy_denied`, `resource_blocked`, `lease_conflict`, `permission_required` | `handlers::thread::spawn` | stable spawn request and resulting child ref when committed; no EventRecord pending authority |
| `cmd.thread.await` | `ThreadAwaitCommandRequest{await_request_id, thread_id, condition_ref, timeout_utc, target_generation}` -> `ThreadAwaitCommandResult` | current nonterminal target; `stale_projection`, `already_in_state`, `deadline_expired`, `target_missing`, `policy_denied` | `handlers::thread::await_condition` | asynchronous wait as `ObservableWork`, never a blocked UI thread; no EventRecord pending authority |
| `cmd.capability.ensure` | `CapabilityEnsureRequest{capability_id, provisioning_mode=Off,Auto,On, requirement_ref, origin_operation_id}` -> `CapabilityEnsureResult` | exact target and current policy; `capability_unavailable`, `setup_required`, `approval_required`, `policy_denied`, `resource_blocked`, `permission_required` | `handlers::capability::ensure` | `CapabilityProvisioningOperation`/readiness projection; provider first acquisition still requires explicit setup |
| `cmd.tool.discover` | `ToolDiscoverRequest{capability_query_ref, stage_limit, expected_registry_generation}` -> `ToolDiscoverResult` | registry query allowed; `stale_projection`, `topology_unavailable`, `policy_denied`, `resource_blocked` | `handlers::tool::discover` | bounded progressive capability-stage projection and artifact refs; no EventRecord pending authority |
| `cmd.tool.select` | `ToolSelectRequest{selection_id, tool_refs[], expected_registry_generation, policy_snapshot_ref}` -> `ToolSelectResult` | all selected refs current/admissible; `stale_projection`, `capability_unavailable`, `policy_denied`, `permission_required` | `handlers::tool::select` | stable ordered selection projection; does not invoke a tool or widen policy |
| `cmd.installation.install` | `InstallationLifecycleCommandRequest{action=install, subject_kind, subject_id, provider_cli, acquisition_basis, official_source_ref, provenance_ref}` -> `InstallationLifecycleCommandResult` | no ready installation and explicit acquisition allowed; `already_in_state`, `operation_in_progress`, `setup_required`, `approval_required`, `official_source_unverified`, `host_environment_mismatch`, `permission_required`, `policy_denied` | `handlers::installation::install` | `InstallationLifecycleRecord`, proof and `ObservableWork` refs; no EventRecord pending authority |
| `cmd.installation.update` | `InstallationLifecycleCommandRequest{action=update, installation_id, target_release_ref, provenance_ref}` -> `InstallationLifecycleCommandResult` | verified consented installation; install reasons plus `target_missing`, `resource_blocked` | `handlers::installation::update` | retains last verified activation until replacement commit; no EventRecord pending authority |
| `cmd.installation.repair` | `InstallationLifecycleCommandRequest{action=repair, installation_id, repair_plan_ref, provenance_ref}` -> `InstallationLifecycleCommandResult` | known installation with repair evidence; update reasons | `handlers::installation::repair` | bounded repair attempt and verification refs; no EventRecord pending authority |
| `cmd.installation.rollback` | `InstallationLifecycleCommandRequest{action=rollback, installation_id, rollback_target_ref, provenance_ref}` -> `InstallationLifecycleCommandResult` | verified rollback target; `target_missing`, `official_source_unverified`, `host_environment_mismatch`, `operation_in_progress`, `permission_required`, `policy_denied` | `handlers::installation::rollback` | rollback/verification receipt refs and lifecycle projection; no EventRecord pending authority |
| `cmd.installation.verify` | `InstallationLifecycleCommandRequest{action=verify, installation_id, verification_policy_ref}` -> `InstallationLifecycleCommandResult` | installation resolvable; `target_missing`, `host_environment_mismatch`, `operation_in_progress`, `policy_denied` | `handlers::installation::verify` | proof-based readiness evidence; exit zero or PATH discovery alone is not success |
| `cmd.authentication.start` | `AuthenticationCommandRequest{action=start, provider_id, route_id, profile_ref?, account_id?, connection_id?, auth_surface, credential_ref?}` -> `AuthenticationCommandResult` | installation separately verified and auth path supported; `setup_required`, `auth_state_mismatch`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::authentication::start` | non-secret auth operation/proof refs; install, auth, entitlement, and readiness remain separate |
| `cmd.authentication.cancel` | `AuthenticationCommandRequest{action=cancel, authentication_operation_id, expected_auth_revision}` -> `AuthenticationCommandResult` | current cancellable auth operation; `auth_state_mismatch`, `already_in_state`, `stale_projection`, `permission_required` | `handlers::authentication::cancel` | cancellation receipt/projection; never deletes provider-owned credentials without a separate owner action |
| `cmd.authentication.resume` | `AuthenticationCommandRequest{action=resume, authentication_operation_id, expected_auth_revision, continuation_ref}` -> `AuthenticationCommandResult` | same nonterminal operation and authority binding; `auth_state_mismatch`, `stale_projection`, `deadline_expired`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::authentication::resume` | resumes the same auth operation; never rotates account/route/host silently |
| `cmd.eval.session.start` | `EvalSessionCommandRequest{action=start, eval_session_id, language, sandbox_policy_ref, limits_ref, variable_scope_ref}` -> `EvalSessionCommandResult` | supported exact-target adapter and no conflicting lease; `unsupported`, `capability_unavailable`, `resource_blocked`, `lease_conflict`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::eval_session::start` | `EvalSessionRecord`, lease, `ObservableWork`, artifact refs; no hidden global kernel |
| `cmd.eval.session.execute` | `EvalSessionCommandRequest{action=execute, eval_session_id, execution_id, expected_session_generation, code_artifact_ref, selected_tool_refs[]}` -> `EvalSessionCommandResult` | live current session; `session_state_mismatch`, `stale_projection`, `deadline_expired`, `resource_blocked`, `permission_required`, `policy_denied` | `handlers::eval_session::execute` | bounded output plus redacted spill artifact; nested calls keep independent policy/admission |
| `cmd.eval.session.stop` | `EvalSessionCommandRequest{action=stop, eval_session_id, expected_session_generation, variable_disposition, cleanup_policy_ref}` -> `EvalSessionCommandResult` | live/recoverable session; `session_state_mismatch`, `stale_projection`, `operation_in_progress`, `permission_required` | `handlers::eval_session::stop` | explicit cleanup and variable/artifact disposition; no EventRecord pending authority |
| `cmd.mcp.server.connect` | `McpServerLifecycleCommandRequest{action=connect, server_id, expected_config_epoch, expected_runtime_generation}` -> `McpServerLifecycleCommandResult` | enabled valid server; `stale_projection`, `already_in_state`, `operation_in_progress`, `capability_unavailable`, `resource_blocked`, `permission_required`, `policy_denied` | `handlers::mcp::connect_server` | component-state projection, lease and work refs; no EventRecord pending authority |
| `cmd.mcp.server.reconnect` | `McpServerLifecycleCommandRequest{action=reconnect, server_id, expected_config_epoch, expected_runtime_generation, reason}` -> `McpServerLifecycleCommandResult` | configured server and breaker admits/join; connect reasons plus `breaker_open`, `auth_state_mismatch` | `handlers::mcp::reconnect_server` | joins the one generation-scoped reconnect; does not erase failure history or add invoke retries |
| `cmd.resource.inspect` | `RuntimeResourceInspectRequest{resource_scope_ref, host_id, environment_id, expected_policy_generation}` -> `RuntimeResourceInspectResult` | readable exact host/environment; `stale_projection`, `topology_unavailable`, `target_missing`, `permission_required` | `handlers::runtime_resource::inspect` | read-only governor/admission/lease/awareness refs; never changes admission |
| `cmd.bsd.set` | `BackSeatDriverModeSetRequest{scope_kind, scope_id, requested_mode=Off,Auto,On, expected_policy_revision}` -> `BackSeatDriverModeSetResult` | scope writable and projection current; `stale_projection`, `already_in_state`, `policy_denied`, `permission_required` | `handlers::back_seat_driver::set_mode` | durable effective-mode projection/receipt; default and recommended value are `Auto`, mode never grants tools or authority |

### Recovery, accessibility, and regression contract

Handlers perform CAS and idempotency checks before mutation, join the existing logical operation when safe, and otherwise return a typed disabled/recovery result. Cancellation is request/acknowledgement based; a button press or accepted command is not cleanup. Restart recovery uses the same `operation_id`, topology generation, owner record, lease and receipt evidence. Missing or conflicting evidence returns `recovery_required` or a disabled reason, never success.

Every visible command exposes its runtime label, current state, disabled reason, busy/wait phase, and terminal outcome to assistive technology. Keyboard and pointer activation dispatch the same ID and payload. Focus remains on the invoking control while accepted work is pending; completion announcements identify the subject and outcome without reading secret or raw output content. Destructive or authority-sensitive setup remains on the shared confirmation/permission surface.

Regression fixtures must cover payload/result schema validation, exact handler uniqueness, alias normalization, keyboard/pointer parity, stale epoch/CAS refusal, idempotent replay, restart reconciliation, cancel-vs-complete races, permission and topology denial, receipt/projection presence, and the absence of unregistered EventRecord effects. Domain-specific suites additionally cover outbox ordering, explicit provider-CLI acquisition, rollback preservation, auth/readiness separation, Eval isolation/output bounds, MCP breaker joining, resource read-only behavior, and BSD `Off|Auto|On` with effective default `Auto`.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

### CS-066 - Shared Runtime Command Census And Typed Family

```yaml
plan_unit_id: CS-066
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The corrected packet's 34 candidate command IDs resolve to 26 new generalized
  shared-runtime commands, seven compatibility intents over existing canonical
  commands, and one rejected generic debug dispatcher; cmd.remote.reconnect
  remains an existing remote wrapper over the newly canonical generalized
  cmd.environment.reconnect after exact environment resolution.
gui_related: true
gui_classification_reason: The commands define visible actions, enabled and disabled state, progress, recovery, and assistive-technology behavior across runtime surfaces.
split_recommended: false
depends_on: [SIR-003, SIR-004, SIR-005, SIR-006, SIR-008, SIR-010, CS-063]
unblocks: [UCC-145]
acceptance_criteria:
  - Exactly 26 new command IDs appear in the canonical family table and no candidate-local Chat, Settings, Onboarding, Doctor, provider, or panel clone is minted.
  - The seven candidate compatibility intents resolve to existing canonical commands and cmd.debug.session.action is rejected in favor of an exact cmd.run_debug.* verb.
  - Every new row has a typed payload/result, state selector, closed disabled reasons, sole handler, receipt/projection effect, recovery rule, accessibility rule, and regression expectations.
  - No row emits or names a new EventRecord family while Event Authority remains UNKNOWN_OPEN.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - command census and exact-handler uniqueness fixture
  - typed command replay, restart, race, accessibility, and no-unregistered-event fixtures
risk_class: command_alias_or_authority_drift
reasoning_tier: high
context_scope: shared_runtime_commands
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: shared_runtime_command_family, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/CANDIDATE_COMMAND_ID_REGISTER.json
  - Plans/Shared_Integration_Runtime.md#15.1
preserved_exact_tokens: [cmd.environment.reconnect, cmd.remote.reconnect, cmd.lsp.restart_server, cmd.run_debug.*, cmd.git.worktree.create, cmd.nav.open_subject, none_pending_event_authority]
negative_constraints:
  - Do not mint an EventRecord family, a generic debug action dispatcher, or surface-local command clones.
  - Do not treat command acceptance, dispatch, or a UI acknowledgement as domain success.
  - Do not let cmd.remote.reconnect replace the generalized environment command or bypass exact ExecutionEnvironmentId resolution.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Shared_Integration_Runtime.md]
```

### CS-058 - EventRecord V2 Command Evidence Consumer

```yaml
plan_unit_id: CS-058
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command-originated persisted domain evidence consumes EventRecord 2.0 scope, global
  event identity, exact scope-partitioned index identity, scoped lifetime idempotency,
  dedupe catch-up, complete-reader admission, no-secret custody, and synced-receipt truth.
  Project restore, worktree, attempt, receipt, and restore-point events require project
  scope; app-root storage diagnostics use application scope without a fake project;
  StorageCompatibilityStatus is not appended into an incompatible target; and normal
  command dispatch can neither request projector_replay_only nor fabricate local events.
gui_related: false
gui_classification_reason: Defines backend event identity, dedupe, durability, and scope constraints for command handlers.
split_recommended: false
depends_on: [CS-006, CS-007, CV-317, CV-318, CV-320, CV-321, SP-241]
unblocks: []
acceptance_criteria:
  - Every command-originated persisted event uses schema_version 2.0.0, exact scope_kind/project_id pairing, and a registered payload/event owner.
  - EventRecord 2.0 root inspection refuses open unless the reader validates 2.0.0; partial or best-effort projection is impossible.
  - Event index access uses exact app/project scope_partition encoding, zero-padded sequence_id_20, and the canonical event_record_index.v2 key; key/value scope mismatch is corruption.
  - A replayed command identity returns the original only for the same semantic digest; conflict or dedupe_unavailable appends nothing.
  - No command success that requires durability is authorized by persisted_at_utc without the matching synced AppendReceipt or owner receipt.
  - Normal dispatch cannot construct projector_replay_only, and compatibility replay produces zero command/tool/provider/network/notification/usage/safe-point/external side effects.
  - Unsupported/newer-store compatibility status remains diagnostic-only; secrets and local root/worktree/credential paths remain absent or local/redacted.
validation_surfaces:
  - future Case L EventRecord scope, dedupe, replay-only, and command-receipt fixtures
  - python3 -m json.tool Plans/event_record.schema.json
  - python3 scripts/pm-plan-index.py validate
risk_class: command_event_identity_or_durability_drift
reasoning_tier: high
context_scope: case_l_command_eventrecord_v2
implementation_surfaces: [Plans/Commands_System.md, Plans/Contracts_V0.md, Plans/event_record.schema.json, Plans/storage-plan.md]
node_compile_hint:
  mode: case_l_command_eventrecord_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-007
  - Case-L:L-008
  - Case-L:L-009
  - Case-L:L-023
  - Case-L:EVT-01..EVT-07
preserved_exact_tokens:
  - EventRecord
  - 2.0.0
  - scope_kind
  - scope_partition
  - application
  - project
  - "event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}"
  - sequence_id_20
  - projector_replay_only
  - replay_only_not_appendable
  - dedupe_unavailable
  - AppendReceipt
  - synced
negative_constraints:
  - Do not fabricate a project for application scope or emit into an incompatible store.
  - Do not let command handlers create a peer event envelope, dedupe rule, or durability meaning.
  - Do not infer successful persistence from timestamps or projection/UI state.
  - Do not open an EventRecord 2.0 root with a reader that cannot validate 2.0.0 or persist raw secret/credential material in command evidence.
owner_hints: [Plans/Commands_System.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```

### CS-059 - Storage Compatibility Maintenance Retention And Availability Gate

```yaml
plan_unit_id: CS-059
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Storage-facing commands consume owner compatibility, migration, maintenance, retention,
  and registry-materialization gates without creating a live unsupported-store viewer,
  generic repair/salvage/Doctor mutation, force-cancel/try-anyway path, retention inference,
  hold/maintenance bypass, or lazy alias rewrite. Retry actions revalidate rather than repair;
  protected hold and manual-compaction requests stay owner-routed; and affected actions remain
  unavailable until their exact machine storage families and value schemas are materialized.
gui_related: true
gui_classification_reason: Compatibility blocks, migration interruption, retention settings, legal holds, compaction, diagnostics, and unavailable actions are visible command states.
split_recommended: false
depends_on: [CS-054, CS-056, CS-057, SP-235, SP-237, SP-243]
unblocks: []
acceptance_criteria:
  - Unsupported/newer-store command inventory exposes only check_for_update, choose_compatible_backup, open_diagnostics, and quit; no live viewer, try_anyway, force-open, downgrade-in-place, or mutation is reachable.
  - Migration cancellation is admitted only in preflight; later phases preserve recovery-on-next-launch disclosure and expose no force-cancel, skip-step, rollback-now, or invented ETA.
  - Retry storage and retry-recovery actions rerun owner admission/verification and never claim byte repair, live salvage, or automatic blocked-work replay.
  - Commands expose no generic verify/repair/salvage, Doctor mutation, in-place editor, or bypass token; backup restore and internal maintenance stay coordinator-owned and offline where required.
  - Unknown retention policy remains indefinite/no-count-eviction and materially_incomplete; no command infers destructive eligibility from prefix, key, path, filename, mtime, ordering, or focus.
  - storage.legal_hold.manage and manual compaction preserve owner permission, actor/reason/receipt, holds/anchors/refs, maintenance lease, and storage access gates.
  - Missing, deferred, ambiguous, or unsupported machine registry family/value schema keeps the affected safe-point, restore-point, migration, retention, quarantine, or deletion action unavailable.
validation_surfaces:
  - future Case L startup command inventory, migration interruption, retention/hold/compaction, and registry-availability fixtures
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_command_maintenance_or_retention_bypass
reasoning_tier: high
context_scope: case_l_storage_compatibility_maintenance_retention_commands
implementation_surfaces: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/UI_Command_Catalog.md]
node_compile_hint:
  mode: case_l_storage_compatibility_retention_command_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-005
  - Case-L:L-017
  - Case-L:L-031
  - Case-L:L-032
  - Case-L:PD-L005-01..PD-L005-07
preserved_exact_tokens:
  - blocked_newer_store
  - check_for_update
  - choose_compatible_backup
  - open_diagnostics
  - storage.legal_hold.manage
  - retention_policy_ref
  - materially_incomplete
negative_constraints:
  - Do not turn metadata diagnostics into live unsupported-store inspection or mutation.
  - Do not mint a generic repair/salvage/Doctor mutation command from storage recovery wording.
  - Do not treat command registration, plan validation, or registry-row presence as runtime durability, migration, compaction, or restore proof.
owner_hints: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md]
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime command-system rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f5d64ed00d4c22eab6a72e2e`: `arguments[]` entries have fields `name`, `type`, `required`, `default?`, `enum_values[]?`, `description`, and `ui_editor`. `type` values are `string`, `number`, `boolean`, `path`, `enum`, `object`, and `array`.
- Repairs `sfk-9e43a6ff3203f5ce66e0126d`: Section 6 numbering is structurally superseded by named headings. Missing `6.4` and `6.5` are retired aliases; new citations must use heading names, not bare section numbers.
- Repairs `sfk-03404db2c315565320a4b3e9`: reserved command prefixes are `cmd.git.`, `cmd.github.`, `cmd.source_control.`, `cmd.file.`, `cmd.permissions.`, `cmd.runtime.`, `cmd.testing.`, `cmd.browser.`, and `cmd.persona.`. Non-owner docs may consume but not mint commands under those prefixes.

## Known-37 recovery-unavailable command registration - 2026-07-18

Commands registers exactly two stable domain commands and no wrappers, aliases, generic repair route, or second handler:

| `allowed_action_id` | Command | Sole handler | Typed request | Typed result | Label |
|---|---|---|---|---|---|
| `locate_and_verify_recovery` | `cmd.runtime.locate_and_verify_recovery` | `handlers::runtime::locate_and_verify_recovery` | `LocateAndVerifyRecoveryRequest` | `LocateAndVerifyRecoveryResult` | Locate and verify recovery |
| `abandon_recovery` | `cmd.runtime.abandon_recovery` | `handlers::runtime::abandon_recovery` | `AbandonRecoveryRequest` | `AbandonRecoveryResult` | Abandon recovery |

Both commands are admitted only from the current ordered `safe_point.recovery_unavailable.allowed_action_ids[]`, exact blocked episode and recovery anchor, exact five-value owner reason, exact non-empty snapshot set, preserved local work, current storage/permission state, operation exclusivity, and a fresh or exactly replayable idempotency key. Pre-attempt dispatch omits `attempt_id`; post-attempt dispatch requires the exact event/anchor/prior-attempt identity. A stale projection, reordered action list, caller-selected branch, raw path, moving ref, inferred reason, or mismatched snapshot set refuses before mutation.

`LocateAndVerifyRecoveryRequest` is closed at `1.0.0` and requires `schema_version`, const command ID, `project_id`, `run_id`, `node_id`, `blocked_sequence`, `safe_point_id`, `anchor_ref`, `expected_snapshot_refs`, `expected_recovery_unavailable_reason_code`, `recovery_source_ref`, `actor_ref`, and `idempotency_key`, plus the conditional attempt field. Optional `expected_manifest_sha256` and `permission_snapshot_id` are evidence only. FileSafe must place the source under owner custody and verify safe-point/run/node/attempt/worktree identity, scope, manifest, and content before Storage commits the result.

`AbandonRecoveryRequest` is closed at `1.0.0` and requires the common exact episode fields plus `actor_ref`, `confirmation = abandon_recovery_and_preserve_local_work`, durable `confirmation_ref`, `preserved_local_work_acknowledged = true`, and `idempotency_key`, plus the conditional attempt field. Run exit, archive, timeout, policy, dialog-local state, or cancellation is not explicit abandonment authority.

Both typed results use `outcome = applied | replayed | refused | failed_recoverable`, `receipt_state = committed | not_committed`, required command/idempotency/episode/anchor identity, conditional attempt identity, and `cleanup_performed = false`. Locate success requires owner verification evidence and releases only as `resolved`; abandonment success releases only as `abandoned_by_user`. A release requires a committed `recovery_unavailable_resolution_receipt`; UI acknowledgement does not suffice. Nonsuccess and receipt failure retain `recovery_unavailable`, every hold/ref and local work. Replay returns the original result/receipt with no second release. Commands emits no new EventRecord family for either action.

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum propagates the ratified Cozy Shelves panel-review decisions (user decision 2026-07-27) into Commands-owned prefix reservation, panel-switch destination consumption, and availability/confirmation class consumption. Source lineage is the winning left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, source-lineage-only: no concept HTML/CSS/class names are copied into spec). Command registration rows remain owned by `Plans/UI_Command_Catalog.md`; this addendum mirrors that catalog addendum without minting rows here. It does not edit existing PlanUnits, retired bridges, `preserved_exact_tokens`, or canonical_text, and it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

Renumber note (CS-050 structural repair): the duplicate second `## 7` heading (`UICommand catalog entry`) is retitled `## 8. UICommand catalog entry`, and the follow-on headings are renumbered in cascade: `## 9. OpenCode baseline and Puppet Master deltas` (subsections `### 9.1 Baseline`, `### 9.2 Puppet Master deltas`) and `## 10. Acceptance criteria`. Heading text is otherwise preserved verbatim; no command identifiers, command-owner refs, or acceptance IDs are renamed. `## 7. Reserved built-in slash commands` is now the single canonical Section 7 anchor, satisfying CS-050 acceptance. Per the FABLE 2026-07-08 addendum rule, citations must use heading names, not bare section numbers; a repo-wide check found no cross-doc bare-number citations of the renumbered sections.

### CS-060 - Panel Domain Reserved Prefix Registry Extension

```yaml
plan_unit_id: CS-060
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The reserved command-prefix registry extends to cmd.docker., cmd.search., cmd.artifacts.,
  cmd.agents., cmd.editor., cmd.panel., and cmd.terminal., joining the existing reserved
  families cmd.git., cmd.github., cmd.source_control., cmd.file., cmd.permissions.,
  cmd.runtime., cmd.testing., cmd.browser., and cmd.persona. Minting authority for every
  reserved prefix is Plans/UI_Command_Catalog.md; non-owner docs and User Commands may
  consume but not mint commands under them. cmd.actions. is explicitly NOT reserved and has
  no minting authority: GitHub Actions commands live under cmd.github., and the concept-only
  ID cmd.actions.rerun must reconcile to cmd.github.actions.rerun before any catalog row or
  wiring coverage can treat it as real.
gui_related: false
gui_classification_reason: Prefix reservation is command-registry governance, not a visible GUI surface.
split_recommended: false
depends_on: [CS-013, CS-039, CS-050]
unblocks: []
acceptance_criteria:
  - The reserved-prefix registry enumerates all sixteen reserved families with Plans/UI_Command_Catalog.md as the sole minting authority.
  - User Command creation whose name collides into any reserved prefix is rejected, consistent with the AC-CMD02/AC-CMD10 reserved-name boundaries.
  - cmd.actions. is absent from the reserved registry; no cmd.actions.* command can be minted, and GitHub Actions IDs reconcile under cmd.github.
  - No prototype command ID under a newly reserved prefix is treated as real until it has a UI_Command_Catalog row plus Wiring_Matrix reverse coverage, with fail-closed dispatch on mismatch.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future catalog/wiring reverse-coverage checks for cmd.* references
risk_class: command_prefix_minting_ambiguity
reasoning_tier: medium
context_scope: cozy_shelves_panel_command_prefix_reservation
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
node_compile_hint:
  mode: reserved_prefix_registry_extension
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-cozy-shelves-panel-review
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
  - fable-2026-07-08:sfk-03404db2c315565320a4b3e9
preserved_exact_tokens:
  - cmd.docker.
  - cmd.search.
  - cmd.artifacts.
  - cmd.agents.
  - cmd.editor.
  - cmd.panel.
  - cmd.terminal.
  - cmd.github.actions.rerun
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not mint, rename, or retire catalog rows from this constraint; Plans/UI_Command_Catalog.md remains the sole registration owner.
  - Do not reserve cmd.actions. or let a cmd.actions.* ID survive reconciliation as canonical.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
```

### CS-061 - Panel Switch Destination Vocabulary And Undock Adjudication

```yaml
plan_unit_id: CS-061
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.panel.switch remains a pure view-state command whose controlled destination vocabulary
  is the canonical panel-id inventory owned by Plans/FinalGUISpec.md Section 4.1: search,
  chat, files, source_control, github_actions, docker_manager, testing, agents, artifacts,
  and run_debug. Commands consume that inventory by reference and must not define, extend,
  reorder, or fork it locally; an unknown destination refuses before dispatch. Panel
  detachment is adjudicated as cmd.panel.undock with cmd.panel.redock as its inverse;
  detach (cmd.panel.detach) is a recorded compatibility alias of cmd.panel.undock, never a
  second handler or peer command.
gui_related: true
gui_classification_reason: The destination vocabulary determines visible panel navigation targets and the undock/redock affordance.
split_recommended: false
depends_on: [CS-006, CS-011, CS-060]
unblocks: []
acceptance_criteria:
  - cmd.panel.switch accepts only the ten canonical panel ids from the Plans/FinalGUISpec.md Section 4.1 inventory; any other destination refuses before dispatch.
  - cmd.panel.switch stays view-state only; it may consume normalized routing context but never replaces the canonical route_target model.
  - Undock and redock resolve to single handlers; cmd.panel.detach exists only as recorded alias metadata of cmd.panel.undock with no separate handler, row semantics, or event meaning.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future panel-switch destination-vocabulary and alias-dispatch fixtures
risk_class: panel_destination_vocabulary_drift
reasoning_tier: medium
context_scope: cozy_shelves_panel_switch_destination_vocabulary
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/FinalGUISpec.md]
node_compile_hint:
  mode: panel_switch_vocabulary_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-cozy-shelves-panel-review
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
preserved_exact_tokens:
  - cmd.panel.switch
  - cmd.panel.undock
  - cmd.panel.redock
  - docker_manager
  - github_actions
  - source_control
  - run_debug
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not enumerate a second panel-id vocabulary in this document; Plans/FinalGUISpec.md Section 4.1 owns the inventory.
  - Do not promote cmd.panel.detach to a canonical command or let cmd.panel.switch become an object-first navigation command.
owner_hints: [Plans/Commands_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
```

### CS-062 - Panel Command Availability And Confirmation Class Assignments

```yaml
plan_unit_id: CS-062
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Newly registered panel-domain commands declare availability and confirmation classes
  before palette, shortcut, or route dispatch, mirroring the UI_Command_Catalog addendum
  rows: cmd.testing.watch_run, cmd.artifacts.watch_recording, cmd.docker.container.stop,
  and cmd.docker.container.restart are live-run only; cmd.artifacts.play_recording and
  cmd.testing.export_bundle are record-only/export-only. cmd.file.delete,
  cmd.git.discard_hunks, cmd.source_control.stash.drop, cmd.git.worktree.remove,
  cmd.docker.container.delete, cmd.docker.image.delete, cmd.docker.compose.scenario.delete,
  cmd.docker.cleanup.prune, cmd.search.replace_all, and cmd.testing.quarantine carry
  owner-assigned destructive confirmation classes (strong, hard_gate, non_reversible, or
  compensating_action_only as assigned by the catalog) and dispatch only through the shared
  confirm surface referenced by the unified expander contract. Commands never infers
  historical safety from a label; a panel command without a declared availability class
  refuses palette, shortcut, and route dispatch. Blocked panel commands surface the owner
  blocked_reason_code with ordered allowed_action_ids[], consumed by reference from the
  unified expander contract owner.
gui_related: true
gui_classification_reason: Availability classes, confirmation gates, disabled reasons, and blocked-action payloads are visible command states in the panel expanders.
split_recommended: false
depends_on: [CS-008, CS-060, CS-061]
unblocks: []
acceptance_criteria:
  - Every newly registered panel-domain command row declares exactly one availability class (live-run only, historical-safe, or record-only/export-only) before palette, shortcut, or route dispatch; class-less dispatch refuses.
  - cmd.testing.watch_run, cmd.artifacts.watch_recording, cmd.docker.container.stop, and cmd.docker.container.restart refuse in historical or record-only contexts; cmd.artifacts.play_recording and cmd.testing.export_bundle perform no live mutation.
  - Each listed destructive command carries its catalog-assigned confirmation class and preserves owner-defined confirmation, gating, preview, and blocked-action checks before dispatch; discoverability never weakens confirmation.
  - Destructive panel actions dispatch only through the shared confirm surface; no expander-local confirmation variant is introduced.
  - Blocked panel commands present blocked_reason_code plus ordered allowed_action_ids[] consumed from the owner payload, and admissibility is evaluated against allowed_action_ids[] before mutation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future availability-class and destructive-confirmation dispatch fixtures
risk_class: panel_command_class_omission
reasoning_tier: medium
context_scope: cozy_shelves_panel_command_availability_confirmation
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
node_compile_hint:
  mode: panel_command_class_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-cozy-shelves-panel-review
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (source-lineage-only)
preserved_exact_tokens:
  - live-run only
  - record-only/export-only
  - hard_gate
  - compensating_action_only
  - blocked_reason_code
  - allowed_action_ids[]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not assign or override concrete per-row classes here; Plans/UI_Command_Catalog.md owns the row-level assignments this unit mirrors.
  - Do not re-own the unified expander contract, its slot order, or its confirm surface; consume blocked_reason_code and allowed_action_ids[] by reference only.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
```

## Run & Debug Revival Addendum - 2026-07-27

This addendum mints the `cmd.run_debug.*` dispatch family for the classical DAP debugger (§7.2), reaffirms the `cmd.debug.*` assistant-investigation boundary (CS-009, §7.1), and registers the `cmd.run.*` orchestrator run-control trio (§7.3) referenced by the `run_interrupted` CTA card (`Plans/FinalGUISpec.md`). Bottom-zone Debug tab and rail "Debug & Run" panel layout and state-machine canon lives in `Plans/FinalGUISpec.md` Run & Debug Revival Addendum (F3-482..F3-496) and is consumed here by unit id only, never restated. `Concepts/**` materials remain source-lineage-only. Row-level command registration remains owned by `Plans/UI_Command_Catalog.md`; this addendum states family semantics, availability and confirmation classes, and the closed disabled-reason set exactly once and does not mint catalog rows. It does not edit existing PlanUnits, retired bridges, `preserved_exact_tokens`, or canonical_text, and it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks.

### 7.2 Run & Debug dispatch family (cmd.run_debug.*)

Run & Debug actions use a dedicated canonical UICommand family, `cmd.run_debug.*`, for classical DAP debugger dispatch. These dispatch IDs are internal wiring identifiers for the classical debugger surfaces — the rail "Debug & Run" panel and the bottom-zone Debug tab per `Plans/FinalGUISpec.md` F3-482/F3-485/F3-490 (referenced) — not User Commands. They are distinct from the assistant-investigation `cmd.debug.*` family (§7.1) per the CS-009 boundary: `cmd.debug.*` remains scoped to assistant-thread investigation control, and classical debugger dispatch uses only `cmd.run_debug.*`.

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.run_debug.start` | Start Debugging | Launches the selected launch profile with the debugger | `config_selected && !session_initializing` |
| `cmd.run_debug.start_no_debug` | Run Without Debugging | Launches the selected profile without attaching the debugger | `config_selected` |
| `cmd.run_debug.stop` | Stop Session | Terminates the focused debug session | `session_active` |
| `cmd.run_debug.disconnect` | Disconnect | Detaches from the focused attach-type session | `session_active && session_is_attach` |
| `cmd.run_debug.restart` | Restart Session | Restarts the focused session with the same profile | `session_active or session_terminated` |
| `cmd.run_debug.attach` | Attach to Process | Opens the attach flow and attaches the debugger to the chosen process | `adapter_available` |
| `cmd.run_debug.pause` | Pause | Pauses the focused running session | `session_running` |
| `cmd.run_debug.continue` | Continue | Resumes the focused paused session | `session_paused` |
| `cmd.run_debug.step_over` | Step Over | Steps over the current line | `session_paused` |
| `cmd.run_debug.step_into` | Step Into | Steps into the current call | `session_paused` |
| `cmd.run_debug.step_out` | Step Out | Steps out of the current frame | `session_paused` |
| `cmd.run_debug.session.select` | Select Session | Focuses a session; all debug controls retarget per F3-484 (referenced) | `session_count > 0` |
| `cmd.run_debug.config.select` | Select Configuration | Chooses the active launch profile | `config_count > 0` |
| `cmd.run_debug.config.add` | Add Configuration | Opens the inline add-configuration form | `panel_visible` |
| `cmd.run_debug.config.edit` | Edit Configuration | Opens the inline edit form for a launch profile | `config_selected` |
| `cmd.run_debug.config.delete` | Delete Configuration | Deletes a launch profile (confirmation class below) | `config_selected && !config_in_use_by_active_session` |
| `cmd.run_debug.config.open_file` | Open Configurations File | Opens the project's launch config file in the editor surface | always |
| `cmd.run_debug.breakpoint.toggle` | Toggle Breakpoint | Toggles activation of a breakpoint record | `breakpoint_selected` |
| `cmd.run_debug.breakpoint.edit` | Edit Breakpoint | Opens the inline edit strip (Expression / Hit Count / Log Message) | `breakpoint_selected` |
| `cmd.run_debug.breakpoint.add_function` | Add Function Breakpoint | Adds a function breakpoint via inline name input | always |
| `cmd.run_debug.breakpoint.remove_all` | Remove All Breakpoints | Removes every breakpoint (confirmation class below) | `has_breakpoints` |
| `cmd.run_debug.breakpoint.toggle_activation` | Toggle All Activations | Enables or disables all breakpoints at once | `has_breakpoints` |
| `cmd.run_debug.breakpoint.goto_source` | Go to Breakpoint Source | Opens the breakpoint's file:line in the editor | `breakpoint_selected` |
| `cmd.run_debug.breakpoint.set_exception_filters` | Set Exception Filters | Updates exception breakpoint filter checkboxes | `adapter_supports_exception_filters` |
| `cmd.run_debug.watch.add` | Add Watch | Adds a watch expression via inline input (allowed pre-session; evaluates on next pause) | `session_exists_or_panel_visible` |
| `cmd.run_debug.watch.edit` | Edit Watch | Edits a watch expression inline | `watch_selected` |
| `cmd.run_debug.watch.remove` | Remove Watch | Removes one watch expression | `watch_selected` |
| `cmd.run_debug.watch.remove_all` | Remove All Watches | Clears all watch expressions | `has_watches` |
| `cmd.run_debug.variables.set_value` | Set Variable Value | Sets a variable's value via inline input (capability-gated per F3-494, referenced) | `session_paused && variable_writable` |
| `cmd.run_debug.variables.copy_value` | Copy Value | Copies the variable's display value | `variable_selected` |
| `cmd.run_debug.variables.copy_expression` | Copy as Expression | Copies the variable's evaluate path for watch paste | `variable_selected` |
| `cmd.run_debug.variables.add_to_watch` | Add to Watch | Adds the variable's evaluate path to watches | `variable_selected` |
| `cmd.run_debug.callstack.select_frame` | Select Frame | Selects a frame; variables/watch re-scope and the editor opens the location per F3-491 (referenced) | `session_paused && frame_present` |
| `cmd.run_debug.callstack.restart_frame` | Restart Frame | Restarts the selected frame (capability-gated) | `session_paused && adapter_supports_restart_frame` |
| `cmd.run_debug.callstack.show_execution_point` | Show Execution Point | Returns the editor to the pause location | `session_paused` |
| `cmd.run_debug.console.evaluate` | Evaluate Expression | Evaluates the REPL input against the selected frame with context 'repl' | `session_active` |
| `cmd.run_debug.console.clear` | Clear Console | Clears the Debug Console pane scrollback | always |
| `cmd.run_debug.console.reveal` | Reveal Debug Tab | Focuses/un-collapses the bottom-zone Debug tab per F3-491 (referenced) | always |
| `cmd.run_debug.terminal.reveal` | Reveal Process Pane | Focuses the Debug tab's Process pane when present per F3-490 (referenced) | `session_active && console_routing == integrated_terminal` |

The three stepping commands are enabled only while the focused session is paused, per the `Plans/FinalGUISpec.md` F3-483 debug session state machine (referenced, not restated).

Availability and confirmation classes mirror the CS-062 pattern; every row declares exactly one availability class before palette, shortcut, or route dispatch, and class-less dispatch refuses:

- **Session-state gated** (availability follows the F3-483 state machine: continue is paused-only, pause is running-only, steps are paused-only, stop/disconnect are any-active): the eight session-lifecycle rows, the three stepping rows, the three call-stack rows, `cmd.run_debug.console.evaluate`, and `cmd.run_debug.terminal.reveal`.
- **Selection** (requires a selected subject): `cmd.run_debug.session.select`, the four config CRUD rows (`config.select`, `config.add`, `config.edit`, `config.delete`), the breakpoint rows `breakpoint.toggle`, `breakpoint.edit`, `breakpoint.remove_all`, `breakpoint.toggle_activation`, `breakpoint.goto_source`, and `breakpoint.set_exception_filters`, all four watch rows, and the variables rows `variables.copy_value`, `variables.copy_expression`, and `variables.add_to_watch`.
- **Session-paused** as tabled: `cmd.run_debug.variables.set_value` (`session_paused && variable_writable`, capability-gated per F3-494, referenced).
- **Always**: `cmd.run_debug.config.open_file`, `cmd.run_debug.breakpoint.add_function`, `cmd.run_debug.console.clear`, and `cmd.run_debug.console.reveal`.

Confirmation classes: `cmd.run_debug.config.delete` and `cmd.run_debug.breakpoint.remove_all` carry destructive confirmation class `strong` and dispatch only through the shared confirm surface referenced by the unified expander contract (referenced, not restated); all other rows are confirmation `none`.

Disabled reasons come only from the closed set `unsupported`, `not_configured`, `adapter_unavailable`, `session_state_mismatch`, `capability_absent`, `stale_projection`, `permission_required`:

| disabled_reason | Raised by |
|---|---|
| `unsupported` | `cmd.run_debug.terminal.reveal` when `console_routing != integrated_terminal`; `cmd.run_debug.config.open_file`, `cmd.run_debug.console.clear`, and `cmd.run_debug.console.reveal` when the owning surface is unavailable |
| `not_configured` | `cmd.run_debug.start` and `cmd.run_debug.start_no_debug` (no launch profile); config CRUD rows; `cmd.run_debug.breakpoint.remove_all` and `breakpoint.toggle_activation` (no breakpoints); `cmd.run_debug.watch.add` and `watch.remove_all` (no watches) |
| `adapter_unavailable` | `cmd.run_debug.start` and `cmd.run_debug.attach` when the debug adapter is absent or disconnected |
| `session_state_mismatch` | every session-state gated row when the F3-483 state does not match the row's required state (e.g. continue while running, pause while paused, steps while running, disconnect on a launch-type session) |
| `capability_absent` | `cmd.run_debug.variables.set_value` (non-writable variable), `cmd.run_debug.callstack.restart_frame`, `cmd.run_debug.breakpoint.set_exception_filters` |
| `stale_projection` | any row whose precondition reads session, config, breakpoint, watch, or variable projection state |
| `permission_required` | `cmd.run_debug.start`, `cmd.run_debug.attach`, and any row routed through the central permission/capability gate per CS-009 |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Glossary.md

### 7.3 Orchestrator run-control trio (cmd.run.*)

The orchestrator run-control trio registers the canonical dispatch IDs referenced by the `run_interrupted` CTA card (`Plans/FinalGUISpec.md` CTA Card Contracts): `cmd.run.resume` (Resume Run — resumes an interrupted orchestrator run; precondition `run_interrupted`), `cmd.run.view_log` (View Run Log — reveals the run's log surface; precondition `run_selected`), and `cmd.run.stop` (Stop Run — requests run stop; precondition `run_active`). Run lifecycle semantics are consumed by reference from `Plans/Orchestrator_Page.md` ("Current vs historical run behavior", including the focused-run/historical routing contract, and "Owner-surface command routing") and `Plans/Run_Graph_View.md` ("Focused run and historical routing contract", RGV-002, and §4 data model and identity); this section does not restate them. Availability class is `selection` for all three rows. Confirmation: `cmd.run.stop` is `two_step`; `cmd.run.resume` and `cmd.run.view_log` are `none`. Disabled reasons come only from the closed set `stale_projection`, `permission_required`, `unreachable`: `cmd.run.resume` and `cmd.run.stop` may raise all three; `cmd.run.view_log` may raise `stale_projection`.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FinalGUISpec.md

### CS-063 - Run & Debug Command Family Registration

```yaml
plan_unit_id: CS-063
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The cmd.run_debug.* family (39 ids) is the sole minting namespace for classical
  DAP debugger dispatch, registered per §7.2 with availability classes derived
  from the debug session state machine (Plans/FinalGUISpec.md F3-483, referenced)
  and the closed disabled-reason set; class-less dispatch refuses palette,
  shortcut, and route dispatch per the existing dispatch-gate canon. The family
  is distinct from cmd.debug.* (assistant investigation) per CS-009.
gui_related: true
gui_classification_reason: Run & Debug dispatch commands drive visible debugger controls, their enabled/disabled states, and destructive confirmation surfaces.
split_recommended: false
depends_on: [CS-009, CS-062]
unblocks: [CS-064]
acceptance_criteria:
  - Every §7.2 row declares exactly one availability class before palette, shortcut, or route dispatch; class-less dispatch refuses.
  - Destructive rows cmd.run_debug.config.delete and cmd.run_debug.breakpoint.remove_all route the shared confirm surface with confirmation class strong.
  - Disabled reasons come only from the closed set unsupported, not_configured, adapter_unavailable, session_state_mismatch, capability_absent, stale_projection, permission_required.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future availability-class and destructive-confirmation dispatch fixtures
risk_class: command_family_drift
reasoning_tier: medium
context_scope: run_debug_revival
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/FinalGUISpec.md]
node_compile_hint:
  mode: run_debug_command_family_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - Plans/FinalGUISpec.md (Run & Debug Revival Addendum F3-482..F3-496; referenced)
preserved_exact_tokens:
  - cmd.run_debug.*
  - cmd.run_debug.start
  - cmd.run_debug.breakpoint.edit
  - cmd.run_debug.console.reveal
  - unsupported
  - not_configured
  - adapter_unavailable
  - session_state_mismatch
  - capability_absent
  - stale_projection
  - permission_required
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate the Debug tab or rail panel layout or the debug session state machine here; Plans/FinalGUISpec.md F3-482..F3-496 owns that canon and is referenced by unit id only.
  - Do not re-scope or restate cmd.debug.* semantics; the assistant-investigation boundary per CS-009 and §7.1 stands unchanged.
  - Do not mint catalog rows here; Plans/UI_Command_Catalog.md owns row-level registration.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/FinalGUISpec.md]
```

### CS-064 - Orchestrator Run-Control Trio Registration

```yaml
plan_unit_id: CS-064
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.run.resume, cmd.run.view_log, and cmd.run.stop are registered per §7.3
  with run lifecycle semantics owned by Plans/Orchestrator_Page.md and
  Plans/Run_Graph_View.md; the run_interrupted CTA card's action references
  (Plans/FinalGUISpec.md CTA Card Contracts) now resolve to canonical
  dispatch ids.
gui_related: true
gui_classification_reason: Run-control commands back the visible run_interrupted CTA card primary and secondary actions.
split_recommended: false
depends_on: [CS-063]
unblocks: []
acceptance_criteria:
  - All three cmd.run.* rows declare availability class selection before palette, shortcut, or route dispatch.
  - cmd.run.stop carries confirmation class two_step; cmd.run.resume and cmd.run.view_log carry none.
  - Disabled reasons come only from the closed set stale_projection, permission_required, unreachable.
  - The run_interrupted CTA card primary and secondary action ids resolve to the registered cmd.run.* ids.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: run_control_command_drift
reasoning_tier: medium
context_scope: run_debug_revival
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md]
node_compile_hint:
  mode: orchestrator_run_control_trio_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - Plans/FinalGUISpec.md (run_interrupted CTA card contract row)
preserved_exact_tokens:
  - cmd.run.resume
  - cmd.run.view_log
  - cmd.run.stop
  - run_interrupted
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate run lifecycle semantics here; Plans/Orchestrator_Page.md and Plans/Run_Graph_View.md own run lifecycle canon.
  - Do not mint additional cmd.run.* ids in this addendum.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md, Plans/UI_Command_Catalog.md]
```

### 7.4 Debug investigation verification and cleanup rows

The §1.0B closed debug phase model (`Plans/assistant-chat-design.md`) makes `verification` mandatory — a fix attempt without a recorded verification result remains `attention_required` or `failed_cleanup`, never `resolved` — and names `cleanup` the terminal mutation-capable phase. The 2026-07-27 gap audit found no command id covering either phase; this section closes both holes inside the existing `cmd.debug.*` investigation family (§7.1 owns the family; these two rows extend it). They are internal wiring identifiers, not User Commands, and they do not alter the classical-debugger boundary (CS-009): `cmd.run_debug.*` remains the sole classical DAP namespace.

| command_id | label | description | precondition |
|---|---|---|---|
| `cmd.debug.record_verification` | Record Verification Result | Records the investigation's verification outcome (resolved or still failing, with evidence refs) so the investigation may leave `attention_required` | `investigation_active && at_verification_phase` |
| `cmd.debug.run_cleanup` | Run Investigation Cleanup | Dispatches removal of temporary instrumentation, temporary env/config, and debug-only runtime state, honoring explicit preservation/hold rules | `investigation_active && verification_recorded` |

Availability class: both rows are `selection` on their tabled preconditions. `cmd.debug.run_cleanup` is mutation-capable (it reverts system state) and carries confirmation class `two_step`; `cmd.debug.record_verification` carries confirmation class `none`. Disabled reasons come only from the closed set: `stale_projection`, `phase_not_reached`, `preservation_hold_active`. Revalidation-gate semantics (target-identity drift, evidence expiry) are owned by `Plans/assistant-chat-design.md` §1.0B and consumed by reference; this section adds no revalidation rules.

### CS-065 - Debug Investigation Verification and Cleanup Registration

```yaml
plan_unit_id: CS-065
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.debug.record_verification and cmd.debug.run_cleanup are registered per §7.4 as
  the investigation family's verification-recording and cleanup-dispatch commands,
  closing the two §1.0B phase-model holes found in the 2026-07-27 gap audit.
  cmd.debug.run_cleanup is mutation-capable and dispatches only behind confirmation
  class two_step; cmd.debug.record_verification records the verification outcome that
  lets an investigation leave attention_required; both draw disabled reasons only from
  the closed §7.4 set, and revalidation-gate semantics remain owned by
  Plans/assistant-chat-design.md §1.0B by reference.
gui_related: true
gui_classification_reason: Verification recording and cleanup dispatch surface as investigation banner/header controls in Assistant Chat's Debug Mode overlay.
split_recommended: false
depends_on: [CS-042, CS-063]
unblocks: []
acceptance_criteria:
  - cmd.debug.record_verification refuses dispatch unless the investigation is active and at the verification phase, and records a resolved or still-failing outcome with evidence refs.
  - cmd.debug.run_cleanup refuses dispatch unless a verification result is recorded, routes confirmation class two_step through the shared confirm surface, and honors explicit preservation/hold rules for temporary instrumentation.
  - Disabled reasons for both rows come only from the closed set: stale_projection, phase_not_reached, preservation_hold_active.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_family_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/assistant-chat-design.md]
node_compile_hint:
  mode: debug_investigation_verification_cleanup_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - Plans/assistant-chat-design.md (§1.0B closed debug phase model; verification/cleanup phases)
preserved_exact_tokens:
  - cmd.debug.record_verification
  - cmd.debug.run_cleanup
  - verification
  - cleanup
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate §1.0B revalidation rules here; Plans/assistant-chat-design.md owns them.
  - Do not re-scope these ids to classical DAP debugging; cmd.run_debug.* remains the sole classical namespace (CS-009).
stale_retired_dispositions: []
owner_boundary_notes:
  - "Plans/Commands_System.md §7.1 owns the cmd.debug.* family; this unit registers only the verification/cleanup pair that closes the §1.0B phase-model holes."
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/assistant-chat-design.md]
```

## u11 Prism II Usage Command Family Addendum - 2026-08-18

This addendum records the family semantics for the one new Usage command the u11 Prism II concept
establishes, and the boundary that keeps the rest of the page command-free. Catalog registration is owned by
`Plans/UI_Command_Catalog.md` (UCC-146) and wiring obligations by `Plans/Wiring_Matrix.md` (WM-044). It
creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated
wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### CS-067 - Usage Forecast Command Family And View-Local Boundary

```yaml
plan_unit_id: CS-067
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.usage.forecast.request is one new canonical Usage command carried by the CS-066 shared command
  envelope: typed request and typed result, CAS and idempotency with restart-safe replay, projected
  availability, a closed disabled-reason set, and an effect that stays receipt or projection only with
  event_effect none_pending_event_authority while the Event Authority denominator remains UNKNOWN_OPEN. It
  requests a labelled projection for the current scope and window and returns neither a quota run-out date
  nor a countdown. Everything else on the Usage page either stays view-local or reuses an existing owner's
  command: disclosure level, page scope, date range, and per-widget filters are view state and dispatch no
  command; a page-scope pick is never an account switch and must not dispatch the account profile selection
  command; every persisted widget layout mutation dispatches the existing widget command family rather than
  writing layout storage directly; only object-backed Usage/Ledger drill-through carrying its stable selector
  dispatches the existing usage-subject navigation command. Event-primary callers use usage_event/usage_event_ref;
  a PMConcept7 Ledger attempt row uses usage_attempt/attempt_id and retains the event, provider, account,
  and runtime refs as correlation. Current PMConcept7 aggregate provider/account/panel cards remain local inspectors and
  dispatch no command; and a Settings change dispatches cmd.settings.open with the Settings-owned
  `pm.settings_route_request.v1` target and exact-return identity.
gui_related: true
gui_classification_reason: The family decides which Usage affordances dispatch a command, what their disabled and busy announcements say, and which affordances are view-local.
depends_on: [CS-066, UF-092]
unblocks: []
acceptance_criteria:
  - cmd.usage.forecast.request carries a typed request and result reference, a state selector, a closed disabled-reason set, one sole handler, CAS and idempotency, and restart-safe replay under the CS-066 envelope.
  - Its effect is receipt or projection only and carries the missing-event-registration disposition; it names no event family while the Event Authority denominator remains UNKNOWN_OPEN.
  - A forecast result is a labelled projection and is never presented as a quota run-out date or a countdown.
  - Disclosure, scope, range, and filter selections dispatch no command, and a page-scope pick never dispatches the account profile selection command; event-primary Usage callers use cmd.nav.open_usage_subject with usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row uses usage_attempt/attempt_id, retains usage_event_ref plus provider/account/runtime refs as correlation, and carries no OpenSubject. Current aggregate provider/account/panel cards stay local with no command, receipt, or event.
  - A persisted Usage widget layout mutation dispatches the existing widget command family with a layout revision expectation and an idempotency key rather than writing layout storage directly.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - future Usage command dispatcher, replay, and disabled-reason fixtures
risk_class: usage_command_surface_drift
reasoning_tier: high
context_scope: usage_command_family
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: usage_forecast_command_family
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/HANDOFF_CORRECTIONS.md
preserved_exact_tokens:
  - cmd.usage.forecast.request
  - cmd.settings.open
  - pm.settings_route_request.v1
  - none_pending_event_authority
  - missing_event_registration
  - UNKNOWN_OPEN
negative_constraints:
  - Do not name or emit an event family for this command while the Event Authority denominator remains UNKNOWN_OPEN.
  - Do not present a forecast as a quota run-out date or a countdown.
  - Do not promote a view-local disclosure, scope, range, or filter selection into a command.
  - Do not dispatch the account profile selection command for a read-only view-scope change.
  - Do not dispatch cmd.nav.open_usage_subject without the stable selector required by its event-primary or attempt-primary branch, attach OpenSubject to either cmd.nav selector branch, or promote a current PMConcept7 aggregate card presentation id into route identity; the pre-existing artifact route/open bridge remains separately owned.
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/usage-feature.md
```

## PMConcept7 settled-interaction command reuse addendum - 2026-08-27

The recovered PMConcept7 surfaces consume the existing command registry; they do not create a
concept-specific command language. Pointer motion, drag/resize previews, hover summaries, popup
open/close state, Usage room/scope/range/disclosure/filter selection, and Context-ring menu disclosure
are local projections. A changed semantic release dispatches one existing command, a no-change release
returns without dispatch, and Escape or `pointercancel` restores the original projection without a
command, receipt, persisted event, or storage write.

The canonical dispositions are:

| Interaction family | Canonical command or disposition | Commit/effect boundary |
|---|---|---|
| Usage/Dashboard widget add, remove, configure, resize, move, reset | `cmd.widget.add`, `cmd.widget.remove`, `cmd.widget.configure`, `cmd.widget.resize`, `cmd.widget.move`, `cmd.widget.reset_layout` | One settled command updates the owner widget-layout store and records its command receipt; no pointer-preview frame is a domain event. |
| Home shell surface move, resize, collapse, reset | `cmd.workspace_layout.move_surface`, `cmd.workspace_layout.resize_surface`, `cmd.workspace_layout.set_collapsed`, `cmd.workspace_layout.reset` | One changed release/activation commits `pm.home_workspace_layout.v1`; only that commit may produce the existing `workspace.layout_changed` effect. |
| PM7 semantic Home size preset | Normalize the concept token `cmd.workspace_layout.size_surface` to `cmd.workspace_layout.resize_surface` after resolving `preset_id` to committed dimensions | `cmd.workspace_layout.size_surface` is concept/compatibility lineage only and is not a new primary registry row or handler. |
| Usage refresh and object-backed Usage/Ledger drill-through | `cmd.usage.refresh`, `cmd.nav.open_usage_subject` | Refresh records a no-persist dispatch receipt. Event-primary callers use `usage_event`/`usage_event_ref`; a PMConcept7 Ledger attempt row uses `usage_attempt`/`attempt_id`, repeats `attempt_id` at top level, retains `usage_event_ref` plus provider/account/runtime refs as correlation, and carries no `OpenSubject`. |
| Aggregate provider/account/panel details | local inspector (`view_only`) | Current aggregate cards open their local inspector only; no command, command receipt, domain event, or invented route kind is admitted. |
| Usage room, scope, range, disclosure, More-menu state, and per-widget filters | local projection (`view_only`) | No command, command receipt, persisted event, or storage mutation is emitted merely for local projection changes. Settled saved preferences remain storage-owned. |
| Context-ring popup/hover summary | local projection (`view_only`) | Opening or hovering the menu does not compact context or open a detail surface. |
| `Compact Now` | `cmd.chat.compact_context` | Dispatches only after explicit selection. While no `context.compaction.*` Event Authority registration exists, production wiring records the command result/receipt and visible projection state rather than fabricating an event family. |
| `More Details`, focus, and close | `cmd.chat.open_thread_context_details`, `cmd.chat.focus_thread_context_details`, `cmd.chat.close_thread_context_details` | Reuses the shared thread Context Detail Pane; it does not create a Usage route or a second chat-local details store. |
| Shell/Chat panel visibility | `cmd.panel.switch` | Changes visibility/seat state for the existing shared Assistant node; it does not instantiate another Assistant. |

`cmd.provider.usage.open_management` remains rejected and exclusions-only. This addendum does not
register that token, does not register `cmd.workspace_layout.size_surface`, and does not alter any
provider-management command disposition.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Widget_System.md, ContractName:Plans/storage-plan.md

### CS-068 - PMConcept7 Settled Interaction Command Reuse And Local Preview Boundary

```yaml
plan_unit_id: CS-068
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  PMConcept7 uses the existing cmd.widget.*, cmd.workspace_layout.*, cmd.usage.refresh,
  object-backed cmd.nav.open_usage_subject, cmd.chat.compact_context, thread Context Detail
  Pane, and cmd.panel.switch authorities. Event-primary Usage callers use usage_event/usage_event_ref;
  a PMConcept7 Ledger attempt row dispatches the navigation command with usage_attempt/attempt_id and
  retains usage_event_ref as correlation. Current PMConcept7 aggregate provider/account/panel details remain
  local inspectors. Pointer, hover, popup, room, scope, range, disclosure, filter, ghost,
  placeholder, and animation previews are local projection state; exactly one changed semantic
  release or explicit action dispatches the existing command, while no-change and cancel paths
  dispatch nothing and write nothing. The concept-only
  cmd.workspace_layout.size_surface token normalizes to cmd.workspace_layout.resize_surface
  after preset resolution and never becomes a primary command. No pointer-preview event,
  PM7 command family, second Assistant command path, or rejected provider-management
  command is admitted.
gui_related: true
gui_classification_reason: The unit governs which visible PMConcept7 controls dispatch and which interactions remain local previews.
split_recommended: false
depends_on: [CS-067, WS-019, WS-020, SP-249, SP-250]
unblocks: [UCC-147, WM-045, UIW-012, DR-039, ACD-448]
acceptance_criteria:
  - Usage and Dashboard widget mutations reuse cmd.widget.add, remove, configure, resize, move, and reset_layout; one changed settled action creates one command receipt and no pointer-preview domain event.
  - Home move, resize, collapse, and reset reuse cmd.workspace_layout.move_surface, resize_surface, set_collapsed, and reset; cmd.workspace_layout.size_surface is compatibility-only and normalizes to resize_surface.
  - Usage room, scope, range, disclosure, More-menu state, per-widget filters, and current PMConcept7 aggregate provider/account/panel inspectors remain local projection state and do not mint commands, receipts, events, or route identity; event-primary callers use cmd.nav.open_usage_subject with usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row uses usage_attempt/attempt_id without OpenSubject and retains usage_event_ref plus provider/account/runtime refs as correlation.
  - Compact Now dispatches cmd.chat.compact_context only after explicit selection; More Details reuses the thread Context Detail Pane command family; menu open and hover dispatch nothing.
  - Escape, pointercancel, invalid target, and no-change releases restore or retain the prior projection and emit no command, receipt, event, or persistence write.
  - cmd.provider.usage.open_management remains rejected and no PM7-only command namespace is added.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: pm7_parallel_command_or_preview_event_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/UI_Wiring_Rules.md
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: pm7_settled_interaction_command_reuse
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens:
  - cmd.widget.resize
  - cmd.widget.move
  - cmd.workspace_layout.move_surface
  - cmd.workspace_layout.resize_surface
  - cmd.workspace_layout.size_surface
  - cmd.usage.refresh
  - cmd.nav.open_usage_subject
  - cmd.chat.compact_context
  - cmd.chat.open_thread_context_details
  - cmd.panel.switch
negative_constraints:
  - Do not register a PM7-only command family or a primary cmd.workspace_layout.size_surface row.
  - Do not dispatch commands or persist events for pointer-preview frames, hover, popup disclosure, or cancellation.
  - Do not revive cmd.provider.usage.open_management.
  - Do not create a second Assistant command path or store.
  - Do not route aggregate provider/account/panel cards, attach OpenSubject to either cmd.nav.open_usage_subject selector branch, or use usage_event_ref as the PMConcept7 Ledger attempt selector.
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

## Settings Command Family Addendum - 2026-08-31

The Settings family contains exactly five canonical command IDs. `Plans/Settings_System.md` owns their semantics and `Plans/settings_system_contracts.schema.json` owns their machine request/result shapes; this document owns central family registration. A registered contract is not evidence that a native handler, dispatcher, persistence path, production GUI, or runtime result exists. Until the sole handler and dispatcher are observed, availability resolves through the Settings projection and may remain disabled with `handler_unavailable` or another exact Settings-owned reason.

| command_id | request_schema_ref | result_schema_ref | effect and owner boundary | executable status |
|---|---|---|---|---|
| `cmd.settings.open` | `Plans/settings_system_contracts.schema.json#/$defs/settings_route_request` (`pm.settings_route_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_route_return` (`pm.settings_route_return.v1`) | Opens exactly one stable setting or manager/detail target and preserves the Settings-owned exact return; writes no setting value. | Canonical command contract registered; `handlers::settings::open_route` is the sole declared destination, not a handler-existence claim. |
| `cmd.settings.transaction.preview` | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_preview_request` (`pm.settings_transaction_preview_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_preview` (`pm.settings_transaction_preview.v1`) | Resolves one immutable exact-ID proposal under owner/currentness/permission checks and writes nothing. | Canonical command contract registered; `handlers::settings::transaction_preview` remains unproven until executable evidence exists. |
| `cmd.settings.transaction.apply` | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_apply_request` (`pm.settings_transaction_apply_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_result` (`pm.settings_transaction_result.v1`) | Applies only the matching current preview under CAS/idempotency, owner readback, and rollback/recovery rules. | Canonical command contract registered; `handlers::settings::transaction_apply` remains unproven until executable evidence exists. |
| `cmd.settings.transaction.rollback` | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_rollback_request` (`pm.settings_transaction_rollback_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_result` (`pm.settings_transaction_result.v1`) | Targets one eligible transaction/rollback token and reports recovery truth without fabricating restoration. | Canonical command contract registered; `handlers::settings::transaction_rollback` remains unproven until executable evidence exists. |
| `cmd.settings.export` | `Plans/settings_system_contracts.schema.json#/$defs/settings_export_request` (`pm.settings_export_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_export_manifest` (`pm.settings_export_manifest.v1`) | Produces a detached exact-ID non-secret export manifest; changes no Settings value and includes no credential material. | Canonical command contract registered; `handlers::settings::export` remains unproven until executable evidence exists. |

All five commands use the shared command identity, actor/permission, exact Project/topology context, expected revision or generation, idempotency, availability, disabled-reason, acknowledgement, and result boundaries required by their Settings schemas. `accepted` or `acknowledged` is not transaction completion. Settings registers no EventRecord family here; current wiring uses a bounded receipt/route/result disposition and must reject unexpected persisted events until Event Authority independently admits an owner family.

The route-only UI actions `settings.onboarding.open`, `settings.onboarding.run_again`, `settings.guided_tour.replay`, `settings.doctor.open`, and `settings.doctor.remediation.open` are not additional commands or aliases. They dispatch `cmd.settings.open` with the exact target frozen by Settings and cannot start Onboarding, replay a tour, run a Doctor probe, or perform remediation.

ContractRef: ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/Settings_System.md#SSYS-019, ContractName:Plans/settings_system_contracts.schema.json, ContractName:Plans/settings_system_contract_fixtures.json, ContractName:Plans/UI_Wiring_Rules.md

### CS-069 - Settings Command Family Registration

```yaml
plan_unit_id: CS-069
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Exactly five canonical cmd.settings commands are centrally registered with the Settings-owned request/result,
  availability, disabled-reason, idempotency/currentness, receipt, and no-unregistered-event boundaries. The five
  Onboarding, Guided Tour, and Doctor UI actions remain route-only cmd.settings.open consumers. Declared handler
  destinations are contract targets and do not prove that a dispatcher or runtime handler exists.
gui_related: true
gui_classification_reason: The family governs Settings route, preview, apply, rollback, and export activation, disabled state, outcome, and exact return.
depends_on: [CS-066, SSYS-018, SSYS-019]
unblocks: [UIW-014]
acceptance_criteria:
  - The registered set is exactly cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, and cmd.settings.export.
  - Every command preserves the exact request_schema_ref and result_schema_ref owned by Plans/settings_system_contracts.schema.json; cmd.settings.open returns pm.settings_route_return.v1.
  - Preview and open write no setting value; apply and rollback settle only through pm.settings_transaction_result.v1 with owner readback; export returns a non-secret pm.settings_export_manifest.v1.
  - The five route-only UI actions dispatch cmd.settings.open and authorize no Onboarding, Guided Tour, Doctor probe, or remediation operation.
  - Registration, a declared handler location, static wiring, schema validation, or a concept simulation is not runtime-handler evidence; handler_unavailable remains truthful until executable proof exists.
  - No unregistered EventRecord is emitted or inferred.
validation_surfaces: [Plans/settings_system_contract_fixtures.json, Plans/Wiring_Matrix.production.json, future Settings dispatcher, handler-absence, CAS, idempotency, restart, redaction, accessibility, and no-unregistered-event fixtures]
risk_class: settings_command_family_or_handler_claim_drift
reasoning_tier: high
context_scope: settings_command_family
implementation_surfaces: [Plans/Commands_System.md, Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: settings_command_family_registration, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Settings_System.md#SSYS-018
  - Plans/Settings_System.md#SSYS-019
  - source_ref:chat:settings-reference-review-canon-closure-2026-08-31
preserved_exact_tokens: [cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, cmd.settings.export, pm.settings_route_return.v1, handler_unavailable]
negative_constraints:
  - Do not resurrect cmd.settings.bloom.open or mint route-only UI action commands.
  - Do not treat registration, a handler-location string, static wiring, or concept behavior as an executable handler claim.
  - Do not infer transaction completion from acceptance or acknowledgement.
  - Do not invent an EventRecord family.
owner_hints: [Plans/Commands_System.md, Plans/Settings_System.md, Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
```

## Project, clone, restore, Server, pairing, and protected-auth central registration addendum - 2026-09-01

The packet-owner contracts remain the sole semantic owners. This addendum centrally registers only the
ten owner commands that were missing from the command catalog boundary and strengthens the six existing
Project and Authentication registrations. A handler path below is a required dispatch target, not proof
that Rust code, a native dispatcher, persistence, or a production runtime exists. Until that evidence
exists, consumers must surface `handler_unavailable` or the exact owner-disabled reason.

| Command ID | Request -> result | Sole specified target | Boundary |
|---|---|---|---|
| `cmd.source_control.repository.clone` | `source_control_command_request` -> `source_control_command_result` | `handlers::source_control::repository_clone` | Ordinary Git only; never aliases Jujutsu clone. |
| `cmd.jujutsu.git.clone` | `command_request` -> `command_result` | `handlers::jujutsu::git_clone` | Jujutsu-native operation and snapshot fence. |
| `cmd.restore.preview` | `backup_restore_command_request` -> `backup_restore_command_result` | `handlers::backup_restore::preview_restore` | Validates and previews without activation. |
| `cmd.server.connect` | `command_payload` -> `command_result` | `handlers::server::connect` | One id carries `connect`, `reconnect`, and `resume`; no duplicate reconnect/resume commands. |
| `cmd.server.bootstrap.start` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::server::bootstrap_start` | Post-claim standalone/container bootstrap only. |
| `cmd.client.pair.start` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::start` | Starts one generation-fenced pairing run; grants no trust. |
| `cmd.client.pair.approve` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::approve` | Explicit current identity approval before trust issuance. |
| `cmd.client.pair.reject` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::reject` | Trusted approver's terminal refusal. |
| `cmd.client.pair.cancel` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::cancel` | Requesting Client's terminal abort; distinct from rejection. |
| `cmd.client.revoke` | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_trust::revoke` | Revokes the whole Client trust record and every active session. |

`cmd.project.new_local`, `cmd.project.add_existing`, and `cmd.project.open` retain their existing IDs and
sole Project targets, but their central contracts now reference `project_action_request` and
`project_action_result`. They preserve the stable Project, home Server, Source Location, repository,
revision/generation/hash, receipt, and exact caller surface/route/focus/invocation/continuation context.
Closing or navigating away from a caller does not cancel owner work.

`cmd.authentication.start`, `cmd.authentication.cancel`, and `cmd.authentication.resume` retain the
Shared Integration Runtime `AuthenticationBroker` lifecycle. Their exact initiating Client and Client
session generation, authentication operation/revision, protected-session reference, return target,
continuation, timeout/cancel disposition, and redacted return fence travel through the shared request and
result. Remote Access adapter commands may route into that same operation, but they do not create a
Remote- or Browser-owned authentication lifecycle.

No EventRecord family is admitted by this registration. Dispatch remains receipt/projection-only until
Event Authority admits a named family. `cmd.server.reconnect`, `cmd.server.resume`, `cmd.git.clone`,
`cmd.scm.clone`, `cmd.project.clone`, `cmd.project.jj_clone`, `cmd.client.pair.qr.import`, and
`cmd.server.peer_candidate.select` remain rejected primary spellings.

ContractRef: ContractName:Plans/Project_System.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/Server_System.md, ContractName:Plans/Shared_Integration_Runtime.md

### CS-070 - Cross-owner command registration and exact-return fences

```yaml
plan_unit_id: CS-070
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The central command system registers the ten missing Project-adjacent clone, restore-preview, Server,
  pairing, and Client-trust command identities without stealing their owner semantics, and strengthens the
  three existing Project plus three existing Authentication rows with their exact owner schemas and
  caller/Client return fences. Each ID has one specified handler target and remains unavailable when that
  native handler is absent; a catalog or wiring string is never implementation evidence.
gui_related: true
gui_classification_reason: These commands back Product Onboarding, Settings, Doctor, Server, restore, SCM, and project controls and their accessible disabled states.
depends_on: [CS-069, PJCT-002, SCS-006, JJI-005, BRS-006, SRV-006, SIR-020]
unblocks: [UCC-148, WM-047]
acceptance_criteria:
  - Exactly the ten commands listed in this addendum receive new central registrations; the six strengthened commands retain their existing identities and do not duplicate rows.
  - Every request and result reference resolves to its packet-owner schema and every visible consumer has an exact return route and disabled reason.
  - Ordinary Git and Jujutsu clone remain distinct; reconnect/resume are modes of cmd.server.connect; QR and peer selection are typed inputs to cmd.client.pair.start.
  - Protected authentication returns only to the exact initiating active Client/session and same operation/revision without exposing, capturing, recording, or persisting protected content.
  - A specified target path, static schema, fixture, PMConcept7 simulation, or browser pass does not prove a native handler or production runtime.
  - No new EventRecord family or rejected alias is admitted.
validation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Plans/shared_runtime_command_contract_fixtures.json, python3 scripts/pm-touch-closure-verify.py]
risk_class: cross_owner_command_duplication_or_false_handler_claim
reasoning_tier: high
context_scope: packet_owner_central_command_closure
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: cross_owner_command_registration, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-integration-20260831/authority-repairs/central-owner-merge/merged-central-owner-delta-manifest.json
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
preserved_exact_tokens: [cmd.source_control.repository.clone, cmd.jujutsu.git.clone, cmd.restore.preview, cmd.server.connect, cmd.server.bootstrap.start, cmd.client.pair.start, cmd.client.pair.approve, cmd.client.pair.reject, cmd.client.pair.cancel, cmd.client.revoke, handler_unavailable]
negative_constraints:
  - Do not interpret a handler target string as executable or native-runtime evidence.
  - Do not create generic clone, Server reconnect/resume, QR-import, peer-selection, or owner-local authentication-lifecycle commands.
  - Do not let caller close cancel owner work or let protected authentication return to a fallback Client.
  - Do not invent an EventRecord family.
owner_hints: [Plans/Commands_System.md, Plans/Project_System.md, Plans/Server_System.md, Plans/Shared_Integration_Runtime.md]
```

## Agent plugin lifecycle central registration addendum - 2026-09-01

The Plugins System remains the sole semantic lifecycle owner. This addendum registers the exact twelve
owner-backed command identities centrally so Plugins, Settings, Doctor, and the palette share one command
language. Registration changes their truthful unavailable state from `command_not_registered` to
`handler_unavailable`; it does not create Rust code, a dispatcher, package execution, persistence, or runtime
evidence. The sole specified targets below are future dispatch destinations and are not handler-existence claims.

All rows use `Plans/plugin_contracts.schema.json#/$defs/PluginCommandRequest` and
`#/$defs/PluginCommandResult`, including the owner availability, permission, disabled-reason, error,
idempotency/currentness, exact-return, receipt, and bounded-projection contracts. Package, manifest,
conformance, migration, containment, adapter, component-isolation, update-diff, rollback, and supply-chain
records remain owned by `Plans/plugin_package_contracts.schema.json`.

| Command ID | Sole specified target | Action boundary |
|---|---|---|
| `cmd.agent_plugin.scan` | `handlers::plugins::scan` | Bounded owner reconciliation; no silent install, activation, permission grant, or mutation. |
| `cmd.agent_plugin.install` | `handlers::plugins::install` | Confirmed admitted-package installation with conformance, provenance, containment, permission, and rollback gates. |
| `cmd.agent_plugin.update` | `handlers::plugins::update` | Confirmed generation-fenced replacement bound to the complete typed update diff and retained prior generation. |
| `cmd.agent_plugin.enable` | `handlers::plugins::enable` | Confirmed PM-native or dual-manifest activation only after all owner gates pass. |
| `cmd.agent_plugin.disable` | `handlers::plugins::disable` | Generation-fenced deactivation that preserves truthful component and owned-data state. |
| `cmd.agent_plugin.reload` | `handlers::plugins::reload` | Confirmed revalidation/reapproval path bound to the exact update diff and rollback proof. |
| `cmd.agent_plugin.remove` | `handlers::plugins::remove` | Confirmed removal with explicit retain/remove/migrate/recovery owned-data disposition. |
| `cmd.agent_plugin.validate` | `handlers::plugins::validate` | Read-only owner validation and bounded result projection. |
| `cmd.agent_plugin.review_changes` | `handlers::plugins::review_changes` | Read-only bounded review of the exact typed update diff and authority changes. |
| `cmd.agent_plugin.rollback` | `handlers::plugins::rollback` | Confirmed rollback to the retained verified generation with exact recovery truth. |
| `cmd.agent_plugin.open_details` | `handlers::plugins::open_details` | Bounded redacted read-only details projection. |
| `cmd.agent_plugin.open_logs` | `handlers::plugins::open_logs` | Bounded redacted read-only logs projection; no unbounded stream or private path. |

Every effect is `receipt_only_no_eventrecord_pending_event_authority`. The retained `agent_plugin.*` and
`plugin.*` names remain non-emitting candidates, not EventRecord registrations. No alias or second handler is
admitted. Missing native implementation, stale generations, unavailable conformance/provenance/containment/
rollback evidence, approval or permission, quarantine, policy, or recovery state remains a typed disabled result.

ContractRef: ContractName:Plans/Plugins_System.md#PLUG-069, ContractName:Plans/Plugins_System.md#PLUG-070, ContractName:Plans/plugin_contracts.schema.json, ContractName:Plans/plugin_package_contracts.schema.json

### CS-071 - Agent plugin lifecycle central registration

```yaml
plan_unit_id: CS-071
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Exactly twelve agent-plugin lifecycle, review, details, and logs commands are centrally registered
  against the Plugins-owned typed contracts and one specified Plugins target each. Registration advances
  their fail-closed state to handler_unavailable but proves no native handler, package operation, persistence,
  runtime result, security behavior, or EventRecord; effects remain receipt-only.
gui_related: true
gui_classification_reason: The commands back visible Plugins, Settings, Doctor, update-review, rollback, details, logs, and palette controls.
depends_on: [CS-070, PLUG-069, PLUG-070]
unblocks: [UCC-149, WM-048]
acceptance_criteria:
  - The registered set is exactly scan, install, update, enable, disable, reload, remove, validate, review_changes, rollback, open_details, and open_logs under cmd.agent_plugin.
  - Every command uses the one Plugins-owned request/result/availability/permission/error family and the package owner records without duplicating schemas or lifecycle ownership.
  - Every row has one specified future target, exact return settlement, and handler_unavailable until source-hashed native dispatcher and handler evidence exists.
  - Mutating commands retain confirmation, generation, conformance, provenance, containment, permission, update-diff, rollback, and recovery gates; details/logs remain bounded and redacted.
  - All effects remain receipt-only and no plugin.* or agent_plugin.* EventRecord family, compatibility alias, or second handler is admitted.
validation_surfaces: [Plans/plugin_contract_fixtures.json, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, python3 scripts/pm-new-contracts-verify.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: plugin_command_registration_or_false_handler_claim
reasoning_tier: high
context_scope: agent_plugin_central_registration
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: agent_plugin_central_registration, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Plugins_System.md#PLUG-069
  - Plans/Plugins_System.md#PLUG-070
  - scratchpad/pm-integration-20260831/authority-repairs/plugin-contract-closure/central-settings-doctor-delta-proposal.md
preserved_exact_tokens: [cmd.agent_plugin.scan, cmd.agent_plugin.install, cmd.agent_plugin.update, cmd.agent_plugin.enable, cmd.agent_plugin.disable, cmd.agent_plugin.reload, cmd.agent_plugin.remove, cmd.agent_plugin.validate, cmd.agent_plugin.review_changes, cmd.agent_plugin.rollback, cmd.agent_plugin.open_details, cmd.agent_plugin.open_logs, handler_unavailable, receipt_only_no_eventrecord_pending_event_authority]
negative_constraints:
  - Do not interpret registration or a handler target string as native implementation, runtime success, security certification, or readiness.
  - Do not create a second plugin lifecycle owner, handler, schema family, command alias, or EventRecord family.
  - Do not enable a control or simulate success before native handler, production route, and fresh runtime receipt closure.
owner_hints: [Plans/Commands_System.md, Plans/Plugins_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```

## Guided Tour local focus-route command disposition - 2026-09-01

`ui.guided_tour.focus_route` is a typed presentation action, not a semantic
command. It carries `route_target.page_id`, requires the currently mounted
shell router, changes only the visible page and focus, and emits a bounded
local result with `domain_mutation=false` and `persistence_write=false`.
`cmd.nav.focus_route` remains an unadopted migration candidate found in older
route vocabulary. It has no central registration, dispatcher row, handler,
event, receipt family, persistence authority, alias target, or production
wiring row. Guided Tour must not manufacture those surfaces to satisfy a
command census.

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-023, SchemaID:pm.guided_tour.contracts.v1, ContractName:Plans/UI_Command_Catalog.md#UCC-150, ContractName:Plans/Wiring_Matrix.md#WM-049

### CS-072 - Guided Tour focus route stays a typed local action

```yaml
plan_unit_id: CS-072
unit_type: command_disposition
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Guided Tour page/focus presentation uses ui.guided_tour.focus_route with a
  typed route_target.page_id and a closed pm.guided_tour.focus_route_result.v1
  no-domain/no-persistence result.
  cmd.nav.focus_route remains unadopted source-lineage and receives no command
  registration, alias, dispatcher, handler, EventRecord, receipt family, or
  production wiring row.
gui_related: true
gui_classification_reason: Governs the visible Guided Tour shell-route control, its unavailable state, and focus behavior.
depends_on: [PWIZ-023, CS-068]
unblocks: [UCC-150, WM-049]
acceptance_criteria:
  - The local action carries route_target.page_id and uses only the mounted shell presentation controller.
  - The action reports unavailable with a keyboard-reachable disabled reason when the shell router is absent.
  - No cmd.nav.focus_route registration, alias, handler, event, persistence write, or production wiring row exists.
  - Static or browser concept evidence is never promoted into native Slint or runtime-handler evidence.
validation_surfaces: [Plans/guided_tour_contracts.schema.json, Plans/guided_tour_contract_fixtures.json, Plans/Wiring_Matrix.production.exclusions.json, Concepts/pm7-tools/verify/guided_tour.mjs]
risk_class: local_presentation_promoted_to_false_domain_command
reasoning_tier: high
context_scope: guided_tour_shell_focus_route
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: guided_tour_local_action_disposition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
  - Plans/Planning_Wizard.md#PWIZ-023
preserved_exact_tokens: [ui.guided_tour.focus_route, route_target.page_id, pm.guided_tour.focus_route_result.v1, cmd.nav.focus_route, domain_mutation=false, persistence_write=false]
negative_constraints:
  - Do not invent a domain command merely to model local page or focus presentation.
  - Do not claim a native controller or runtime result from the PMConcept7 simulation.
owner_hints: [Plans/Commands_System.md, Plans/Planning_Wizard.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```
## Server/Egolite Command-Gap Central Registration Addendum - 2026-09-01


The exact machine partition is 171 packet rows: 86 new canonical commands, 43 pre-policy aliases, 39 typed local UI actions, and three rejected spellings. Six retained Egolite commands also lacked central rows. Eleven existing alias targets require the same central repair, with `cmd.source_control.workspace.create` the sole overlap with the retained six. Therefore 103 obligation references collapse to **102 unique primary command/catalog/production-intent rows**; the packet primary denominator remains 92 (`86 + 6`). Denominators must never be silently substituted for one another.

Every primary row below is static central intent. A named `handler_location` is the sole future dispatch target, not evidence that Rust code, registration, provider execution, persistence, native Slint wiring, security behavior, or runtime success exists. Initial availability remains `handler_unavailable`; the exact disabled reason is projected accessibly. All rows use receipt/projection-only effects and `expected_event_types=[]` until Event Authority separately admits an exact family. `ObservableWork` applies only where the owner contract declares asynchronous work. Exact owner permissions, generations, currentness, idempotency, cancellation, reconciliation, and exact-return rules remain intact.


### Exact 102 primary registrations

| Exact primary command | Canonical owner / PlanUnit | Sole future handler target | Exact request -> result contract |
|---|---|---|---|
| `cmd.auth_profile.rename` | `Plans/Multi-Account.md` / `MA-071` | `handlers::multi_account::rename` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` |
| `cmd.auth_profile.revoke` | `Plans/Multi-Account.md` / `MA-071` | `handlers::multi_account::revoke` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` |
| `cmd.auth_profile.transfer.apply` | `Plans/Multi-Account.md` / `MA-071` | `handlers::multi_account::transfer_apply` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` |
| `cmd.auth_profile.transfer.preview` | `Plans/Multi-Account.md` / `MA-071` | `handlers::multi_account::transfer_preview` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` |
| `cmd.browser.program.inspect` | `Plans/Section15_MVP_Promoted_Features_Spec.md` / `SMPFS-156` | `handlers::browser_program::inspect` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` |
| `cmd.client.access.update` | `Plans/Server_System.md` / `SRV-011` | `handlers::client_trust::access_update` | `Plans/server_system_contracts.schema.json#/$defs/ClientTrustCommandRequest` -> `Plans/server_system_contracts.schema.json#/$defs/ClientTrustCommandResult` |
| `cmd.client.remove` | `Plans/Server_System.md` / `SRV-011` | `handlers::client_trust::remove` | `Plans/server_system_contracts.schema.json#/$defs/ClientTrustCommandRequest` -> `Plans/server_system_contracts.schema.json#/$defs/ClientTrustCommandResult` |
| `cmd.client.rename` | `Plans/Server_System.md` / `SRV-011` | `handlers::client_trust::rename` | `Plans/server_system_contracts.schema.json#/$defs/ClientTrustCommandRequest` -> `Plans/server_system_contracts.schema.json#/$defs/ClientTrustCommandResult` |
| `cmd.client.session.revoke` | `Plans/Server_System.md` / `SRV-011` | `handlers::client_trust::session_revoke` | `Plans/server_system_contracts.schema.json#/$defs/ClientTrustCommandRequest` -> `Plans/server_system_contracts.schema.json#/$defs/ClientTrustCommandResult` |
| `cmd.credential_attachment.revoke` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_revoke` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.credential_attachment.revoke_active` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_revoke_active` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.credential_attachment.test` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_test` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.credential_attachment.transfer.apply` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_transfer_apply` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.credential_attachment.transfer.preview` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::attachment_transfer_preview` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.credential_source.add` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::source_add` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.credential_source.remove` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::source_remove` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.credential_source.test` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::source_test` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.doctor.export_report` | `Plans/newtools.md` / `N2-155` | `handlers::doctor_report::export_report` | `Plans/doctor_contracts.schema.json#/$defs/DoctorReportExportRequest` -> `Plans/doctor_contracts.schema.json#/$defs/DoctorReportExportResult` |
| `cmd.execution_environment.attach` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_attach` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.discover` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_discover` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.provision` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_provision` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.remove` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_remove` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.repair` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_repair` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.resource_policy.apply` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_resource_policy_apply` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.resource_policy.preview` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_resource_policy_preview` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.restart` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_restart` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.rollback` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_rollback` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.select` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_select` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.start` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_start` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.stop` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_stop` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.update` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_update` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_environment.verify` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::environment_verify` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_host.capabilities.refresh` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_capabilities_refresh` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_host.disable` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_disable` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_host.drain` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_drain` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_host.enable` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_enable` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_host.register` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_register` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_host.remove` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_remove` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_host.set_default` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_set_default` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.execution_host.test` | `Plans/Shared_Integration_Runtime.md` / `SIR-025` | `handlers::execution_topology::host_test` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ExecutionTopologyCommandResult` |
| `cmd.forge.repository.create` | `Plans/Forge_Integrations.md` / `FGI-008` | `handlers::forge::repository_create` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` |
| `cmd.goal.checkpoint` | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::checkpoint` | `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandRequest` -> `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandResult` |
| `cmd.goal.continue_on_host` | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::continue_on_host` | `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandRequest` -> `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandResult` |
| `cmd.goal.handoff.cancel` | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::handoff_cancel` | `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandRequest` -> `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandResult` |
| `cmd.goal.handoff.retry` | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::handoff_retry` | `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandRequest` -> `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandResult` |
| `cmd.goal.pause` | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::pause` | `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandRequest` -> `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandResult` |
| `cmd.goal.resume_here` | `Plans/Goal_Runtime_System.md` / `GRS-047` | `handlers::goal_handoff::resume_here` | `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandRequest` -> `Plans/goal_handoff_contracts.schema.json#/$defs/GoalHandoffCommandResult` |
| `cmd.installation.attach_external` | `Plans/Shared_Integration_Runtime.md` / `SIR-027` | `handlers::installation::attach_external` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/InstallationOwnershipCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/InstallationOwnershipCommandResult` |
| `cmd.installation.detach_external` | `Plans/Shared_Integration_Runtime.md` / `SIR-027` | `handlers::installation::detach_external` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/InstallationOwnershipCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/InstallationOwnershipCommandResult` |
| `cmd.installation.remove` | `Plans/Shared_Integration_Runtime.md` / `SIR-027` | `handlers::installation::remove` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/InstallationOwnershipCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/InstallationOwnershipCommandResult` |
| `cmd.project.duplicate_configuration` | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::duplicate_configuration` | `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandRequest` -> `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandResult` |
| `cmd.project.duplicate_with_history` | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::duplicate_with_history` | `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandRequest` -> `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandResult` |
| `cmd.project.execution_host.select` | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::execution_host_select` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandResult` |
| `cmd.project.execution_policy.set` | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::execution_policy_set` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandResult` |
| `cmd.project.home_server.set` | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::home_server_set` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandResult` |
| `cmd.project.move.cancel` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::cancel` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandResult` |
| `cmd.project.move.pause` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::pause` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandResult` |
| `cmd.project.move.preflight` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::preflight` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandResult` |
| `cmd.project.move.resume` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::resume` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandResult` |
| `cmd.project.move.retry` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::retry` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandResult` |
| `cmd.project.move.rollback` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::rollback` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandResult` |
| `cmd.project.move.start` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::project_move::start` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ProjectMoveCommandResult` |
| `cmd.project.source_location.add` | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_add` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandResult` |
| `cmd.project.source_location.remove` | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_remove` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandResult` |
| `cmd.project.source_location.set_primary` | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_set_primary` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandResult` |
| `cmd.project.source_location.test` | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_test` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandResult` |
| `cmd.project.source_location.update` | `Plans/Shared_Integration_Runtime.md` / `SIR-026` | `handlers::execution_topology::source_location_update` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/ProjectTopologyCommandResult` |
| `cmd.project_template.create_project` | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::template_create_project` | `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandRequest` -> `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandResult` |
| `cmd.project_template.delete` | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::template_delete` | `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandRequest` -> `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandResult` |
| `cmd.project_template.rename` | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::template_rename` | `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandRequest` -> `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandResult` |
| `cmd.project_template.save` | `Plans/Project_System.md` / `PJCT-003` | `handlers::project::template_save` | `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandRequest` -> `Plans/project_system_contracts.schema.json#/$defs/ProjectCompositionCommandResult` |
| `cmd.provider_binding.copy` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::binding_copy` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.provider_binding.resolve_on_destination` | `Plans/Shared_Integration_Runtime.md` / `SIR-024` | `handlers::credential_broker::binding_resolve_on_destination` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/IntegrationCredentialCommandResult` |
| `cmd.source_control.backend.detect` | `Plans/Source_Control_System.md` / `SCS-003` | `handlers::source_control::backend_detect` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` |
| `cmd.source_control.backend.select` | `Plans/Source_Control_System.md` / `SCS-003` | `handlers::source_control::backend_select` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` |
| `cmd.source_control.checkpoint.create` | `Plans/Source_Control_System.md` / `SCS-008` | `handlers::source_control::checkpoint_create` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` |
| `cmd.source_control.checkpoint.inspect` | `Plans/Source_Control_System.md` / `SCS-008` | `handlers::source_control::checkpoint_inspect` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` |
| `cmd.source_control.checkpoint.restore` | `Plans/Source_Control_System.md` / `SCS-008` | `handlers::source_control::checkpoint_restore` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` |
| `cmd.source_control.workspace.create` | `Plans/Source_Control_System.md` / `SCS-003` | `handlers::source_control::workspace_create` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` |
| `cmd.source_control.workspace.switch` | `Plans/Source_Control_System.md` / `SCS-003` | `handlers::source_control::workspace_switch` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` |
| `cmd.tool_package.approve_license` | `Plans/Shared_Integration_Runtime.md` / `SIR-027` | `handlers::installation::package_approve_license` | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/InstallationOwnershipCommandRequest` -> `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/InstallationOwnershipCommandResult` |
| `cmd.update.app.automatic.set_enabled` | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::automatic_set_enabled` | `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandRequest` -> `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandResult` |
| `cmd.update.app.cancel_download` | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::cancel_download` | `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandRequest` -> `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandResult` |
| `cmd.update.app.check` | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::check` | `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandRequest` -> `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandResult` |
| `cmd.update.app.download` | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::download` | `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandRequest` -> `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandResult` |
| `cmd.update.app.install_restart` | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::install_restart` | `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandRequest` -> `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandResult` |
| `cmd.update.app.remind_later` | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::remind_later` | `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandRequest` -> `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandResult` |
| `cmd.update.app.rollback` | `Plans/Release_Supply_Chain.md` / `RSC-014` | `handlers::application_update::rollback` | `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandRequest` -> `Plans/release_update_contracts.schema.json#/$defs/ApplicationUpdateCommandResult` |
| `cmd.update.content.activate` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::content_update::activate` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ContentUpdateCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ContentUpdateCommandResult` |
| `cmd.update.content.check` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::content_update::check` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ContentUpdateCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ContentUpdateCommandResult` |
| `cmd.update.content.download` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::content_update::download` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ContentUpdateCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ContentUpdateCommandResult` |
| `cmd.update.content.rollback` | `Plans/Project_Sync_and_Backbone.md` / `PSB-005` | `handlers::content_update::rollback` | `Plans/project_sync_backbone_contracts.schema.json#/$defs/ContentUpdateCommandRequest` -> `Plans/project_sync_backbone_contracts.schema.json#/$defs/ContentUpdateCommandResult` |

### Exact 43 normalization-only aliases

| Packet/source spelling | Exact target | Target handler | Rule |
|---|---|---|---|
| `cmd.auth_session.cancel` | `cmd.authentication.cancel` | `handlers::authentication::cancel` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.open_official_page` | `cmd.auth_profile.open_official_page` | `handlers::multi_account::open_official_page` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.open_secure_browser` | `cmd.authentication.start` | `handlers::authentication::start` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.open_secure_cli` | `cmd.authentication.start` | `handlers::authentication::start` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.resume_callback` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.retry` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.start` | `cmd.authentication.start` | `handlers::authentication::start` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.submit_redirect` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.auth_session.submit_returned_code` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.add` | `cmd.integration.connection.add` | `handlers::integration_connection::add` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.disable` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.edit` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.open_details` | `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.refresh_capabilities` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.remove` | `cmd.integration.connection.remove` | `handlers::integration_connection::remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.select` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.cluster_connection.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.git_credential_binding.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.installation.rescan` | `cmd.tool.discover` | `handlers::tool::discover` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.add_worktree` | `cmd.source_control.workspace.create` | `handlers::source_control::workspace_create` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.connect_existing` | `cmd.source_control.repository.bind` | `handlers::source_control::repository_bind` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.create` | `cmd.source_control.workspace.create` | `handlers::source_control::workspace_create` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.remove` | `cmd.source_control.workspace.remove` | `handlers::source_control::workspace_remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.checkout.verify` | `cmd.source_control.status.refresh` | `handlers::source_control::status_refresh` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.remove_registration` | `cmd.project.remove` | `handlers::project::remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.settings_copy.apply` | `cmd.settings.transaction.apply` | `handlers::settings::transaction_apply` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.settings_copy.preview` | `cmd.settings.transaction.preview` | `handlers::settings::transaction_preview` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.project.settings_copy.rollback` | `cmd.settings.transaction.rollback` | `handlers::settings::transaction_rollback` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.add` | `cmd.integration.connection.add` | `handlers::integration_connection::add` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.edit` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.open_details` | `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.remove` | `cmd.integration.connection.remove` | `handlers::integration_connection::remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_connection.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.registry_credential_binding.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.remote_access.remote_link.test` | `cmd.remote_access.route.test` | `handlers::remote_access::route_test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.add` | `cmd.integration.connection.add` | `handlers::integration_connection::add` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.disable` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.edit` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.open_details` | `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.remove` | `cmd.integration.connection.remove` | `handlers::integration_connection::remove` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.select` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.runtime_connection.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |
| `cmd.ssh_credential_binding.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | Normalize before permission and dispatch; source is not registered and has no peer handler, availability, wiring, persistence, or EventRecord. |

### Exact 39 typed local UI dispositions

| Command-shaped packet spelling | Exact typed local UI action | Complete intended GUI consumers |
|---|---|---|
| `cmd.auth_profile.open_details` | `ui.auth_profile.open_details` | Settings > Integrations > Profiles; Product Onboarding owner handoff; Doctor remediation; authentication handoff surface; palette/API |
| `cmd.auth_session.close_secure_browser` | `ui.auth_session.close_secure_browser` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.copy_device_code` | `ui.auth_session.copy_device_code` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_details` | `ui.auth_session.open_details` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.client.open_details` | `ui.client.open_details` | Settings > Servers > Clients; pairing/trust surface; Server permanent web UI; Doctor |
| `cmd.credential_attachment.open_consumers` | `ui.credential_attachment.open_consumers` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.open_details` | `ui.credential_attachment.open_details` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.open_details` | `ui.credential_source.open_details` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.doctor.copy_diagnostics` | `ui.doctor.copy_diagnostics` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.open` | `ui.doctor.open` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.open_finding` | `ui.doctor.open_details` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.open_owner` | `ui.doctor.open_remediation` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.refresh` | `ui.doctor.refresh_visible` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.doctor.run_check` | `ui.doctor.run_check` | Settings > Doctor; Doctor finding/detail/return surfaces |
| `cmd.execution_environment.open_details` | `ui.execution_environment.open_details` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.open_logs` | `ui.execution_environment.open_logs` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.open_details` | `ui.execution_host.open_details` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.goal.handoff.open_details` | `ui.goal.handoff.open_details` | Goal/Assistant status; Project activity; Goal handoff modal; status bar; Doctor |
| `cmd.installation.open_details` | `ui.installation.open_details` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.open_logs` | `ui.installation.open_logs` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.onboarding.back` | `ui.onboarding.back` | Product Onboarding modal |
| `cmd.onboarding.cancel` | `ui.onboarding.close` | Product Onboarding modal |
| `cmd.onboarding.continue` | `ui.onboarding.next` | Product Onboarding modal |
| `cmd.onboarding.defer` | `ui.onboarding.defer` | Product Onboarding modal |
| `cmd.onboarding.finish` | `ui.onboarding.finish` | Product Onboarding modal |
| `cmd.onboarding.open_details` | `ui.onboarding.open_details` | Product Onboarding modal |
| `cmd.onboarding.resume` | `ui.onboarding.start` | Product Onboarding modal |
| `cmd.onboarding.skip` | `ui.onboarding.skip` | Product Onboarding modal |
| `cmd.project.move.open_details` | `ui.project.move.open_details` | Projects > Move Project; Settings > Hosting & Files; Doctor; status bar |
| `cmd.project.open_details` | `ui.project.open_details` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.project.source_location.open_details` | `ui.project.source_location.open_details` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.unarchive` | `ui.project.restore_archived` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.project_template.open_details` | `ui.project_template.open_details` | Projects page; K3 Project manager; Product Onboarding First Project; palette/API |
| `cmd.tool_package.open_provenance` | `ui.tool_package.open_provenance` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.tool_package.review_license` | `ui.tool_package.review_license` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.update.app.open_details` | `ui.update.app.open_details` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.open_logs` | `ui.update.app.open_logs` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.app.open_release_notes` | `ui.update.app.open_release_notes` | Settings > Updates; bottom Update Available item; Server permanent web UI; Doctor |
| `cmd.update.content.open_details` | `ui.update.content.open_details` | Settings > Updates > Content; content attention/status; Doctor |

Typed local UI actions retain typed request/result/currentness, accessibility, focus, and return-state contracts, but receive no semantic-domain UICommand registration, production UICommand row, persistence mutation, or EventRecord. Their command-shaped packet spellings are production exclusions.

### Exact three rejections

| Rejected spelling | Reason | Replacement guidance |
|---|---|---|
| `cmd.doctor.cancel` | Doctor is a viewer/router; closing detaches the viewer and must not cancel owner ObservableWork. Cancellation remains an exact domain-owner action when that owner exposes it. | owner-specific cancellable command from remediation result; closing Doctor only detaches the viewer |
| `cmd.doctor.run_all` | An unbounded full sweep conflicts with cached-first, relevance-scoped, resource-governed Doctor scheduling. Use ui.doctor.refresh_visible or exact ui.doctor.run_check actions. | ui.doctor.refresh_visible \| ui.doctor.run_check |
| `cmd.project.create` | A generic create command would erase the current required split among new-local, forge-created, existing, Git, Jujutsu, SSH, restore, and migration registrations. Call the exact owner path instead. | cmd.project.new_local \| cmd.project.new_github_repo \| cmd.project.add_existing \| exact Source Control/Jujutsu/Restore owner command followed by cmd.project.add_existing |

### CS-073 - Server And Egolite Central Command Registration

```yaml
plan_unit_id: CS-073
unit_type: command_registration
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: The 171-row server command-gap adjudication and six retained Egolite gaps resolve to 102 unique exact primary command registrations, 43 pre-policy aliases, 39 typed local UI actions, and three non-dispatchable rejections, with one sole planned target per primary and no fabricated native or event proof.
gui_related: true
gui_classification_reason: The registrations supply Settings, Product Onboarding, Doctor, project, hosting, update, Browser, Forge, Source Control, and palette consumers with exact availability and disabled reasons.
depends_on: [CS-070, CS-071, CS-072]
unblocks: [UCC-151, WM-050, UIW-016]
acceptance_criteria:
  - Exact denominators remain 171 = 86 + 43 + 39 + 3, packet primaries remain 92 = 86 + 6, and 103 obligation references collapse to 102 unique central rows through the one workspace-create overlap.
  - Every primary resolves one owner, exact request/result contracts, one planned target, handler_unavailable state, receipt/projection-only effect, and complete reverse consumers.
  - Every alias normalizes before permission and dispatch with no source registration or peer route; every local predecessor and rejection has no production row.
  - Static plans, schemas, fixtures, target strings, catalogs, wiring rows, and concepts confer no native, security, visual, performance, or runtime proof.
validation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json, scripts/pm-touch-closure-verify.py, scripts/pm-plans-verify.py]
risk_class: central_command_denominator_or_phantom_handler_drift
reasoning_tier: high
context_scope: server_egolite_central_command_closure
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: central_command_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-1-171, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#92-command-denominator]
negative_constraints:
  - Do not register an alias, typed local predecessor, or rejected spelling as a primary command.
  - Do not treat a sole future handler path or production-intent row as native implementation proof.
  - Do not emit an unadmitted EventRecord family.
```

## Central Touch Production Closure Addendum - 2026-09-01

The following exact 231 primary commands complete the remaining actionable Touch/production denominator after the 102-row Server/Egolite closure. Each target is now adjudicated by its semantic owner; the handler string is a sole future dispatch identity, not executable-handler evidence. Aliases, typed local UI actions, and the blocked false-inventory spelling `cmd.artifacts.open_panel` are excluded from this table.

| Command | Canonical owner binding | Sole future handler | Request -> result | Initial availability / effect |
|---|---|---|---|---|
| `cmd.artifacts.create_demonstration_video` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::artifacts_create_demonstration_video` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.artifacts.inspect_capture_provenance` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::artifacts_inspect_capture_provenance` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.auth_profile.cancel` | `Plans/Multi-Account_Connection_Spec.md#MACS-004` | `handlers::multi_account::cancel` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.auth_profile.retry` | `Plans/Multi-Account_Connection_Spec.md#MACS-004` | `handlers::multi_account::retry` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.auth_profile.select` | `Plans/Multi-Account_Connection_Spec.md#MACS-004` | `handlers::multi_account::select` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.auth_profile.sign_in` | `Plans/Multi-Account_Connection_Spec.md#MACS-004` | `handlers::multi_account::sign_in` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.auth_profile.sign_out` | `Plans/Multi-Account_Connection_Spec.md#MACS-004` | `handlers::multi_account::sign_out` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.auth_profile.submit_code` | `Plans/Multi-Account_Connection_Spec.md#MACS-004` | `handlers::multi_account::submit_code` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.auth_profile.verify` | `Plans/Multi-Account_Connection_Spec.md#MACS-004` | `handlers::multi_account::verify` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.browse` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_browse` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.cancel` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_cancel` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.delete` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_delete` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.destination.add` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_destination_add` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.destination.remove` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_destination_remove` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.destination.test` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_destination_test` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.destination.update` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_destination_update` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.open_details` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_open_details` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.open_history` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_open_history` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.policy.update` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_policy_update` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.project.create` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_project_create` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.protect` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_protect` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.retry` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_retry` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.server.create` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_server_create` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.test_restore` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_test_restore` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.verify` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_verify` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.page.activate` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::page_activate` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.page.close` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::page_close` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.page.create` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::page_create` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.page.evaluate` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::page_evaluate` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.page.representation.capture` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::page_representation_capture` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.page.representation.delta` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::page_representation_delta` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.page.representation.query` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::page_representation_query` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.program.cancel` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::program_cancel` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.program.pause` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::program_pause` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.program.resume` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::program_resume` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.program.run` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::program_run` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.workspace.close` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::workspace_close` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.workspace.create` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::workspace_create` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.browser.workspace.reset` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-157` | `handlers::browser_program::workspace_reset` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.connection.reauthorize` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::connection_reauthorize` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.mirror.connect` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::mirror_connect` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.mirror.detach` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::mirror_detach` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.mirror.inspect` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::mirror_inspect` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.mirror.sync` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::mirror_sync` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.pipeline.cancel` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::pipeline_cancel` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.pipeline.list` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::pipeline_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.pipeline.open_in_browser` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::pipeline_open_in_browser` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.pipeline.open_job` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::pipeline_open_job` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.pipeline.open_logs` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::pipeline_open_logs` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.pipeline.refresh` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::pipeline_refresh` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.pipeline.retry` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::pipeline_retry` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.pipeline.run` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::pipeline_run` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.repository.list` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::repository_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.repository.open_in_browser` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::repository_open_in_browser` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.repository.refresh` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::repository_refresh` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.approve` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_approve` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.checkout` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_checkout` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.close` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_close` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.comment` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_comment` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.create` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_create` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.mark_ready` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_mark_ready` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.merge` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_merge` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.open` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_open` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.open_in_browser` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_open_in_browser` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.refresh` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_refresh` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.reopen` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_reopen` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.request_changes` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_request_changes` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.thread.list` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_thread_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.thread.reopen` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_thread_reopen` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.thread.reply` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_thread_reply` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.thread.resolve` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_thread_resolve` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.version.compare` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_version_compare` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.version.open` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::review_version_open` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.webhook.delivery.list` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::webhook_delivery_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.webhook.redeliver` | `Plans/Forge_Integrations.md#FGI-010` | `handlers::forge::webhook_redeliver` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.installation.select` | `Plans/Shared_Integration_Runtime.md#SIR-030` | `handlers::installation::select` | `Plans/shared_integration_runtime.schema.json#/$defs/InstallationSelectCommandRequest` -> `Plans/shared_integration_runtime.schema.json#/$defs/InstallationSelectCommandResult` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.bookmark.create` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::bookmark_create` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.bookmark.delete` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::bookmark_delete` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.bookmark.move` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::bookmark_move` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.bookmark.rename` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::bookmark_rename` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.bookmark.track` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::bookmark_track` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.bookmark.untrack` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::bookmark_untrack` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.change.abandon` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::change_abandon` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.change.describe` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::change_describe` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.change.edit` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::change_edit` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.change.new` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::change_new` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.change.rebase` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::change_rebase` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.change.restore` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::change_restore` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.change.split` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::change_split` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.change.squash` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::change_squash` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.diff.open` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::diff_open` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.git.export` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::git_export` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.git.fetch` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::git_fetch` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.git.import` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::git_import` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.git.push` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::git_push` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.history.open` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::history_open` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.operation.log` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::operation_log` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.operation.restore` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::operation_restore` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.operation.show` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::operation_show` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.operation.undo` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::operation_undo` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.status.refresh` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::status_refresh` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.workspace.create` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::workspace_create` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.workspace.list` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::workspace_list` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.workspace.open` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::workspace_open` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.workspace.remove` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::workspace_remove` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.jujutsu.workspace.switch` | `Plans/Jujutsu_Integration.md#JJI-007` | `handlers::jujutsu::workspace_switch` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.named_plan.archive` | `Plans/Named_Plan_System.md#NPLAN-003` | `handlers::named_plan::archive` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.named_plan.create` | `Plans/Named_Plan_System.md#NPLAN-003` | `handlers::named_plan::create` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.named_plan.open` | `Plans/Named_Plan_System.md#NPLAN-003` | `handlers::named_plan::open` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.named_plan.rename` | `Plans/Named_Plan_System.md#NPLAN-003` | `handlers::named_plan::rename` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.named_plan.restore` | `Plans/Named_Plan_System.md#NPLAN-003` | `handlers::named_plan::restore` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.named_plan.set_priority` | `Plans/Named_Plan_System.md#NPLAN-003` | `handlers::named_plan::set_priority` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.panel.redock` | `Plans/FinalGUISpec.md#F3-HOME-003` | `handlers::panel::redock` | typed `panel_id`, `window_id?`, `target_host`, `expected_layout_revision`, `idempotency_key` request -> typed panel/layout result | `handler_unavailable`; `panel.redocked` remains the admitted owner event; native Final GUI evidence is absent |
| `cmd.panel.undock` | `Plans/FinalGUISpec.md#F3-HOME-003` | `handlers::panel::undock` | typed `project_id?`, `panel_id`, `current_host`, `target_window?`, `expected_layout_revision`, `idempotency_key` request -> typed panel/layout/window result | `handler_unavailable`; `panel.undocked` remains the admitted owner event; native Final GUI evidence is absent |
| `cmd.remote_access.funnel.disable` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::funnel_disable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.funnel.enable` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::funnel_enable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.funnel.preflight` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::funnel_preflight` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.funnel.restore` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::funnel_restore` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.funnel.test` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::funnel_test` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.open` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::open` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.open_logs` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::open_logs` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.private_endpoint.add` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::private_endpoint_add` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.private_endpoint.remove` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::private_endpoint_remove` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.private_endpoint.test` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::private_endpoint_test` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.private_endpoint.update` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::private_endpoint_update` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.proxy.disable` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::proxy_disable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.proxy.export` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::proxy_export` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.proxy.generate` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::proxy_generate` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.proxy.open_details` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::proxy_open_details` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.proxy.preview` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::proxy_preview` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.proxy.set_external_origin` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::proxy_set_external_origin` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.proxy.set_trusted_proxies` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::proxy_set_trusted_proxies` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.proxy.test` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::proxy_test` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.remote_link.configure_gateway` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::remote_link_configure_gateway` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.remote_link.copy_address` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::remote_link_copy_address` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.remote_link.disable` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::remote_link_disable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.remote_link.enable` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::remote_link_enable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.remote_link.open` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::remote_link_open` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.remote_link.open_details` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::remote_link_open_details` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.remote_link.retry` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::remote_link_retry` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.remote_link.rotate_recovery_key` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::remote_link_rotate_recovery_key` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.remote_link.setup` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::remote_link_setup` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.route.open_details` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::route_open_details` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.route.retry` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::route_retry` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.route.set_policy` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::route_set_policy` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.set_enabled` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::set_enabled` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.disable` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::tailscale_disable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.headscale.start` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::tailscale_headscale_start` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.headscale.submit_registration` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::tailscale_headscale_submit_registration` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.login.resume` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::tailscale_login_resume` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.login.start` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::tailscale_login_start` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.setup.start` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::tailscale_setup_start` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.sign_out` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::tailscale_sign_out` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.test` | `Plans/Remote_Access_System.md#RAS-012` | `handlers::remote_access::tailscale_test` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.restore.cancel` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::restore_cancel` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.restore.open_details` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::restore_open_details` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.restore.project_as_new` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::restore_project_as_new` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.restore.project_in_place` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::restore_project_in_place` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.restore.retry` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::restore_retry` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.restore.rollback` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::restore_rollback` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.restore.selective` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::restore_selective` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.restore.server_full` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::restore_server_full` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.add` | `Plans/Server_System.md#SRV-012` | `handlers::server::add` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.capabilities.refresh` | `Plans/Server_System.md#SRV-012` | `handlers::server::capabilities_refresh` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.claim` | `Plans/Server_System.md#SRV-012` | `handlers::server::claim` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.discovery.open_nearby` | `Plans/Server_System.md#SRV-012` | `handlers::server::discovery_open_nearby` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.discovery.refresh` | `Plans/Server_System.md#SRV-012` | `handlers::server::discovery_refresh` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.discovery.set_enabled` | `Plans/Server_System.md#SRV-012` | `handlers::server::discovery_set_enabled` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.endpoint.add_manual` | `Plans/Server_System.md#SRV-012` | `handlers::server::endpoint_add_manual` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.endpoint.copy` | `Plans/Server_System.md#SRV-012` | `handlers::server::endpoint_copy` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.endpoint.open` | `Plans/Server_System.md#SRV-012` | `handlers::server::endpoint_open` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.endpoint.open_details` | `Plans/Server_System.md#SRV-012` | `handlers::server::endpoint_open_details` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.endpoint.remove` | `Plans/Server_System.md#SRV-012` | `handlers::server::endpoint_remove` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.endpoint.set_preferred` | `Plans/Server_System.md#SRV-012` | `handlers::server::endpoint_set_preferred` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.endpoint.test` | `Plans/Server_System.md#SRV-012` | `handlers::server::endpoint_test` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.endpoint.update` | `Plans/Server_System.md#SRV-012` | `handlers::server::endpoint_update` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.open_details` | `Plans/Server_System.md#SRV-012` | `handlers::server::open_details` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.open_logs` | `Plans/Server_System.md#SRV-012` | `handlers::server::open_logs` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.open_web` | `Plans/Server_System.md#SRV-012` | `handlers::server::open_web` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.processing.set_enabled` | `Plans/Server_System.md#SRV-012` | `handlers::server::processing_set_enabled` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.remove` | `Plans/Server_System.md#SRV-012` | `handlers::server::remove` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.rename` | `Plans/Server_System.md#SRV-012` | `handlers::server::rename` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.restart` | `Plans/Server_System.md#SRV-012` | `handlers::server::restart` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.select` | `Plans/Server_System.md#SRV-012` | `handlers::server::select` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.stop` | `Plans/Server_System.md#SRV-012` | `handlers::server::stop` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.test_connection` | `Plans/Server_System.md#SRV-012` | `handlers::server::test_connection` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.server.update_policy` | `Plans/Server_System.md#SRV-012` | `handlers::server::update_policy` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.diff.open` | `Plans/Source_Control_System.md#SCS-010` | `handlers::source_control::diff_open` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.history.open` | `Plans/Source_Control_System.md#SCS-010` | `handlers::source_control::history_open` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.remote.fetch` | `Plans/Source_Control_System.md#SCS-010` | `handlers::source_control::remote_fetch` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.remote.publish` | `Plans/Source_Control_System.md#SCS-010` | `handlers::source_control::remote_publish` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.remote.sync` | `Plans/Source_Control_System.md#SCS-010` | `handlers::source_control::remote_sync` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.repository.unbind` | `Plans/Source_Control_System.md#SCS-010` | `handlers::source_control::repository_unbind` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.workspace.list` | `Plans/Source_Control_System.md#SCS-010` | `handlers::source_control::workspace_list` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.workspace.open` | `Plans/Source_Control_System.md#SCS-010` | `handlers::source_control::workspace_open` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.testing.capture.bookmark` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::testing_capture_bookmark` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.testing.capture.health.inspect` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::testing_capture_health_inspect` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.testing.capture.pause` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::testing_capture_pause` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.testing.capture.resume` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::testing_capture_resume` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.testing.capture.save_clip` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::testing_capture_save_clip` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.testing.capture.start` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::testing_capture_start` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.testing.capture.stop` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::testing_capture_stop` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.testing.capture.target.update` | `Plans/Test_Capture_and_Motion_Evidence.md#TCME-008` | `handlers::test_capture::testing_capture_target_update` | `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_request` -> `Plans/test_capture_motion_evidence_contracts.schema.json#/$defs/capture_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.repository.fork` | `Plans/Forge_Integrations.md#FGI-013` | `handlers::forge::repository_fork` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.repository.policy.preview` | `Plans/Forge_Integrations.md#FGI-013` | `handlers::forge::repository_policy_preview` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.repository.policy.apply` | `Plans/Forge_Integrations.md#FGI-013` | `handlers::forge::repository_policy_apply` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.review.checks` | `Plans/Forge_Integrations.md#FGI-013` | `handlers::forge::review_checks` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.pipeline.approve` | `Plans/Forge_Integrations.md#FGI-013` | `handlers::forge::pipeline_approve` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.runner.registration.apply` | `Plans/Forge_Integrations.md#FGI-013` | `handlers::forge::runner_registration_apply` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.runner.remove` | `Plans/Forge_Integrations.md#FGI-013` | `handlers::forge::runner_remove` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.release.list` | `Plans/Forge_Integrations.md#FGI-013` | `handlers::forge::release_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.forge.release.asset.download` | `Plans/Forge_Integrations.md#FGI-013` | `handlers::forge::release_asset_download` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.destination.discover` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_destination_discover` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.retention.preview` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_retention_preview` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.prune` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_prune` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.unlock` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_unlock` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.file.download` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_file_download` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.extract` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_extract` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.file.compare` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_file_compare` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.export` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_export` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.archive.retrieve` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::backup_archive_retrieve` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.recovery_key.export` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::recovery_key_export` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.recovery_key.copy` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::recovery_key_copy` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.recovery_key.print` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::recovery_key_print` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.recovery_key.test` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::recovery_key_test` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.recovery_key.acknowledge_saved` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::recovery_key_acknowledge_saved` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.recovery_key.rotate` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::recovery_key_rotate` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.backup.recovery_key.reencrypt` | `Plans/Backup_Restore_System.md#BRS-011` | `handlers::backup_restore::recovery_key_reencrypt` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.connector.check` | `Plans/Remote_Access_System.md#RAS-015` | `handlers::remote_access::tailscale_connector_check` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.connector.restart` | `Plans/Remote_Access_System.md#RAS-015` | `handlers::remote_access::tailscale_connector_restart` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.remote_access.tailscale.identity.reset` | `Plans/Remote_Access_System.md#RAS-015` | `handlers::remote_access::tailscale_identity_reset` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |

### September 1 Remote Access compatibility demotions

These four historical component/Serve spellings are normalization-only inputs. They are not catalog primaries, have no state selector, handler, production row, persistence, or EventRecord of their own, and preserve only invoked compatibility/source receipt identity.

| Compatibility input | Canonical target | Target handler |
|---|---|---|
| `cmd.remote_access.tailscale.component.check` | `cmd.remote_access.tailscale.connector.check` | `handlers::remote_access::tailscale_connector_check` |
| `cmd.remote_access.tailscale.serve.enable` | `cmd.remote_access.tailscale.setup.start` with fixed `operation_scope=ensure_private_endpoint` | `handlers::remote_access::tailscale_setup_start` |
| `cmd.remote_access.tailscale.serve.test` | `cmd.remote_access.tailscale.test` | `handlers::remote_access::tailscale_test` |
| `cmd.remote_access.tailscale.serve.disable` | `cmd.remote_access.tailscale.disable` with fixed `disable_scope=private_connector_route` and connector identity preservation | `handlers::remote_access::tailscale_disable` |

### CS-074 - Remaining Touch Primary Command Closure

```yaml
plan_unit_id: CS-074
unit_type: command_catalog
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: Exactly 231 remaining owner-admitted Touch commands are primary catalog entries with one owner-adjudicated future handler each, typed owner contracts, handler_unavailable initial state, no alias peers, and no newly admitted EventRecord types.
gui_related: true
gui_classification_reason: The command set is consumed by Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named GUI routes.
depends_on: [CS-073, BRS-011, FGI-010, FGI-013, JJI-007, MACS-004, NPLAN-003, RAS-012, RAS-015, SMPFS-157, SRV-012, SIR-030, SCS-010, TCME-008]
unblocks: []
acceptance_criteria:
- The exact table contains 231 unique primary IDs and no alias, typed local UI action, rejected token, or blocked false inventory.
- Each command has exactly one owner binding, handler target, production-intent row, typed request/result/error/availability/permission contract, and reverse GUI route.
- Every row starts handler_unavailable and expected_event_types is empty until native and Event Authority evidence exists.
validation_surfaces:
- python3 scripts/pm-touch-closure-verify.py --json
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: central_command_route_closure
reasoning_tier: high
context_scope: remaining_touch_primary_commands
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: touch_primary_command_closure, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- Plans/touch_closure.json
- Plans/Wiring_Matrix.production.json
- user-approved Parallel Canon, Settings, and PMConcept7 Integration Plan
negative_constraints:
- Do not treat a planned target or production-intent row as native implementation proof.
- Do not mint peer alias handlers or events.
compile_disposition: extend_existing_owner
```

## ConnectionDraft Central Registration Addendum - 2026-09-02

`cmd.integration.connection.activate` is the one new primary command needed to close the packet ConnectionDraft lifecycle. It joins the existing `cmd.integration.connection.add|update|test|remove|open_details` family and maps only to `handlers::integration_connection::activate`. Its exact request, result, error, availability, and permission contracts are `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionCommandRequest`, `#/$defs/IntegrationConnectionCommandResult`, `#/$defs/IntegrationConnectionCommandError`, `#/$defs/IntegrationConnectionAvailability`, and `#/$defs/SharedIntegrationPermissionDecision`. The owner is `Plans/Shared_Integration_Runtime.md#SIR-035`; the persistence owner is `IntegrationConnectionRegistry`.

The six packet candidates normalize before schema, capability/currentness, permission, policy, dispatch, receipt, event, or persistence handling:

| Source candidate | Canonical command | Sole future target | Source disposition |
|---|---|---|---|
| `cmd.connection.draft.create` | `cmd.integration.connection.add` | `handlers::integration_connection::add` | ACT-148 compatibility input; source unregistered; canonical add persists inactive draft |
| `cmd.connection.activate` | `cmd.integration.connection.activate` | `handlers::integration_connection::activate` | ACT-149 compatibility input; source unregistered |
| `cmd.connection.update` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | ACT-150 compatibility input; source unregistered |
| `cmd.connection.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | ACT-151 compatibility input; source unregistered |
| `cmd.connection.remove` | `cmd.integration.connection.remove` | `handlers::integration_connection::remove` | ACT-152 compatibility input; source unregistered |
| `cmd.connection.open_details` | `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` | ACT-153 compatibility input for persisted connection; source unregistered |

`cmd.connection.draft.open_details` is not a command or alias. Its current identity is the owner-local `ui.integration.connection.draft.open_details` action from SIR-035, with no domain handler, command registration, persistence mutation, EventRecord, or production-wiring command row.

All six canonical command targets remain `handler_unavailable`. Static owner contracts, registration prose, catalog metadata, and production-intent wiring are not dispatcher or native handler proof. Effects remain owner result/receipt/projection only with `expected_event_types=[]`; no protected-auth material, capability success, persistence success, provider call, or runtime readiness is inferred.

### CS-075 - ConnectionDraft Activation Registration And Candidate Normalization

```yaml
plan_unit_id: CS-075
unit_type: command_registry
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The central registry adds only cmd.integration.connection.activate to the existing six-command IntegrationConnectionRegistry family; ACT-148..153 source spellings normalize before all gates to the six canonical commands, receive no peer handler or persistence identity, and draft-only details remain a typed owner-local action.
gui_related: true
gui_classification_reason: Settings integration/destination rows, Product Onboarding, Doctor, connection managers, and palette/API expose activation and the existing lifecycle commands through typed availability.
depends_on: [CS-073, SIR-035]
unblocks: [UCC-153]
acceptance_criteria:
  - cmd.integration.connection.activate appears once as a primary command and maps only to handlers::integration_connection::activate with the SIR-035 request/result/error/availability/permission family.
  - ACT-148..153 source spellings normalize one-to-one before capability/currentness, permission, policy, validation, dispatch, receipt, event, or persistence handling and never receive peer handlers.
  - cmd.integration.connection.add is the canonical inactive-draft creation route; activation remains a separate expected-generation mutation with verified capability evidence.
  - cmd.connection.draft.open_details and ui.integration.connection.draft.open_details receive no command registration or domain handler.
  - All six canonical routes remain handler_unavailable and event-silent with "expected_event_types=[]" until executable proof and Event Authority exist.
validation_surfaces: [Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, python3 scripts/pm-new-contracts-verify.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: duplicate_connection_command_namespace_or_false_registration
reasoning_tier: high
context_scope: connection_draft_central_registration
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: static_command_registry_and_alias_normalization_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Shared_Integration_Runtime.md#SIR-035
  - "source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:192-197"
preserved_exact_tokens: [ACT-148, ACT-149, ACT-150, ACT-151, ACT-152, ACT-153, cmd.integration.connection.activate, handlers::integration_connection::activate, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not register any cmd.connection.* source spelling or create a peer availability, handler, persistence identity, EventRecord, or provider namespace.
  - Do not promote ui.integration.connection.draft.open_details into a command.
  - Do not claim native dispatcher, handler, persistence, provider, authentication, capability, or runtime evidence.
```

## Post-Integration Auth Candidate Central Normalization - 2026-09-02

SIR-033 already owns the typed normalization records for these three packet candidates. The central command registry therefore registers no new primary command and creates no alias-specific handler, availability record, production wiring row, persistence identity, or EventRecord.

| Packet/source spelling | Exact target | Sole future target handler | Central disposition |
|---|---|---|---|
| `cmd.auth_session.resume` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before every gate; preserve source identity only as compatibility provenance. |
| `cmd.auth_session.submit_code` | `cmd.auth_profile.submit_code` | `handlers::multi_account::submit_code` | Normalize before every gate; submitted code remains in the protected owner channel and never enters alias metadata. |
| `cmd.credential.add` | `cmd.credential_source.add` | `handlers::credential_broker::source_add` | Normalize before every gate; credential material and attachments remain with the credential owner. |

The canonical targets retain their existing typed requests, results, errors, availability, permissions, and sole future handlers. They remain `handler_unavailable`, and `expected_event_types=[]` remains exact until native dispatcher/handler evidence and Event Authority admission exist.

### CS-076 - Post-Integration Auth Candidate Normalization

```yaml
plan_unit_id: CS-076
unit_type: command_registry
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  SIR-033's three post-integration source spellings normalize before every gate to existing authentication, auth-profile, and credential-source commands; the central registry adds no primary, peer handler, independent wiring, persistence identity, or EventRecord.
gui_related: false
gui_classification_reason: This is central pre-dispatch identity normalization; GUI consumers remain attached to the canonical target commands through UCC-154.
depends_on: [CS-073, SIR-033]
unblocks: [UCC-154]
acceptance_criteria:
  - cmd.auth_session.resume maps only to cmd.authentication.resume and handlers::authentication::resume.
  - cmd.auth_session.submit_code maps only to cmd.auth_profile.submit_code and handlers::multi_account::submit_code.
  - cmd.credential.add maps only to cmd.credential_source.add and handlers::credential_broker::source_add.
  - Normalization precedes schema selection, availability, currentness, permission, policy, validation, dispatch, receipt, event, and persistence handling.
  - The three source spellings remain unregistered and receive no peer availability, handler, production wiring row, persistence identity, EventRecord, secret payload, or protected-browser authority.
  - Canonical targets remain handler_unavailable and event-silent with "expected_event_types=[]" until executable proof and Event Authority exist.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, Plans/UI_Command_Catalog.md, Plans/touch_closure.json, Plans/Wiring_Matrix.production.exclusions.json, python3 scripts/pm-touch-closure-verify.py --json]
risk_class: duplicate_auth_handler_or_secret_bearing_compatibility_route
reasoning_tier: high
context_scope: post_integration_auth_candidate_central_normalization
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/touch_closure.json, Plans/Wiring_Matrix.production.exclusions.json]
node_compile_hint: {mode: static_alias_normalization_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Shared_Integration_Runtime.md#SIR-033
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:124-131
preserved_exact_tokens: [cmd.auth_session.resume, cmd.auth_session.submit_code, cmd.credential.add, cmd.authentication.resume, cmd.auth_profile.submit_code, cmd.credential_source.add, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not register the packet source spellings or create peer handlers, wiring, persistence, events, secrets, or protected-session access.
  - Do not infer native normalization, dispatch, handler, authentication, credential mutation, or runtime readiness from static contracts.
```

## Neutral Source-Control Primary Registration Completion - 2026-09-02

Three existing Source Control owner commands already have typed owner contracts, Touch Closure rows, and production-intent wiring, but require explicit concrete central catalog records. This section completes those records without minting new semantics or changing the packet compatibility aliases that target them.

| Command ID | Canonical owner | Sole future handler | Exact request -> result | Current evidence boundary |
|---|---|---|---|---|
| `cmd.source_control.repository.bind` | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::repository_bind` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.status.refresh` | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::status_refresh` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.workspace.remove` | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::workspace_remove` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |

The compatibility spellings `cmd.project.checkout.connect_existing`, `cmd.project.checkout.verify`, and `cmd.project.checkout.remove` continue to normalize before every gate to these primaries. They do not receive peer registrations or handlers.

### CS-077 - Neutral Source-Control Primary Registration Completion

```yaml
plan_unit_id: CS-077
unit_type: command_registry
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Repository bind, status refresh, and workspace remove receive concrete central catalog records over their existing Source Control owner contracts, sole future handlers, Touch Closure rows, and production-intent wiring; compatibility inputs remain unregistered and native evidence remains absent.
gui_related: true
gui_classification_reason: Source Control, Settings, Project setup, Doctor, and palette/API consumers require exact availability, disabled reason, and return behavior for these commands.
depends_on: [CS-073, SCS-003]
unblocks: [UCC-155]
acceptance_criteria:
  - Each exact command appears once in this concrete table with Source Control owner, typed request/result, and one sole future handler.
  - Existing production-intent and Touch Closure rows remain the only wiring identities; no compatibility source receives a peer row or handler.
  - Every route remains handler_unavailable and event-silent with "expected_event_types=[]" until executable proof and Event Authority admission exist.
  - Repository binding, status observation, and workspace removal remain distinct actions with owner-defined currentness, permission, data-disposition, and exact-return semantics.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, Plans/touch_closure.json, Plans/Wiring_Matrix.production.json, python3 scripts/pm-touch-closure-verify.py --json, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: missing_central_source_control_primary_or_conflated_mutation
reasoning_tier: high
context_scope: neutral_source_control_primary_registration
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Source_Control_System.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: static_existing_primary_registration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Source_Control_System.md#SCS-003
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json
preserved_exact_tokens: [cmd.source_control.repository.bind, cmd.source_control.status.refresh, cmd.source_control.workspace.remove, handlers::source_control::repository_bind, handlers::source_control::status_refresh, handlers::source_control::workspace_remove, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not invent peer compatibility handlers, generic source-control dispatch, automatic removal, or fabricated currentness.
  - Do not claim native dispatcher, handler, persistence, filesystem, repository, or runtime evidence from static registration.
```

## Puppet Master Assistant Redesign Central Registration Addendum - 2026-09-03

This addendum records the central command-contract registration for the approved Puppet Master Assistant redesign. `Plans/UI_Command_Catalog.md` carries the catalog rows, labels, preconditions and reverse-consumer surfaces; this document carries the typed contract identity, the sole future handler, and the exact evidence boundary for each command. Every route below is `handler_unavailable`. A typed contract, a catalog row, and a production-intent wiring row together prove design closure and prove nothing about a native dispatcher, handler execution, rendered control, receipt, storage write, or runtime readiness.

`cmd.chat.goal.start`, `cmd.chat.goal.update` and `cmd.bsd.set` were already centrally registered. This wave revises their request and result contract identities in place. They keep one registration, one handler target, and one wiring identity; no compatibility spelling and no peer row is minted for them.

### Central command contract records

| Command ID | Canonical owner | Sole future handler | Exact request -> result | Current evidence boundary |
|---|---|---|---|---|
| `cmd.chat.goal.start` | `Plans/Goal_Runtime_System.md` | `handlers::goal_runtime::goal_start` | `Plans/goal_runtime_contracts.schema.json#/$defs/GoalStartRequestV2` -> `Plans/goal_runtime_contracts.schema.json#/$defs/GoalStartResultV2` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.goal.update` | `Plans/Goal_Runtime_System.md` | `handlers::goal_runtime::goal_update` | `Plans/goal_runtime_contracts.schema.json#/$defs/GoalUpdateRequestV2` -> `Plans/goal_runtime_contracts.schema.json#/$defs/GoalUpdateResultV2` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.goal.propose_update` | `Plans/Goal_Runtime_System.md` | `handlers::goal_runtime::goal_propose_update` | `Plans/goal_runtime_contracts.schema.json#/$defs/GoalUpdateProposalRequest` -> `Plans/goal_runtime_contracts.schema.json#/$defs/ApprovalRequest` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.goal.pause` | `Plans/Goal_Runtime_System.md` | `handlers::goal_runtime::goal_pause` | `Plans/goal_runtime_contracts.schema.json#/$defs/GoalControlRequestV2` -> `Plans/goal_runtime_contracts.schema.json#/$defs/GoalControlResultV2` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.goal.resume` | `Plans/Goal_Runtime_System.md` | `handlers::goal_runtime::goal_resume` | `Plans/goal_runtime_contracts.schema.json#/$defs/GoalControlRequestV2` -> `Plans/goal_runtime_contracts.schema.json#/$defs/GoalControlResultV2` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.goal.cancel` | `Plans/Goal_Runtime_System.md` | `handlers::goal_runtime::goal_cancel` | `Plans/goal_runtime_contracts.schema.json#/$defs/GoalControlRequestV2` -> `Plans/goal_runtime_contracts.schema.json#/$defs/GoalControlResultV2` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.goal.open_editor` | `Plans/assistant-chat-design.md` | `handlers::assistant_chat::goal_open_editor` | `Plans/assistant_chat_contracts.schema.json#/$defs/GoalEditorRoute` -> `Plans/assistant_chat_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.plan.strategy.set` | `Plans/Assistant_Plan_Runtime.md` | `handlers::assistant_plan::plan_strategy_set` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanStrategyRequest` -> `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanStrategyResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.plan.create` | `Plans/Assistant_Plan_Runtime.md` | `handlers::assistant_plan::plan_create` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCreateRequest` -> `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCreateResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.plan.request_revision` | `Plans/Assistant_Plan_Runtime.md` | `handlers::assistant_plan::plan_request_revision` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanRevisionRequest` -> `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanRevisionResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.plan.view.set` | `Plans/Assistant_Plan_Runtime.md` | `handlers::assistant_plan::plan_view_set` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanViewRequest` -> `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanViewResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.plan.build` | `Plans/Assistant_Plan_Runtime.md` | `handlers::assistant_plan::plan_build` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanBuildRequest` -> `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanBuildResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.plan.build_with_crew` | `Plans/Assistant_Plan_Runtime.md` | `handlers::assistant_plan::plan_build_with_crew` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCrewBuildRequest` -> `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanBuildResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.plan.schedule_build` | `Plans/Scheduling_and_Quota_Resume.md` | `handlers::scheduling::plan_schedule_build` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/AssistantPlanScheduleRequest` -> `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionScheduleResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.plan.cancel` | `Plans/Assistant_Plan_Runtime.md` | `handlers::assistant_plan::plan_cancel` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCancelRequest` -> `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCancelResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.plan.export` | `Plans/Assistant_Plan_Runtime.md` | `handlers::assistant_plan::plan_export` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanExportRequest` -> `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/ArtifactExportResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.plan.send_to_planning_wizard` | `Plans/Planning_Wizard.md` | `handlers::planning_wizard::assistant_plan_intake` | `Plans/planning_wizard_contracts.schema.json#/$defs/AssistantPlanHandoffRequest` -> `Plans/planning_wizard_contracts.schema.json#/$defs/PlanningWizardIntakeResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.plan.open_details` | `Plans/Assistant_Plan_Runtime.md` | `handlers::assistant_plan::plan_open_details` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanRoute` -> `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.todos.open` | `Plans/ToDo_Runtime.md` | `handlers::todo_runtime::todos_open` | `Plans/todo_runtime_contracts.schema.json#/$defs/TodoRoute` -> `Plans/todo_runtime_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.todos.toggle_parent` | `Plans/ToDo_Runtime.md` | `handlers::todo_runtime::todos_toggle_parent` | `Plans/todo_runtime_contracts.schema.json#/$defs/TodoViewRequest` -> `Plans/todo_runtime_contracts.schema.json#/$defs/TodoViewResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.todos.open_work` | `Plans/ToDo_Runtime.md` | `handlers::todo_runtime::todos_open_work` | `Plans/todo_runtime_contracts.schema.json#/$defs/TodoWorkRoute` -> `Plans/todo_runtime_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.collaboration.configure` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::configure` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.collaboration.start` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::start` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.collaboration.pause` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::pause` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.collaboration.resume` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::resume` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.collaboration.cancel` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::cancel` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.collaboration.message` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::message` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.collaboration.open` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::open` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationOpenRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationOpenResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.collaboration.participant.open` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::participant_open` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationParticipantOpenRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationParticipantOpenResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.collaboration.export` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::export` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.collaboration.reconfigure` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::reconfigure` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.brainstorm.next_round` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::brainstorm_next_round` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.brainstorm.synthesize_plan` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::brainstorm_synthesize_plan` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormSynthesisRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/AssistantPlanCreateResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.review.create_todos` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::review_create_todos` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.review.send_findings_to_agent` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::review_send_findings_to_agent` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewSendFindingsRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.review.run_again` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::review_run_again` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewRunAgainRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat_room.next_round` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::chat_room_next_round` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat_room.summarize` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::chat_room_summarize` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomSummarizeRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/ArtifactResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat_room.promote_to_plan` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::chat_room_promote_to_plan` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat_room.promote_to_todo` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::chat_room_promote_to_todo` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat_room.promote_to_goal` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::chat_room_promote_to_goal` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.crew_auto.set` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::crew_auto_set` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetRequest` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.crew_auto.open_config` | `Plans/Collaborative_Workflows.md` | `handlers::collaboration::crew_auto_open_config` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoConfigRoute` -> `Plans/collaborative_workflows_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.bsd.set` | `Plans/Back_Seat_Driver.md` | `handlers::back_seat_driver::set_mode` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BackSeatDriverModeSetRequest` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/BackSeatDriverModeSetResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.bsd.configure` | `Plans/Back_Seat_Driver.md` | `handlers::bsd::configure` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDPolicyUpdateRequest` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDPolicyUpdateResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.bsd.workflow.configure` | `Plans/Back_Seat_Driver.md` | `handlers::bsd::workflow_configure` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDWorkflowBindingRequest` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDWorkflowBindingResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.bsd.assignment.pause` | `Plans/Back_Seat_Driver.md` | `handlers::bsd::assignment_pause` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDAssignmentControlRequest` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDAssignmentControlResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.bsd.assignment.resume` | `Plans/Back_Seat_Driver.md` | `handlers::bsd::assignment_resume` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDAssignmentControlRequest` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDAssignmentControlResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.bsd.assignment.retry` | `Plans/Back_Seat_Driver.md` | `handlers::bsd::assignment_retry` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDAssignmentRetryRequest` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDAssignmentRetryResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.bsd.assignment.stop` | `Plans/Back_Seat_Driver.md` | `handlers::bsd::assignment_stop` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDAssignmentControlRequest` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDAssignmentControlResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.bsd.finding.open` | `Plans/Back_Seat_Driver.md` | `handlers::bsd::finding_open` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDFindingRoute` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.bsd.open_usage` | `Plans/Back_Seat_Driver.md` | `handlers::bsd::open_usage` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDUsageRoute` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.bsd.open_transcript` | `Plans/Back_Seat_Driver.md` | `handlers::bsd::open_transcript` | `Plans/back_seat_driver_contracts.schema.json#/$defs/BSDTranscriptRoute` -> `Plans/back_seat_driver_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.attachment.add` | `Plans/FileManager.md` | `handlers::chat_attachments::attachment_add` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentAddRequest` -> `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentAddResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.attachment.remove` | `Plans/FileManager.md` | `handlers::chat_attachments::attachment_remove` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentRemoveRequest` -> `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentRemoveResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.attachment.retry` | `Plans/FileManager.md` | `handlers::chat_attachments::attachment_retry` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentRetryRequest` -> `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentRetryResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.attachment.open` | `Plans/FileManager.md` | `handlers::chat_attachments::attachment_open` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentOpenRequest` -> `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentOpenResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.attachment.download` | `Plans/FileManager.md` | `handlers::chat_attachments::attachment_download` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentDownloadRequest` -> `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentDownloadResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.attachment.details` | `Plans/FileManager.md` | `handlers::chat_attachments::attachment_details` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentDetailsRequest` -> `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentDetailsResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.attachment.freeze_reference` | `Plans/FileManager.md` | `handlers::chat_attachments::attachment_freeze_reference` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentFreeze_ReferenceRequest` -> `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentFreeze_ReferenceResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.attachment.save_to_project` | `Plans/FileManager.md` | `handlers::chat_attachments::attachment_save_to_project` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentSave_To_ProjectRequest` -> `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentSave_To_ProjectResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.composer.destination.set` | `Plans/assistant-chat-design.md` | `handlers::assistant_chat::composer_destination_set` | `Plans/assistant_chat_contracts.schema.json#/$defs/ComposerDestinationSetRequest` -> `Plans/assistant_chat_contracts.schema.json#/$defs/ComposerDestinationSetResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.composer.destination.clear` | `Plans/assistant-chat-design.md` | `handlers::assistant_chat::composer_destination_clear` | `Plans/assistant_chat_contracts.schema.json#/$defs/ComposerDestinationClearRequest` -> `Plans/assistant_chat_contracts.schema.json#/$defs/ComposerDestinationClearResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.schedule_message` | `Plans/Scheduling_and_Quota_Resume.md` | `handlers::scheduling::schedule_message` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCreateRequest` -> `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCreateResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.schedule_message.update` | `Plans/Scheduling_and_Quota_Resume.md` | `handlers::scheduling::schedule_message_update` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageUpdateRequest` -> `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageUpdateResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.schedule_message.cancel` | `Plans/Scheduling_and_Quota_Resume.md` | `handlers::scheduling::schedule_message_cancel` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCancelRequest` -> `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCancelResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.execution_window.create` | `Plans/Scheduling_and_Quota_Resume.md` | `handlers::scheduling::execution_window_create` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowCreateRequest` -> `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowCreateResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.execution_window.update` | `Plans/Scheduling_and_Quota_Resume.md` | `handlers::scheduling::execution_window_update` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowUpdateRequest` -> `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowUpdateResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.execution_window.cancel` | `Plans/Scheduling_and_Quota_Resume.md` | `handlers::scheduling::execution_window_cancel` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowCancelRequest` -> `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowCancelResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.runtime.quota_resume.set` | `Plans/Scheduling_and_Quota_Resume.md` | `handlers::scheduling::quota_resume_set` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/QuotaResumeConsentRequest` -> `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/QuotaResumeConsentResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.thread.regenerate_title` | `Plans/assistant-chat-design.md` | `handlers::assistant_chat::thread_regenerate_title` | `Plans/assistant_chat_contracts.schema.json#/$defs/ThreadTitleRegenerateRequest` -> `Plans/assistant_chat_contracts.schema.json#/$defs/ThreadTitleGenerationResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.teach.capture` | `Plans/assistant-memory-subsystem.md` | `handlers::assistant_memory::teach_capture` | `Plans/assistant_memory_contracts.schema.json#/$defs/TeachCaptureRequest` -> `Plans/assistant_memory_contracts.schema.json#/$defs/TeachCaptureResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.teach.confirm` | `Plans/assistant-memory-subsystem.md` | `handlers::assistant_memory::teach_confirm` | `Plans/assistant_memory_contracts.schema.json#/$defs/TeachConfirmRequest` -> `Plans/assistant_memory_contracts.schema.json#/$defs/TeachConfirmResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.teach.cancel` | `Plans/assistant-memory-subsystem.md` | `handlers::assistant_memory::teach_cancel` | `Plans/assistant_memory_contracts.schema.json#/$defs/TeachCancelRequest` -> `Plans/assistant_memory_contracts.schema.json#/$defs/TeachCancelResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.chat.teach.open_memory` | `Plans/assistant-memory-subsystem.md` | `handlers::assistant_memory::teach_open_memory` | `Plans/assistant_memory_contracts.schema.json#/$defs/MemoryRoute` -> `Plans/assistant_memory_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |
| `cmd.chat.eli5.set` | `Plans/assistant-chat-design.md` | `handlers::assistant_chat::eli5_set` | `Plans/assistant_chat_contracts.schema.json#/$defs/ELI5ThreadOverrideRequest` -> `Plans/assistant_chat_contracts.schema.json#/$defs/ELI5ThreadOverrideResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.browser.capture.full_to_chat` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `handlers::browser_runtime::capture_full_to_chat` | `Plans/browser_capture_contracts.schema.json#/$defs/BrowserCaptureFullRequest` -> `Plans/browser_capture_contracts.schema.json#/$defs/BrowserCaptureResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.browser.capture.region_to_chat` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `handlers::browser_runtime::capture_region_to_chat` | `Plans/browser_capture_contracts.schema.json#/$defs/BrowserCaptureRegionRequest` -> `Plans/browser_capture_contracts.schema.json#/$defs/BrowserCaptureResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.browser.component.pick` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `handlers::browser_runtime::component_pick` | `Plans/browser_capture_contracts.schema.json#/$defs/BrowserComponentPickRequest` -> `Plans/browser_capture_contracts.schema.json#/$defs/BrowserComponentPickResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.browser.component.send_now` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `handlers::browser_runtime::component_send_now` | `Plans/browser_capture_contracts.schema.json#/$defs/BrowserComponentSendRequest` -> `Plans/browser_capture_contracts.schema.json#/$defs/MessageAdmissionResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.browser.component.add_to_composer` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `handlers::browser_runtime::component_add_to_composer` | `Plans/browser_capture_contracts.schema.json#/$defs/BrowserComponentComposerRequest` -> `Plans/browser_capture_contracts.schema.json#/$defs/ComposerBufferResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.browser.component.insert_at_cursor` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `handlers::browser_runtime::component_insert_at_cursor` | `Plans/browser_capture_contracts.schema.json#/$defs/BrowserComponentComposerRequest` -> `Plans/browser_capture_contracts.schema.json#/$defs/ComposerBufferResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.browser.component.mode.set_default` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `handlers::browser_runtime::component_mode_set_default` | `Plans/browser_capture_contracts.schema.json#/$defs/BrowserComponentModeRequest` -> `Plans/browser_capture_contracts.schema.json#/$defs/SettingsTransactionResult` | `handler_unavailable`; owner typed result, receipt and projection only; expected_event_types resolved by the owner event table below |
| `cmd.browser.devtools.open` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `handlers::browser_runtime::devtools_open` | `Plans/browser_capture_contracts.schema.json#/$defs/BrowserDevToolsOpenRequest` -> `Plans/browser_capture_contracts.schema.json#/$defs/RouteResult` | `handler_unavailable`; owner typed result, receipt and projection only; `expected_event_types=[]` |

The eleven contract schema documents named above are owner-authored artifacts that must exist and validate before any row leaves `handler_unavailable`. Naming them here does not create them and does not admit a storage key or an EventRecord.

### Typed error vocabulary

Every command in this wave returns one of the shared owner error kinds: `invalid_request`, `owner_unavailable`, `command_not_registered`, `permission_denied`, `stale_revision`, `stale_currentness`, `target_not_found`, `precondition_failed`, `idempotency_conflict`, `quota_exhausted`, `manual_stop_latched`, or `cancelled`. A failure stays a failure: it never advances a Goal, Plan, To-Do, workflow, BSD assignment, or schedule, and never returns a success-shaped receipt. `manual_stop_latched` is terminal against every scheduled or quota-driven auto-resume path and can only be cleared by an explicit user action.

### Semantic event candidates requiring Event Authority adjudication

The redesign proposes sixty-seven semantic event names. None of them is registered. No owner may emit any of them until the central EventRecord catalog admits the name and its payload schema, and until then the owning command records only its typed result, receipt, and projection.

| Proposed owner | Event names | Authority status |
|---|---|---|
| `Plans/Goal_Runtime_System.md` | `goal.created`, `goal.updated`, `goal.paused`, `goal.resumed`, `goal.blocked`, `goal.completed`, `goal.cancelled`, `goal.continuation_evaluated` | `requires_central_adjudication` |
| `Plans/Assistant_Plan_Runtime.md` | `assistant_plan.created`, `assistant_plan.version_created`, `assistant_plan.build_started`, `assistant_plan.completed`, `assistant_plan.cancelled`, `assistant_plan.exported`, `assistant_plan.wizard_handoff_created`, `assistant_plan.schedule_invalidated` | `requires_central_adjudication` |
| `Plans/ToDo_Runtime.md` | `todo.created`, `todo.updated`, `todo.work_bound`, `todo.status_changed`, `todo.dependency_changed`, `todo.reordered`, `todo.removed_from_current_list` | `requires_central_adjudication` |
| `Plans/Collaborative_Workflows.md` | `collaboration.created`, `collaboration.started`, `collaboration.paused`, `collaboration.resumed`, `collaboration.cancelled`, `collaboration.completed`, `collaboration.participant_started`, `collaboration.participant_completed`, `collaboration.message_added`, `collaboration.artifact_added`, `collaboration.configuration_changed`, `brainstorm.proposal_added`, `brainstorm.vote_added`, `brainstorm.plan_synthesized`, `review.finding_added`, `review.finding_dispositioned`, `review.artifact_finalized` | `requires_central_adjudication` |
| `Plans/Back_Seat_Driver.md` | `bsd.policy_changed`, `bsd.workflow_binding_created`, `bsd.assignment_started`, `bsd.assignment_paused`, `bsd.assignment_resumed`, `bsd.assignment_stopped`, `bsd.review_started`, `bsd.finding_held`, `bsd.finding_reconfirmed`, `bsd.finding_cleared`, `bsd.advice_emitted`, `bsd.finding_suppressed`, `bsd.review_failed`, `bsd.review_timed_out`, `bsd.output_quarantined` | `requires_central_adjudication` |
| `Plans/Scheduling_and_Quota_Resume.md` | `scheduled_dispatch.created`, `scheduled_dispatch.updated`, `scheduled_dispatch.cancelled`, `scheduled_dispatch.dispatched`, `scheduled_dispatch.held`, `scheduled_dispatch.failed`, `execution_window.created`, `execution_window.updated`, `execution_window.invalidated`, `runtime.quota_wait_started`, `runtime.quota_resume_consent_changed`, `runtime.quota_resume_attempted` | `requires_central_adjudication` |

### Runtime record families requiring central storage adjudication

The redesign proposes the following runtime record families. Each names a payload-semantics owner. Storage owns physical binding, replay, retention, indexes, and projector checkpoints, and no writer is admitted until `Plans/storage-plan.md` and the Contracts owner register the family.

| Record schema_id | Payload-semantics owner | Registration status |
|---|---|---|
| `pm.chat.composer_buffer.v1` | `Plans/storage-plan.md` | `required` |
| `pm.chat.composer_destination.v1` | `Plans/assistant-chat-design.md` | `required` |
| `pm.chat.scheduled_message_snapshot.v1` | `Plans/Scheduling_and_Quota_Resume.md` | `required` |
| `pm.chat.attachment_ref.v2` | `Plans/FileManager.md` | `required` |
| `pm.chat.attachment_materialization.v1` | `Plans/Prompt_Pipeline.md` | `required` |
| `pm.goal.record.v2` | `Plans/Goal_Runtime_System.md` | `required` |
| `pm.goal.revision.v2` | `Plans/Goal_Runtime_System.md` | `required` |
| `pm.goal.continuation.v2` | `Plans/Goal_Runtime_System.md` | `required` |
| `pm.assistant_plan.record.v1` | `Plans/Assistant_Plan_Runtime.md` | `required` |
| `pm.assistant_plan.document_revision.v1` | `Plans/Assistant_Plan_Runtime.md` | `required` |
| `pm.assistant_plan.deep_ledger_session.v1` | `Plans/Planning_Ledger_System.md` | `required` |
| `pm.assistant_plan.planunit_bundle.v1` | `Plans/Plan_Document_System.md` | `required` |
| `pm.assistant_plan.run.v1` | `Plans/Assistant_Plan_Runtime.md` | `required` |
| `pm.assistant_plan.adherence.v1` | `Plans/Assistant_Plan_Runtime.md` | `required` |
| `pm.chat.todo_item.v2` | `Plans/ToDo_Runtime.md` | `required` |
| `pm.chat.todo_work_binding.v1` | `Plans/ToDo_Runtime.md` | `required` |
| `pm.chat.todo_transition.v1` | `Plans/ToDo_Runtime.md` | `required` |
| `pm.collaboration.definition.v1` | `Plans/Collaborative_Workflows.md` | `required` |
| `pm.collaboration.participant_spec.v1` | `Plans/Collaborative_Workflows.md` | `required` |
| `pm.collaboration.run.v1` | `Plans/Collaborative_Workflows.md` | `required` |
| `pm.collaboration.message.v1` | `Plans/Collaborative_Workflows.md` | `required` |
| `pm.brainstorm.question_bank.v1` | `Plans/Collaborative_Workflows.md` | `required` |
| `pm.brainstorm.proposal.v1` | `Plans/Collaborative_Workflows.md` | `required` |
| `pm.brainstorm.vote.v1` | `Plans/Collaborative_Workflows.md` | `required` |
| `pm.review.target_pack.v1` | `Plans/Collaborative_Workflows.md` | `required` |
| `pm.review.finding.v1` | `Plans/Collaborative_Workflows.md` | `required` |
| `pm.research.capability_provisioning.v1` | `Plans/Shared_Integration_Runtime.md` | `required` |
| `pm.bsd.policy.v1` | `Plans/Back_Seat_Driver.md` | `required` |
| `pm.bsd.workflow_binding.v1` | `Plans/Back_Seat_Driver.md` | `required` |
| `pm.bsd.assignment.v1` | `Plans/Back_Seat_Driver.md` | `required` |
| `pm.bsd.review_cycle.v1` | `Plans/Back_Seat_Driver.md` | `required` |
| `pm.bsd.finding.v1` | `Plans/Back_Seat_Driver.md` | `required` |
| `pm.bsd.quarantine.v1` | `Plans/Back_Seat_Driver.md` | `required` |
| `pm.execution.schedule.v1` | `Plans/Scheduling_and_Quota_Resume.md` | `required` |
| `pm.runtime.quota_resume_consent.v1` | `Plans/Scheduling_and_Quota_Resume.md` | `required` |
| `pm.browser.element_context.v1` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `required` |
| `pm.browser.component_instruction_item.v1` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `required` |
| `pm.chat.thread_title_policy.v1` | `Plans/Settings_System.md` | `required` |
| `pm.chat.thread_title_generation.v1` | `Plans/Models_System.md` | `required` |

### CS-078 - Assistant Redesign Central Contract, Event, And Record Registration

```yaml
plan_unit_id: CS-078
unit_type: command_registry
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The Puppet Master Assistant redesign registers eighty-four exact command contracts across eleven owner documents, each with one typed request, one typed result, and one sole future handler, plus a shared typed error vocabulary of invalid_request, owner_unavailable, command_not_registered, permission_denied, stale_revision, stale_currentness, target_not_found, precondition_failed, idempotency_conflict, quota_exhausted, manual_stop_latched, and cancelled. cmd.chat.goal.start, cmd.chat.goal.update, and cmd.bsd.set are pre-existing registrations whose contracts are revised in place with no peer row and no second handler. Sixty-seven semantic event names and thirty-nine runtime record families are proposed and remain requires_central_adjudication; no owner may emit an event or admit a storage writer until Event Authority and storage registration close for that name. Every route stays handler_unavailable, and a typed contract plus a catalog row plus a production-intent wiring row prove design closure and prove nothing about a native dispatcher, handler execution, rendered control, receipt, storage write, or runtime readiness.
gui_related: true
gui_classification_reason: Every registered command has named GUI consumers whose availability and disabled reason depend on these contracts.
depends_on: [CS-077, UCC-156]
unblocks: []
acceptance_criteria:
  - All eighty-four commands carry one owner, one typed request, one typed result, and one sole future handler.
  - The three pre-existing IDs are revised in place with no duplicate registration or handler.
  - A failure never advances a Goal, Plan, To-Do, workflow, BSD assignment, or schedule and never returns a success-shaped receipt.
  - manual_stop_latched is terminal against every scheduled or quota-driven auto-resume path.
  - All sixty-seven events and thirty-nine record families remain unregistered until central adjudication closes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: unregistered_emission_or_simulated_command_success
reasoning_tier: high
context_scope: assistant_redesign_central_registration
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/storage-plan.md
node_compile_hint:
  mode: static_central_command_registration_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:machine/commands.json
  - pm-assistant-implementation-2026-09-02-recovered:machine/events.json
  - pm-assistant-implementation-2026-09-02-recovered:machine/runtime_records.json
  - pm-assistant-implementation-2026-09-02-recovered:DRY-003
preserved_exact_tokens:
  - "handler_unavailable"
  - "command_not_registered"
  - "requires_central_adjudication"
  - "manual_stop_latched"
negative_constraints:
  - Do not emit a proposed event before Event Authority admits its name and payload schema.
  - Do not admit a storage writer before the record family is registered.
  - Do not return a success-shaped receipt for a failed command.
owner_hints:
  - Plans/Commands_System.md
```

## Additive Correction v4 — Branch-Current Command Census And Dispositions (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`CDRY-001..013`) to this owner.
The correction is additive to the implemented v2 branch and mints **no new user command**.

### CDRY-001 — The census that preceded these dispositions

The correction packet's proposed IDs were treated as proposals, not as implementation truth. A
census of the branch-current registers (`Plans/UI_Command_Catalog.md`, this document, and
`Plans/Wiring_Matrix.production.json`) was run first, on 2026-09-03, and every command the
correction touches already existed:

| Command | Census result | Disposition |
|---|---|---|
| `cmd.chat.plan.build` | present, one handler `handlers::assistant_plan::plan_build` | revise: add `execution_topology: agent \| goal_driven` (`PGOAL-002`) |
| `cmd.chat.plan.build_with_crew` | present, one handler `handlers::assistant_plan::plan_build_with_crew` | retain atomic contract; add currentness and participant semantics |
| `cmd.chat.plan.schedule_build` | present, one handler `handlers::scheduling::plan_schedule_build` | revise: `execution_topology`, frozen Crew definition, first-dispatch admission |
| `cmd.chat.plan.export` | present, one handler `handlers::assistant_plan::plan_export` | revise: add `content_kind: plan_document \| execution_report` |
| `cmd.chat.plan.view.set` | present, classified `shell_view` | keep as view state; emits no Plan event |
| `cmd.chat.plan.open_details` | present, classified `navigation_wrapper` | keep; owns no details data |
| `cmd.chat.goal.pause/resume/cancel/update` | present, `handlers::goal_runtime::*` | revise for a bound `PlanRun` |
| `cmd.collaboration.configure` | present | preview only; no run, provider, Usage, event, card, install, or settings effect (`MODAL-003`) |
| `cmd.collaboration.start` | present | idempotent admission; freeze targets at Start |
| `cmd.collaboration.reconfigure` | present | extend for retry, replacement, waiver, coordinator/moderator replacement (`PART-005`) |
| `cmd.chat.crew_auto.set` | present | commit the checkmark only after a Settings transaction |
| `cmd.chat.schedule_message[.update\|.cancel]` | all three present | revise for projection, currentness, and preserved history |
| `cmd.chat.attachment.add` | present, one handler `handlers::chat_attachments::attachment_add` | revise: `semantic_kind: file \| folder` |
| `cmd.chat.add_file_reference` | present, signature-locked | file-only compatibility alias; rejects a folder |
| `cmd.browser.component.send_now / .add_to_composer / .insert_at_cursor / .pick` | all four present | revise for revalidation; `pick` is the recapture flow (`BSTALE-004`) |
| `cmd.chat.todos.toggle_parent` | present, classified `shell_view` | local or shared view state only |

`FOLDER-003` is the negative half of that census: no `cmd.chat.add_folder_reference`
and no folder-specific handler, event, or storage family exists, and a census of the
branch found no independent folder effect.

Absent, and deliberately **not** created: `cmd.chat.plan.build_as_goal`,
`cmd.chat.plan.export_report`, `cmd.chat.plan.progress.set`, `cmd.chat.add_folder_reference`,
`cmd.browser.component.recapture`, and any per-number question-limit command. A census of the
branch found no independent folder effect and no second progress authority; nothing in this
correction justifies minting one.

### CDRY-002..005 — The four reuse rules

Plan progress is a derived projection. No user command and no model tool sets it; the internal
projector action is `internal.plan_progress.recompute`.

The seven question values (six bases plus the Grill Me extension) are ordinary project Settings
written through the generic Settings transaction. No per-number command handler is created.

`Build as Goal` is `cmd.chat.plan.build` with `execution_topology: goal_driven`. `Build With
Crew` keeps its specialised atomic command so that `PlanRun` and `CrewRun` commit together;
decomposing it into `cmd.collaboration.start` followed by `cmd.chat.plan.build` would create a
race and is prohibited.

Plan export reuses `cmd.chat.plan.export` with `content_kind` alongside the existing format
discriminator, so one export owner produces two distinct artifacts.

### CDRY-006 — What stays view state

Modal open and close, the Plan Rich/Markdown toggle, card expand and collapse, hover, local tabs,
and To-Do parent expansion use local or shared view-state primitives and emit no domain event. A
persisted preference uses the shared UI state owner. No domain command is registered for a visual
action, and `local.workflow_modal.close`, `local.plan_card.expand`, and `local.plan_view.toggle`
are local view actions rather than catalog rows.

### CDRY-007..009 — Family reuse

Collaboration start, reconfigure, pause, resume, cancel, message, and export reuse the shared
`cmd.collaboration.*` family. A kind-specific command exists only where the semantics genuinely
differ; thin aliases normalise to one handler and one effect, and four duplicate runtimes are
never built.

Scheduled-message projection reuses the existing create, update, and cancel commands. Card
actions map onto those commands. Dispatch is `internal.scheduler.dispatch_scheduled_message`, an
internal scheduler action with its own idempotency domain — not a second user command, and not a
state-set command.

Folder add reuses `cmd.chat.attachment.add`. Browser stale currentness returns a typed result or
error through the existing component send and pick commands rather than forking attachment or
browser ownership.

### CDRY-010..011 — Contract obligations for every changed command

Each new or changed mutating command carries a typed request, result, and error enumeration, an
availability predicate, expected revision and currentness, a permission snapshot, an idempotency
key, exactly one handler, and a declared effect disposition. Unknown state and unknown errors
fail closed; success is never inferred from a dismissed modal or an accepted dispatch.

Every durable effect has either a centrally admitted `EventRecord` payload authority or an
explicit receipt-only / no-event disposition recorded before implementation-ready status. A
proposed event list is not a registration, and no owner document emits an unregistered event
name.

### CDRY-012..013 — Wiring and the Settings boundary

Production wiring covers the full path for every correction surface: GUI or internal producer →
command or intent → sole handler → owner record, event, or receipt → projector → every GUI
consumer, including the failure and recovery paths. Reverse coverage is required so an orphan
control or an invisible effect is detectable; validating command-to-handler rows alone is
insufficient.

Settings remains the owner of the shell, the inventory, project-scoped values, transactions,
defaults, and manager routing. Domain runtimes own their own records and operations. A manager
action routes to its owner, and participant, run, and schedule truth is never stored as a
settings value.
