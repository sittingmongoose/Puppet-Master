# Project System

> **Authority:** This document is the sole canonical owner of the Puppet Master `Project` aggregate, immutable `project_id`, Project registry semantics, registration lifecycle, human metadata, archive/list removal, active-Project selection, and Project-list projections. It consumes, and does not duplicate, Settings, Project Sync and Backbone, Server/Vault/topology, Source Control, Backup/Restore, FileSafe, Permissions, shell layout, or storage-engine behavior.

## 1. Product boundary

A Project is the stable user-facing container that gives Project-scoped Plans, threads, settings, files, source-control bindings, runtime work, evidence, and shell state one immutable join identity. A Project is not a path, repository, worktree, Vault, checkout, Server, Execution Host, environment, source location, plan, or backup. Those objects retain their own owners and identities.

Project System owns:

- issuing and preserving immutable `project_id`;
- the `ProjectRecord` aggregate and registry revision;
- registration from create, existing local content, ordinary Git clone, Jujutsu clone, forge creation, SSH/server-hosted source, or verified restore result, while preserving the distinct `git_clone` and `jujutsu_clone` registration kinds;
- display name, lifecycle, last-opened metadata, bounded source summary refs, and active-Project selection;
- reversible archive, list-only removal, re-registration, and exact distinction from data deletion;
- Project list/search/recent projections and route/open behavior;
- migration from path-keyed or singleton legacy project entries.

It does not own:

- ordinary Project Settings values or their copy/import/reset/migration (`Plans/Settings_System.md`);
- Project/Vault content sync, move, source relocation, Sync bundles, or currentness (`Plans/Project_Sync_and_Backbone.md`);
- physical Vault, Home Server, Host/Environment, route, trust, endpoint identity, or standalone/container execution form;
- Git/Jujutsu/forge/branch/worktree operations;
- Project backup, Full Server Backup, restore execution, secret envelopes, or recovery engines;
- file mutation/deletion, FileSafe, permission decisions, retention/holds/compaction, or storage mechanics;
- per-Project shell/panel state (`project_state:v1:{project_id}`), Orchestrator projections, or operational health rollups;
- Named Plan, PRD, PlanningRun, PlanCompileRun, Goal, or runtime lifecycle.

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/Project_Sync_and_Backbone.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Named_Plan_System.md

## 2. Typed Project aggregate

`Plans/project_system_contracts.schema.json` closes `ProjectRecord`, `ProjectActionRequest`, `ProjectActionResult`, exact caller-return context, and `ProjectMigrationReceipt`. `project_id` is immutable, opaque, never derived from a mutable path, display name, repository URL, or Server address, and never reused after data deletion. Rename changes only `display_name`. Moving content, changing a worktree, reconnecting a Server, restoring as new, or switching source location cannot silently change Project identity. `git_clone` and `jujutsu_clone` are separate registration kinds; a generic `clone` kind is forbidden.

The registry lifecycle is:

`registering -> listed <-> archived -> removed_from_list`

`registering -> registration_failed` is allowed. `registration_failed -> registering` requires an explicit retry with the same idempotency binding or a new request. `removed_from_list -> registering` is re-registration and may recover the same `project_id` only through a verified stable config reference or migration alias; path equality alone is insufficient. Data deletion is an external Storage-owned operation. While deletion is requested or blocked, the Project projection may show `data_deletion_pending` or `data_deletion_blocked`, but Project System does not execute or certify deletion.

`ProjectRecord` contains only Project identity and registry metadata: immutable ID, display name, lifecycle, registration kind, stable config ref, Project Home Server/Vault/source/repository refs when known, created/updated/last-opened timestamps, revision, currentness hash, bounded warning codes, and migration lineage. It does not embed Settings values, file trees, Git state, sync manifests, backup payloads, credentials, active agents, runtime health, or shell layout.

Registration is transactional. Candidate inspection may discover metadata, but a Project is not visible as `listed` until identity, stable config ref, minimum permission/FileSafe checks, and owner handoff refs are committed together. Failure leaves no half-registered row. A temporary mount remains temporary until explicitly promoted. A restore owner returns either `restore_same_project` with verified identity or `restore_as_new`; the latter receives a new `project_id`.

## 3. Actions, commands, and results

The existing command catalog remains command-ID authority. Project System consumes these exact registered commands where their current payloads normalize to `ProjectActionRequest`:

| Command | Project semantic action | Required identity/result rule |
|---|---|---|
| `cmd.project.add_existing` | Register verified existing local/SSH content | Returns one `project_id` only after atomic registration; no half-row on failure. |
| `cmd.project.new_local` | Create and register a local Project | File creation remains owner-routed; Project result binds the created stable config ref. |
| `cmd.project.new_github_repo` | Request forge/repository creation and register resulting Project | Git/forge/clone remain Source Control/GitHub-owned; failure does not fabricate Project success. |
| `cmd.project.open` | Select/open an existing Project by `project_id` | Navigation only; cannot mutate Project content or runtime work. |
| `cmd.project.archive` | Reversibly archive a listed Project | Never deletes working tree, Vault, backups, settings, plans, or evidence. |
| `cmd.project.remove` | Remove the Project from the visible list | List-only; never a data deletion. |
| `cmd.project.refresh` | Refresh registry/list projections | Cached-first; cannot rewrite Project identity from path discovery. |
| `cmd.project.open_settings` | Route to Project-bound Settings | Settings owns values and mutation. |
| `cmd.project.delete_data` | Route a separately confirmed Storage-owned purge intent | Strong confirmation/holds/retention stay Storage-owned; it is not an alias of remove. |

The exact owner-local typed UI action `ui.project.restore_archived` restores an archived row to `listed`. It is not yet a central command registration; the command catalog owner must register one command or explicitly normalize an existing action before runtime wiring. All requests carry the expected Project-registry revision and currentness hash; existing-Project actions also carry the expected Project revision and currentness hash. Mutating requests carry `project_id` when one exists, actor, permission snapshot, FileSafe evidence where applicable, idempotency key, initiating surface, and one closed exact return context containing caller surface, route, focus, invocation token, caller-context ref, expected caller revision, and continuation generation. A terminal result echoes that return context byte-for-byte. Caller close, Back, Skip, route change, or Client disconnect does not cancel dispatched owner work; an actual owner cancellation returns `outcome=cancelled`, preserves the exact return context, and leaves no half-listed row. Duplicate idempotency bindings return the original result; same key with different binding fails.

### 3.1 Product Onboarding First Project routing

Product Onboarding launches owner flows; it does not gain a Project wrapper command. The exact mappings are:

| Onboarding choice | Owner command and Project handoff |
|---|---|
| `create_project` | `cmd.project.new_local`. |
| `open_detected_project` | `cmd.project.open` only for an already registered, current `project_id`; otherwise `cmd.project.add_existing` after verified inspection. |
| existing local content | `cmd.project.add_existing` with a stable Source Location and inspection receipt; never a raw path as identity. |
| `clone_project` | Source Control executes `cmd.source_control.repository.clone` with `scm_backend=git`; only its terminal receipt and identities may feed `cmd.project.add_existing {registration_kind=git_clone}`. |
| `jj_project` | Jujutsu executes the distinct `cmd.jujutsu.git.clone`; only its terminal receipt and identities may feed `cmd.project.add_existing {registration_kind=jujutsu_clone}`. It never normalizes to the ordinary Git clone. |
| `ssh_project` or server-hosted content | Server/Remote Access verifies Server, route/trust, Source Location, and current connection first; `cmd.project.add_existing {registration_kind=ssh_remote}` registers those stable refs and owner receipts. Opening after registration is `cmd.project.open`. No `cmd.project.ssh.*` alias exists. |
| `restore_project` | Backup/Restore owns `cmd.restore.preview` and the restore execution. Project System accepts only a verified terminal restore result through `cmd.project.add_existing {registration_kind=restore_same_project|restore_as_new}`; it does not accept a preview as registration success. |

Standalone versus containerized Server execution is not Project registration semantics. Project System records the selected Project Home Server reference but does not choose, create, or certify a standalone/container execution form; that residual stays with Server/Deployment owners and their central commands.

### 3.2 Project-context Backup and Restore routes

The Projects page, Project card, Project details, and Project-bound Settings may expose the following contextual actions, but each action routes directly to the Backup/Restore owner contract in `Plans/Backup_Restore_System.md`. Project System defines no private backup, snapshot, repository, browse, download, export, or restore handler and never treats dispatch acceptance, a preview, or a browse result as Project registration.

| Visible Project action | Backup/Restore route | Project consumer rule |
|---|---|---|
| `Back Up Project` | `cmd.backup.project.create` | Bind the current immutable `project_id` as the one-element `target_project_ids`, plus the exact Home Server, destination, policy revision, Project/registry currentness, initiating surface, and return context. Backup/Restore owns capture, repository bytes, encryption, upload, verification, receipt, cancellation, and retry. |
| `Restore as New` | `cmd.restore.preview {restore_mode=as_new}` followed, after a current accepted preview and required approval/recovery receipts, by `cmd.restore.project_as_new` | Project System allocates/reserves a fresh never-reused `project_id` for the target registration intent. It lists that Project only after the verified terminal restore receipt is accepted through `cmd.project.add_existing {registration_kind=restore_as_new}`. The new Project retains explicit source-Project and backup/manifest lineage; external forge host/account/repository identity remains external, is not renamed or rewritten to the new PM identity, and must be revalidated by Source Control/forge owners before use. No recovered execution lease, live request ID, push, pipeline, or automation is activated by registration. |
| `Backup history` | `cmd.backup.open_history` | Open the Backup-owned history projection with the exact Project and Server filter plus caller return route/focus. It does not create a Project-owned history model. |
| Open snapshot | `cmd.backup.browse` | After an explicit history selection, bind the exact `backup_id` and preserve `repository_id`, immutable `snapshot_id`, `capture_set_id`, Project filter, selected path/filter, initiating Client, currentness, and caller focus in the Backup-owned browse/route projection. Refresh or stale recovery never substitutes `latest` or a different snapshot. |

Every forward route and terminal reverse route preserves the initiating Project row/card identity, immutable `project_id`, repository/snapshot/capture-set selection when present, filter, focus target, invocation/continuation identity, initiating Client, expected caller revision, and Backup currentness. Back, close, Client disconnect, or navigation does not fabricate cancellation or success. Browse, history, compare, download, extract, export, and archive retrieval are non-restore operations: they neither mutate nor select the active Project, activate restored content, resume work, or execute content.

These Project consumer routes use the Backup/Restore owner request/result/error/availability family and owner receipts or `ObservableWork` where applicable. They imply no Project or Backup `EventRecord`; `expected_event_types=[]` remains mandatory until Event Authority separately admits an exact family. All future Backup handlers remain `handler_unavailable` without source-hashed native evidence. Plan prose, command names, schemas, fixtures, route targets, and static wiring are future contract truth only, not proof of executable backup/restore, GUI implementation, persistence, provider readiness, or recovery safety.

ContractRef: ContractName:Plans/Backup_Restore_System.md#BRS-006, ContractName:Plans/Backup_Restore_System.md#BRS-014, ContractName:Plans/Backup_Restore_System.md#BRS-016, SchemaID:pm.backup_restore_system.contracts.v2, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Forge_Integrations.md

Typed errors are `invalid_request`, `identity_ambiguous`, `identity_conflict`, `stable_config_missing`, `source_unavailable`, `permission_denied`, `filesafe_blocked`, `destination_exists`, `registration_failed`, `stale_project_revision`, `archive_state_required`, `storage_hold_active`, `owner_unavailable`, or `cancelled`. A source/network/owner failure stays a failure and cannot leave a `listed` Project without a verified receipt.

## 4. GUI projection, motion, and accessibility

The Projects surface is a registry projection, not operational truth. The normal view shows human name, bounded location/source summary, lifecycle, last opened, and concise attention text. Technical IDs, host/path/repository detail, migration aliases, and currentness hashes live under Details. Search and recent lists are virtualized and cached. Refresh is incremental; a stale discovery result cannot reorder or overwrite a newer row.

The page has one dominant `Add Project` CTA. Its menu uses progressive disclosure: `Create Project` and `Open Existing Project` are prominent; clone, SSH, restore, and advanced registration remain secondary choices. Opening or switching a Project must not pause, cancel, or move background work in another Project. Non-active Project activity remains visible only through owner summaries/badges, not by loading every runtime surface.

Add/open confirmation uses a `180 ms` opacity/translation settle, archive/remove collapses a row over `160 ms` only after owner acceptance, and active selection uses a `120 ms` non-spatial highlight. Motion is interruptible, nonblocking, and uses stable Slint model IDs, opacity, translation, and clipping. Reduced Motion changes state immediately with focus/announcement. A failed mutation restores the row in place and announces the owner error; no optimistic success survives rejection.

Every row and menu action has a text label, visible focus, keyboard activation, non-color lifecycle state, and accessible name. Focus returns to the invoking row after dialogs/routes. `Escape` closes menu, then detail, without changing selection. Long/localized names wrap or elide with an accessible full name; duplicate names show Project/short-ID disambiguation. Destructive data deletion is never adjacent copy-equivalent to list removal and requires the Storage-owned strong-confirmation surface.

## 5. Persistence and migration

Storage owns the existing `projects:v1` registry binding. The payload must validate as `ProjectRecord`; Project System owns its meaning, while Storage owns atomic bytes, replay, retention, and migration receipts. `project_state:v1:{project_id}` is a separate shell/UX projection and cannot become the Project aggregate. Project summary/attention, coordination, Source Control, containers, artifacts, terminal state, and Orchestrator projections remain separate keys/owners.

Legacy path-keyed records are migration inputs only. Migration canonicalizes candidate locations under FileSafe, joins any stable config/repository/host identity, and creates or reuses one `project_id` only when the identity proof is unambiguous. Equal path strings on different Hosts/Environments do not deduplicate. Conflicts quarantine before registry publication. The migration receipt records accepted, merged, new-ID, stale, skipped, and quarantined entries plus alias refs and before/after hashes. Legacy app-global/singleton active Project state becomes an explicit selected `project_id` only when that Project resolves; otherwise no Project is selected.

Removing a list row preserves the stable identity alias needed for safe re-registration according to retention policy, but does not retain raw secrets or broad path data beyond the storage/permission policy. Deleting Project data never permits reusing the deleted `project_id`; restoring a backup as new always allocates a new identity and records lineage to the source Project without copying its ID.

## 6. Verification

Static validation must cover one positive and one negative for every Project action plus ordinary Git clone handoff, distinct Jujutsu clone handoff, existing local, SSH/server-hosted registration, verified restore-result registration, immutable-ID rename/move/restore cases, same-path-different-host cases, atomic registration, idempotent retry, half-registration rejection, archive/restore/list removal, strong separation from data deletion, migration quarantine, no-secret records, exact route/focus/continuation return, cancellation without half-row, duplicate-name disambiguation, virtualized large lists, stale registry and Project currentness rejection, multi-Project background continuity, keyboard/screen-reader behavior, six widths, all eight themes, Reduced Motion, and Slint-portable interruption.

Owner-routing tests must prove Settings values stay with Settings; sync/move stays with PSB; Git/JJ/forge stays with Source Control; backup/restore stays with its owner; physical bytes/holds/deletion stay with Storage/FileSafe/Permissions; and shell/runtime projections never become ProjectRecord fields. Schema/fixture success is structural evidence only, not runtime registration, persistence, GUI, migration, or data-safety proof.

## 7. PlanUnits

### PJCT-001 - Project aggregate and registry owner

```yaml
plan_unit_id: PJCT-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: Project System is the sole owner of immutable project_id, ProjectRecord registry meaning, registration lifecycle, human metadata, archive/list removal, active Project selection, and Project list projections; it does not own Settings values, content sync/move, topology, Source Control, backup/restore, storage deletion, shell state, Named Plans, or runtime truth.
gui_related: true
gui_classification_reason: Project identity, list rows, selection, archive, removal, and add/open flows are user-visible.
depends_on: [PSB-001]
unblocks: []
acceptance_criteria:
  - A path, repository, Vault, Server, worktree, or shell state cannot substitute for project_id.
  - Registration is atomic and failures leave no half-listed Project.
  - Archive and list removal never delete Project data.
validation_surfaces: [Plans/project_system_contracts.schema.json, Plans/project_system_contract_fixtures.json, owner-routing negative fixtures]
risk_class: project_identity_or_owner_collapse
reasoning_tier: high
context_scope: project_aggregate_registry
implementation_surfaces: [Plans/Project_System.md, Plans/project_system_contracts.schema.json]
node_compile_hint: {mode: project_system_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:register-fullthread.md#R-052-through-R-056"
negative_constraints: [Do not identify a Project by path alone., Do not duplicate Settings or PSB., Do not treat list removal as data deletion.]
```

### PJCT-002 - Project actions, persistence, and migration

```yaml
plan_unit_id: PJCT-002
unit_type: requirement
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: Project lifecycle actions are typed, revisioned, idempotent, permission-aware, receipt-bearing operations over projects:v1; legacy path/singleton entries migrate through identity proof and quarantine, while project_state and domain projections remain separate consumers.
gui_related: true
gui_classification_reason: Defines add/open/archive/remove/restore behavior, result/error presentation, focus, motion, and migration-visible outcomes.
depends_on: [PJCT-001]
unblocks: []
acceptance_criteria:
  - Existing Project command IDs and the owner-local restore-archived action validate through the typed Project action schema and one owner result; clone and restore-preview commands remain in their named owners.
  - Ordinary Git clone and Jujutsu clone produce distinct registration kinds and cannot normalize into one Project clone command.
  - Every caller return preserves exact route, focus, invocation token, caller revision, continuation generation, and registry/Project currentness fences; cancellation leaves no half-listed row.
  - ui.project.restore_archived remains typed owner-local action until catalog registration is closed.
  - Migration never deduplicates equal paths across distinct Hosts and never reuses a deleted project_id.
validation_surfaces: [Plans/project_system_contracts.schema.json, Plans/project_system_contract_fixtures.json, persistence and migration fixtures]
risk_class: project_registration_or_migration_data_loss
reasoning_tier: high
context_scope: project_actions_persistence_migration
implementation_surfaces: [Plans/Project_System.md, Plans/project_system_contracts.schema.json, Plans/storage-plan.md]
node_compile_hint: {mode: project_system_persistence_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:wave9-lane3.md#Named-Plans-and-Projects"
negative_constraints: [Do not persist secrets in ProjectRecord., Do not infer successful registration from discovery., Do not let migration replay owner mutations.]
```

## 8. Stage boundary

These PlanUnits and schemas materialize static canon only. They create no WorkNodes, NodeSeeds, executable queues, runtime handlers, Project rows, storage migrations, generated indexes, command registrations, production wiring, Slint implementation, backup, deletion, or certification evidence.

## 9. Server command-gap closure (2026-09-01)

`ProjectRegistry/ProjectCompositionService` owns one DRY `ProjectCompositionCommandRequest|ProjectCompositionCommandResult|ProjectCompositionCommandError|ProjectCompositionCommandAvailability|ProjectCompositionDisabledReason|ProjectCompositionPermissionDecision` family in `Plans/project_system_contracts.schema.json`. The same schema owns exact `project_local_action_request|project_local_action_result` definitions for the three adjudicated local actions.

| Row / packet line | Disposition | Exact retained semantic |
|---|---|---|
| 103 / `machine/command_census.json:1212` | reject `cmd.project.create` | A generic create erases the mandatory split among new-local, forge-created, existing, Git, Jujutsu, SSH, restore, and migration registration. Use `cmd.project.new_local`, `cmd.project.new_github_repo`, `cmd.project.add_existing`, or the exact Source Control/Jujutsu/Restore owner command followed by `cmd.project.add_existing`. No command or handler is registered for the rejected spelling. |
| 104 / `machine/command_census.json:1224` | `cmd.project.duplicate_configuration` -> `handlers::project::duplicate_configuration` | Create a new Project ID and Vault from portable settings and bindings while excluding history, live work, host paths, and raw secrets. |
| 105 / `machine/command_census.json:1230` | `cmd.project.duplicate_with_history` -> `handlers::project::duplicate_with_history` | Create a new Project through verified backup/import with identity rewrite, explicit inclusion, and no duplicate execution lease. |
| 117 / `machine/command_census.json:1308` | `cmd.project.open_details` -> `ui.project.open_details` | Open a bounded, redacted, lazy exact-Project projection without mutation. This is a typed local UI action with no semantic-domain handler or domain EventRecord. |
| 118 / `machine/command_census.json:1314` | alias `cmd.project.remove_registration` -> `cmd.project.remove` | Remove only the registry/list entry while preserving Project data and external source content. Normalize before policy and dispatch; preserve the invoked spelling only in compatibility/source receipt identity; `independent_handler_allowed=false` and `independent_wiring_allowed=false`; the sole target handler remains `handlers::project::remove`. |
| 128 / `machine/command_census.json:1374` | `cmd.project.unarchive` -> `ui.project.restore_archived` | Restore an archived row to listed state without recreating or moving Project data. It remains a typed local action, not a domain command/EventRecord producer. |
| 129 / `machine/command_census.json:1380` | `cmd.project_template.create_project` -> `handlers::project::template_create_project` | Create a new Project from the portable, versioned, secret-free template after resolving placeholders. |
| 130 / `machine/command_census.json:1386` | `cmd.project_template.delete` -> `handlers::project::template_delete` | Delete the exact template only after destructive confirmation, dependency, hold, and data-disposition checks. |
| 131 / `machine/command_census.json:1392` | `cmd.project_template.open_details` -> `ui.project_template.open_details` | Open a bounded, redacted, lazy exact-template projection without mutation; no semantic-domain handler or domain EventRecord. |
| 132 / `machine/command_census.json:1398` | `cmd.project_template.rename` -> `handlers::project::template_rename` | Rename the exact template without changing its stable identity or authority. |
| 133 / `machine/command_census.json:1404` | `cmd.project_template.save` -> `handlers::project::template_save` | Save a portable, versioned, secret-free template from an exact current Project configuration. |

All six new commands remain `handler_unavailable` until their named sole native handler, central registration, schema binding, permission/FileSafe route, production wiring, and receipt-or-separately-admitted-event disposition are proved. Async duplication/template work exposes `ObservableWork`; results preserve exact return context. Duplicate idempotency bindings, stale Project/template/registry generations, permission/FileSafe denial, restart/race ambiguity, identity collision, raw-secret input, or incomplete rollback evidence fail closed.

The exact GUI consumers for all eleven rows are Projects page, K3 Project manager, Product Onboarding First Project, and palette/API.

The packet source base for every line above is `PM_Server_First_Backbone_Delivery_Bundle_FINAL_WAN_MVP_2026-08-14/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14.zip.contents/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/machine/command_census.json`; the owner schema preserves every complete `packet_source_ref` and intended semantic byte-for-byte.

### PJCT-003 - Project Composition, Local Action, Alias, And Rejection Closure

```yaml
plan_unit_id: PJCT-003
unit_type: requirement
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: >-
  Project System owns six exact duplication/template commands through one closed ProjectComposition family, three
  typed local actions, one pre-policy/pre-dispatch compatibility alias to cmd.project.remove, and one explicit generic
  create rejection. Commands remain handler_unavailable until their named sole native handlers and full central
  integration exist; local actions and rejected spellings create no semantic-domain handler or EventRecord.
gui_related: true
gui_classification_reason: Project/template actions, availability, details, archive restoration, blockers, and exact return are visible Project surfaces.
depends_on: [PJCT-001, PJCT-002]
unblocks: []
acceptance_criteria:
  - The owner contract and fixtures cover exactly six new commands, three local actions, one alias, and one rejected row from adjudication rows 103-105, 117-118, and 128-133.
  - Each command has one named sole handler and remains handler_unavailable without native integration evidence.
  - cmd.project.remove_registration normalizes before policy/dispatch to cmd.project.remove and receives no second handler, policy evaluation, or wiring row.
  - cmd.project.create stays explicitly rejected with the exact-path replacement set and no registration.
  - Local actions have typed request/results, mutate no domain state, invoke no semantic-domain handler, and emit no domain EventRecord.
validation_surfaces: [Plans/project_system_contracts.schema.json, Plans/project_system_contract_fixtures.json, focused Server owner-bundle-B validator]
risk_class: project_composition_identity_or_alias_bypass
reasoning_tier: high
context_scope: server_command_gap_project_system
implementation_surfaces: [Plans/Project_System.md, Plans/project_system_contracts.schema.json, future Project composition native handlers]
node_compile_hint: {mode: project_system_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-103-105, source_ref:server-command-gap-adjudication:rows-117-118, source_ref:server-command-gap-adjudication:rows-128-133]
negative_constraints:
  - Do not register cmd.project.create or infer a generic Project creation path.
  - Do not give cmd.project.remove_registration an independent handler or wiring row.
  - Do not make static schema/fixture evidence a native-handler or production-readiness claim.
```

## 10. Backup v2 Project consumer closure (2026-09-01)

### PJCT-004 - Project Backup, History, And Restore-As-New Consumer

```yaml
plan_unit_id: PJCT-004
unit_type: integration_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: >-
  Project surfaces route Back Up Project, Restore as New, Backup history, and immutable snapshot
  browse directly through Backup/Restore-owned commands and records. Restore as New receives a
  fresh never-reused project_id, records source Project and backup lineage, preserves external
  forge identity as an external binding subject to owner revalidation, and becomes listed only
  after a verified terminal restore result; Project System owns no backup repository bytes or
  backup/restore handler.
gui_related: true
gui_classification_reason: Project cards, history/snapshot pivots, Restore as New, disabled reasons, and exact reverse focus are user-visible routes.
depends_on: [PJCT-001, PJCT-002, BRS-006, BRS-014, BRS-016]
unblocks: []
acceptance_criteria:
  - Back Up Project binds exactly one immutable project_id and exact Server, destination, policy revision, currentness, caller, and return context to cmd.backup.project.create.
  - Restore as New uses cmd.restore.preview and cmd.restore.project_as_new, allocates a new project_id, and cannot list the Project before a verified terminal restore receipt is accepted.
  - Restore-as-new preserves source Project and backup/manifest lineage while external forge host, account, and repository identity remains external, unrenamed, and owner-revalidated before use.
  - Backup history and snapshot browse return to the exact Project/repository/snapshot/capture-set/filter/focus and never select latest by implication.
  - Browse and export cannot activate a Project, execute content, resume work, or count as restore/registration success.
  - The consumer adds no Project-private backup handler or EventRecord; expected_event_types stays empty and static contract evidence remains handler_unavailable without native proof.
validation_surfaces: [Plans/Backup_Restore_System.md, Plans/backup_restore_system_contracts.schema.json, future Project Backup reverse-route identity restore-as-new and event-silence tests]
risk_class: project_backup_owner_leak_or_restore_identity_collision
reasoning_tier: high
context_scope: project_backup_restore_consumer
implementation_surfaces: [Plans/Project_System.md, future Projects surface, future Backup Restore native owner]
node_compile_hint: {mode: project_backup_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:REST-002-REST-005
  - source_ref:packet:2026-09-01:REST-008-REST-009
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.3
negative_constraints:
  - Do not create Project-owned backup, repository, browse, export, or restore handlers.
  - Do not reuse the source project_id for Restore as New.
  - Do not rename, rewrite, or automatically activate an external forge repository identity.
  - Do not infer latest snapshot, runtime readiness, success, or an EventRecord from static routes.
owner_hints: [Plans/Project_System.md, Plans/Backup_Restore_System.md, Plans/Source_Control_System.md, Plans/Forge_Integrations.md]
```

### PJCT-005 - Project Backup Preference, Copy, Move, And Recovery Consumption

```yaml
plan_unit_id: PJCT-005
unit_type: integration_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: >-
  Project Vault owns each Project's concrete non-secret backup preferences, source/capture lineage, snapshot/restore receipts, and source-control/forge binding references; Server Catalog owns destination/connection metadata, scheduler occurrences and writer assignments, RecoverySet public metadata/credential refs, and cross-Project full-capture indexes. Project copy may copy selected preference records with preview/recovery/atomic rollback, but never credentials, Recovery Keys, live schedules, writer leases, duplicate jobs, billing consent, or external repository authority. Project Move preflights destination/profile readiness and transfers or explicitly retains one schedule/writer/prune assignment. Restore as New creates a fresh Project identity and leaves external forge/repository identity owner-revalidated.
gui_related: true
gui_classification_reason: Project settings copy, backup preference preview, move readiness, Back Up Project, history, Restore as New, reconnect, and exact-return status are visible Project surfaces.
depends_on: [PJCT-002, PJCT-004, BRS-017, BRS-019]
unblocks: []
acceptance_criteria:
  - Project-specific preferences, lineage, and receipts stay in Project Vault; destination/profile/scheduler/writer/RecoverySet-public/cross-Project indexes stay in Server Catalog; secrets stay in the protected owner store and remote bytes stay encrypted recovery content.
  - Copy preserves selectable concrete Project settings and optional preview/pre-copy recovery/atomic rollback without creating inherited settings, copying cloud credentials, enabling a destination, scheduling work, or authorizing billing.
  - Move validates destination/profile/key availability and commits exactly one scheduler/writer/prune authority transfer or explicit source-retained policy; source and target Servers cannot prune the same repository independently.
  - Restore as New allocates a fresh project_id, preserves source/manifest/snapshot lineage, leaves provider repository identity external, and activates no recovered Goal, lease, automation, push, or pipeline.
  - Closing or switching a Client never stops Server-owned backup or Project work; Project System consumes owner receipts and exact return refs without owning capture, repository bytes, restore activation, or rollback.
  - All Project consumer evidence is static, event-silent, and handler_unavailable absent native proof; PROC-001/PROC-002 remain later execution obligations.
validation_surfaces: [Plans/project_system_contracts.schema.json#/$defs/project_backup_consumer_projection, Plans/project_system_contract_fixtures.json, Plans/backup_restore_system_contracts.schema.json]
risk_class: project_copy_or_move_duplicate_backup_authority
reasoning_tier: high
context_scope: project_backup_preference_copy_move_and_recovery
implementation_surfaces: [Plans/Project_System.md, Plans/project_system_contracts.schema.json, Plans/project_system_contract_fixtures.json]
node_compile_hint: {mode: static_project_backup_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:AUTH-004
  - source_ref:packet:2026-09-01:BKP-010
  - source_ref:packet:2026-09-01:REST-005-REST-006
  - source_ref:packet:2026-09-01:OWN-006
  - source_ref:packet:2026-09-01:PROC-001-PROC-002
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.3
preserved_exact_tokens: [Project Vault, Server Catalog, Back Up Project, Restore as New, Reconnect destination, project_id, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not copy or inherit credentials, Recovery Keys, scheduler occurrences, writer/maintenance leases, active jobs, external billing consent, or provider authority through Project settings.
  - Do not let two Servers schedule or prune one repository, treat Client lifetime as work lifetime, or register a restore preview as a Project.
  - Do not activate recovered execution, automation, push, pipeline, hook, credential, or connector identity through registration.
  - Do not claim runtime copy/move/restore, native GUI, storage, safety, or PROC execution evidence from this static consumer contract.
owner_hints: [Plans/Project_System.md, Plans/Backup_Restore_System.md, Plans/Project_Sync_and_Backbone.md, Plans/storage-plan.md]
```
