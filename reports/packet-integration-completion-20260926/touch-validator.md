# Touch validator companions — TCP-CMDSC (CS-081 census)

Date: 2026-09-26. Validator-lane companions for
[commands-central-consumers.md](commands-central-consumers.md). Static checks only:
no native handler, dispatcher, filesystem, permission, storage, provider,
EventRecord, visual, or readiness proof is claimed.

## Scope and ownership

Touched only: `Plans/touch_closure.schema.json`,
`scripts/pm-touch-closure-verify.py`,
`tests/test_pm_touch_closure_source.py`, and this report.
`Plans/touch_closure.json` (central lane's 16 rows + `TCP-CMDSC` profile),
production wiring, catalog, fixtures, and the `pm-new-contracts` /
`pm_packet_integration_semantics` lanes were not modified.

## Changes

- Row `action_id` pattern (schema) and `ACTION_RE` (validator) now admit the
  exact eight `commands.*` local IDs as bounded closed names
  (`create|update|delete|preview|import_preview|import_commit|export|reset_all`);
  any other `commands.*` spelling is schema- and validator-rejected.
  `TOKEN_RE` stays narrow (`cmd|ui|settings`) so ambient prose can never
  promote a `commands.*` token into the inventory.
- `expected_inventory` reads `/$defs/census_action_id/enum` from
  `Plans/commands_shortcuts_contracts.schema.json`, fails closed on any drift
  from the exact eight, and maps all sixteen IDs (eight `commands.*` plus the
  eight closed `settings.commands_shortcuts.*` bindings/view rows) to
  `TCP-CMDSC` as `ui_action` / `partial`.
- Resolved denominators updated to rows 666, profiles 134, exclusions 58,
  aliases 65, production entries 1149 (covers the +7 PJCT/FORGE batch reusing
  `TCP-PROJECT`/`TCP-FORGE` plus the +16 CMDSC rows under new `TCP-CMDSC`).
  All previous owner validations (DRY guard, Forge alias, permissions refs,
  gap-repair, server-gap adjudication, exclusion partition) are unchanged.
- `CommandsShortcutsCensusTests` (3 tests): local rows map to
  `TCP-CMDSC`/`ui_action`/`partial` with owner `CS-081` and real counts;
  unknown `commands.*` spellings are rejected and enum drift fails closed; no
  primary is minted (all sixteen are `ui_action`, zero catalog primary rows,
  zero production entries). Existing count asserts updated to 666/134.

## Baseline and checks

Before this lane, the validator reported exactly the three failure classes the
central report predicted: 8 schema-pattern rejections on `commands.*` rows,
16 orphan actions, and denominator drift (643/133/1142 vs 666/134/1149).
No other failures existed; no unrelated failure was touched.

- `python3 scripts/pm-touch-closure-verify.py` → PASS, 666 rows across
  134 profiles, open residuals 666 (all `partial`/`blocked`/`missing` by design).
- `python3 -m unittest tests.test_pm_touch_closure_source` → 53 tests OK
  (50 existing + 3 new).
