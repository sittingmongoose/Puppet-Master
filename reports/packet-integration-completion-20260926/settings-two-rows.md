# settings-two-rows — the two Project-scoped Commands settings rows registered

Final integration status and current evidence are in README.md and validation.md. Producer handoff sections below retain intermediate counts and next steps for lineage; they are not the remaining-work list.

Worker report for the `settings-two-rows` scope of [closure.json](closure.json).
Basis: review verdict
`/home/sittingmongoose/PM-Experiments/packet-integration-completion-20260926/reviews/settings-pending-rows.md`,
SSYS-002/SSYS-009 (`Plans/Settings_System.md`), and CS-081 (`Plans/Commands_System.md`).
Only the five owned surfaces were edited; no commit, no builders/generated HTML, no
shard/index/governance regeneration, and no native writer or readiness claim. The existing
Settings transaction preview/apply (`cmd.settings.transaction.preview` →
`cmd.settings.transaction.apply`, handlers `handlers::settings::transaction_preview` /
`handlers::settings::transaction_apply`) stays the sole writer; no new command, no physical
writer, no global preference key.

## 1. Registered rows (`Plans/settings_inventory.json`)

Two rows added to the `extensions.commands` run, directly after
`extensions.commands.shortcut-hints` (S5 → S6 → S7 census order). Inventory is now **889** rows
(was 887); no duplicate ids; validated against `Plans/settings_inventory.schema.json` in place —
no schema edit.

| Exact setting ID | Shape | Default | Scope |
|---|---|---|---|
| `extensions.commands.keyboard-layout` | `select`, options exactly `Auto-detect`, `US (QWERTY)`, `UK`, `German (QWERTZ)`, `French (AZERTY)` | `"Auto-detect"` | `["project"]` |
| `extensions.commands.command-palette-visibility` | `toggle` | `"on"` | `["project"]` |

Value mapping (per the review, unchanged): the selected `Keyboard layout` select stores
`commandsPrefs.layout` verbatim; `Auto-detect` is a stored choice whose effective layout follows
the system. The selected `Show your commands in the command palette` toggle maps
`commandsPrefs.palette: true` ↔ inventory `on`, `false` ↔ `off`; it scopes user commands in the
palette only, never UICommand registration or execution permission. Both rows are tier
`advanced` (both controls live in the manager's Advanced disclosures), with
`related_features: ["mcp", "plugins"]` matching the sibling `extensions.commands` rows.

## 2. Owner prose (`Plans/Commands_System.md` — S6/S7/CS-081 only)

- S6/S7 table rows now name the exact IDs above instead of "(pending registration)": S6
  preview+applies the Project-scoped layout select, S7 the Project-scoped toggle with the
  on/off mapping.
- CS-081 `canonical_text` names `extensions.commands.keyboard-layout` and
  `extensions.commands.command-palette-visibility` in its settings-transaction sentence and says
  "registered Project-scoped inventory rows"; the matching acceptance criterion carries both IDs.
- CS-082 and the root Scope/FileSafe fixes were not touched.

## 3. Fixtures (`Plans/commands_shortcuts_contract_fixtures.json` — S6/S7 cases only)

- `route_layout_pending` and `route_palette_pending` (case ids kept stable) are now bound:
  `setting_id` exact, `setting_pending: false`, notes say the registered Project-scoped row
  writes through settings preview+apply.
- `availability_owner_unavailable_pending_row` renamed to `availability_owner_unavailable`; the
  record itself is unchanged and honest — `available: false` with `owner_unavailable` — because
  the registered contract still has no native handler.
- `reject_route_pending_with_setting_id` kept as-is: the schema retains the generic
  `setting_pending: true → setting_id: null` rule for future rows, so the adversarial case stays
  a valid schema-rejection test. Counts unchanged: 71 valid, 40 invalid, 24 semantic cases.

## 4. Selected source (`Concepts/pm7-tools/settings_refresh/managers/24-commands.js`)

`COMMAND_ACTION_BINDINGS['commands-layout'].setting` →
`extensions.commands.keyboard-layout` and `['commands-pref:palette'].setting` →
`extensions.commands.command-palette-visibility`; both `pending_row: true` flags removed and the
binding comment rewritten to say a bound registered row proves nothing about native handler
availability. No UI, handlers, option labels, or placement changed; the browser `saveState()`
remains fixture-local.

## 5. Validation (run once)

- Both changed JSON files parse; inventory row count 889 with no duplicate ids;
  `jsonschema.validate` of `Plans/settings_inventory.json` against
  `Plans/settings_inventory.schema.json`: **PASS**.
- The two bound fixture records carry the exact IDs with `setting_pending: false`; the renamed
  availability case and the preserved adversarial reject case are present.
- `node --check Concepts/pm7-tools/settings_refresh/managers/24-commands.js`: **PASS**.

## 6. Handoff still owned by root / other producers

1. `Plans/Settings_System.md`: the narrow owner paragraph after SSYS-037 (Settings owner; the
   review's coordinated-edit item 1).
2. `Plans/settings_system_contract_fixtures.json`: `commands-shortcuts` descriptor
   `owner_gap_reason` should now name both registered rows and no remaining S6/S7 owner gap;
   `Plans/touch_closure.json` S6/S7 rows and any validator join should require the exact ids and
   `setting_pending: false` (central consumers; item 4).
3. `Concepts/pm7-tools/settings_tome_source.py:143` pins
   `need(len(rows) == 887, "T44: compatibility Settings inventory count changed")` and line 3039
   says "current 887-row … payload" — both must move to 889 when the authored T44 build next
   runs, otherwise the concept build fails. The published generated HTML embeds no
   `pending_row` metadata, so no HTML patch is forced by this change.
4. `reports/packet-integration-completion-20260926/commands-shortcuts.md` still says "pending
   row" for S6/S7 (lines 45-46 and 152) — Commands-report owner should drop that pending
   language.
5. `closure.json` has no `settings-two-rows` item yet; wire one if this scope is tracked there.
6. Shard/index regeneration and hash sync for the changed `Plans/*.md` and inventory, per the
   designated Plans lane.
