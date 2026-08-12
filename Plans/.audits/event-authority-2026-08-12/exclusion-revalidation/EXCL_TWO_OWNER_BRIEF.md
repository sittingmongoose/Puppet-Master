# Exclusion revalidation — two owner rows

**Generated:** 2026-08-12T08:52:00Z  
**Status:** 92/94 pass; `all_revalidated=false`. No evidence-backed exclusion-only edit currently supports 94/94. The remaining two rows are blocked strictly on explicit owner responses for `EXCL-OD-done_budget_exceeded` and `EXCL-OD-stop_identical_failure`.

Both remaining failures keep `actual_category: exact_excluded` and fail only because `disposition: OWNER_DECISION_REQUIRED`.

Validator boundary:

- `independent-validator/INDEPENDENT_EA_VALIDATOR_SPEC.md` requires `OWNER_DECISION_SHEET.json` and treats `owner_decision_sheet_all_applied` as false until each required decision has an explicit `owner_response.chosen_option`.
- `independent-validator/receipts/event_authority_validator_receipt.json` currently records `exclusion_revalidation_pass_count=92`, `exclusion_revalidation_total=94`, and `owner_decision_sheet_pending=8`.
- Therefore `exclusion_revalidation_incomplete` should remain until those two exclusion decisions are answered; changing the exclusion ledger to 94/94 before that would contradict the validator contract rather than repair it.

Sheet IDs: `EXCL-OD-done_budget_exceeded`, `EXCL-OD-stop_identical_failure`.

Neither token appears in `Plans/event_family_registry.json`, `Plans/Wiring_Matrix.production.json`, or `Plans/storage_value_registry.json`.

## `done.budget_exceeded`

- `Plans/Run_Modes.md:381-419` — post-response terminal stop reason after durable usage recording; carried in terminal `done` payload and `run.completed` metadata.
- `Plans/Contracts_V0.md:2230-2276` — distinguishes pre-dispatch `kill.budget_exceeded` from post-response `done.budget_exceeded`; requires durable overrun evidence.
- Ledger citation range `13279-13312` currently lands on cost-monotonicity PlanUnit text, not the live spending-limit section. Do not silently restamp.

Ambiguity: “emit” plus general EventRecord persistence language is not a direct `event_type` binding (`CENSUS_ADMISSION_RULE_V2`).

## `stop.identical_failure`

- `Plans/Run_Modes.md:248-274` — exact consecutive `(tool_name, serialized_args_hash, error_message)` terminal stop.
- `Plans/Executor_Protocol.md:438-462` — doom-loop guard says emit `stop.identical_failure`; later alignment makes `kill.identical_failure` canonical and labels `stop.*` an older compatibility alias.

Same-file emit vs alias conflict is owner-only.

## Concept labels vs sheet options (literal)

| Requested concept term | Sheet option | Meaning |
|---|---|---|
| `AFFIRM_EXCLUSION` | `CONFIRM_EXACT_EXCLUDE` | Affirm july68 exact exclusion. Token remains out of admitted denominator. |
| `RECLASSIFY_TO_UNRESOLVED` | `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE` | Leave exact-exclusion; fail-closed unresolved/quarantine. No registry admit. |
| `ADMIT` | **not a sheet option** | Would assert a persisted EventRecord family. Current evidence does not satisfy `DIRECT_EVENT_TYPE_BINDING_REQUIRED`. |

Additional sheet option (no requested-concept alias): `RECLASSIFY_TO_NON_EXACT` — move to july26 non-exact exclusion; still not admitted.

## What each sheet option means

Sheet labels (do not invent `ADMIT` on the sheet):

| Option | Effect |
|---|---|
| `CONFIRM_EXACT_EXCLUDE` (`AFFIRM_EXCLUSION`) | Stay in july68 `exact_excluded`. Payload/stop-reason/compatibility vocabulary, **not** an admitted EventRecord family. Outside admitted denominator. |
| `RECLASSIFY_TO_NON_EXACT` | Move to july26 non-exact exclusion. Still not admitted. |
| `RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE` (`RECLASSIFY_TO_UNRESOLVED`) | Leave exact-exclusion; fail-closed unresolved/quarantine. No registry admit. Still outside admitted denominator until direct persistence authority exists. |

`ADMIT` is **not** a sheet option. Current evidence does not satisfy `DIRECT_EVENT_TYPE_BINDING_REQUIRED`. Choosing admit would be new product authority plus complete EA contract work, not a revalidation conclusion.

Default if no response on the sheet is `CONFIRM_EXACT_EXCLUDE` (category unchanged), but that default is not self-applying. The validator still blocks until an explicit `owner_response.chosen_option` is recorded on the owner sheet.
