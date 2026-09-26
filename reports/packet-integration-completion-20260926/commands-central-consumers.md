# Commands central consumers — CS-081 census + Forge 3-destination sync

Date: 2026-09-26. Central-companion scope only: settings contracts schema/fixtures,
catalog, wiring prose + production metadata, Touch Closure, DRY, and this report.
Owner contracts (`Plans/Commands_System.md#CS-081`, `Plans/Forge_Integrations.md#FGI-021`,
`Plans/commands_shortcuts_contracts.schema.json`, source24) are consumed as-is; no owner
file is touched here. Static companions only: no native handler, dispatcher, filesystem,
permission, storage, provider, EventRecord, visual, or readiness proof is claimed. All
sixteen Touch rows stay `partial`; the seven UCC-165/WM-058 primaries keep their catalog
registration with exactly one production entry each, `handler_unavailable`, and
`expected_event_types=[]`.

## 1. Admitted local actions and profile

Eight Commands-owned typed local file actions (F1–F8), sole future handler
`handlers::commands::apply_local_action` (native implementation absent), with persistent
filesystem effects (actor, permission snapshot, FileSafe containment, CAS generation,
idempotency, durable readback). Preview is inert: no read, shell, ask-flow, permission
evaluation, or dispatch. Local actions are not UICommand primaries: zero catalog rows and
zero production rows added. S1–S7 execute only through the Settings-owned transaction
handlers (`handlers::settings::transaction_preview` / `transaction_apply` /
`transaction_rollback`).

| Touch row | Action | Route |
|---|---|---|
| `TOUCH-CMDSC-001` | `commands.create` | F1 Create command, asserts target absent |
| `TOUCH-CMDSC-002` | `commands.update` | F2 hero-sheet fields, asserts exact content; Scope is an atomic cross-root move |
| `TOUCH-CMDSC-003` | `commands.delete` | F3 Delete command, modal proof + §2.3 reveal |
| `TOUCH-CMDSC-004` | `commands.preview` | F4 dry run, inert |
| `TOUCH-CMDSC-005` | `commands.import_preview` | F5 binds immutable plan, no mutation |
| `TOUCH-CMDSC-006` | `commands.import_commit` | F6 applies one bound plan |
| `TOUCH-CMDSC-007` | `commands.export` | F7 bounded nonsecret manifest |
| `TOUCH-CMDSC-008` | `commands.reset_all` | F8 count-confirmed composite reset with rollback |
| `TOUCH-CMDSC-009` | `settings.commands_shortcuts.shortcut_bind` | S1 add/change/use keys |
| `TOUCH-CMDSC-010` | `settings.commands_shortcuts.shortcut_remove` | S2 immediate removal |
| `TOUCH-CMDSC-011` | `settings.commands_shortcuts.shortcuts_reset` | S3 restore defaults |
| `TOUCH-CMDSC-012` | `settings.commands_shortcuts.shortcuts_backup` | S4 backup plan + collection |
| `TOUCH-CMDSC-013` | `settings.commands_shortcuts.hints_toggle` | S5 hints toggle |
| `TOUCH-CMDSC-014` | `settings.commands_shortcuts.layout_select` | S6 layout select |
| `TOUCH-CMDSC-015` | `settings.commands_shortcuts.palette_toggle` | S7 palette toggle |
| `TOUCH-CMDSC-016` | `settings.commands_shortcuts.presentation` | V view-only aggregate, no dispatch |

Profile `TCP-CMDSC` (`Plans/Commands_System.md#CS-081`): payload/result refs point at the
owner schema document root (eight Request defs and seven Result defs are enumerated in
`availability_rule`; a single `$defs` pointer cannot name them all), error ref
`#/$defs/ActionError`, closed 24-reason disabled set, FileSafe persistence with no
admitted storage-plan family, no EventRecord, no `ObservableWork`. File roots come from
target scope plus project binding, never from the Settings scope selector.

## 2. Settings keys (all four registered; no new unaudited key)

| Setting ID | Type | Default | Scope | Used by |
|---|---|---|---|---|
| `extensions.commands.keyboard-shortcuts` | keyvalue | `{}` | project* | S1–S4 bindings delta |
| `extensions.commands.shortcut-hints` | toggle | on | project* | S5 |
| `extensions.commands.keyboard-layout` | select, 5 options | Auto-detect | project | S6 |
| `extensions.commands.command-palette-visibility` | toggle | on | project | S7 |

\* The two pre-existing rows still carry the historical `global` scope token; the
2026-08-31 index entry names that vocabulary a deferred normalization that does not
authorize global persisted values, and every binding here executes through the
Project-bound transaction route. Type/default/scope metadata above is read verbatim from
`Plans/settings_inventory.json`. Writer metadata: the registry carries no per-key writer
field; execution custody is the shared transaction handlers, not a per-key writer claim.
No `owner_contract_missing` was removed: the commands-shortcuts descriptor carried none,
and the transaction-preview reason plus the DL-041 dry-method guard keep theirs.

## 3. Fixture and schema changes

- `settings_manager_descriptor` gains optional `owner_local_action_refs`: closed enum of
  exactly the eight `commands.*` IDs (authority: CS-081 `census_action_id`). The field was
  necessary because `owner_action_ids` is `^cmd\.`-only and the descriptor is
  `additionalProperties:false`; prose alone could not carry machine-checkable refs.
- `manager_registry.commands-shortcuts`: `owner_action_ids` stays `[]`; refs populated;
  `owner_refs` extended with the owner schema + fixtures paths; stale "not yet
  census-routed" gap text replaced with the exact census mapping.
- The eight `cmd.commands.custom.*` / `cmd.shortcuts.*` dispositions stay
  `rejected_with_reason` with zero replacements and `native_handler_claim:false`; reasons
  now point at the local contract (`commands.*` file action or transaction binding).
  `cmd.user_command.*` / `cmd.keybinding.*` appear nowhere as routes. Disposition
  partition unchanged (41/7/1/31 over 80 tokens); registry hash pin refreshed to the new
  fixture bytes (see §6).
- New cases: `valid-manager-descriptor-commands-shortcuts-local-refs` (full descriptor
  with all eight refs validates) and
  `invalid-manager-descriptor-local-ref-resurrects-cmd-alias` (rejected `cmd.shortcuts.bind`
  in the enum is schema-rejected). Valid 26→27, negative 22→23.

## 4. Catalog / wiring / DRY companions (reference only)

- `UCC-166` (catalog): zero rows added; control-resolution reference plus the guard that
  fails any `cmd.user_command.*`, `cmd.keybinding.*`, `cmd.commands.custom.*`,
  `cmd.shortcuts.*`, preset/binding-minted, or retired `commands.save_*` row ID.
- `WM-059` (wiring prose): zero production entries added (`ui_command_id` requires
  `^cmd\.`); S-controls reuse existing transaction rows; V stays view-only.
- `DR-042` (DRY): `commands.*` namespace ownership with the exact owner rule. It records
  that DR-041's no-`handlers::` sentence governs reversible-presentation local UI actions,
  while owner-local file actions carry exact DR-040 keys including their sole native owner
  handler — and supersedes the UCC-165-batch note that the census remains unadmitted.
- `Plans/UI_Wiring_Rules.md` needed no edit: UIW-023 already covers central response
  separation generically, and no production row was added.

## 5. Forge official-browser sync (existing row, three destinations)

`catalog.forge_pipeline_open_in_browser` (plus its UCC-165/WM-058 prose and token lists)
now carries all three FGI-021 `official_destination_kind` values: `automation_run_artifacts`
binds the exact run (immutable `automation_run_id` plus pipeline/definition identity, job
where applicable); `hosted_service_settings` binds the non-null `hosted_setting_scope_ref`
with no run identity; `automation_service_overview` binds the selected overview with its
exact `AutomationBinding` and neither run nor scope identity. Allowed origin/route equal
the instance/tenant profile-approved official UI destination from `web_base_url` (which
may differ from `api_root`); the API host is never an origin-equality constraint, and the
earlier normalized-host equality removal is retained. Generic `Connect automation` with no
selected service is existing local setup/navigation intent, not a malformed pipeline
request. No command added; entry count unchanged.

## 6. Denominator deltas for the validator worker (files untouched here)

| Registry | Baseline | After +7 batch | After this batch | Delta here |
|---|---|---|---|---|
| Touch rows | 643 | 650 | 666 | +16 (`TOUCH-CMDSC-001`..`016`) |
| Touch profiles | 133 | 133 | 134 | +1 (`TCP-CMDSC`) |
| Excluded tokens | 58 | 58 | 58 | +0 |
| Alias bindings | 65 | 65 | 65 | +0 |
| Production entries | 1142 | 1149 | 1149 | +0 (one row edited in place) |

Worker scope beyond counts (all outside this lane): wire the eight `commands.*` IDs plus
the eight `settings.commands_shortcuts.*` IDs into `expected_inventory` under `TCP-CMDSC`
(the `commands.*` namespace also needs extending the row-schema `action_id` pattern and
`ACTION_RE`, which currently admit only `cmd|ui|settings`); extend the orphan/expected
checks accordingly; update `tests/test_pm_touch_closure_source.py` asserts;
`CONTRACT_PAIRS` 31→32 plus the fourteen `cmdsc_*` semantic checks per the producer report
§5. The `TCR-SETTINGS-PACKET-COMMANDS` pin in `Plans/touch_closure.json` was refreshed to
`6871d6791d5d946d8e4d8ccd635e7d5417499a2d2e8bc4ee2c927cbfcfd1c90e` (mechanical checksum of
this lane's own fixture edit, not a governance reseal). One deliberate deviation from the
producer handoff §4: its prescribed gap text exceeds the schema's 512-char
`non_empty_string` limit, so the descriptor carries a shortened form (448 chars) preserving
every material claim — census pointer, S1–S7 bindings, view-only, sole handler, empty
`owner_action_ids` rationale, presets-not-UICommands, and the scope-selector boundary.

## 7. Remaining prose handoffs

- Settings_System owner paragraph for the S1–S7 transaction bindings: root adds it after
  the current Settings writer stops (not this lane; no `Plans/Settings_System.md` edit).
- Commands_System CS-082 seven-primary companion and Scope-move destination-root repair
  landed owner-side during this lane; owned central files needed no change for either, and
  per root instruction no broad audit of them was run here.
- The producer handoff §4 sentence leaving S6/S7 rows unregistered is superseded: the rows
  now exist (`extensions.commands.keyboard-layout`, select with five options defaulting to
  Auto-detect; `extensions.commands.command-palette-visibility`, toggle defaulting to on;
  both Project-scoped) and every central consumer in this lane binds them.

## 8. Checks run and static proof limits

Narrow checks only (peers still editing; no full gates): every touched JSON parses; the
new valid fixture case validates against `settings_manager_descriptor` and the negative
case is schema-rejected; new Touch rows match the six-column shape with unique IDs,
`partial` disposition, non-empty residuals, and an existing profile; `TCP-CMDSC` refs
resolve (owner file contains CS-081; JSON-pointer refs resolve); the edited production
entry keeps all required `WiringEntry` fields; each of the seven UCC-165 commands keeps its catalog registration
and exactly one production entry; counts verified as in §6. Known
expected failures until the validator worker acts: the eight `commands.*` row IDs fail the
current row-schema `action_id` pattern, and all sixteen rows report as orphans in
`expected_inventory`. Static contracts only: nothing here proves a native handler,
dispatcher, filesystem write, permission enforcement, storage mode, provider behavior,
Slint rendering, or product readiness.
