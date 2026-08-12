# Independent validator — fail-open audit

**Generated:** 2026-08-12T08:30:00Z  
**Target:** `pm_event_authority_independent_validator.py`

Fail-open means: artifact deleted, emptied, or stripped of required rows makes a named check **true** (or omits a failure) so certification can proceed.

## Ranked residual / fixed

| Rank | Named check / gate | Deleted | Empty | Missing required rows | Verdict |
|---:|---|---|---|---|---|
| 1 | `august_checkpoint_decisions_applied` | `required_input_missing` (path now in `required_paths`) | `august_checkpoint_drafts_empty` | `august_checkpoint_events_missing` | **FIXED** this campaign. Also requires each draft `veto_status` to match the normalized mapping of that event’s `owner_response.chosen_option`; otherwise `august_checkpoint_veto_status_mismatch_owner_choice` fails before seal. Probed empty / one-event / deleted. |
| 2 | `owner_decision_sheet_all_applied` | `required_input_missing` (`owner_decision_sheet` now required) | `owner_decision_sheet_empty` | `owner_decision_sheet_missing_required_ids` (8 IDs including `COMPACT-001`) | **FIXED** this turn. `owner_response` must be a dict whose `chosen_option` is in that decision's `options` (truthy strings no longer count). |
| 3 | `exclusion_revalidation_all_rows_pass` | `required_input_missing` (summary + ledger now required) | 0 rows → `exclusion_revalidation_row_count_mismatch` + incomplete | pass count < 94 → incomplete | **Fail closed** |
| 4 | `executable_oracle_harness_pass` | `executable_oracle_harness_missing_or_failed` (`oracle_ok` defaults False) | N/A (JSON object) | `pass`/`executable`/`covers_registered_families` must all be true | **Fail closed**. Missing file does not set pass. |
| 5 | Known37 / cohort / denom / disposition ledger / census adj ledger+partition / freeze / registry | `required_input_missing` early return | malformed JSON raises | set-equality checks | **Fail closed** on absence |
| 6 | `md_only_bindings_adjudicated_ok` | machine scan missing already appends `required_input_missing` (non-early); named check may stay True if tokens empty | v3 + tokens + missing adj file → fail | token set mismatch → fail | **Residual named-check fail-open** if machine scan is deleted: overall `pass` still false via `required_input_missing`, but `md_only_bindings_adjudicated_ok` can remain True. Not a pass-gate hole. |
| 7 | `fresh_denominator_closed` | denom is required | `closed=false` always fails `fresh_census_denominator_not_closed` | sealed empty types fail separately | **Fail closed**. Post-seal certification only. |
| 8 | Blocking dispositions (`NEEDS_OWNER_VETO` / `NEEDS_MORE_EVIDENCE` / unresolved / provisional) | ledger required | empty ledger would also break cohort coverage | counts from live ledger | **Fail closed** (presence of blocking rows fails; absence of ledger fails) |

## Probe notes (August)

- present PENDING → `august_checkpoint_veto_pending`
- empty file → `august_checkpoint_drafts_empty`
- one event → `august_checkpoint_events_missing`
- deleted file → early-return `required_input_missing` (stdout now includes `failure_errors`)
- original 2-row PENDING ledger restored (10385 bytes)

## Not fail-open

Hardcoded `pass: false` is absent. Flags are computed from results. `seal_prerequisites_met` excludes only the open-denominator certification family so `pass=true` cannot be used as a pre-seal gate.

## Residual (non-blocking for Advisor-2 August concern)

- Oracle receipt is not in `required_paths` because two locations are searched; missing still fails `executable_oracle_harness_missing_or_failed`.

## Follow-up (2026-08-12T08:40Z)

Advisor-2 August fail-open is closed:

- draft path is in `required_paths` → deleted file = `required_input_missing` (early return)
- empty file = `august_checkpoint_drafts_empty` before veto-status evaluation
- missing either expected August event = `august_checkpoint_events_missing` before veto-status evaluation
- `august_checkpoint_decisions_applied` starts False and becomes True only when both events are present and none are `PENDING`

`md_only_bindings_adjudicated_ok` residual also closed this turn:

- machine-scan, rejected-lexical, and md_only adjudication ledgers are in `required_paths`
- missing scan / non-v3 schema sets the named check False (does not skip adjudication)
- Known37 exact uniqueness (`len==37` and `len(set)==37`) is now an executable failure
