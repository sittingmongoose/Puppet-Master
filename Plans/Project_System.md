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
| `cmd.project.unarchive` | Persistently restore an archived Project to listed state | Changes only the existing Project's registry lifecycle and revision/currentness metadata; never restores files, backups, or runtime work. |
| `cmd.project.remove` | Remove the Project from the visible list | List-only; never a data deletion. |
| `cmd.project.refresh` | Refresh registry/list projections | Cached-first; cannot rewrite Project identity from path discovery. |
| `cmd.project.open_settings` | Route to Project-bound Settings | Settings owns values and mutation. |
| `cmd.project.delete_data` | Route a separately confirmed Storage-owned purge intent | Strong confirmation/holds/retention stay Storage-owned; it is not an alias of remove. |

All requests carry the expected Project-registry revision and currentness hash; existing-Project actions also carry the expected Project revision and currentness hash. Mutating requests carry `project_id` when one exists, actor, permission snapshot, FileSafe evidence where applicable, idempotency key, initiating surface, and one closed exact return context containing caller surface, route, focus, invocation token, caller-context ref, expected caller revision, and continuation generation. A terminal result echoes that return context byte-for-byte. Caller close, Back, Skip, route change, or Client disconnect does not cancel dispatched owner work; an actual owner cancellation returns `outcome=cancelled`, preserves the exact return context, and leaves no half-listed row. Duplicate idempotency bindings return the original result; same key with different binding fails.

### 3.0 Archived Project restoration — approved registry mutation (2026-09-11)

The user adjudication `USER-PROJECT-UNARCHIVE-REGISTRY-20260911` resolves the predecessor conflict between restoring a registry row and a non-mutating local action. `cmd.project.unarchive` is the one central Project-owner command, consuming the existing `project_action_request` / `project_action_result` family through the sole planned `handlers::project::unarchive` target. The retained entry token `ui.project.restore_archived` is a UI adapter only: it constructs that exact command before availability, permission, currentness, idempotency, and dispatch checks. It is neither a member of `ProjectCompositionLocalActionId` nor a second command, handler, production row, or local registry writer. Prior requests/results bearing the local action identity remain historical evidence; they cannot be replayed as authorized mutation requests.

The request names an existing immutable `project_id`, current Project and registry revisions/hashes, actor, permission snapshot, idempotency binding, and exact return context. Creation, source, repository, Home Server, Settings-copy, and Onboarding-commit fields cannot widen this operation. The owner rechecks permission and currentness before the atomic `archived -> listed` transition in the existing `projects:v1` registry. Only lifecycle, the affected Project's update/revision/currentness metadata, and registry revision/currentness change. Identity, registration kind, display name, stable config, Vault/source/repository refs, Settings, files, backups, evidence, active-Project selection, and runtime lifecycle remain unchanged. Restoring visibility does not open the Project, re-register removed data, retry a deletion, restore a backup, or restart work.

An accepted result follows successful persistence/readback, reports `lifecycle=listed`, `persistence_disposition=persisted`, the same Project identity, the updated Project/registry fences, and a correlated owner receipt. Dispatch acknowledgement is not this terminal result. The same already-committed idempotency binding returns its original result without another write; a fresh authorized request against an already listed Project returns `no_change` with unchanged revisions and a correlated readback receipt. Other lifecycle states, stale fences, permission denial, unavailable handlers, persistence failure, or uncertain recovery cannot report success. A rejected request performs no mutation; an owner cancellation before commit leaves no partial write, while caller navigation cannot cancel committed work. There is no fallback to an optimistic local-only list change. Receipt/projection evidence uses the existing owner result and storage family; no new EventRecord family is admitted. The action stays `handler_unavailable` until native dispatch, permission, persistence/readback, replay/restart, and reverse-consumer evidence exist.

ContractRef: ContractName:Plans/Commands_System.md#CS-073, ContractName:Plans/UI_Command_Catalog.md#UCC-151, ContractName:Plans/Wiring_Matrix.md#WM-050, ContractName:Plans/storage-plan.md

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

For the reviewed Onboarding commit, these exact mappings remain the only owner routes. New/add requests carry the Project-owned onboarding_setup_binding: queued plan/ref/reviewed revision/hash, draft/ref/revision, explicit commit consent, current preflight, and paired optional Settings draft-preview ref/hash. The draft is not a Project ID. Only after the user commits may the Project owner reserve the actual identity required by clone/restore/configuration/Settings child owners. Required work must settle under that one idempotency binding before registry publication as listed and usable. If Settings copy was selected, SSYS-036 rebinds the exact preview to the reserved identity, performs the ordinary apply/readback/rollback transaction, and contributes its terminal result. Failure remains failure/recovery-required, not a half-ready list row.

The project_setup_commit_binding value is a Project-owned read model over the actual typed ProjectActionResult, its content hash, listed lifecycle, persistence disposition, Project/registry revisions and required child receipt/result refs. outcome=accepted alone is not Project completion. New/add require persisted state; opening an already listed Project keeps its distinct no-persist navigation disposition and verified listing receipt. A duplicate request returns the original identity/results. This read model admits no new physical receipt family, and Onboarding cannot write it as a success flag. After a verified commit, provider setup may start in that real Project; Back, Close, Skip or provider failure cannot undo it.

Before executing an Onboarding creation request, Project System resolves the exact approved draft bytes identified by the setup binding and checks their digest. Content, history/backend and Settings choices come from that confirmed draft, not a consumer default. An explicit no-history choice does not initialize Git, and a Jujutsu choice is never silently substituted with Git; an unavailable required owner route blocks the commit. Legacy caller payload summaries such as optional `init_git` do not override the reviewed binding or establish a second Project request schema.

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

These Project consumer routes use the Backup/Restore owner request/result/error/availability family and owner receipts or `ObservableWork` where applicable. Required approval/recovery evidence means the exact BRS-021 phase-local prerequisite, including its narrowly validated emergency alternative; Project System does not grant consent, copy a recovery point, or infer rollback availability. It lists a restored Project only from the verified owner terminal receipt even when the owner has valid emergency consent. They imply no Project or Backup `EventRecord`; `expected_event_types=[]` remains mandatory until Event Authority separately admits an exact family. All future Backup handlers remain `handler_unavailable` without source-hashed native evidence. Plan prose, command names, schemas, fixtures, route targets, and static wiring are future contract truth only, not proof of executable backup/restore, GUI implementation, persistence, provider readiness, or recovery safety.

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
  - Existing Project command IDs and cmd.project.unarchive validate through the typed Project action schema and one owner result; clone and restore-preview commands remain in their named owners.
  - Ordinary Git clone and Jujutsu clone produce distinct registration kinds and cannot normalize into one Project clone command.
  - Every caller return preserves exact route, focus, invocation token, caller revision, continuation generation, and registry/Project currentness fences; cancellation leaves no half-listed row.
  - cmd.project.unarchive persists only archived-to-listed registry metadata through the sole Project owner; ui.project.restore_archived is a pre-gate UI adapter without a local writer, peer handler, or independent production row.
  - Successful unarchive preserves identity and all non-registry owners, proves listed persistence/readback and exact return, and never reports navigation-only success; stale/denied/non-archived-state requests fail closed, and replay/no-change does not write again.
  - Migration never deduplicates equal paths across distinct Hosts and never reuses a deleted project_id.
validation_surfaces: [Plans/project_system_contracts.schema.json, Plans/project_system_contract_fixtures.json, scripts/pm_project_unarchive_contract.py, tests/test_pm_project_unarchive.py, persistence and migration fixtures]
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

These PlanUnits and schemas materialize static canon only. The catalog and production-intent declarations cited here are static registrations, not executable integration. They create no WorkNodes, NodeSeeds, executable queues, runtime handlers, Project rows, storage migrations, Slint implementation, backup, deletion, or certification evidence.

## 9. Server command-gap closure (2026-09-01)

`ProjectRegistry/ProjectCompositionService` owns one DRY `ProjectCompositionCommandRequest|ProjectCompositionCommandResult|ProjectCompositionCommandError|ProjectCompositionCommandAvailability|ProjectCompositionDisabledReason|ProjectCompositionPermissionDecision` family in `Plans/project_system_contracts.schema.json` for six duplication/template commands. The same schema owns exact `project_local_action_request|project_local_action_result` definitions for the two read-only local detail actions. The September 11 user adjudication routes row 128 through the existing Project lifecycle action family, not a duplicated composition or local-mutation family.

| Row / packet line | Disposition | Exact retained semantic |
|---|---|---|
| 103 / `machine/command_census.json:1212` | reject `cmd.project.create` | A generic create erases the mandatory split among new-local, forge-created, existing, Git, Jujutsu, SSH, restore, and migration registration. Use `cmd.project.new_local`, `cmd.project.new_github_repo`, `cmd.project.add_existing`, or the exact Source Control/Jujutsu/Restore owner command followed by `cmd.project.add_existing`. No command or handler is registered for the rejected spelling. |
| 104 / `machine/command_census.json:1224` | `cmd.project.duplicate_configuration` -> `handlers::project::duplicate_configuration` | Create a new Project ID and Vault from portable settings and bindings while excluding history, live work, host paths, and raw secrets. |
| 105 / `machine/command_census.json:1230` | `cmd.project.duplicate_with_history` -> `handlers::project::duplicate_with_history` | Create a new Project through verified backup/import with identity rewrite, explicit inclusion, and no duplicate execution lease. |
| 117 / `machine/command_census.json:1308` | `cmd.project.open_details` -> `ui.project.open_details` | Open a bounded, redacted, lazy exact-Project projection without mutation. This is a typed local UI action with no semantic-domain handler or domain EventRecord. |
| 118 / `machine/command_census.json:1314` | alias `cmd.project.remove_registration` -> `cmd.project.remove` | Remove only the registry/list entry while preserving Project data and external source content. Normalize before policy and dispatch; preserve the invoked spelling only in compatibility/source receipt identity; `independent_handler_allowed=false` and `independent_wiring_allowed=false`; the sole target handler remains `handlers::project::remove`. |
| 128 / `machine/command_census.json:1374` | `cmd.project.unarchive` -> `handlers::project::unarchive` | Persist the existing Project registry row from archived to listed through the Project action family; preserve data and identity. The old `ui.project.restore_archived` entry only constructs this command before all gates. No new EventRecord is admitted. |
| 129 / `machine/command_census.json:1380` | `cmd.project_template.create_project` -> `handlers::project::template_create_project` | Create a new Project from the portable, versioned, secret-free template after resolving placeholders. |
| 130 / `machine/command_census.json:1386` | `cmd.project_template.delete` -> `handlers::project::template_delete` | Delete the exact template only after destructive confirmation, dependency, hold, and data-disposition checks. |
| 131 / `machine/command_census.json:1392` | `cmd.project_template.open_details` -> `ui.project_template.open_details` | Open a bounded, redacted, lazy exact-template projection without mutation; no semantic-domain handler or domain EventRecord. |
| 132 / `machine/command_census.json:1398` | `cmd.project_template.rename` -> `handlers::project::template_rename` | Rename the exact template without changing its stable identity or authority. |
| 133 / `machine/command_census.json:1404` | `cmd.project_template.save` -> `handlers::project::template_save` | Save a portable, versioned, secret-free template from an exact current Project configuration. |

All seven owner commands remain `handler_unavailable` until their named sole native handler, central registration, schema binding, permission/FileSafe route where applicable, production wiring, and receipt-or-separately-admitted-event disposition are proved. Async duplication/template work exposes `ObservableWork`; results preserve exact return context. Duplicate idempotency bindings, stale Project/template/registry generations, permission/FileSafe denial, restart/race ambiguity, identity collision, raw-secret input, or incomplete rollback evidence fail closed.

The exact GUI consumers for all eleven rows are Projects page, K3 Project manager, Product Onboarding First Project, and palette/API.

The packet source base for every line above is `PM_Server_First_Backbone_Delivery_Bundle_FINAL_WAN_MVP_2026-08-14/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14.zip.contents/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/machine/command_census.json`; the owner schema preserves every complete `packet_source_ref` and intended semantic byte-for-byte.

### PJCT-003 - Project Composition, Local Action, Alias, And Rejection Closure

```yaml
plan_unit_id: PJCT-003
unit_type: requirement
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: >-
  Project System owns six exact duplication/template commands through one closed ProjectComposition family,
  cmd.project.unarchive through the existing Project action family, two read-only typed local actions,
  one pre-policy/pre-dispatch compatibility alias to cmd.project.remove, and one explicit generic
  create rejection. Commands remain handler_unavailable until their named sole native handlers and full central
  integration exist; local actions and rejected spellings create no semantic-domain handler or EventRecord.
gui_related: true
gui_classification_reason: Project/template actions, availability, details, archive restoration, blockers, and exact return are visible Project surfaces.
depends_on: [PJCT-001, PJCT-002]
unblocks: []
acceptance_criteria:
  - The owner contract and fixtures cover exactly seven commands, two local actions, one alias, and one rejected row from adjudication rows 103-105, 117-118, and 128-133, preserving every source row identity and semantic under the September 11 user correction.
  - Each command has one named sole handler and remains handler_unavailable without native integration evidence.
  - cmd.project.remove_registration normalizes before policy/dispatch to cmd.project.remove and receives no second handler, policy evaluation, or wiring row.
  - cmd.project.create stays explicitly rejected with the exact-path replacement set and no registration.
  - Local actions have typed request/results, mutate no domain state, invoke no semantic-domain handler, and emit no domain EventRecord.
  - Row 128 is the Project registry mutation cmd.project.unarchive, not a local action; its old UI entry constructs the existing owner request before all gates and cannot independently mutate, dispatch, or emit an event.
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

## Notebook Project Data Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Working Notebook records are Project data joined by `project_id`, not ordinary Settings values and not operational manager objects. `cmd.project.duplicate_configuration` excludes notebook bodies and checkpoints (it copies portable settings/bindings only, so note bodies never travel through settings transfer); `cmd.project.duplicate_with_history` includes them through the verified backup/import path with identity rewrite (new `project_id`, remapped notebook/entry/checkpoint identities and scope bindings), explicit inclusion, and no duplicated execution lease or writer authority. Forks and rewinds of threads keep source revisions and destination identity: a branch built from a restore point sees note revisions as of that boundary, never future-branch decisions as current, and cloned usage history is not newly incurred cost.

```yaml
plan_unit_id: PJCT-006
unit_type: requirement
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: Working Notebook records are Project data, not Settings values or operational objects. duplicate_configuration excludes note bodies and checkpoints; duplicate_with_history includes them through verified backup/import with identity rewrite and no duplicated writer authority or execution lease. Thread forks/rewinds use correct source revisions and destination identity, never leaking future-branch note decisions as current or cloning usage as new cost.
gui_related: false
gui_classification_reason: Project data classification is system behavior, not GUI work.
depends_on: [PJCT-005, BRS-020]
unblocks: []
acceptance_criteria:
  - Configuration duplication carries no note bodies.
  - History duplication remaps identities and grants no foreign write authority.
  - Fork/rewind branches see correct as-of note revisions.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: identity_leak
reasoning_tier: standard
context_scope: project_system
implementation_surfaces: [Plans/Project_System.md, Plans/Backup_Restore_System.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: project_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I12
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A49
preserved_exact_tokens: ["duplicate_configuration", "duplicate_with_history", "identity rewrite"]
negative_constraints:
  - Do not carry note bodies through configuration duplication or settings transfer.
owner_hints: [Plans/Project_System.md, Plans/Backup_Restore_System.md]
```

ContractRef: ContractName:Plans/Project_System.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/Working_Notebook.md

### PJCT-007 - Reviewed Onboarding Commit And Provider Handoff

```yaml
plan_unit_id: PJCT-007
unit_type: integration_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: Project System consumes one explicitly confirmed Onboarding draft through its existing new/open/add
  command mapping and backend-native clone/SSH/restore child owners. A real identity may be reserved only after
  commit consent. Publication as listed and usable waits for required configuration, content/history, Settings rebind/apply/readback
  and terminal owner receipts. project_setup_commit_binding is an exact read model of the actual ProjectActionResult
  and required receipt chain, never new physical commit authority. Provider setup requires that committed real Project
  and cannot uncreate it on navigation or failure.
gui_related: true
gui_classification_reason: Determines the visible Review commit, truthful Project creation progress/listing and
  provider handoff.
depends_on:
- PJCT-001
- PJCT-002
- SSYS-036
unblocks: []
acceptance_criteria:
- Onboarding creation/add requests require the exact Project-owned setup/review/draft/consent/preflight binding;
  no generic cmd.project.create or Onboarding wrapper is introduced.
- Git clone, Jujutsu clone, existing folder, SSH source and restore retain distinct existing owner commands, registration
  kinds and terminal receipts.
- No Project/destination mutation happens before commit, and acceptance or provisional identity is not listed/persisted
  completion.
- Selected Settings copy must rebind and settle before listing; failures cannot publish a half-ready Project.
- Resolve and hash-check the actual confirmed draft before effects; honor its history/backend choice without a
  consumer-forced Git default, and block an unavailable required backend route instead of substituting one.
- The provider handoff compares actual owner result ref/hash, command/instance/idempotency, Project/registry revisions,
  lifecycle, persistence and receipt membership.
- Same idempotency/binding yields original result and identity; conflict, stale revision, rejected/failed/cancelled
  result or mismatched receipt fails closed.
- Close/Back/provider Skip and failure preserve an already committed Project and do not replay the owner operation.
validation_surfaces:
- Plans/project_system_contract_fixtures.json
- tests/test_pm_onboarding_phases.py
- tests/test_pm_settings_draft_transfer.py
- future native registration, child-owner rollback, idempotency and restart receipts; not_run
risk_class: premature_project_publication_or_false_provider_context
reasoning_tier: high
context_scope: onboarding_project_commit
implementation_surfaces:
- Plans/Project_System.md
- Plans/project_system_contracts.schema.json
node_compile_hint:
  mode: onboarding_project_commit_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_packet:PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/02_PROJECT_DRAFT_COPY_AND_COMMIT.md
negative_constraints:
- Do not mint a generic Project or Onboarding command or physical receipt family.
- Do not confuse owner acceptance, preview or provisional identity with committed listing.
- Do not fabricate child results, overwrite unrelated Project state or claim native persistence proof.
```

## 11. Existing GitHub creation handoff — PJCT-008

`cmd.project.new_github_repo` consumes the existing `project_action_request` and
`project_action_result` in `Plans/project_system_contracts.schema.json`, not the
six-command Project Composition family. GI-042 owns forge/API and source preparation;
Project Registry alone commits the Project. The existing sole planned handler is
`handlers::github::project_new_repo`, unavailable until native owner routing/gates
are proved. This section changes no Onboarding or Settings design.

The request has no Project ID/fence before creation. It carries current registry
fences, actor, permission/FileSafe refs, exact return context and stable idempotency
binding. `source_ref` resolves the approved creation intent; `repository_ref` is
its opaque owner binding, not proof a remote repository exists. The GitHub owner
resolves its account, organization/owner, options and target source location.
The Home Server reference must resolve through the Server owner, not be assumed
equal to a Server ID. Onboarding still requires the complete PJCT-007 confirmed
draft/Review/Settings chain; a matching ref alone is insufficient.

Terminal `outcome=accepted` means the actual newly allocated Project is durably
`listed` with `persistence_disposition=persisted`, Project revision/currentness
and resulting registry fence. It is not dispatcher acceptance. The result echoes
command instance and exact return context and includes distinct resolved repository
creation, Project registration and readback receipts. Readback matches Project ID,
forge-created kind, name, Home Server, source/repository bindings and fences; the
local source is ready. Accepted registration advances the compared registry fence
once. Stable config/immutable-ID checks remain PJCT-001; no foreign Project may
be substituted. The central response joins the actual request digest, instance,
operation/Server, idempotency key, result digest and registration receipt.

The Full Thread creation operation remains application-scoped with null Project
identity even after its result returns a Project. `project.github_repo_bound` is
a Project-scoped child projection of that same operation, not an identity rewrite.
`ProjectRegistry.forge_registration` emits it once after committed registration
and verified readback. Its closed payload contains identity/fence/digest/receipt
metadata only; the envelope Project ID equals the actual result. It joins GI-042
intake by operation ID, original request digest and admission receipt. Payload,
retention and replay consume row 1 of `Plans/github_project_event_admission.json`
and the existing Case L EventRecord store. No second ProjectRecord/store is created.

Rejected/cancelled registration publishes no half-listed Project and proves the
registry unchanged by this operation. A stale request may return the actual
observed registry fence without pretending its expected fence was current. If a
remote repository exists but preparation/registration fails or effects are
uncertain, retain the existing owner operation/receipts and expose pending or
recovery-required truth through the central outcome contract. Do not fabricate a
settled Project result, automatically delete a repository, or run create again.
Compensation remains separately approved and owner-routed. An unrelated existing
repository is not successful creation no-change. Exact retry returns the original
accepted result with `replayed=true`, no new API/clone/registry/event effects and
no identity change. Changed content under the same binding fails closed. Navigation
does not cancel owner work.

### PJCT-008 - Typed GitHub-to-Project commit and event binding

```yaml
plan_unit_id: PJCT-008
unit_type: requirement
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: The existing new-GitHub-Project command joins GI-042 intake to the existing Project action family, an application-scoped creation operation, verified owner receipts and atomic listed Project readback; only that committed result emits the Project-bound event.
gui_related: false
gui_classification_reason: Owner request/result, identity, receipt and event integration without presentation changes.
depends_on: [PJCT-001, PJCT-002, PJCT-007, GI-042]
unblocks: []
acceptance_criteria:
- No provisional Project ID, acknowledgement-as-success, foreign readback, changed return context, missing receipt or unresolved remote effect is accepted as completion.
- Existing command, sole planned handler, typed family and placement remain; exact retries preserve original identity and execute no effects.
- The Project-bound event joins the original application-scoped operation without changing that operation's identity.
- Static validation grants no native availability, runtime proof, readiness, WorkNodes or governance certification.
validation_surfaces: [Plans/project_system_contracts.schema.json, Plans/github_project_event_payloads.schema.json, Plans/github_project_event_fixtures.json, scripts/pm-github-project-integration.py, tests/test_pm_github_project_integration.py]
risk_class: premature_project_publication_or_duplicate_remote_effect
reasoning_tier: high
context_scope: existing_github_project_creation_handoff
implementation_surfaces: [Plans/Project_System.md, Plans/GitHub_Integration.md, Plans/Wiring_Matrix.production.json, scripts/pm_project_forge_contract.py, scripts/pm_ui_command_response.py]
node_compile_hint: {mode: static_owner_integration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Project_System.md#3-actions-commands-and-results, Plans/GitHub_Integration.md#GI-032, Plans/Wiring_Matrix.production.json#/entries/catalog.project_new_github_repo]
negative_constraints: [No fake Project identity., No consumer-owned Project writer., No automatic repository deletion or duplicate create., No Onboarding or Settings design change., No native or global audit closure claim.]
```

ContractRef: ContractName:Plans/GitHub_Integration.md#GI-042, ContractName:Plans/Project_System.md#PJCT-007, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe
