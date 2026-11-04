# DG6B — prepared without admission

**Branch:** `plans/ea-w2-plugins-personas-github-20261104`. Base: `be4766513f`. Contract tree is recorded in DG6B.self-grade.json after the contract commit.

13 exact-family drafts; six Persona rows stopped on an owner conflict. No exclusions, admission records, registry additions or Decision Log entries. No main push, landing lock, governance reseal, frozen-validator change, pm-mail or delegation. Native execution is NOT_RUN.

## Per-row outcome

| Family | Outcome | Owner | Self-grade |
|---|---|---|---|
| `auth.github.authenticated` | register (prepared; admission and retention gate closed) | `GAAAF-077` | 10 PASS; membership ABSENT; retention PARTIAL |
| `auth.github.device_code.issued` | register (prepared; admission and retention gate closed) | `GAAAF-078` | 10 PASS; membership ABSENT; retention PARTIAL |
| `auth.github.disconnected` | register (prepared; admission and retention gate closed) | `GAAAF-079` | 10 PASS; membership ABSENT; retention PARTIAL |
| `auth.github.failed` | register (prepared; admission and retention gate closed) | `GAAAF-080` | 10 PASS; membership ABSENT; retention PARTIAL |
| `auth.github.token.polling` | register (prepared; admission and retention gate closed) | `GAAAF-081` | 10 PASS; membership ABSENT; retention PARTIAL |
| `plugin.hook.blocked` | register (prepared; admission and retention gate closed) | `PLUG-131` | 10 PASS; membership ABSENT; retention PARTIAL |
| `plugin.hook.error` | register (prepared; admission and retention gate closed) | `PLUG-132` | 10 PASS; membership ABSENT; retention PARTIAL |
| `plugin.hook.invoked` | register (prepared; admission and retention gate closed) | `PLUG-133` | 10 PASS; membership ABSENT; retention PARTIAL |
| `plugin.load_failed` | register (prepared; admission and retention gate closed) | `PLUG-134` | 10 PASS; membership ABSENT; retention PARTIAL |
| `plugin.loaded` | register (prepared; admission and retention gate closed) | `PLUG-135` | 10 PASS; membership ABSENT; retention PARTIAL |
| `plugin.permission.override` | register (prepared; admission and retention gate closed) | `PLUG-136` | 10 PASS; membership ABSENT; retention PARTIAL |
| `plugin.tool.collision` | register (prepared; admission and retention gate closed) | `PLUG-137` | 10 PASS; membership ABSENT; retention PARTIAL |
| `plugin.tool.registered` | register (prepared; admission and retention gate closed) | `PLUG-138` | 10 PASS; membership ABSENT; retention PARTIAL |
| `persona.created` | blocked on Jared: Q1 | P-060 / UI command contracts | CONFLICT; no draft or admission |
| `persona.deleted` | blocked on Jared: Q1 | P-060 / UI command contracts | CONFLICT; no draft or admission |
| `persona.exported` | blocked on Jared: Q1 | P-060 / UI command contracts | CONFLICT; no draft or admission |
| `persona.imported` | blocked on Jared: Q1 | P-060 / UI command contracts | CONFLICT; no draft or admission |
| `persona.selected` | blocked on Jared: Q1 and Q2 | P-060 / UI command contracts | CONFLICT; no draft or admission |
| `persona.updated` | blocked on Jared: Q1 | P-060 / UI command contracts | CONFLICT; no draft or admission |

## Questions for Jared — unanswered

**Q1 (all six Persona rows):** UI_Command_Catalog.md:8559–8565 requires project_id for create/update/delete/select/import/export, whereas Personas.md P-060 and §2/§4 allow library-home management and No project. What is the authoritative command/event scope and home/Computer binding for library operations, including import/export/select? Shall the existing commands receive an application/library edition, or do those events remain Project-only with another already-owned receipt path for library work? This draft chooses neither.

**Q2 (persona.selected):** UI_Command_Catalog.md:8562 returns effective_persona_id; Personas.md §3.3A and §10 and Contracts runtime identity prohibit that parallel field and require effective_persona. Which command-result edition and compatibility disposition should govern this event? No renaming decision was applied.

The search included all current cmd.persona.* rows and the later P-060/save_as_override additions, not only the survey. Later save_as_override has an explicit destination Project; it does not supply the missing library edition of the six rows.

## Newly authored owner bindings and per-family searches

DL-045 explicitly lists all 19 exact families (Decision_Log.md scope table). Its technical-authoring premise remains true. It does not authorize resolving the Persona owner conflict or retention. Current plugin §8 and the later plugin addendum explicitly say all eight plugin.* identities are non-emitting candidates; this draft preserves that state. They are not excluded merely because admission is absent. GitHub OAuth device flow, stable account identity and OS credential-store custody remain specified by GitHub_API_Auth_and_Flows.md §Purpose/device flow; Contracts AuthEvent still names all five histories.

For EACH following family the search scope was live top-level Plans/*.md, *.json and *.jsonl, then semantic owner, Contracts EventRecord/AuthEvent, SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Exact-family schema/identity/receipt adoption and operating reader were absent in that scope. Existing semantic conditions are reused. Generic EventRecord index, its checkpoint and first-AppendReceipt custody already exist and are reused by explicit name; no sibling supplies a binding. Per-family matched lines and negative findings are in the hashed canon-search.json below.

| Family | New producer binding | New consumer/version | New operation value/key stem |
|---|---|---|---|
| `auth.github.authenticated` | github_api OAuth token-success handler | `consumer.auth_github_authenticated.history@1.0.0` | `auth_github_authenticated_operation.v1` |
| `auth.github.device_code.issued` | github_api device-code response handler | `consumer.auth_github_device_code_issued.history@1.0.0` | `auth_github_device_code_issued_operation.v1` |
| `auth.github.disconnected` | github_api disconnect handler | `consumer.auth_github_disconnected.history@1.0.0` | `auth_github_disconnected_operation.v1` |
| `auth.github.failed` | github_api device-flow failure handler | `consumer.auth_github_failed.history@1.0.0` | `auth_github_failed_operation.v1` |
| `auth.github.token.polling` | github_api device-flow poll response handler | `consumer.auth_github_token_polling.history@1.0.0` | `auth_github_token_polling_operation.v1` |
| `plugin.hook.blocked` | hook Block result handler | `consumer.plugin_hook_blocked.history@1.0.0` | `plugin_hook_blocked_operation.v1` |
| `plugin.hook.error` | hook error/timeout result handler | `consumer.plugin_hook_error.history@1.0.0` | `plugin_hook_error_operation.v1` |
| `plugin.hook.invoked` | hook dispatch completion observer | `consumer.plugin_hook_invoked.history@1.0.0` | `plugin_hook_invoked_operation.v1` |
| `plugin.load_failed` | plugin loader failure handler | `consumer.plugin_load_failed.history@1.0.0` | `plugin_load_failed_operation.v1` |
| `plugin.loaded` | plugin loader activation observer | `consumer.plugin_loaded.history@1.0.0` | `plugin_loaded_operation.v1` |
| `plugin.permission.override` | permission.ask override result handler | `consumer.plugin_permission_override.history@1.0.0` | `plugin_permission_override_operation.v1` |
| `plugin.tool.collision` | plugin tool-registry collision handler | `consumer.plugin_tool_collision.history@1.0.0` | `plugin_tool_collision_operation.v1` |
| `plugin.tool.registered` | plugin tool-registry commit observer | `consumer.plugin_tool_registered.history@1.0.0` | `plugin_tool_registered_operation.v1` |

Each row separately owns its closed payload/operation definitions in Plans/dg6b_event_contracts.schema.json (`$defs/<exact_name_with_underscores>` and `<name>_operation`), original operation identity recipe, SP-286/CV-339/SP-291 full-value first-receipt adoption, source/result ordering, retry/conflict fences, access/deletion checks, coherent restore, SP-278 read-through and withdrawal/rebuild protocol. New operation keys bind storage instance, scope and original operation ID; event identity hashes the exact family/instance/scope/operation/revision tuple. Newly authored operation profiles use the existing canonical coordination_and_storage group and SP-337 16 KiB limit. These are authored technical contracts, not pre-existing evidence.

Readers reuse `projector.storage.event_record_index@1.0.0`, `event_record_index.v2@eig_<generation>` and the existing generic checkpoint schema. They introduce no separate filtered checkpoint or projection. No new checkpoint identifier is claimed.

## Retention left pending

All 13 drafted event histories and all 13 operation values carry `PENDING_RETENTION_DECISION`; the six stopped Persona assessments also leave retention pending without writing a value family. Candidates are Case L-3 audit/receipt authority, non-authority security diagnostics and ordinary telemetry, cited at storage-plan.md:17399–17417. No class or application cardinality is selected. Pending is materially incomplete; activation stays closed. Existing generic index/checkpoint policies are unchanged.

## Premise checks

- **DL-045:** exact names remain in the authorized scope; technical bindings only. Persona competing-owner choices remain reserved.
- **DL-076:** current SP-278 still separates the nine-field durable token from live redb_snapshot_id; adopted explicitly. No live snapshot ID is persisted by a new value.
- **DL-270:** current SP-336 amends original SP-286 sync ordering; drafts adopt that current amendment and do not restore the superseded extra-sync requirement.
- **No old retention answer applied:** neither DL-075 artifact retention nor orchestration answers cover these exact histories. No old answer was extended.
- **Failed applicability premise:** treating old Project-only Persona command rows as a complete current library/No-project contract fails against P-060. Those six rows stop.

## IDs and shared-file hunks

`SP-670`, `SP-671`; `CV-690`; `ATS-335`; `GAAAF-077`–`GAAAF-081`; `PLUG-131`–`PLUG-138`. No Persona ID minted. All origin branches were scanned after fetch: maxima P=60, PLUG=71, GAAAF=17, SP=420, CV=368, ATS=85; assigned shared blocks had no collisions. Semantic IDs start 60 above each current highest owner ID.

Shared hunks: storage-plan.md appends SP-670/671 with a separate named subsection for each exact family; Contracts_V0.md appends CV-690 routes; Automated_Testing_System.md appends ATS-335 obligations; storage_value_registry.json appends 13 operation rows and 13 storage_profile.family_profiles entries only. Semantic owners append five GAAAF and eight PLUG units. No existing shared row is rewritten or reordered. Derived shards/index are regenerated, never hand-edited.

## Evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/canon-search.json` — SHA-256 `fbe65c695f3a6ef9b1c1e79d47ceee064aed54d402aba9f204dc3e6246d809c1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/base-source-hashes.json` — SHA-256 `56a8ce3109a7bc72045d65222cf1eedbbb3f02ac47a7324a9a9d6d7ee9baeff5`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/id-scan.json` — SHA-256 `fc0dc2a5471655ffa8c8b077b0f180d03daa229ff9f00a13479f72339600a98a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/currentness-sha256.json` — SHA-256 `3345a80cfa09411d912b0e4bb92f94e567e988db5553bcab2811c169a65d6b5e`.

The currentness edition was copied from the shared checkout and all 15 file hashes matched before index generation. Auth multi-cohort census pins remain unchanged; no census/ledger outcome was rewritten as registration, and no cohort is silently cleared.

## Checks

Final exit codes: Storage profile baseline at the base revision has 41 existing missing-profile errors; the branch has the identical 41 and no new profile error. The frozen validator was not run or changed. Governance reseal is outside this task; canonical edits will require the lead’s later integration/reseal process.


| Check | Exit | Top-level/result |
|---|---:|---|
| `contracts-check` | 0 | pass |
| `shard-generate` | 0 | pass |
| `index-generate` | 0 | pass |
| `shard-check` | 0 | pass |
| `index-validate` | 0 | pass |
| `github-integration-check` | 0 | pass |
| `storage-profile-check` | 1 | 41 pre-existing profile errors; no new error |
| `diff-check` | 0 | pass |

New storage-row JSON Schema validation: 13 rows, zero errors. Derived shard changes are confined to the five edited Markdown owners and storage_value_registry; no other document’s shards changed. `git diff --check` passes.

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/check-exits.json` — SHA-256 `34d664619493ae5d3c857f2ecdd167ce0330a1842f8749d5aa61d79cb7eeaf5e`.

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/storage-profile-baseline.json` — SHA-256 `89d47858adcab797033a9feca549351641cfb6a2f6ee5da75a2c62082b3d450b`.

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/storage-profile-check.json` — SHA-256 `41190f97c6e8f86658e94aa1a05243c250104d86ccc768a824fce3dbe417f36f`.

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/new-storage-rows-schema.json` — SHA-256 `0a97e222a99f03141bfecbf35868e2e8d8235dcfc0f5c786a00250703e14c29a`.
