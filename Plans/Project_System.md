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
| `cmd.project.resume_creation` | Resume a recovery-required creation under its retained recovery | Fresh attempt bound to the original recovery; executes only unsettled steps and never repeats a settled remote create. |

All requests carry the expected Project-registry revision and currentness hash; existing-Project actions also carry the expected Project revision and currentness hash. Mutating requests carry `project_id` when one exists, actor, permission snapshot, FileSafe evidence where applicable, idempotency key, initiating surface, and one closed exact return context containing caller surface, route, focus, invocation token, caller-context ref, expected caller revision, and continuation generation. A terminal result echoes that return context byte-for-byte. Caller close, Back, Skip, route change, or Client disconnect does not cancel dispatched owner work; an actual owner cancellation returns `outcome=cancelled`, preserves the exact return context, and leaves no half-listed row. Duplicate idempotency bindings return the original result; same key with different binding fails. Replaying the original creation idempotency key re-observes its terminal result with `replayed=true` and MUST NOT resume: a resume is the distinct `cmd.project.resume_creation` action carrying a fresh attempt identity bound to the retained recovery, never the original key.

### 3.0 Archived Project restoration — approved registry mutation (2026-09-11)

The user adjudication `USER-PROJECT-UNARCHIVE-REGISTRY-20260911` resolves the predecessor conflict between restoring a registry row and a non-mutating local action. `cmd.project.unarchive` is the one central Project-owner command, consuming the existing `project_action_request` / `project_action_result` family through the sole planned `handlers::project::unarchive` target. The retained entry token `ui.project.restore_archived` is a UI adapter only: it constructs that exact command before availability, permission, currentness, idempotency, and dispatch checks. It is neither a member of `ProjectCompositionLocalActionId` nor a second command, handler, production row, or local registry writer. Prior requests/results bearing the local action identity remain historical evidence; they cannot be replayed as authorized mutation requests.

The request names an existing immutable `project_id`, current Project and registry revisions/hashes, actor, permission snapshot, idempotency binding, and exact return context. Creation, source, repository, Home Server, Settings-copy, and Onboarding-commit fields cannot widen this operation. The owner rechecks permission and currentness before the atomic `archived -> listed` transition in the existing `projects:v1` registry. Only lifecycle, the affected Project's update/revision/currentness metadata, and registry revision/currentness change. Identity, registration kind, display name, stable config, Vault/source/repository refs, Settings, files, backups, evidence, active-Project selection, and runtime lifecycle remain unchanged. Restoring visibility does not open the Project, re-register removed data, retry a deletion, restore a backup, or restart work.

An accepted result follows successful persistence/readback, reports `lifecycle=listed`, `persistence_disposition=persisted`, the same Project identity, the updated Project/registry fences, and a correlated owner receipt. Dispatch acknowledgement is not this terminal result. The same already-committed idempotency binding returns its original result without another write; a fresh authorized request against an already listed Project returns `no_change` with unchanged revisions and a correlated readback receipt. Other lifecycle states, stale fences, permission denial, unavailable handlers, persistence failure, or uncertain recovery cannot report success. A rejected request performs no mutation; an owner cancellation before commit leaves no partial write, while caller navigation cannot cancel committed work. There is no fallback to an optimistic local-only list change. Receipt/projection evidence uses the existing owner result and storage family; no new EventRecord family is admitted. The action stays `handler_unavailable` until native dispatch, permission, persistence/readback, replay/restart, and reverse-consumer evidence exist.

ContractRef: ContractName:Plans/Commands_System.md#CS-073, ContractName:Plans/UI_Command_Catalog.md#UCC-151, ContractName:Plans/Wiring_Matrix.md#WM-050, ContractName:Plans/storage-plan.md

### 3.1 Shared reviewed Project setup routing

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
| verified mounted content | Source Location owner verifies backing device, mount, Host/Environment and current inspection; cmd.project.add_existing registers mounted_existing, never a temporary mount as durable identity. |
| new online copy on an offered API service | PJCT-010 fixes the exact per-service create/source/bind/register chain; cmd.project.new_github_repo remains the GitHub compatibility root, other services use the reviewed cmd.project.add_existing forge_created composition. |
| contribution fork or online acquisition | Native Git/JJ clone then cmd.project.add_existing uses git_clone/jujutsu_clone plus closed fork_contribute or online_import acquisition provenance under PJCT-010; no generic clone kind. |

For the reviewed Onboarding commit, these exact mappings remain the only owner routes. New/add requests carry the Project-owned project_setup_binding: queued plan/ref/reviewed revision/hash, draft/ref/revision, explicit commit consent, current preflight, and paired optional Settings draft-preview ref/hash. The draft is not a Project ID. Only after explicit reviewed commit admission by the person or the Permissions-admitted mode route may the Project owner reserve the actual identity required by clone/restore/configuration/Settings child owners. Required work must settle under that one idempotency binding before registry publication as listed and usable. If Settings copy was selected, SSYS-036 rebinds the exact preview to the reserved identity, performs the ordinary apply/readback/rollback transaction, and contributes its terminal result. Failure remains failure/recovery-required, not a half-ready list row.

The project_setup_commit_binding value is a Project-owned read model over the actual typed ProjectActionResult, its content hash, listed lifecycle, persistence disposition, Project/registry revisions and required child receipt/result refs. outcome=accepted alone is not Project completion. New/add require persisted state; opening an already listed Project keeps its distinct no-persist navigation disposition and verified listing receipt. A duplicate request returns the original identity/results. This read model admits no new physical receipt family, and Onboarding cannot write it as a success flag. After a verified commit, provider setup may start in that real Project; Back, Close, Skip or provider failure cannot undo it.

Before executing an Onboarding creation request, Project System resolves the exact approved draft bytes identified by the setup binding and checks their digest. Content, history/backend and Settings choices come from that confirmed draft, not a consumer default. The reviewed setup requires Git or Jujutsu; existing verified history determines the backend, and neither backend is silently substituted for the other. An unavailable required owner route blocks the commit. Legacy caller payload summaries such as optional `init_git` do not override the reviewed binding or establish a second Project request schema.

Standalone versus containerized Server execution is not Project registration semantics. Project System records the selected Project Home Server reference but does not choose, create, or certify a standalone/container execution form; that residual stays with Server/Deployment owners and their central commands.

### 3.1.1 Generic remote-create/local-failure recovery composition (PJCT-007)

When an Onboarding creation path creates a remote repository and a later step fails — source preparation, clone/connect, history initialization, Settings rebind/apply, or registry publication — the operation exposes recovery-required truth through the central outcome contract, never a half-listed Project and never a new EventRecord or receipt family. This composition is provider-neutral and lives here, not in the GitHub-only PJCT-008: each actual Forge/SCM/Project command chain supplies its own verified remote result, and no arbitrary Forge create is routed through `cmd.project.new_github_repo`. The single Project-owned recovery command is `cmd.project.resume_creation`, defined below; it is not an alias of any runtime retry, Project Move resume, or authentication resume. A second generic wrapper, alias, or duplicate physical receipt family is forbidden; the durable recovery context below is custody, not a receipt family.

Only an original Project action whose exact currently owned command chain performed and receipted a remote create may anchor a remote-create recovery. PJCT-008 retains the exact `cmd.project.new_github_repo` / GI-042 / GI-032 GitHub compatibility chain. PJCT-010 additionally defines the per-service `cmd.forge.repository.create` and admitted `cmd.forge.repository.fork` compositions under `cmd.project.add_existing`; only their verified owner terminal create/fork results and receipt chains qualify. `cmd.project.new_local` has no remote create effect by definition and can never anchor a verified-remote recovery; a local creation carrying a remote receipt is rejected as a fake remote. `cmd.project.add_existing` anchors one only when its exact owned chain truly performed and receipted remote creation; the PJCT-010 tagged create/fork chains are the only newly admitted `add_existing` originals. Provider command/result identity is consumed from the owning chain, never fabricated here.

A timeout or otherwise ambiguous remote effect reconciles before any repeat create, through the Forge/SCM owners, never inside Project System: `reconcile ambiguous timeouts before retrying`. A Forge `effect_unknown` result admits only a reconciliation-only retry to a settled outcome (Forge §3.3); SCM reconciles the exact remote by object, commit, run, or correlation evidence and never blindly repeats a non-idempotent effect (SCS-016). Unknown is not failed: while the remote effect is unknown, only reconciliation runs — Project System repeats no create, deletes nothing, offers no Delete path, and infers no repository identity; failed-before-effect retains no remote identity; only a verified created identity unlocks the recovery routes. Never silently create it again or silently delete it. The user-facing name for the created thing is repository; packet wording for the notice is source lineage only, not frozen copy.

An exact idempotent replay of a terminal result re-observes that original result with `replayed=true` and no new effects; a rejected terminal result never advances by replay. Advancing past a failure requires the explicitly authorized Project-owned recovery/resume transition contracted here: the retained `project_creation_recovery_context` joined to the original operation, the exact reviewed draft, the verified Forge create result, and the known settled versus remaining effects, advanced only by `cmd.project.resume_creation` carrying a `creation_recovery_resume_binding`. The closed `project_action_id` set, extended with display-name-only rename, retains exactly this one creation-resume action; `cmd.project.move.resume`, `cmd.project.move.retry`, `cmd.authentication.resume`, and every Forge pipeline retry remain other owners' operations and are never valid Project creation-resume identities. The context names the original Project operation (command, instance, idempotency key, operation ref), the immutable original terminal result ref and digest, the reviewed setup binding, the exact Forge terminal create result/receipt and verified repository binding (provider, normalized host, account, provider repository identity), the remote effect state (`verified_created`, `failed_before_effect`, or `unknown`), per-route availability with reasons, the settled effects with their result/receipt refs, the remaining child steps, the one-active-resume claim, and the composition revision and hash. The composition is restart-safe: it persists under its recovery identity (`project_creation_recovery_context.v1:{recovery_id}` under SP-321 custody) with original command-instance/idempotency lookup, immutable terminal-result and remote-effect evidence, and a composition revision and hash, so Close, reload, or Client loss re-observes the same recovery instead of fabricating a new one. No half-ready Project, speculative identity, or commit binding forms from the context alone.

Join authority comes only from owner-resolved comparison, never from client booleans. The owner resolves the retained context, the original terminal result, and the Forge create result/receipt server-side and compares actual fields: the entire reviewed draft binding, the original command/instance/idempotency/operation identities, the Forge result and receipt refs with the verified repository binding, the composition revision and hash, and the settled and remaining effect sets with settled/remaining disjointness. The candidate `recovery_ref` must equal the retained `recovery_id`. Resolve the immutable original result by its retained ref and verify its SHA-256 over RFC 8785 canonical JSON under CV-333 before adopting its fields; a mismatched identity or digest rejects even a structurally valid result. A self-claim matches both the attempt command instance and idempotency key. The six `join_checks` booleans carried in transport are an owner-computed echo recorded after that resolution; a client-supplied `true` grants no authority and is ignored by the semantic check, and any mismatch fails closed even when every boolean reads `true`. The typed `creation_recovery_resume_round_trip` pairs retained context, candidate request, and original terminal result so the central semantic validator can compare those fields; its failure names are `resume_original_command_mismatch`, `resume_original_instance_mismatch`, `resume_original_idempotency_mismatch`, `resume_original_operation_mismatch`, `resume_reviewed_draft_mismatch`, `resume_forge_result_ref_mismatch`, `resume_forge_receipt_ref_mismatch`, `resume_repository_binding_mismatch`, `resume_composition_revision_stale`, `resume_composition_hash_mismatch`, `resume_settled_effects_mismatch`, `resume_remaining_effects_mismatch`, `resume_settled_remaining_overlap`, `resume_remote_effect_not_verified`, `resume_original_result_identity_mismatch`, `resume_original_result_not_rejected_terminal`, `resume_concurrent_active_attempt`, `resume_recovery_ref_mismatch`, and `resume_original_result_digest_mismatch`. Each compares the candidate binding against the owner-resolved retained record with exact string equality, exact integer equality, deep object equality, and set equality, as specified in the report handoff; the script implementation is a separate central worker.

A resume attempt is explicitly authorized by its own authorization ref, carries a fresh command instance and idempotency key bound to the original recovery, revalidates identity, currentness, and permissions against current fences, and executes only the remaining effects — no second remote create, no second clone of settled content, no second registry write, no second Settings apply of settled values. Resume attempt keys live in the `idempotency:project:resume:` namespace and instances in `command:project:resume:`, disjoint from original creation keys, so a reused original key can never validate as a resume. Reusing the original idempotency key is replay, never resume, and is rejected as a resume. A stale or changed draft, a mismatched repository binding or original operation, a repeated settled effect, or an unverified or unknown remote effect fails closed. While the remote effect is unknown only Forge/SCM reconciliation runs before any repeat create or any delete; the resume waits.

Exactly one resume attempt is active per recovery. The owner admits the active resume claim atomically (compare-and-swap on the retained claim with a fresh claim generation bound to the winning attempt identity); a second Client presenting a new attempt for the same recovery is rejected or coalesced onto the active attempt, never admitted alongside it. Child-effect execution and result adoption are fenced by the claim generation and attempt identity: effects and results from a superseded or unknown claim are discarded, never adopted. A crash restarts into the retained recovery, reconciles any in-flight child effect through its owner before retrying it, and only then continues remaining effects under a fresh claim. Stale-claim and concurrent-attempt evidence is typed in the round-trip fixtures.

The three routes project that retained owner state, separating owner resume eligibility from effective dispatch availability. `resume_eligible` is the owner verdict: the retained joins hold for a verified created remote with a current reviewed draft, a current composition, disjoint settled/remaining sets, and no fencing conflict. `available` is effective dispatch: eligibility plus current permission, a live recovery claim, and central registration, wiring, and native handler gates. A verified created remote alone never forces `available=true`. Until those gates hold, Continue Setup stays visible but unavailable with the exact fail-closed reason (`central_dispatch_unavailable`, or `concurrent_resume_active` while another attempt holds the claim); the Project-owned join itself is contracted. When dispatch is admitted, Continue Setup resumes under the fresh attempt identity bound to the original operation, reviewed draft binding, and verified create result, reconciles unknown effects first, and executes only unsettled steps. A changed draft under the same binding still fails closed, and an owner cancellation still leaves no half-row. Open Repository is enabled only on the verified binding and dispatches the existing `cmd.forge.repository.open_in_browser`; it mutates nothing and proves nothing about the Project. Delete Repository is a separate explicit destructive intent consumed from the Forge owner's FGI-021 admission of `cmd.forge.repository.delete`: it requires the exact provider, variant, normalized host, stable account, PM `repo_id`, provider repository ID, locator, binding generation, current direct revalidation with `mutation_safety=verified`, effective authority, `remote_side_effect` permission with a human actor, verified-create result and receipt refs, and fresh target-bound human confirmation, and it routes through the Forge owner only. It never runs as automatic rollback, as part of Continue Setup, speculatively while the remote effect is unknown, or on provider-scope reuse — selected-source authentication (MACS-005 / FGI-011) never authorizes deletion. Project System never executes deletion itself and dispatches no phantom command; the Forge delete row stays `handler_unavailable` until its own native evidence lands, separately from the resume row. Settings rebind (SSYS-036) settles under the resumed operation before listing, exactly as on the first attempt.

### 3.2 Project-context Backup and Restore routes

The Projects page, Project card, Project details, and Project-bound Settings may expose the following contextual actions, but each action routes directly to the Backup/Restore owner contract in `Plans/Backup_Restore_System.md`. Project System defines no private backup, snapshot, repository, browse, download, export, or restore handler and never treats dispatch acceptance, a preview, or a browse result as Project registration.

| Visible Project action | Backup/Restore route | Project consumer rule |
|---|---|---|
| `Back Up Project` | `cmd.backup.project.create` | Bind the current immutable `project_id` as the one-element `target_project_ids`, plus the exact Home Server, destination, policy revision, Project/registry currentness, initiating surface, and return context. Backup/Restore owns capture, repository bytes, encryption, upload, verification, receipt, cancellation, and retry. |
| `Restore as New` | `cmd.restore.preview` followed, after a current accepted preview and required approval/recovery receipts, by `cmd.restore.project_as_new` | Project System allocates/reserves a fresh never-reused `project_id` for the target registration intent. It lists that Project only after the verified terminal restore receipt is accepted through `cmd.project.add_existing {registration_kind=restore_as_new}`. The new Project retains explicit source-Project and backup/manifest lineage; external forge host/account/repository identity remains external, is not renamed or rewritten to the new PM identity, and must be revalidated by Source Control/forge owners before use. No recovered execution lease, live request ID, push, pipeline, or automation is activated by registration. |
| `Backup history` | `cmd.backup.open_history` | Open the Backup-owned history projection with the exact Project and Server filter plus caller return route/focus. It does not create a Project-owned history model. |
| Open snapshot | `cmd.backup.browse` | After an explicit history selection, bind the exact `backup_id` and preserve `repository_id`, immutable `snapshot_id`, `capture_set_id`, Project filter, selected path/filter, initiating Client, currentness, and caller focus in the Backup-owned browse/route projection. Refresh or stale recovery never substitutes `latest` or a different snapshot. |

Every forward route and terminal reverse route preserves the initiating Project row/card identity, immutable `project_id`, repository/snapshot/capture-set selection when present, filter, focus target, invocation/continuation identity, initiating Client, expected caller revision, and Backup currentness. Back, close, Client disconnect, or navigation does not fabricate cancellation or success. Browse, history, compare, download, extract, export, and archive retrieval are non-restore operations: they neither mutate nor select the active Project, activate restored content, resume work, or execute content.

These Project consumer routes use the Backup/Restore owner request/result/error/availability family and owner receipts or `ObservableWork` where applicable. Required approval/recovery evidence means the exact BRS-023 phase-local prerequisite, including its narrowly validated emergency alternative; Project System does not grant consent, copy a recovery point, or infer rollback availability. It lists a restored Project only from the verified owner terminal receipt even when the owner has valid emergency consent. They imply no Project or Backup `EventRecord`; `expected_event_types=[]` remains mandatory until Event Authority separately admits an exact family. All future Backup handlers remain `handler_unavailable` without source-hashed native evidence. Plan prose, command names, schemas, fixtures, route targets, and static wiring are future contract truth only, not proof of executable backup/restore, GUI implementation, persistence, provider readiness, or recovery safety.

ContractRef: ContractName:Plans/Backup_Restore_System.md#BRS-006, ContractName:Plans/Backup_Restore_System.md#BRS-014, ContractName:Plans/Backup_Restore_System.md#BRS-016, SchemaID:pm.backup_restore_system.contracts.v2, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Forge_Integrations.md

Typed errors are `invalid_request`, `identity_ambiguous`, `identity_conflict`, `stable_config_missing`, `source_unavailable`, `permission_denied`, `filesafe_blocked`, `destination_exists`, `registration_failed`, `stale_project_revision`, `archive_state_required`, `storage_hold_active`, `owner_unavailable`, or `cancelled`. A source/network/owner failure stays a failure and cannot leave a `listed` Project without a verified receipt.

## 4. GUI projection, motion, and accessibility

The Projects surface is a registry projection, not operational truth. The normal view shows human name, bounded location/source summary, lifecycle, last opened, and concise attention text. Technical IDs, host/path/repository detail, migration aliases, and currentness hashes live under Details. Search and recent lists are virtualized and cached. Refresh is incremental; a stale discovery result cannot reorder or overwrite a newer row.

The page has one dominant `New Project` CTA. Its launcher offers equal new, folder, online, computer/NAS, restore and from-chat entry ways; advanced fields remain disclosed within the chosen way. One guided page and live Review consume PJCT-009/PWIZ-037. Cards and rows expose labelled Open, Details and More, the shared attention vocabulary, and owner-derived history/online-copy/backup facts. Opening or switching a Project must not pause, cancel, or move background work in another Project. Non-active activity remains visible through owner summaries, without loading every runtime surface. PJCT-012 owns the Project-page consumer boundaries.

Add/open confirmation uses a `180 ms` opacity/translation settle, archive/remove collapses a row over `160 ms` only after owner acceptance, and active selection uses a `120 ms` non-spatial highlight. Motion is interruptible, nonblocking, and uses stable Slint model IDs, opacity, translation, and clipping. Reduced Motion changes state immediately with focus/announcement. A failed mutation restores the row in place and announces the owner error; no optimistic success survives rejection.

Every row and menu action has a text label, visible focus, keyboard activation, non-color lifecycle state, and accessible name. Focus returns to the invoking row after dialogs/routes. `Escape` closes menu, then detail, without changing selection. Long/localized names wrap or elide with an accessible full name; duplicate names show Project/short-ID disambiguation. Destructive data deletion is never adjacent copy-equivalent to list removal and requires the Storage-owned strong-confirmation surface.

## 5. Persistence and migration

Storage owns the existing `projects:v1` registry binding. The payload must validate as `ProjectRecord`; Project System owns its meaning, while Storage owns atomic bytes, replay, retention, and migration receipts. `project_state:v1:{project_id}` is a separate shell/UX projection and cannot become the Project aggregate. Project summary/attention, coordination, Source Control, containers, artifacts, terminal state, and Orchestrator projections remain separate keys/owners.

Legacy path-keyed records are migration inputs only. Migration canonicalizes candidate locations under FileSafe, joins any stable config/repository/host identity, and creates or reuses one `project_id` only when the identity proof is unambiguous. Equal path strings on different Hosts/Environments do not deduplicate. Conflicts quarantine before registry publication. The migration receipt records accepted, merged, new-ID, stale, skipped, and quarantined entries plus alias refs and before/after hashes. Legacy app-global/singleton active Project state becomes an explicit selected `project_id` only when that Project resolves; otherwise no Project is selected.

Removing a list row preserves the stable identity alias needed for safe re-registration according to retention policy, but does not retain raw secrets or broad path data beyond the storage/permission policy. Deleting Project data never permits reusing the deleted `project_id`; restoring a backup as new always allocates a new identity and records lineage to the source Project without copying its ID.

## 6. Verification

Static validation must cover one positive and one negative for every Project action plus ordinary Git clone handoff, distinct Jujutsu clone handoff, existing local, SSH/server-hosted registration, verified restore-result registration, immutable-ID rename/move/restore cases, same-path-different-host cases, atomic registration, idempotent retry, half-registration rejection, archive/restore/list removal, strong separation from data deletion, migration quarantine, no-secret records, exact route/focus/continuation return, cancellation without half-row, duplicate-name disambiguation, virtualized large lists, stale registry and Project currentness rejection, multi-Project background continuity, keyboard/screen-reader behavior, six widths, all ten themes, Reduced Motion, and Slint-portable interruption.

Owner-routing tests must prove Settings values stay with Settings; sync/move stays with PSB; Git/JJ/forge stays with Source Control; backup/restore stays with its owner; physical bytes/holds/deletion stay with Storage/FileSafe/Permissions; and shell/runtime projections never become ProjectRecord fields. Schema/fixture success is structural evidence only, not runtime registration, persistence, GUI, migration, or data-safety proof.

## 7. PlanUnits

### PJCT-001 - Project aggregate and registry owner

```yaml
plan_unit_id: PJCT-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: >-
  Project System is the sole owner of immutable project_id, ProjectRecord registry meaning, registration lifecycle, human metadata, archive/list removal, active Project selection, and Project list projections; it does not own Settings values, content sync/move, topology, Source Control, backup/restore, storage deletion, shell state, Named Plans, or runtime truth.
  Projects may coexist with genuine application-scope chats and workflows owned elsewhere; those records do not acquire a synthetic Project or Project Vault. This owner also owns the Starter file-set meaning in PJCT-011, while its file writes remain FileSafe- and source-owner-routed. Settings values and app layout keep their existing owners.
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
- source_report:register-fullthread.md#R-052-through-R-056
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
negative_constraints: [Do not identify a Project by path alone., Do not duplicate Settings or PSB., Do not treat list removal as data deletion.]
```

### PJCT-002 - Project actions, persistence, and migration

```yaml
plan_unit_id: PJCT-002
unit_type: requirement
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: >-
  Project lifecycle actions are typed, revisioned, idempotent, permission-aware, receipt-bearing operations over projects:v1; legacy path/singleton entries migrate through identity proof and quarantine, while project_state and domain projections remain separate consumers.
  cmd.project.rename changes display_name through the existing ProjectActionRequest/ProjectActionResult family and sole handlers::project::rename. It checks Project/registry revision and currentness, exact return and idempotency; project_id, stable config, physical folder, repository and Vault identity remain unchanged. Archive consumes the BRS-033 schedule pause consequence before reporting the combined outcome.
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
- source_report:wave9-lane3.md#Named-Plans-and-Projects
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
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
  The existing cmd.project_template.* engine accepts a closed configuration or starter_file_set use under PJCT-011, without growing a second catalog writer or replacing configuration compatibility. Saved setups remain detached Settings transactions for own values, selected owner things and account choices; a Starter copies selected files.
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
source_lineage:
- source_ref:server-command-gap-adjudication:rows-103-105
- source_ref:server-command-gap-adjudication:rows-117-118
- source_ref:server-command-gap-adjudication:rows-128-133
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
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
  The Settings ladder resolves portable behavior defaults through SSYS-002/059; the concrete operational backup policy, occurrences and writer assignments retain Backup custody. A detached copy takes selected own values and approved owner subtransactions, never live schedule authority, credentials or a source link.
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
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
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
canonical_text: >-
  Working Notebook records are Project data, not Settings values or operational objects. duplicate_configuration excludes note bodies and checkpoints; duplicate_with_history includes them through verified backup/import with identity rewrite and no duplicated writer authority or execution lease. Thread forks/rewinds use correct source revisions and destination identity, never leaking future-branch note decisions as current or cloning usage as new cost.
  Application scratch notebook custody before conversion belongs to Working_Notebook and Shared Integration Runtime. A chat conversion uses their fenced destination-Vault transfer and ACD-510/511 lineage; neither Saved setups nor Starter file sets copy notebook, Goal, Plan or Crew bodies.
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
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: ["duplicate_configuration", "duplicate_with_history", "identity rewrite"]
negative_constraints:
  - Do not carry note bodies through configuration duplication or settings transfer.
owner_hints: [Plans/Project_System.md, Plans/Backup_Restore_System.md]
```

ContractRef: ContractName:Plans/Project_System.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/Working_Notebook.md

### PJCT-007 - Reviewed Shared Project Commit And Provider Handoff

```yaml
plan_unit_id: PJCT-007
unit_type: integration_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: >-
  Project System consumes one authorized reviewed setup draft through its existing new/open/add command mapping and backend-native clone/SSH/restore child owners. A real identity may be reserved only after explicit person commit consent or the task-bound mode authority admitted by PS-146/148; N27 never fabricates person consent. Publication as listed and usable waits for required configuration, content/history, Settings rebind/apply/readback and terminal owner receipts. project_setup_commit_binding is an exact read model of the actual ProjectActionResult and required receipt chain, never new physical commit authority. Project-bound provider setup requires that committed real Project and cannot uncreate it on navigation or failure. N15 separately admits provider setup with explicit application scope on the named Computer when Project creation is deferred. For any remote-create path whose later local steps fail, the same unit owns the provider-neutral recovery composition — reconcile-before-retry, retained recovery context, and three gated routes — with exact replay re-observing and never advancing a rejected result. Resume authority comes only from owner-resolved joins over the retained context, the original terminal result, and the Forge create evidence; the durable context persists under SP-321 custody with a one-active-resume claim; owner resume eligibility stays distinct from effective dispatch availability; Delete Repository is consumed from the Forge FGI-021 admission; and only an original action with an owned receipted remote-create chain anchors a recovery.
  PJCT-009 makes this the one reviewed setup-draft owner for Onboarding, New Project and make-project-from-chat. Its consumer discriminator preserves exact source draft/ref/revision/hash and consent or admitted mode authority; initial intake is application-scoped with null Project. Current FO-22 applicability, Back/Edit branch invalidation and fresh Review are required. Recovery binds the tagged PJCT-010 create/fork origin and its exact receipt graph; all existing claim, original-result digest, replay and unknown-effect fences remain.
gui_related: true
gui_classification_reason: Determines the visible Review commit, truthful Project creation progress/listing and
  provider handoff.
depends_on:
- PJCT-001
- PJCT-002
- SSYS-036
- SCS-016
- FGI-009
- FGI-010
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
  result or mismatched receipt fails closed; replaying the original key never resumes, and only
  cmd.project.resume_creation with a fresh attempt identity bound to the retained recovery advances.
- Close/Back/provider Skip and failure preserve an already committed Project and do not replay the owner operation.
- A timeout or otherwise unknown remote effect reconciles through the Forge/SCM owners before any repeat create;
  reconcile ambiguous timeouts before retrying; a Forge effect_unknown result admits only reconciliation-only retry,
  and unknown is never retried blind, never treated as failed, never deleted speculatively, and never given an
  inferred identity.
- Failed-before-effect retains no remote identity; a verified created remote with later local failure retains the
  original operation/idempotency, the verified repository binding, the exact reviewed draft binding, and the return
  context, with no half-listed Project and no commit binding; exact idempotent replay re-observes the original
  terminal result with replayed=true and no new effects, and never advances a rejected result.
- Continue Setup is enabled only with the explicit Project-owned recovery/resume transition and typed join to the
  original operation, reviewed draft, verified create result, and settled/remaining effects, contracted as
  cmd.project.resume_creation with a creation_recovery_resume_binding over the retained
  project_creation_recovery_context; replaying the original idempotency key re-observes and never resumes, and a resume
  carries a fresh attempt identity bound to the original recovery; owner resume_eligible stays distinct from effective
  dispatch available, a verified created remote alone never forces available=true, and Continue Setup stays visible but
  unavailable until current draft, permission, recovery claim, central registration, wiring, and handler availability
  all hold for the resume command; Open Repository uses the verified binding through
  cmd.forge.repository.open_in_browser; Delete Repository is separate explicit destructive intent consumed from the
  Forge FGI-021 cmd.forge.repository.delete admission with its exact currentness and target-bound confirmation, never
  automatic, never Project-local, and never dispatched while the remote effect is unknown.
- A changed draft under the same binding fails closed; an owner cancellation leaves no half-row; selected-source
  authentication never authorizes deletion; Settings rebind settles under the resumed operation before listing.
- Resume authority is owner-resolved comparison of actual fields — entire draft binding, original identities, Forge
  result/receipt refs with repository binding, composition revision/hash, settled/remaining sets — typed as
  creation_recovery_resume_round_trip; client join_checks booleans never grant authority and mismatches fail closed
  with every boolean true.
- The recovery context persists under SP-321 custody keyed by recovery_id with immutable original terminal-result and
  remote-effect evidence; one atomic compare-and-swap claim admits a single active resume, a second new attempt is
  rejected or coalesced, child effects adopt only under the winning claim generation, and crash restart reconciles
  in-flight effects before retry.
- PJCT-008 retains the cmd.project.new_github_repo / GI-042 / GI-032 chain. PJCT-010 defines additional tagged create/fork chains under cmd.project.add_existing, each with exact owner results; cmd.project.new_local never anchors a remote effect.
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
- Plans/Forge_Integrations.md#33-typed-command-admission-and-result-boundary
- Plans/Source_Control_System.md#SCS-016
- source_packet:PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03/01_COMBINED_HANDOFF.md:103-124
- source_packet:PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03/10_ACCEPTANCE_FAILURE_AND_USABILITY_MATRIX.md:81-83
- source_report:reports/concept-packet-integration-20260926/project-recovery-owner.md
- source_report:reports/packet-integration-completion-20260926/project-recovery.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: ["Continue Setup", "Open Repository", "Delete Repository", "effect_unknown", "reconcile ambiguous timeouts before retrying"]
negative_constraints:
- Do not mint a second generic Project or Onboarding wrapper/alias command or a duplicate physical receipt family;
  cmd.project.resume_creation stays the sole Project recovery action and the durable recovery context is custody,
  not a receipt family.
- Do not confuse owner acceptance, preview or provisional identity with committed listing.
- Do not fabricate child results, overwrite unrelated Project state or claim native persistence proof.
- Do not speculate a repository deletion after an unknown remote effect.
- Do not duplicate Forge/SCM reconciliation inside Project System.
- Do not dispatch a resume or delete without the contracted owner transition or Forge delete action.
- Do not grant resume authority from client join_checks booleans; only owner-resolved field comparison authorizes.
- Do not execute repository deletion inside Project System or as automatic rollback; deletion routes only through
  the Forge FGI-021 admission with its currentness and target-bound confirmation.
- Do not admit a new_local original or any original without an owned receipted remote-create chain into a
  verified-remote recovery.
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
identity even after its result returns a Project. The candidate `project.github_repo_bound`
payload describes a Project-scoped child fact of that same operation, not an identity
rewrite. `ProjectRegistry.forge_registration` owns its send-only obligation after
committed registration and verified readback. Its closed payload contains identity/fence/digest/receipt
metadata only; the envelope Project ID equals the actual result. It joins GI-042
intake by operation ID, original request digest and command-intake admission receipt.
Row 1 of `Plans/github_project_event_admission.json` records the DL-039 emit-only,
`quarantined_not_admitted` disposition. It grants no EventRecord registration,
append, retention assignment, replay/projection or checkpoint authority. Even valid
candidate deliveries leave identity/checkpoint state unchanged. Project commit and
its owner receipts remain governed separately; no second ProjectRecord/store is created.

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

For the exact `cmd.project.new_github_repo` / GI-042 creation case, this unit consumes the PJCT-007 generic recovery composition in §3.1.1; it is not all-provider recovery authority. The verified remote result is the GI-042 terminal create result and receipt with its repository binding, and GI-032 remains the remote-side-effect and durable-receipt boundary. This GitHub chain retains its exact legacy root; the separate PJCT-010 compositions provide the other admitted anchors. An exact retry re-observes the original terminal result — accepted or rejected — with `replayed=true`, no new API/clone/registry/event effects, and no identity change; a rejected result never advances by replay, and only `cmd.project.resume_creation` with a fresh attempt identity bound to the retained recovery advances. The PJCT-007 gates apply unchanged: Continue Setup uses only the owner-resolved typed join with owner eligibility distinct from effective dispatch availability, and stays visible but unavailable until current draft, permission, recovery claim, central registration, wiring, and handler availability all hold for the resume command; Open Repository uses only the verified binding; Delete Repository is consumed from the Forge FGI-021 `cmd.forge.repository.delete` admission with its exact currentness and target-bound confirmation, never Project-local, never automatic, and never while the remote effect is unknown. Other offered-service create and GitHub/GHES fork routes use the exact PJCT-010 chains and their own owner results; this GitHub command is not their wrapper.

### PJCT-008 - Typed GitHub-to-Project commit and event binding

```yaml
plan_unit_id: PJCT-008
unit_type: requirement
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: >-
  The existing new-GitHub-Project command joins GI-042 intake to the existing Project action family, an application-scoped creation operation, verified owner receipts and atomic listed Project readback; the Project-bound candidate payload follows that committed result but remains an emit-only, unadmitted obligation under DL-039.
  The exact GitHub command and sole handler remain compatibility, including immutable historical payload and DL-039 quarantined event dispositions. New service chains use PJCT-010 and never substitute provider values in this command or infer event admission from its candidates.
gui_related: false
gui_classification_reason: Owner request/result, identity, receipt and event integration without presentation changes.
depends_on: [PJCT-001, PJCT-002, PJCT-007, GI-042]
unblocks: []
acceptance_criteria:
- No provisional Project ID, acknowledgement-as-success, foreign readback, changed return context, missing receipt or unresolved remote effect is accepted as completion.
- Existing command, sole planned handler, typed family and placement remain; exact retries preserve original identity and execute no effects.
- The Project-bound candidate joins the original application-scoped operation without changing that operation's identity or granting persisted-event admission.
- EventRecord append/replay remains denied under DL-039 without identity consumption or checkpoint/projection changes, independently of candidate validity and command-result retry.
- Static validation grants no native availability, runtime proof, readiness, WorkNodes or governance certification.
- For the exact cmd.project.new_github_repo / GI-042 creation case only, this unit consumes the PJCT-007 generic recovery composition in §3.1.1, with the GI-042 terminal create result as the verified remote result and GI-032 as the remote-side-effect boundary; it is not all-provider recovery authority, exact replay re-observes without advancing a rejected result, only cmd.project.resume_creation with a fresh attempt identity advances, and the PJCT-007 Continue eligibility/dispatch gating and Forge FGI-021 Delete-consumption gates apply unchanged.
validation_surfaces: [Plans/project_system_contracts.schema.json, Plans/github_project_event_payloads.schema.json, Plans/github_project_event_fixtures.json, scripts/pm-github-project-integration.py, tests/test_pm_github_project_integration.py]
risk_class: premature_project_publication_or_duplicate_remote_effect
reasoning_tier: high
context_scope: existing_github_project_creation_handoff
implementation_surfaces: [Plans/Project_System.md, Plans/GitHub_Integration.md, Plans/Wiring_Matrix.production.json, scripts/pm_project_forge_contract.py, scripts/pm_ui_command_response.py]
node_compile_hint: {mode: static_owner_integration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Project_System.md#3-actions-commands-and-results
- Plans/GitHub_Integration.md#GI-032
- Plans/Wiring_Matrix.production.json#/entries/catalog.project_new_github_repo
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
negative_constraints: [No fake Project identity., No consumer-owned Project writer., No automatic repository deletion or duplicate create., No Onboarding or Settings design change., No native or global audit closure claim.]
```

ContractRef: ContractName:Plans/GitHub_Integration.md#GI-042, ContractName:Plans/Project_System.md#PJCT-007, ContractName:Plans/Forge_Integrations.md#FGI-009, ContractName:Plans/Forge_Integrations.md#FGI-010, ContractName:Plans/Source_Control_System.md#SCS-016, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.


## Projects refresh accepted owner addendum (2026-11-03)

### PJCT-009 - One reviewed Project setup draft

```yaml
plan_unit_id: PJCT-009
unit_type: integration_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: |-
  Project System owns one reviewed setup-draft engine consumed by Product Onboarding, New Project and Make a project from this chat. The typed project_setup_binding adds setup_consumer=onboarding|new_project|chat_conversion while preserving source draft/ref/revision/hash, queued plan/ref/reviewed revision/hash, exact return context, permission/FileSafe and current preflight, idempotency, and paired Settings preview ref/hash. The old onboarding_setup_binding name is compatibility-only for exact historical requests; version-aware reading must preserve their original bytes, hashes and replay results. Consumers do not write Project completion or create a second draft engine.

  Before commit, the draft is application-scoped with project_id=null and a real session/recovery identity. Read-only source inspection, verified selected-source authentication and Settings preview are permitted only through their owners. Creation/mutation waits for the named explicit commit or Permissions-admitted task-bound mode authority. Only then may Project reserve its actual never-reused identity for child owners. Project-bound child requests cannot substitute a draft, path, source URL or placeholder as project_id.

  Applicability and valid Back history derive from current answers. Changing acquisition, Computer, source, service, variant, owner or destination invalidates abandoned branch state and dependent validation; Edit revalidates current choices and returns through a fresh Review. Returning must never restore an old folder, online repository, auth choice or acknowledgement from an inapplicable path. Preserve current PM7 FO-22 fixes. Listing waits for required source/history/configuration and exact Settings preview rebind/apply/readback, plus actual terminal owner receipts; accepted alone is not completion. Failure remains failed/recovery_required and cannot publish a half-ready Project. A new registry Project from unregistered folder/online/device content may use detached own_values copy; opening an already registered Project, Later and connect-only never copy.

  Git and Jujutsu are equal local history choices in this setup; existing verified history wins and no no-history option is offered here. Backend unavailability blocks rather than silently substituting. N15 Later has no Project commit and instead offers AI setup with explicit app/Computer scope before a No project chat. A chat conversion calls its own current preview/copy/check/cutover engine and moves the chat only after verified Project listing; this setup neither rewrites history nor confers destination authority.

  account_resolution is recomputed on every work-Computer change; explicit look/NieR choices and other Settings-owner-excluded IDs remain excluded from the detached copy. Your usual settings resolves the full admitted ladder, not a snapshot of another Computer path.

  Make a project from this chat and Move this chat into a project remain equal visible entries owned by ACD-510/511. Conversion-to-new consumes the same live reviewed setup and the exact CV-367 manifest. Regular obtains the person apply; N27 permits only the guarded task-bound YOLO route for a clearly requested destination under fresh destination authority. Protected sign-in, host trust and claim remain human. The creation operation retains its original application identity with project_id=null and records the actual resulting Project separately; reserving or listing that Project never rekeys the original operation or manufactures a dual-scope event. Chat cutover waits for the real committed/listed/readback result. Partial or unknown results keep the app chat intact and reuse the same retained operation and settled-versus-remaining phases, with no duplicate remote create or automatic delete. App Plan handoff after conversion uses the exact source-to-destination revision map and a fresh, separately admitted Project intake; conversion never enters Planning Wizard, PRD Builder or Orchestrator automatically.

  SSH source prerequisites consume the protected Server protocol in SRV-018 and the RAS-017 boundary: cmd.server.ssh.trust uses sole handlers::server::ssh_host_trust, and cmd.server.ssh.public_key.install uses sole handlers::server::ssh_public_key_install. Each has preview|apply phases; apply is human-only on the initiating active Client under the exact target/observation/trust/key/currentness/permission/return commitment. SSH host trust pins the actual host/port/key observation; ssh_host_key_changed blocks reuse until a fresh explicit replacement preview compares the old and new fingerprints and the person approves that exact replacement. Installation names the exact remote account, references only the public key from the one shared SSH key list, checks weak-key eligibility before reuse, and CAS-checks observed authorized_keys while preserving existing entries. The Server owner proves idempotent readback or retains unknown-effect reconciliation before any retry. Requests/results carry no private key, password or passphrase; protected input stays in the existing secret/auth broker. These separately admitted source prerequisites create neither Project registration nor Client pairing/PM claim/provisioning/remote-ingress authority, and a mode/grant never supplies human trust or key-install consent. expected_event_types=[] and handler_unavailable remain until actual native proof; browsing, reachability or integration.connection.* cannot impersonate either effect.

  The final SRV-018 command/data table is authoritative for every original target/challenge/human-decision/trust/key/file/receipt source and phase-specific ref. Its actor is human_gui|human_palette and scope is the actual executing claimed Server; an unmanaged SSH host never receives an invented PM server_id. An effect_unknown result preserves the owner work/reconciliation ref and cannot complete setup. Unsupported remote atomicity, unsafe permissions or symlink/file identity drift refuse without a shell fallback or permission loosening. Cancel, Project failure, Settings rollback and conversion Undo cannot speculatively remove installed trust or public entries; any cleanup is a fresh protected owner action. Installation proves the entry only, with later connection readiness independently checked.
  For conversion-to-new, the live read-only preview uses ChatMoveDraftPreviewManifestV1 with the actual setup draft identity and no reserved Project. The accepted Create project and move chat reserves once through this owner; ChatMoveCutoverManifestV2 then records reservation plus committed/listed/readback receipts and rebinds the reviewed plan to the real target. Changed visible effects require renewed preview. Files copy/verify and source work fences still precede chat cutover; failure before reservation has no destination Project and failure after reservation reuses the retained creation operation.
gui_related: true
gui_classification_reason: Defines visible setup, choice, status, recovery or exact return behavior.
depends_on:
- PJCT-007
- SSYS-036
- SCS-011
unblocks: []
acceptance_criteria:
- Each consumer uses the same reviewed draft identity and exact currentness/return/idempotency contract.
- Every abandoned path fails stale reuse, including Existing folder to New, online to Restore, service or Computer
  changes, and Review Edit.
- A terminal Project result and required child receipts settle before listed/readback, with exact Settings rebind
  and rollback on failure.
- N15 Later creates no Project or commit proof and admits AI setup before No project landing.
- >-
  Conversion-to-new preserves the source app chat until verified Project listing; stale destination authority, unknown remote effects or a partial phase cannot admit cutover or repeat settled effects.
- >-
  Regular and N27 YOLO consume the same current preview with authentic distinct authority; Plan handoff requires an exact revision map and fresh Project intake.
- >-
  SSH trust/key-install effects require their own exact human Server-owner apply and terminal readback; a setup commit, read receipt or mode/grant cannot impersonate consent, create a Project or replay an unknown remote effect.
validation_surfaces:
- Plans/project_system_contracts.schema.json
- scripts/pm-projects-refresh-contracts.py
risk_class: identity_authority_or_false_completion
reasoning_tier: high
context_scope: projects_refresh_pjct_009
implementation_surfaces:
- Plans/Project_System.md
- future existing owner handlers; handler_unavailable until native evidence
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#P1-P12; S9-S11; N15/N27; pass-1 §4
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-e
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md#18-and-21
- 'Jared, 2026-11-03 (verbatim): Those look good, except goals and crew should be allowed in no project.'
- 'Jared, 2026-11-03 (verbatim): Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t.'
- '/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-E01'
- 'Plans/Server_System.md#SRV-018; Plans/Remote_Access_System.md#RAS-017; A interface freeze pm-mail 1103211659-9a77 (2026-11-03)'
- 'Plans/Server_System.md#SRV-018 exact command and data contract; A publication pm-mail 1103212607-5405'
preserved_exact_tokens:
- project_setup_binding
- setup_consumer
- onboarding_setup_binding
- project_id=null
- FO-22
- own_values
- No project
- account_resolution
- Make a project from this chat
- Move this chat into a project
- N27
- cmd.server.ssh.trust
- handlers::server::ssh_host_trust
- cmd.server.ssh.public_key.install
- handlers::server::ssh_public_key_install
- expected_event_types=[]
- ssh_host_key_changed
- effect_unknown
- human_gui|human_palette
negative_constraints:
- Do not register cmd.project.create, a generic clone/init command or another Project setup writer.
- Do not treat acceptance, provisional IDs, old Review or client success flags as listed completion.
- Do not reinterpret historical request hashes or replay keys when generalizing the binding.
owner_hints:
- Plans/Project_System.md
compatibility_only_notes:
- Existing exact historical Project requests/results/receipts remain readable under their original version; no in-place
  reinterpretation.
stale_retired_dispositions:
- Earlier pending decision labels are superseded by the approved packet; native implementation and governance certification
  remain unproved.
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-009, ContractName:Plans/Plan_Document_System.md#PDS-003

### PJCT-010 - Per-service creation and contribution recovery chains

```yaml
plan_unit_id: PJCT-010
unit_type: integration_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: |-
  The same reviewed setup owns the following exact chains. For github_cloud and currently host-policy-admitted github_enterprise create, preserve cmd.project.new_github_repo with sole handlers::github::project_new_repo and PJCT-008/GI-042 results. For gitlab_saas, gitlab_self_managed, azure_devops_services, azure_devops_server, bitbucket_cloud, bitbucket_data_center, forgejo and gitea, use cmd.project.add_existing with registration_kind=forge_created as the root Project composition. That root first admits and reserves the actual Project identity, calls cmd.forge.repository.create through sole handlers::forge::repository_create with FGI-023 service options, adopts its exact verified remote identity/result/receipt, prepares the selected source through the backend owner, adds or binds its remote through SCS-025, optionally publishes only when explicitly included in Review, then completes stable config, Settings and atomic registry/readback. There is no new per-service wrapper command and no substitution of providers in the GitHub command. Hosting APIs do not create paid accounts or Azure team projects.

  Every GitHub/GitLab chain consumes FGI-023's normative profile-to-variant mapping through creation and binding: gitlab_saas resolves to gitlab_com, gitlab_self_managed to gitlab_self_managed, and the two GitHub profiles retain their matching variant spellings. gitlab_dedicated has no New Project create profile. Validate the paired options/result binding before adopting its remote identity; do not rename a profile or infer a variant from a service label.

  Source preparation is exact per draft: an empty new source is materialized and initialized once through the selected backend owner; existing history binds without grafting another history; copying an existing remote uses cmd.source_control.repository.clone for Git or cmd.jujutsu.git.clone for Jujutsu. A clone is not also run against settled local content. If initial files/local history exist, the hosted repository starts empty and any first upload is separately listed; conflicting initial histories are refused. Plain Git addresses are transport-only and cannot enter create. Optional online setup added to an already listed Project is a Forge/SCM mutation, not re-registration or a new Project setup recovery anchor.

  P2 fork contribution uses root cmd.project.add_existing, native git_clone or jujutsu_clone registration, and acquisition_provenance.kind=fork_contribute. At reviewed commit call cmd.forge.repository.fork through handlers::forge::repository_fork for GitHub/GHES only, adopt the verified fork result, clone that exact fork once, add original upstream through SCS-025, create the exact branch/bookmark through the backend owner, bind the original/base and fork/head repositories under FGI-024, then Settings and registry/readback. Using a previously verified existing fork is an explicit branch of the preview and performs no fork-create effect. Non-contribution remote acquisition uses acquisition_provenance.kind=online_import with git_clone or jujutsu_clone. A verified mounted source uses mounted_existing. Preserve all nine pre-existing registration kinds including new_local, existing_local, git_clone, jujutsu_clone, forge_created, ssh_remote, restore_same_project, restore_as_new and migration; acquisition provenance is a closed orthogonal object, not a generic clone kind or other-app import.

  Recovery extends PJCT-007 with tagged create/fork origin, chain kind and immutable owner operation/result/receipt refs. remote_effect_state=unknown permits reconciliation only, failed_before_effect retains no remote identity, and verified_created permits retained recovery with settled versus remaining effects. A fork result cannot be forged as a create result. The retained context joins exact original Project root and reviewed draft to the nested Forge/SCM receipt graph and original terminal result digest. cmd.project.new_local has no remote effect and cannot carry these anchors. Exact original-key replay only re-observes; cmd.project.resume_creation alone uses a fresh attempt and one CAS-fenced active claim, revalidates current authority and executes only unsettled steps. Open Repository uses the verified binding. Delete Repository remains a separate explicit human target-confirmed FGI-021 recovery route, never rollback, resume, speculative cleanup or an Undo consequence.
gui_related: true
gui_classification_reason: Defines visible setup, choice, status, recovery or exact return behavior.
depends_on:
- PJCT-007
- PJCT-008
- FGI-023
- FGI-024
- SCS-025
unblocks: []
acceptance_criteria:
- Each offered service/variant has an exact root, provider target, backend child sequence, receipt graph and atomic
  registry result.
- Failures before effect, unknown effect and each local phase after create/fork leave no half-listed Project; resume
  never repeats settled create/fork/clone/bind/Settings/registry effects.
- Concurrent fresh resumes are rejected/coalesced through the retained claim and stale claim results are discarded.
- Original nine kinds stay exact; mounted_existing and closed provenance match the adopted schema and fixtures.
validation_surfaces:
- Plans/project_system_contracts.schema.json
- scripts/pm-projects-refresh-contracts.py
risk_class: identity_authority_or_false_completion
reasoning_tier: high
context_scope: projects_refresh_pjct_010
implementation_surfaces:
- Plans/Project_System.md
- future existing owner handlers; handler_unavailable until native evidence
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#P1/P2/P5; N2/N13/N20
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-e
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md#18-and-21
preserved_exact_tokens:
- registration_kind=forge_created
- acquisition_provenance.kind=fork_contribute
- acquisition_provenance.kind=online_import
- mounted_existing
- cmd.project.add_existing
- cmd.project.resume_creation
- cmd.project.new_local
- verified_created
- failed_before_effect
- unknown
negative_constraints:
- Do not route arbitrary Forge creation through cmd.project.new_github_repo or claim new_local made a remote.
- Do not repeat create/fork after an ambiguous result or delete a repository on failure, cancellation or conversion
  Undo.
- Do not equate current schema/receipt design with handler or EventRecord admission.
owner_hints:
- Plans/Project_System.md
compatibility_only_notes:
- Existing exact historical Project requests/results/receipts remain readable under their original version; no in-place
  reinterpretation.
stale_retired_dispositions:
- Earlier pending decision labels are superseded by the approved packet; native implementation and governance certification
  remain unproved.
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-010, ContractName:Plans/Plan_Document_System.md#PDS-003

### PJCT-011 - Starters are file sets; Saved setups are detached settings

```yaml
plan_unit_id: PJCT-011
unit_type: integration_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: |-
  Project System owns one versioned Starter file-set catalog, managed through Settings Starters / My starters and the existing cmd.project_template.save, cmd.project_template.create_project, cmd.project_template.rename, cmd.project_template.delete and typed local open_details routes. The catalog adds template_kind=starter_file_set alongside the existing configuration-template use, with stable item/version identity, immutable local-folder manifest or template-repository revision/content references, bounded file manifest/hash, source/trust evidence and secret-scan result. Settings remains a consumer of this Project-owned catalog, not a file writer or new 39th manager.

  A Starter copies selected source files into a new Project at the reviewed setup commit. The current preview names the exact source version, destination Computer/path, relative file set, placeholder resolutions and permissions; revalidation checks content hashes, secret scan, FileSafe roots and collision/overwrite policy immediately before writing. Source acquisition/read and destination writes retain their own permission and backend owners. No history store, credential, host-local path binding, source approval, live Goal/Plan/Crew/notebook body or executable-source trust travels by copying. Symlink/path escape, unknown version, scan failure or unreviewed overwrite blocks. Cancellation or partial copy retains an honest owner result and cannot list a half-ready Project.

  Saved setups remain portable configuration templates and cmd.project.duplicate_configuration using the Settings detached own-values/owner-things/account-choice transaction; they do not carry Starter files or live inheritance. The same existing template engine has discriminated uses and one owner, without converting historical configuration templates into file sets. A local-only new Project may select a Starter. README, ignore list and licence for a new online copy have one editor in Online copy Advanced; Start with links to it rather than duplicating those choices. For an existing-history source the online repository starts empty. The default ignore list remains its own Settings-owned row, consumed once by source initialization.
  ProjectCompositionCommandRequestV3/ResultV3 preserve historical configuration editions and select ProjectTemplateCommandRequestV3/ResultV3 for Save/Create/Rename/Delete. ProjectTemplateOperationPayloadV3 connects project_composition_payload_v2 to Save/Create, retaining configuration versus starter_file_set discrimination. StarterCatalogContextV1 permits Settings-only management with no thread. Save freezes local-folder or template-repository manifest, version/content hash, exclusions, trust and secret scan. Create rechecks that exact version/hash/scan and the draft registration/collision plan before the explicit Project creation owner reserves identity. Rename/Delete carry immutable catalog item/version/hash and registry generation, with dependency/hold/disposition evidence on Delete. Content, scan, collision or target drift refuses and refreshes review; operation-specific results return actual item/version and only a committed Create returns the real Project ID. No second template engine or file-copy-as-configuration coercion is introduced.
gui_related: true
gui_classification_reason: Defines visible setup, choice, status, recovery or exact return behavior.
depends_on:
- PJCT-003
- PJCT-009
- SSYS-036
unblocks: []
acceptance_criteria:
- Local-folder and template-repository Starters retain exact immutable content and scan refs through preview and
  commit.
- Saved setups copy configuration only; existing configuration-template requests preserve exact compatibility.
- Local-only starter creation succeeds without an online account, and source/collision/scan failure leaves no false
  listed Project.
- Online-copy basics have one Advanced editor and never create a second remote history for existing content.
validation_surfaces:
- Plans/project_system_contracts.schema.json
- scripts/pm-projects-refresh-contracts.py
risk_class: identity_authority_or_false_completion
reasoning_tier: high
context_scope: projects_refresh_pjct_011
implementation_surfaces:
- Plans/Project_System.md
- future existing owner handlers; handler_unavailable until native evidence
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#P3/P12; S8-S11; pass-1 starting-files owner
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-e
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md#18-and-21
preserved_exact_tokens:
- Starters
- My starters
- Saved setups
- template_kind=starter_file_set
- cmd.project_template.save
- cmd.project_template.create_project
- cmd.project.duplicate_configuration
- README
- Advanced
negative_constraints:
- Do not make Starter bodies ordinary Settings values or add another catalog/writer.
- Do not copy .git/.jj history, secrets, host bindings, executable trust, live work or notebook bodies through a
  Starter or Saved setup.
- Do not silently overwrite destination or follow escaping symlinks.
owner_hints:
- Plans/Project_System.md
compatibility_only_notes:
- Existing exact historical Project requests/results/receipts remain readable under their original version; no in-place
  reinterpretation.
stale_retired_dispositions:
- Earlier pending decision labels are superseded by the approved packet; native implementation and governance certification
  remain unproved.
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-011, ContractName:Plans/Plan_Document_System.md#PDS-003

### PJCT-012 - Projects surface, rename and folder recovery

```yaml
plan_unit_id: PJCT-012
unit_type: integration_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: |-
  Projects is the primary registry/list management surface with one New Project launcher and labelled Open, Details and More actions. It consumes one current Project registry and the existing project_summary and project_attention_item rollups. Canonical blocked episodes take precedence over derived warnings; stale/degraded summaries disclose reduced confidence rather than manufacturing a blocker or healthy success. Render one primary owner reason using FinalGUISpec §7.5 precedence. History/backend/branch or bookmark, online-copy service plus checked ahead/behind facts, and the last complete backup/last verified backup/later failed or unverified attempt remain independent Safe facts, never one protection boolean.

  Details shows full source path and work Computer, copy/open-in-file-manager, Find folder or Move folder, owner-routed history/online actions and Backup history/Back Up Now/Restore as New, Project Settings, Rename and New project like this. Technical identities/hashes and destructive Delete data stay in their exact detail/strong-confirmation surfaces. Empty, filtered-empty, archived, removed, unavailable/missing-folder, recovery-required and duplicate-name states are explicit. Search/filter changes never mutate a Project. P11 Import from another app is shown not here yet with its reason, receives no working command and does not revive retired Origin integration.

  cmd.project.rename uses sole handlers::project::rename and the existing Project action family. It trims and validates display_name by the Project metadata policy while preserving interior spaces; expected Project/registry revisions and hashes, exact return, authority and idempotency fence the write/readback. Only display_name and its registry revision/timestamp change; immutable project_id, stable config, folder, repo, Vault, sources and running work retain identity. A stale/concurrent rename fails rather than overwriting. Folder names for new content retain the accepted name spaces subject to the actual destination filesystem and collision rules; they are not silently lowercased or dash-slugged.

  Missing-folder repair offers Locate/repoint through source_location.test then source_location.update with stable Project/Host/Environment/source identity, as clarified by SIR-026. It moves no files. Content relocation uses PSB-005 cmd.project.move.preflight/start and its verified lifecycle; the page performs neither operation privately. Archive is reversible and consumes BRS-033 schedule pause; unarchive uses current owner eligibility without hidden backup. Remove remains list-only, with Undo using verified re-registration of the retained stable config/identity. Delete data remains a separate Storage-owned operation under holds. Switching or opening never stops background work in other Projects.

  Projects surfaces retained unfinished-setup notices separately from listed registry rows, keyed by recovery_id under SP-321. Opening a notice reads the same current owner recovery projection and re-enters the shared setup view; it never automatically resumes, creates a Project row or treats a verified remote as a listed Project. Continue Setup uses cmd.project.resume_creation only when the exact current owner eligibility and effective dispatch gates hold; Open Repository and separately human-confirmed Delete Repository retain PJCT-007/010 boundaries.
gui_related: true
gui_classification_reason: Defines visible setup, choice, status, recovery or exact return behavior.
depends_on:
- PJCT-001
- PJCT-002
- PJCT-009
- BRS-033
unblocks: []
acceptance_criteria:
- Rename changes display metadata only and repeats idempotently; stale/foreign Project and identity-changing rename
  are rejected.
- Find folder tests and updates a binding without file movement; Move delegates PSB verified lifecycle.
- Remove preserves every data/history/backup object and re-add/Undo requires stable identity evidence.
- Missing/archived/filtered/recovery/long-path states, all ten looks, keyboard/focus and Reduced Motion consume
  shared GUI primitives and owner status.
validation_surfaces:
- Plans/project_system_contracts.schema.json
- scripts/pm-projects-refresh-contracts.py
risk_class: identity_authority_or_false_completion
reasoning_tier: high
context_scope: projects_refresh_pjct_012
implementation_surfaces:
- Plans/Project_System.md
- future existing owner handlers; handler_unavailable until native evidence
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#P5/P7/P9/P10/P11; pass-1 §4
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-e
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md#18-and-21
preserved_exact_tokens:
- New Project
- cmd.project.rename
- handlers::project::rename
- display_name
- project_id
- source_location.test
- source_location.update
- PSB-005
- not here yet
- project_summary
- project_attention_item
- recovery_id
- cmd.project.resume_creation
negative_constraints:
- Do not make Projects a Settings, SCM, Backup, topology, move, data-deletion, health or hover owner.
- Do not infer no changes, counts, backup safety or currentness from a stale or partial projection.
- Do not implement P11 import or infer source identity from equal paths on different Computers.
owner_hints:
- Plans/Project_System.md
compatibility_only_notes:
- Existing exact historical Project requests/results/receipts remain readable under their original version; no in-place
  reinterpretation.
stale_retired_dispositions:
- Earlier pending decision labels are superseded by the approved packet; native implementation and governance certification
  remain unproved.
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-012, ContractName:Plans/Plan_Document_System.md#PDS-003


### PJCT-072 - Event Authority project.added 1.0.0 — newly authored owner contract under DL-045.

```yaml
plan_unit_id: PJCT-072
unit_type: event_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: |-
  project.added 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/project_added.schema.json (pm.event_payload.project_added.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: Project registration commit adapter. After cmd.project.add_existing completes atomic projects:v1 identity/config/permission/owner handoff and readback, record its existing-content registration once. A failed registration, temporary mount, list-only open/archive/remove, or unverified restore creates no completion. Restore-as-new requires its verified Backup terminal receipt first. This event observes the completed registration; it does not grant permission, create files or replace the Project result.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["project.added", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="project.added:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original completed Project existing-content registration; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for project.added: actor_ref is the non-empty non-secret actor reference retained by the original completed Project existing-content registration from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original atomic registry/readback result must join payload.project_id, project_revision, stable_config_ref and operation_receipt_ref exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.project.added@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for project.added: stable config and original registration result remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with Project registration commit adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.project.added@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for project.added: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns Project registration commit adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  project.added append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for project.added: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for project.added authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by scripts/pm-small-owner-guard-audit.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. Each enforcement rule is removed only in memory; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- CV-625
- SP-605
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Project_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### PJCT-073 - Event Authority project.created 1.0.0 — newly authored owner contract under DL-045.

```yaml
plan_unit_id: PJCT-073
unit_type: event_contract
status: accepted
owner_doc: Plans/Project_System.md
canonical_text: |-
  project.created 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/project_created.schema.json (pm.event_payload.project_created.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: Project creation composition terminal adapter. After cmd.project.new_local or an admitted current forge-create composition completes all reviewed owner steps and atomic Project registry/readback, capture the exact new identity and terminal receipt. Remote create alone, effect_unknown, partial failure and merely reserving a Project ID never produce completion. Resume publishes only after verified remaining steps complete under its original root creation intent; retry never repeats forge or filesystem effects. Existing-content add alone produces no project.created. The two Project event candidates are distinct by original semantic action, not command-name aliases.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["project.created", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="project.created:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original root Project creation composition; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for project.created: actor_ref is the non-empty non-secret actor reference retained by the original root Project creation composition from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original atomic registry/readback result must join payload.project_id, project_revision, stable_config_ref and operation_receipt_ref exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.project.created@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for project.created: stable config, verified creation result and original terminal receipt remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with Project creation composition terminal adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.project.created@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for project.created: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns Project creation composition terminal adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  project.created append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for project.created: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for project.created authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by scripts/pm-small-owner-guard-audit.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. Each enforcement rule is removed only in memory; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- CV-626
- SP-606
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Project_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```
