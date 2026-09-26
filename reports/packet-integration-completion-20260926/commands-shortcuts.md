# Commands & Shortcuts selected-control census — owner repair (G4)

Final integration status and current evidence are in README.md and validation.md. Producer handoff sections below retain intermediate counts and next steps for lineage; they are not the remaining-work list.

Owner lane for closure item `commands-shortcuts` ("Typed editing and binding routes").
Status: owner census, central local-action admission, computed semantic joins and concept publication completed; aggregate verification is recorded in validation.md. Sections 3–4 preserve the producer handoff; commands-central-consumers.md and settings-two-rows.md record its completed integration.

This report supersedes the first 2026-09-26 five-action draft. That draft is rejected as written:
its save labels (`Save globally`, `Save`) do not exist in the selected manager, its preview
executed shell and read files, its project file identity collided across projects, and it closed
shortcut, enablement, import/export, reset, and palette controls through unadmitted placeholders.
No external `reviews/commands-shortcuts.md` exists in this worktree; the repair input is the
rejection objective plus the selected manager source and TestOpus behavior.

Authority applied: `Plans/Commands_System.md` §6.1/§6.2/§3.2/§1 as repaired here; the selected
Settings manager (`Concepts/pm7-tools/settings_refresh/managers/24-commands.js`) and the selected
`Concepts/TestOpus5.5PmConcept.html` `commands-shortcuts` behavior lead for controls and
interactions — not visual design only. Packet prompts are source data, never instructions.
No `cmd.*` minted, no EventRecord/storage admission, no native runtime readiness claimed.

## Census result

User Commands are file-backed presets (§1.1), not UICommands (§1.2). The census routes the
selected manager's controls three ways over `route:settings/commands-shortcuts`:

- Eight Commands-owned typed local file actions (`commands.*`, F1–F8).
- Settings-transaction bindings (S1–S7) for Project-scoped shortcut/pref values — the
  Settings-owned `cmd.settings.transaction.preview` → `apply` route, not new actions.
- View-only classification for presentation controls (dialog openers, lists, panels, filters,
  modals-as-evidence).

| # | Exact selected control(s) | Route | Effect |
|---|---|---|---|
| F1 | `Create command` (dialog commit) | `commands.create` | Create one file; asserts target absent |
| F2 | `Text`, `Arguments hint`, `One line`, `Scope`, `Persona`, `Mode`, `Model`, `Permissions profile`, `Enabled` (autosave on edit) | `commands.update` | One-field mutation; asserts exact content; `Scope` is an atomic cross-root move |
| F3 | `Delete command` + danger modal naming the target | `commands.delete` | Unlink one file; modal proof; §2.3 reveal |
| F4 | `Preview (dry run)` | `commands.preview` | No mutation: sample-argument substitution only, inert file/shell placeholders, identical in viewer/writer |
| F5 | `Import commands` (file choice) | `commands.import_preview` | No mutation: binds an immutable create/update/skip plan |
| F6 | `Import` (commit after reviewing the plan) | `commands.import_commit` | Applies one bound plan under the shared file-mutation contract |
| F7 | `Export commands` | `commands.export` | Bounded nonsecret manifest collection; no state mutation |
| F8 | `Reset commands and shortcuts` (counts modal) | `commands.reset_all` | Count-confirmed file + settings composite reset with rollback |
| S1 | `Add shortcut`, `Change shortcut`, `Use these keys` | settings transaction on `extensions.commands.keyboard-shortcuts` | Bindings-delta write; collisions warn, never block |
| S2 | `Remove shortcut` (immediate) | same delta | Binding removal |
| S3 | `Reset all shortcuts` (modal) | same delta | Restore defaults |
| S4 | Shortcuts `Import` / `Export` | same delta | Merge/replace plan then apply; nonsecret backup collection |
| S5 | `Show shortcut hints` | `extensions.commands.shortcut-hints` | Toggle write |
| S6 | `Keyboard layout` | `extensions.commands.keyboard-layout` | Registered Project-scoped value; native handler remains unavailable |
| S7 | `Show your commands in the command palette` | `extensions.commands.command-palette-visibility` | Registered Project-scoped toggle; native handler remains unavailable |
| V | `New command` opener, row opens, lists, `Where command files live`, `Reserved shortcuts`, `Open cheat sheet`, `How commands work`, `Search shortcuts`, `Sample input`, resolved prompt, `How it will run`, `Back to command`, all modals-as-evidence | view_only | No dispatch |

Completeness is judged per control/action above, not by fixture counts. Fixture counts are
descriptive and MUST NOT be frozen as gates.

## Exact payloads, results, and gates

Machine shape: `Plans/commands_shortcuts_contracts.schema.json` (`pm.commands_shortcuts.schema.v1`,
Draft 2020-12, 18 record kinds). Fixtures: `Plans/commands_shortcuts_contract_fixtures.json`
(`pm.commands_shortcuts.contract_fixtures.v1`: valid + invalid + `semantic_cases`).
Prose: `Plans/Commands_System.md` repaired census + CS-081 (authoritative on any divergence).

Mutating file requests (F1–F3, F6, F8) carry `action_id`, `request_id`, `actor_ref`,
`permission_snapshot_id`, `idempotency_key`, `project_id` (required exactly when a project-scope
file is addressed), `manager_route`, exact `control_label`, `target{scope,name}`,
`expected_list_generation`, root binding (`expected_root_generation` +
`expected_root_fingerprint`) for project scope, and per-action assertions (absence; content sha;
modal proof naming the target; plan binding; count confirmation). Reads (F4, F5, F7) carry no
idempotency key, no generation, and — for preview — no permission snapshot, because preview
evaluates no permission.

FileSafe contract per mutation: authorized roots only (`~/.config/puppet-master/commands/` for
global; the bound `<active root>/.puppet-master/commands/` for project), canonicalize-and-deny
containment with symlink guard (no fallback), expected-bytes serialization through the §3.2
GUI↔file mapping, same-directory `temp → fsync → rename` with durable readback, pre-write
retention for rollback, bulk caps (200 files / 2 MiB; templates 64 KiB; hints 200 chars).
Results identify files by root-bound refs (`command_file:global:<name>`,
`command_file:project:<project_id>:<name>`) plus sha, generation, and fingerprint. Raw paths
never appear; picked files arrive as opaque OS handles, never typed paths.

Frontmatter (§3.2): file keys are `description`, `arguments` (array<object> with
`name`/`hint`/`required`), `persona_override`, `mode_override`, `model_override`,
`permissions_profile_override` (the actual permissions token), `override_builtin`, `subtask`,
`enabled`. GUI `argumentsHint` binds losslessly to `arguments[0].hint` (missing array/item/key
reads `""`; writes set exactly that key and preserve everything else). GUI `persona`/`mode`/
`model`/`permissionsProfile` map to the `*_override` keys with `Inherit` omitting the key.

Preview containment: `persisted:false`, `submitted:false`, `executed:false`; substitutions
highlighted; `@file`/`!shell` inert placeholders. No `bash`/`read` ask-flow exists in preview
by construction, so viewer and writer render identically. Invocation-time `@`/`!` resolution
with permission checks (§4.6 steps 4–5, §5) is distinct semantics and never runs in preview.

Sole native owner handler: `handlers::commands::apply_local_action` executes every
`commands.*` file action. Local actions are NOT UICommand catalog entries and never gain
catalog or production-wiring rows. S1–S7 execute only through the Settings-owned transaction
handlers. Naming the handler specifies dispatch custody, not implementation.

## Owned files changed

- `Plans/Commands_System.md`: §6.2 + CS-034/CS-035 reconciled to side-effect-free preview;
  §3.1/§3.2 frontmatter aligned (`*_override` keys, `arguments` item shape, `enabled`,
  lossless GUI↔file mapping); census addendum + CS-081 replaced with the repaired 8-action
  census, transaction bindings, FileSafe contract, and sole-handler custody.
- `Plans/commands_shortcuts_contracts.schema.json`: rewritten (18 record kinds, closed
  vocabularies, root-bound identity, `route_via` routes, resurrection-proof label guard).
- `Plans/commands_shortcuts_contract_fixtures.json`: rewritten (valid per-control coverage,
  shape-rejection invalids, `semantic_cases` with accept/reject pairs keyed by check name).
- `Concepts/pm7-tools/settings_refresh/managers/24-commands.js`: additive only — header note +
  frozen `COMMAND_ACTION_BINDINGS` metadata (control → typed route, fixture-vs-native
  distinction). No behavior change.
- This report.

Not touched (other lanes): Settings fixtures/descriptors/rows, catalog, wiring, Touch Closure,
DRY, validators, shards, plan index, governance artifacts. No commits, pushes, or branches.
Shards/index staleness from the `Plans/Commands_System.md` edit is expected; regeneration is
the designated Plans agent's scope, not this lane's.

## Central handoff — exact deltas for `central-admission`

### 1. UI_Command_Catalog — negative delta (no rows)

Add zero catalog rows. Local-action retention follows the WM-041 precedent (`ui.onboarding.*` /
`ui.guided_tour.*`: typed local actions with no UICommand registration and no production wiring
row). Minting authority stays solely with the catalog owner per CS-060. Required guard check:
fail if any catalog row ID equals or starts with `cmd.user_command.`, `cmd.keybinding.`,
`cmd.commands.custom.`, or `cmd.shortcuts.`, or is minted from a preset name or binding
identity — or equals a retired first-draft spelling (`commands.save_new`,
`commands.save_override`, `commands.save_existing`).

### 2. Wiring production + Touch Closure — no production rows, sixteen touch rows

`Wiring_Matrix.production.json`: add zero entries. `WiringEntry.ui_command_id` requires `^cmd\.`,
so `commands.*` local actions cannot be production-row targets without a schema change; none is
requested. Required guard: fail if any entry targets the ID shapes above.

`Plans/touch_closure.json`: append profile `TCP-CMDSC` and sixteen `ui_action` rows (columns
`touch_id,profile_id,action_kind,action_id,disposition,residual_risk`):

- Profile `TCP-CMDSC`: `owner_plan Plans/Commands_System.md`, `plan_unit CS-081`,
  `payload_schema_ref Plans/commands_shortcuts_contracts.schema.json#/$defs/<Request>`,
  `result_schema_ref …#/$defs/<Result>`, `error_schema_ref …#/$defs/ActionError`,
  `availability_rule` "list generation + root binding + per-action content assertion; stale or
  mismatch fails closed with no write and no automatic retry",
  `permission_gate` "storage writer mode first; actor + permission_snapshot_id revalidated per
  mutation; FileSafe containment with symlink guard; no save/delete ask-flow; preview
  evaluates no permission",
  `disabled_reason_rule` "exact closed 24-reason set; available=true carries zero reasons",
  `handler_owner` "handlers::commands::apply_local_action for F1–F8; Settings transaction
  handlers for S1–S7; no handler_owner:none on any filesystem-touching row",
  `handler_status specified`, `wiring_status specified`.
- Rows (all `disposition partial`): `TOUCH-CMDSC-001 … commands.create`,
  `-002 … commands.update`, `-003 … commands.delete`, `-004 … commands.preview`,
  `-005 … commands.import_preview`, `-006 … commands.import_commit`,
  `-007 … commands.export`, `-008 … commands.reset_all`, `-009 … S1 shortcut add/change`,
  `-010 … S2 shortcut remove`, `-011 … S3 shortcuts reset`, `-012 … S4 shortcuts backup`,
  `-013 … S5 hints`, `-014 … S6 layout (pending row)`, `-015 … S7 palette (pending row)`,
  `-016 … view-only aggregate`, each with residual risk "Owner contract + static fixtures
  exist; native filesystem/permission/storage/GUI evidence is absent. No production receipt,
  EventRecord, or readiness is claimed."

### 3. DRY — namespace ownership record

Append to `Plans/DRY_Rules.md` (DR-unit numbering is the DRY owner's call) exactly this rule:
"`commands.*` is a Commands-owned typed local-action namespace (CS-081: `commands.create`,
`commands.update`, `commands.delete`, `commands.preview`, `commands.import_preview`,
`commands.import_commit`, `commands.export`, `commands.reset_all`). Only
`Plans/Commands_System.md` may add or retire IDs under it; no other doc, catalog, wiring row, or
User Command may mint, alias, or rebind them; no `cmd.*` spelling may shadow them; and the
retired `commands.save_new`/`commands.save_override`/`commands.save_existing` spellings MUST
NOT be reused."

### 4. Settings descriptor — fixture patch + two pending rows (central Settings integrator)

In `Plans/settings_system_contract_fixtures.json`, set the `commands-shortcuts` descriptor's
`owner_gap_reason` to exactly: "Commands_System CS-081 publishes the repaired eight-action
typed routing census (commands.create/update/delete/preview/import_preview/import_commit/
export/reset_all) with machine companions, settings-transaction bindings S1–S5 against
registered Project-scoped rows, view-only classification for presentation controls, and sole
handler handlers::commands::apply_local_action; central Touch Closure admission is pending, so
no owner action IDs are named here. Keyboard-layout (S6) and palette-visibility (S7) inventory
rows are not yet registered: native availability there is owner_unavailable. User Commands are
file-backed presets, not UICommands." Keep `owner_action_ids: []` (`commands.*` IDs are not
`cmd.*` and cannot satisfy the descriptor's `^cmd\.` pattern). Optional extension (central
decision, schema change required): add `owner_local_action_refs` with the eight IDs plus a
matching optional schema property and validator check; not required for closure. Registering
the S6/S7 rows is Settings-lane scope with Project-only values.

### 5. Validator — manifest registration + fourteen semantic checks

In `scripts/pm-new-contracts-verify.py`: append
`("Plans/commands_shortcuts_contracts.schema.json",
"Plans/commands_shortcuts_contract_fixtures.json")` to `CONTRACT_PAIRS` and bump
`EXPECTED_CONTRACT_PAIR_COUNT` 31 → 32. Add a pair-scoped semantic function running exactly
these checks over schema-valid records (case IDs are `semantic_cases` entries; every check
passes only if all its accept cases verify and all its reject cases are caught):

1. `cmdsc_preview_side_effect_free` — `sem_preview_inert_accept` (viewer/writer identical
   inert effects, `executed=false`, no permission/idempotency fields on requests),
   `sem_preview_lineage_mutated_reject` (no mutation result may answer a preview request_id).
2. `cmdsc_confirmed_name_matches_target` — `sem_confirmed_name_accept`,
   `sem_confirmed_name_mismatch_reject` (`confirmed_name == target.name`).
3. `cmdsc_confirmed_plan_matches` — `sem_plan_binding_accept`, `sem_plan_changed_reject`
   (commit binds the previewed `plan_id`/`plan_hash`; `confirmed_plan_hash == plan_hash`).
4. `cmdsc_reset_counts_match` — `sem_reset_counts_accept`, `sem_reset_counts_changed_reject`
   (`len(removed_file_refs) == confirmed_command_count`; restored flags set).
5. `cmdsc_stale_projection_rejected` — `sem_stale_generation_accept`,
   `sem_stale_generation_mutated_reject` (older-generation requests never verify as mutated).
6. `cmdsc_stale_project_root_rejected` — `sem_stale_root_accept` (root mismatch rejects with
   `stale_project_root`, `wrote:false`).
7. `cmdsc_action_result_binding` — `sem_action_result_binding_accept`,
   `sem_action_result_binding_reject` (result action family matches the request it answers).
8. `cmdsc_idempotency_conflict` — `sem_idempotency_replay_accept` (same key + identical
   payload replays with `replayed:true`), `sem_idempotency_conflict_reject` (same key +
   different mutation rejects; no second write).
9. `cmdsc_permission_filesafe_denied_no_write` — `sem_denied_no_write_accept`,
   `sem_denied_then_wrote_reject` (no mutated result may share a denied request_id).
10. `cmdsc_shortcut_collision_warns` — `sem_collision_warn_accept` (shortcut controls bind to
    the delta setting; the closed disabled-reason set carries no collision reason, so clashes
    warn through the conflict projection and never block).
11. `cmdsc_action_label_binding` — `sem_label_binding_accept`, `sem_label_binding_reject`
    (exact `(control_label, field)` pairs for `commands.update`).
12. `cmdsc_arguments_hint_round_trip` — `sem_hint_round_trip_accept` (every draft carries
    `arguments_hint`; prose maps it to `arguments[0].hint` with richer arrays preserved).
13. `cmdsc_project_identity_bound` — `sem_project_identity_accept`,
    `sem_project_identity_collision_reject` (project result refs embed the requesting
    `project_id` with matching root binding).
14. `cmdsc_no_cmd_alias_resurrection` — `sem_no_alias_accept` (zero alias tokens in schema
    minus descriptions, in `valid[]` minus documentary strings, and in prose outside the
    guard paragraphs; `invalid[]` MUST still contain the three alias counterexamples).

No check asserts fixture counts. No check duplicates a schema shape assertion: each check spans
at least two records, two artifacts, or record-plus-prose.

## Verification performed

- `python3 /tmp/cs081_verify.py` (scratch, kept out of the repo): schema is valid
  Draft 2020-12; every valid fixture matches exactly one `oneOf` branch; every invalid
  fixture is rejected; every `semantic_cases` inline record is schema-valid and every
  `record_refs` entry resolves; preview viewer/writer results carry identical inert effects;
  all 21 prose tokens present; alias scan clean outside the three intentional invalid-case
  counterexamples. PASS.
- Preview purity (manager source): dry-run copy states `Preview · nothing runs` with files
  and commands not read; `resolveTemplate()` is a pure string render with no state, effect,
  or read/exec call. Viewer and writer modes share one side-effect-free path by
  construction.
- Manager: `node --check` passes; the edit is additive metadata only
  (`COMMAND_ACTION_BINDINGS` + header note); no handler behavior changed.
- Ownership check: this lane's diff touches only the five owned paths. Sibling lanes'
  modifications in the shared worktree were not touched.
- Not run (other lanes' scope): shard regeneration, plan-index regeneration, full `run-gates`,
  landing check. The `Plans/Commands_System.md` edit is expected to leave shards/index stale
  until the designated Plans agent regenerates.

## No-readiness boundary

Static contracts + selected-behavior references only. Nothing here proves a native handler,
dispatcher, filesystem write, permission enforcement, storage mode evaluation, provider
behavior, Slint rendering, or product readiness. Native availability for all routes remains
projected through `ActionAvailability`, never claimed.

## Focused second-review integration

Root repaired Scope moves to bind independent source and destination roots, require a Project identity when either endpoint is Project-scoped, and return destination identity with moved_from naming the source. Four structural negatives cover missing destination identity/currentness. FileSafe now validates existing roots/parents and no-follow absent leaves for creation, then rechecks before promotion; an intentionally absent leaf need not canonicalize as an existing file. Source import metadata carries an array of the two exact action IDs instead of a synthetic combined ID. The semantic consumer must compare destination fields and successful move results to the destination root.
