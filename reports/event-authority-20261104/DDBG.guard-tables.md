# DDBG guard tables: per-row cut results (sweep part 2A)

Generated from the guard-isolation tool's JSON reports (tool `scripts/pm_guard_isolation.py` at `004bdedd63`). Columns: the row's own negatives; how many flipped to accepted when the row was cut; how many other controls and negatives kept their exact result and trace; masked negatives (own negatives still refused when cut); other cases whose result changed. Schema rows are labelled `<definition>#<pointer>`; code rows by name.

| Suite | Status | Controls | Proved | Negatives | Evaluations | Cut results | Failure kinds |
|---|---|---:|---|---:|---:|---|---|
| `envelope_suite` | PASS | 2 | 13 / 13 | 63 | 2600 | 63 flips, 0 masked, 0 unrelated changes | none |
| `payload_context_item_added_suite` | PASS | 1 | 36 / 36 | 36 | 4033 | 36 flips, 0 masked, 0 unrelated changes | none |
| `payload_context_item_state_changed_suite` | PASS | 1 | 23 / 23 | 23 | 1680 | 23 flips, 0 masked, 0 unrelated changes | none |
| `payload_exported_suite` | PASS | 1 | 28 / 28 | 28 | 2465 | 28 flips, 0 masked, 0 unrelated changes | none |
| `payload_imported_suite` | PASS | 1 | 24 / 24 | 24 | 1825 | 24 flips, 0 masked, 0 unrelated changes | none |
| `payload_verification_recorded_suite` | PASS | 1 | 23 / 23 | 23 | 1680 | 23 flips, 0 masked, 0 unrelated changes | none |
| `payload_instrumentation_state_changed_suite` | PASS | 31 | 13 / 13 | 13 | 1760 | 13 flips, 0 masked, 0 unrelated changes | none |
| `payload_values_instrumentation_state_changed_suite` | PASS | 31 | 21 / 21 | 21 | 3328 | 21 flips, 0 masked, 0 unrelated changes | none |
| `payload_started_suite` | PASS | 11 | 16 / 16 | 17 | 1372 | 17 flips, 0 masked, 0 unrelated changes | none |
| `payload_values_started_suite` | PASS | 11 | 25 / 25 | 25 | 2736 | 25 flips, 0 masked, 0 unrelated changes | none |
| `payload_target_bound_suite` | PASS | 1 | 9 / 9 | 11 | 336 | 11 flips, 0 masked, 0 unrelated changes | none |
| `payload_values_target_bound_suite` | PASS | 1 | 28 / 28 | 28 | 2465 | 28 flips, 0 masked, 0 unrelated changes | none |
| `payload_state_changed_suite` | PASS | 14 | 9 / 9 | 9 | 644 | 9 flips, 0 masked, 0 unrelated changes | none |
| `payload_values_state_changed_suite` | PASS | 14 | 24 / 24 | 24 | 2774 | 24 flips, 0 masked, 0 unrelated changes | none |
| `family_suite` | PASS | 72 | 4 / 4 | 6 | 1014 | 6 flips, 0 masked, 0 unrelated changes | none |
| `lifecycle_suite` | PASS | 16 | 21 / 21 | 43 | 3776 | 43 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_source_suite` | PASS | 14 | 11 / 11 | 11 | 850 | 11 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_source_values_suite` | PASS | 14 | 19 / 19 | 27 | 2378 | 27 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_suite` | PASS | 36 | 19 / 19 | 19 | 3190 | 19 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_required_suite` | PASS | 36 | 15 / 15 | 15 | 2346 | 15 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_values_a_suite` | PASS | 3 | 15 / 15 | 15 | 828 | 15 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_values_d_suite` | PASS | 7 | 15 / 15 | 15 | 1012 | 15 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_values_b_suite` | PASS | 13 | 10 / 10 | 30 | 1333 | 30 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_detail_values_c_suite` | PASS | 19 | 16 / 16 | 20 | 1911 | 20 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_joins_suite` | PASS | 36 | 11 / 11 | 11 | 1598 | 11 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_suite` | PASS | 37 | 12 / 12 | 12 | 1813 | 12 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_handoff_suite` | PASS | 36 | 12 / 12 | 12 | 1776 | 12 flips, 0 masked, 0 unrelated changes | none |
| `instrumentation_retry_suite` | PASS | 36 | 13 / 13 | 15 | 2040 | 15 flips, 0 masked, 0 unrelated changes | none |
| `retry_request_suite` | PASS | 2 | 10 / 10 | 10 | 372 | 10 flips, 0 masked, 0 unrelated changes | none |
| `admission_suite` | PASS | 9 | 5 / 5 | 54 | 1008 | 54 flips, 0 masked, 0 unrelated changes | none |
| `retained_suite` | PASS | 9 | 9 / 9 | 81 | 2520 | 81 flips, 0 masked, 0 unrelated changes | none |
| `references_suite` | PASS | 1 | 4 / 4 | 5 | 78 | 5 flips, 0 masked, 0 unrelated changes | none |

Totals: 513 rows, 513 proved, 517 controls, 746 negatives, 59541 evaluations.

### `envelope_suite`: PASS, 13 of 13 rows proved (report SHA-256 `89a873b87be80dd09c0747f6f92ff2c03ef363de6496e1d162f093c015798e2f`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `envelope.replay_only` | 9 | 9 | 54 | 0 | 0 | yes |
| `envelope.writer_policy` | 18 | 18 | 45 | 0 | 0 | yes |
| `envelope.project_id` | 1 | 1 | 62 | 0 | 0 | yes |
| `envelope.scope_kind` | 9 | 9 | 54 | 0 | 0 | yes |
| `envelope.project_join` | 1 | 1 | 62 | 0 | 0 | yes |
| `envelope.owner_project` | 1 | 1 | 62 | 0 | 0 | yes |
| `envelope.partition` | 18 | 18 | 45 | 0 | 0 | yes |
| `envelope.owner_investigation` | 1 | 1 | 62 | 0 | 0 | yes |
| `envelope.payload_project` | 1 | 1 | 62 | 0 | 0 | yes |
| `envelope.thread_join` | 1 | 1 | 62 | 0 | 0 | yes |
| `envelope.payload_thread` | 1 | 1 | 62 | 0 | 0 | yes |
| `envelope.run_join` | 1 | 1 | 62 | 0 | 0 | yes |
| `envelope.payload_run` | 1 | 1 | 62 | 0 | 0 | yes |

### `payload_context_item_added_suite`: PASS, 36 of 36 rows proved (report SHA-256 `f4b075f52e4ed9aa4b2e775e6cfc87f8f2cf1561b3002de0a15b21c38f0706a7`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload#/type` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/required/schema_version` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/required/investigation_id` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/required/operation_id` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/required/item_id` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/required/item_kind` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/required/source_surface` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/required/state` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/required/summary` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/required/redaction_state` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/schema_version/const` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/investigation_id/type` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/investigation_id/minLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/investigation_id/maxLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/operation_id/type` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/operation_id/minLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/operation_id/maxLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/item_id/type` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/item_id/minLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/item_id/maxLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/item_kind/type` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/item_kind/minLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/item_kind/maxLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/source_surface/type` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/source_surface/minLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/source_surface/maxLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/state/enum` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/summary/type` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/summary/maxLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/artifact_ref/type` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/artifact_ref/minLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/artifact_ref/maxLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/redaction_state/type` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/redaction_state/minLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/properties/redaction_state/maxLength` | 1 | 1 | 35 | 0 | 0 | yes |
| `payload#/additionalProperties/$boolean` | 1 | 1 | 35 | 0 | 0 | yes |

### `payload_context_item_state_changed_suite`: PASS, 23 of 23 rows proved (report SHA-256 `b8ff7650bc9f36242cbaeae7602cecf4fc38fffbdc10135e34934f5ca91359e4`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload#/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/schema_version` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/investigation_id` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/operation_id` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/item_id` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/previous_state` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/state` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/schema_version/const` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/investigation_id/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/investigation_id/minLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/investigation_id/maxLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/operation_id/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/operation_id/minLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/operation_id/maxLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/item_id/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/item_id/minLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/item_id/maxLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/previous_state/enum` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/state/enum` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/reason_code/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/reason_code/minLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/reason_code/maxLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/additionalProperties/$boolean` | 1 | 1 | 22 | 0 | 0 | yes |

### `payload_exported_suite`: PASS, 28 of 28 rows proved (report SHA-256 `b3b63468c3be0f8644ad23693e9a182899e1d1878b21ce711ab388dffd9d29c0`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload#/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/required/schema_version` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/required/investigation_id` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/required/operation_id` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/required/bundle_id` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/required/schema_id` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/required/item_count` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/required/artifact_count` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/required/redaction_profile` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/schema_version/const` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/investigation_id/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/investigation_id/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/investigation_id/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/operation_id/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/operation_id/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/operation_id/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/bundle_id/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/bundle_id/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/bundle_id/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/schema_id/const` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/item_count/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/item_count/minimum` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/artifact_count/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/artifact_count/minimum` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/redaction_profile/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/redaction_profile/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/properties/redaction_profile/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload#/additionalProperties/$boolean` | 1 | 1 | 27 | 0 | 0 | yes |

### `payload_imported_suite`: PASS, 24 of 24 rows proved (report SHA-256 `dd6841faed12fe6485a4d2a1e49d2fff783ea0ffc996949b426f689575a27b81`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload#/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/required/schema_version` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/required/investigation_id` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/required/operation_id` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/required/bundle_id` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/required/source_kind` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/required/schema_id` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/required/imported_target_kind` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/schema_version/const` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/investigation_id/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/investigation_id/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/investigation_id/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/operation_id/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/operation_id/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/operation_id/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/bundle_id/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/bundle_id/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/bundle_id/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/source_kind/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/source_kind/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/source_kind/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/schema_id/const` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/properties/imported_target_kind/const` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload#/additionalProperties/$boolean` | 1 | 1 | 23 | 0 | 0 | yes |

### `payload_verification_recorded_suite`: PASS, 23 of 23 rows proved (report SHA-256 `632ec7edfb663a1db905c88ed8497b9a35d8a446e7e1eb2e0350ce1afe086e0e`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload#/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/schema_version` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/investigation_id` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/operation_id` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/verification_strength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/required/verification_summary` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/schema_version/const` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/investigation_id/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/investigation_id/minLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/investigation_id/maxLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/operation_id/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/operation_id/minLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/operation_id/maxLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/verification_strength/enum` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/verification_summary/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/verification_summary/maxLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/artifact_refs/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/artifact_refs/maxItems` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/artifact_refs/uniqueItems` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/artifact_refs/items/type` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/artifact_refs/items/minLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/properties/artifact_refs/items/maxLength` | 1 | 1 | 22 | 0 | 0 | yes |
| `payload#/additionalProperties/$boolean` | 1 | 1 | 22 | 0 | 0 | yes |

### `payload_instrumentation_state_changed_suite`: PASS, 13 of 13 rows proved (report SHA-256 `4c4d6ea1b92ff4504b68a584cf55256acc92e4d0cedb647e6d3e32b2e830c3cd`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload#/type` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/investigation_id` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/operation_id` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/instrumentation_id` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/scope_kind` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/reason_code` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/detail_ref` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/schema_version` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/previous_state` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/state` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/previous_rollback_state` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/required/rollback_state` | 1 | 1 | 12 | 0 | 0 | yes |
| `payload#/additionalProperties/$boolean` | 1 | 1 | 12 | 0 | 0 | yes |

### `payload_values_instrumentation_state_changed_suite`: PASS, 21 of 21 rows proved (report SHA-256 `8ef0dbe7294d26d0694e109ca00b6ae7eedf0114a26f9efbf5c50da8161af80d`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload.values#/properties/investigation_id/type` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/minLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/maxLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/type` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/minLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/maxLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/instrumentation_id/type` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/instrumentation_id/minLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/instrumentation_id/maxLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/scope_kind/enum` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/reason_code/type` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/reason_code/minLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/reason_code/maxLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/detail_ref/type` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/detail_ref/minLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/detail_ref/maxLength` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/schema_version/const` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/previous_state/enum` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/state/enum` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/previous_rollback_state/enum` | 1 | 1 | 20 | 0 | 0 | yes |
| `payload.values#/properties/rollback_state/enum` | 1 | 1 | 20 | 0 | 0 | yes |

### `payload_started_suite`: PASS, 16 of 16 rows proved (report SHA-256 `48355068728a089c4f1f0dddbe1d1e09ba3976cf9d5930085e48f9dd9094aa4d`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload#/type` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/schema_version` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/investigation_id` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/operation_id` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/project_id` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/initiator_surface` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/target_kind` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/target_locator_summary` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/requested_mode_overlay` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/effective_mode_overlay` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/required/runtime_mode` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/additionalProperties/$boolean` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/allOf/0/then/properties/effective_mode_overlay/const` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/allOf/1/then/properties/requested_mode_overlay/const` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/allOf/1/then/properties/runtime_mode/enum` | 1 | 1 | 16 | 0 | 0 | yes |
| `payload#/allOf/2/then/properties/runtime_mode/const` | 2 | 2 | 15 | 0 | 0 | yes |

### `payload_values_started_suite`: PASS, 25 of 25 rows proved (report SHA-256 `f84b486a72f73c0b905c3afd432c9ecd16262e1a8aef01727c13244412c2ae5d`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload.values#/properties/schema_version/const` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/type` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/minLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/maxLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/type` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/minLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/maxLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/project_id/type` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/project_id/minLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/project_id/maxLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/thread_id/type` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/thread_id/minLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/thread_id/maxLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/run_id/type` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/run_id/minLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/run_id/maxLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/initiator_surface/type` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/initiator_surface/minLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/initiator_surface/maxLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/target_kind/enum` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/target_locator_summary/type` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/target_locator_summary/maxLength` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/requested_mode_overlay/enum` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/effective_mode_overlay/enum` | 1 | 1 | 24 | 0 | 0 | yes |
| `payload.values#/properties/runtime_mode/enum` | 1 | 1 | 24 | 0 | 0 | yes |

### `payload_target_bound_suite`: PASS, 9 of 9 rows proved (report SHA-256 `e9a3fe8a20a48c0863d09bc6db35510af672767195b08b6b5731541c37707fd1`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload.target_sha256_hex` | 3 | 3 | 8 | 0 | 0 | yes |
| `payload#/type` | 1 | 1 | 10 | 0 | 0 | yes |
| `payload#/required/schema_version` | 1 | 1 | 10 | 0 | 0 | yes |
| `payload#/required/investigation_id` | 1 | 1 | 10 | 0 | 0 | yes |
| `payload#/required/operation_id` | 1 | 1 | 10 | 0 | 0 | yes |
| `payload#/required/target_kind` | 1 | 1 | 10 | 0 | 0 | yes |
| `payload#/required/target_bindings` | 1 | 1 | 10 | 0 | 0 | yes |
| `payload#/required/binding_state` | 1 | 1 | 10 | 0 | 0 | yes |
| `payload#/additionalProperties/$boolean` | 1 | 1 | 10 | 0 | 0 | yes |

### `payload_values_target_bound_suite`: PASS, 28 of 28 rows proved (report SHA-256 `6494beb53376dbe5e43bc50aeeb14b6a2efe53e9d3949836150819cf64224992`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload.values#/properties/schema_version/const` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_kind/enum` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/required/owner_ref` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/required/target_ref` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/required/binding_revision` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/required/source_sha256` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/owner_ref/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/owner_ref/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/owner_ref/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/target_ref/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/target_ref/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/target_ref/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/binding_revision/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/binding_revision/minimum` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/source_sha256/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/source_sha256/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/properties/source_sha256/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/target_bindings/additionalProperties/$boolean` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/binding_state/type` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/binding_state/minLength` | 1 | 1 | 27 | 0 | 0 | yes |
| `payload.values#/properties/binding_state/maxLength` | 1 | 1 | 27 | 0 | 0 | yes |

### `payload_state_changed_suite`: PASS, 9 of 9 rows proved (report SHA-256 `35b06e07771bec69ab901013049eef9c459d084846ac37f33ab5d5b00e752609`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload#/type` | 1 | 1 | 8 | 0 | 0 | yes |
| `payload#/required/schema_version` | 1 | 1 | 8 | 0 | 0 | yes |
| `payload#/required/investigation_id` | 1 | 1 | 8 | 0 | 0 | yes |
| `payload#/required/operation_id` | 1 | 1 | 8 | 0 | 0 | yes |
| `payload#/required/previous_state` | 1 | 1 | 8 | 0 | 0 | yes |
| `payload#/required/previous_phase` | 1 | 1 | 8 | 0 | 0 | yes |
| `payload#/required/phase` | 1 | 1 | 8 | 0 | 0 | yes |
| `payload#/required/state` | 1 | 1 | 8 | 0 | 0 | yes |
| `payload#/additionalProperties/$boolean` | 1 | 1 | 8 | 0 | 0 | yes |

### `payload_values_state_changed_suite`: PASS, 24 of 24 rows proved (report SHA-256 `a81364ab3c4a06dfb54b2758ceaec84004b2cb3efa1b0a5f11dd7dda3d65d9f0`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `payload.values#/properties/investigation_id/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/investigation_id/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/operation_id/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/attention_required_reason_code/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/attention_required_reason_code/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/attention_required_reason_code/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/stop_reason_code/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/stop_reason_code/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/stop_reason_code/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/budget_kind/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/budget_kind/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/budget_kind/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/blocked_reason_code/type` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/blocked_reason_code/minLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/blocked_reason_code/maxLength` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/schema_version/const` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/previous_state/enum` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/state/enum` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/previous_phase/enum` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/phase/enum` | 1 | 1 | 23 | 0 | 0 | yes |
| `payload.values#/properties/verification_strength/enum` | 1 | 1 | 23 | 0 | 0 | yes |

### `family_suite`: PASS, 4 of 4 rows proved (report SHA-256 `ea39a7ba98cb0cff23232364544f52a2c8631b54868718ac911b8e73835e843e`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `family.explicit_yolo` | 1 | 1 | 5 | 0 | 0 | yes |
| `family.planning_approval` | 1 | 1 | 5 | 0 | 0 | yes |
| `family.context_no_op` | 1 | 1 | 5 | 0 | 0 | yes |
| `family.payload_size` | 3 | 3 | 3 | 0 | 0 | yes |

### `lifecycle_suite`: PASS, 21 of 21 rows proved (report SHA-256 `9359fc7dd654682f26e539a09d53b72159a3744bcafda03032ebe8e442aae683`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `lifecycle.stale_state` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle.stale_phase` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle.no_op` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle.terminal` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle.state_reason` | 11 | 11 | 32 | 0 | 0 | yes |
| `lifecycle.attention_reason` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle.blocked_reason` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle.verification` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle.cleanup` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle_source#/type` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle_source#/required/state` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle_source#/required/phase` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle_source#/required/verification_qualified` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle_source#/required/cleanup_completed` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle_source#/required/documented_preservation_hold` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle_source#/properties/state/enum` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle_source#/properties/phase/enum` | 1 | 1 | 42 | 0 | 0 | yes |
| `lifecycle_source#/properties/verification_qualified/type` | 5 | 5 | 38 | 0 | 0 | yes |
| `lifecycle_source#/properties/cleanup_completed/type` | 5 | 5 | 38 | 0 | 0 | yes |
| `lifecycle_source#/properties/documented_preservation_hold/type` | 5 | 5 | 38 | 0 | 0 | yes |
| `lifecycle_source#/additionalProperties/$boolean` | 1 | 1 | 42 | 0 | 0 | yes |

### `instrumentation_source_suite`: PASS, 11 of 11 rows proved (report SHA-256 `ea217c53416a07df369aa1871968ec92c313751244e1547991481a556a25e0ca`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instrumentation_source#/type` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/required/instrumentation_id` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/required/scope_kind` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/required/target_ref` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/required/owner_ref` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/required/state` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/required/cleanup_result` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/required/retry_count` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/required/previous_attempt_failed` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/required/handoff_pending` | 1 | 1 | 10 | 0 | 0 | yes |
| `instrumentation_source#/additionalProperties/$boolean` | 1 | 1 | 10 | 0 | 0 | yes |

### `instrumentation_source_values_suite`: PASS, 19 of 19 rows proved (report SHA-256 `99bf8f14ba16a2148a38132b6975f65b9743c9a2fc08e5fd7e6526fb5caf9f04`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instrumentation_source.values#/properties/instrumentation_id/type` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/instrumentation_id/minLength` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/instrumentation_id/maxLength` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/scope_kind/type` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/scope_kind/minLength` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/scope_kind/maxLength` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/target_ref/type` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/target_ref/minLength` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/target_ref/maxLength` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/owner_ref/type` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/owner_ref/minLength` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/owner_ref/maxLength` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/state/enum` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/cleanup_result/enum` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/retry_count/type` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/retry_count/minimum` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/retry_count/maximum` | 1 | 1 | 26 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/previous_attempt_failed/type` | 5 | 5 | 22 | 0 | 0 | yes |
| `instrumentation_source.values#/properties/handoff_pending/type` | 5 | 5 | 22 | 0 | 0 | yes |

### `instrumentation_detail_suite`: PASS, 19 of 19 rows proved (report SHA-256 `ae17e507a815098dc7009684733814a0384d7d23d302e83b29fd0a211cc35110`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instr.detail_available` | 1 | 1 | 18 | 0 | 0 | yes |
| `instr.detail_size` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/type` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/instrumentation_id` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/operation_id` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/target_ref` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/previous_owner_ref` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/owner_ref` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/proof_ref` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/recovery_ref` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/linked_work_ref` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/remaining_obligation_refs` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/whole_lane_never_needed_undoing` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/no_leftovers` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/removal_verified` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/retry_authorized` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/previous_attempt_failed` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/required/handoff_approved` | 1 | 1 | 18 | 0 | 0 | yes |
| `instrumentation_change_detail#/properties/detail/additionalProperties/$boolean` | 1 | 1 | 18 | 0 | 0 | yes |

### `instrumentation_detail_required_suite`: PASS, 15 of 15 rows proved (report SHA-256 `8f44d01a7982610303f5e2d0894a6120efe84fe1169fe0e1dee3e6e4496e035d`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instrumentation_change_detail.required_b#/properties/detail/required/durable_fix_approved` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/owner_accepted` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/handoff_pending` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/invasive` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/restore_receipt_verified` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/permission_verified` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/overlap_present` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/target_leftovers_present` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/target_leftovers_promoted` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/retry_count_before` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/retry_count_after` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/attempt_number` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/transition_kind` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/handoff_kind` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.required_b#/properties/detail/required/handoff_committed` | 1 | 1 | 14 | 0 | 0 | yes |

### `instrumentation_detail_values_a_suite`: PASS, 15 of 15 rows proved (report SHA-256 `6b730a4d5f073f190c363cb9894910e7dc5523d52b8a8a357b3af2ba320264cf`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instrumentation_change_detail.values_a#/properties/detail/properties/instrumentation_id/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/instrumentation_id/minLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/instrumentation_id/maxLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/operation_id/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/operation_id/minLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/operation_id/maxLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/target_ref/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/target_ref/minLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/target_ref/maxLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/previous_owner_ref/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/previous_owner_ref/minLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/previous_owner_ref/maxLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/owner_ref/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/owner_ref/minLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_a#/properties/detail/properties/owner_ref/maxLength` | 1 | 1 | 14 | 0 | 0 | yes |

### `instrumentation_detail_values_d_suite`: PASS, 15 of 15 rows proved (report SHA-256 `18ca7e9a954c0b72928eacb04478dc433fc036e5ba047a4e24fda0420141657f`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instrumentation_change_detail.values_d#/properties/detail/properties/proof_ref/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/proof_ref/minLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/proof_ref/maxLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/recovery_ref/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/recovery_ref/minLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/recovery_ref/maxLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/linked_work_ref/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/linked_work_ref/minLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/linked_work_ref/maxLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/remaining_obligation_refs/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/remaining_obligation_refs/uniqueItems` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/remaining_obligation_refs/items/type` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/remaining_obligation_refs/items/minLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/remaining_obligation_refs/items/maxLength` | 1 | 1 | 14 | 0 | 0 | yes |
| `instrumentation_change_detail.values_d#/properties/detail/properties/whole_lane_never_needed_undoing/type` | 1 | 1 | 14 | 0 | 0 | yes |

### `instrumentation_detail_values_b_suite`: PASS, 10 of 10 rows proved (report SHA-256 `ac676308150e00cc6a84c1f5e2cb144837379607d69bc6ffbfe79fa346a5e3d1`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instrumentation_change_detail.values_b#/properties/detail/properties/no_leftovers/type` | 5 | 5 | 25 | 0 | 0 | yes |
| `instrumentation_change_detail.values_b#/properties/detail/properties/removal_verified/type` | 5 | 5 | 25 | 0 | 0 | yes |
| `instrumentation_change_detail.values_b#/properties/detail/properties/retry_authorized/type` | 5 | 5 | 25 | 0 | 0 | yes |
| `instrumentation_change_detail.values_b#/properties/detail/properties/previous_attempt_failed/type` | 1 | 1 | 29 | 0 | 0 | yes |
| `instrumentation_change_detail.values_b#/properties/detail/properties/handoff_approved/type` | 1 | 1 | 29 | 0 | 0 | yes |
| `instrumentation_change_detail.values_b#/properties/detail/properties/durable_fix_approved/type` | 1 | 1 | 29 | 0 | 0 | yes |
| `instrumentation_change_detail.values_b#/properties/detail/properties/owner_accepted/type` | 1 | 1 | 29 | 0 | 0 | yes |
| `instrumentation_change_detail.values_b#/properties/detail/properties/handoff_pending/type` | 1 | 1 | 29 | 0 | 0 | yes |
| `instrumentation_change_detail.values_b#/properties/detail/properties/invasive/type` | 5 | 5 | 25 | 0 | 0 | yes |
| `instrumentation_change_detail.values_b#/properties/detail/properties/restore_receipt_verified/type` | 5 | 5 | 25 | 0 | 0 | yes |

### `instrumentation_detail_values_c_suite`: PASS, 16 of 16 rows proved (report SHA-256 `6c23a55042044e2120b0f0911199305a409bad084494c5d7af0d636b7f0adcf9`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instrumentation_change_detail.values_c#/properties/detail/properties/permission_verified/type` | 5 | 5 | 15 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/overlap_present/type` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/target_leftovers_present/type` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/target_leftovers_promoted/type` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/retry_count_before/type` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/retry_count_before/minimum` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/retry_count_before/maximum` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/retry_count_after/type` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/retry_count_after/minimum` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/retry_count_after/maximum` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/attempt_number/type` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/attempt_number/minimum` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/attempt_number/maximum` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/transition_kind/enum` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/handoff_kind/enum` | 1 | 1 | 19 | 0 | 0 | yes |
| `instrumentation_change_detail.values_c#/properties/detail/properties/handoff_committed/type` | 1 | 1 | 19 | 0 | 0 | yes |

### `instrumentation_joins_suite`: PASS, 11 of 11 rows proved (report SHA-256 `fdc2a4cc53ea5be63d45b1869ec6fa6d8e0a9b7b742feb1cadab0dcd05fcf39b`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instr.join_payload_instrumentation` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_payload_scope` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_previous_state` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_previous_result` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_detail_instrumentation` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_detail_operation` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_detail_target` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_detail_owner` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_detail_retry_count` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_detail_attempt_failed` | 1 | 1 | 10 | 0 | 0 | yes |
| `instr.join_detail_handoff_pending` | 1 | 1 | 10 | 0 | 0 | yes |

### `instrumentation_suite`: PASS, 12 of 12 rows proved (report SHA-256 `20dc9899d0d940ade9737999b2553bb6e97d119214df8e8ee75c446bea1dcba4`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instr.second_handoff` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.no_op` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.pair_before` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.pair_after` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.cleaned_restart` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.edge_start` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.edge_end` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.never_needed_whole_lane` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.never_needed_no_leftovers` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.never_needed_proof` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.never_needed_not_removed` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.removal_verified` | 1 | 1 | 11 | 0 | 0 | yes |

### `instrumentation_handoff_suite`: PASS, 12 of 12 rows proved (report SHA-256 `48c4cc78b56b3af2eef9a027f9e93b229c2849bce2b6970d142fd5ab5b027218`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instr.removal_no_leftovers` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.removal_proof` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.obligations_remaining` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.obligations_recovery` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.handoff_approved` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.handoff_committed` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.handoff_linked_work` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.handoff_new_owner` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.handoff_kind` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.handoff_durable_fix` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.owner_unchanged` | 1 | 1 | 11 | 0 | 0 | yes |
| `instr.replacement_linked_work` | 1 | 1 | 11 | 0 | 0 | yes |

### `instrumentation_retry_suite`: PASS, 13 of 13 rows proved (report SHA-256 `438a5a81f04dbc206b30954b7ce34a21ada0498b5d41d66ac445326d42f5fa91`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `instr.receiving_accepted` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.retry_authorized` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.retry_ceiling` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.retry_count_increment` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.retry_count_unchanged` | 2 | 2 | 13 | 0 | 0 | yes |
| `instr.attempt_number` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.attempt_none` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.cannot_retry_previous_failure` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.cannot_retry_available` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.install_restore_receipt` | 2 | 2 | 13 | 0 | 0 | yes |
| `instr.install_permission` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.install_overlap` | 1 | 1 | 14 | 0 | 0 | yes |
| `instr.install_target_leftovers` | 1 | 1 | 14 | 0 | 0 | yes |

### `retry_request_suite`: PASS, 10 of 10 rows proved (report SHA-256 `c2be36be9abc24bae8c3e05eb90a490497136956beca6370c8e50f2440bd870d`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `retry.authorization` | 1 | 1 | 9 | 0 | 0 | yes |
| `retry.ceiling` | 1 | 1 | 9 | 0 | 0 | yes |
| `cleanup_retry_request#/type` | 1 | 1 | 9 | 0 | 0 | yes |
| `cleanup_retry_request#/required/retries_used` | 1 | 1 | 9 | 0 | 0 | yes |
| `cleanup_retry_request#/required/authorized` | 1 | 1 | 9 | 0 | 0 | yes |
| `cleanup_retry_request#/properties/retries_used/type` | 1 | 1 | 9 | 0 | 0 | yes |
| `cleanup_retry_request#/properties/retries_used/minimum` | 1 | 1 | 9 | 0 | 0 | yes |
| `cleanup_retry_request#/properties/retries_used/maximum` | 1 | 1 | 9 | 0 | 0 | yes |
| `cleanup_retry_request#/properties/authorized/type` | 1 | 1 | 9 | 0 | 0 | yes |
| `cleanup_retry_request#/additionalProperties/$boolean` | 1 | 1 | 9 | 0 | 0 | yes |

### `admission_suite`: PASS, 5 of 5 rows proved (report SHA-256 `33705f53fdbc2d6773b550e62e29689d306e20083a4b39fee202382d835c3aee`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `admission.replay_only` | 9 | 9 | 45 | 0 | 0 | yes |
| `admission.writer_policy` | 18 | 18 | 36 | 0 | 0 | yes |
| `admission.withdrawn` | 9 | 9 | 45 | 0 | 0 | yes |
| `admission.registered` | 9 | 9 | 45 | 0 | 0 | yes |
| `admission.retention` | 9 | 9 | 45 | 0 | 0 | yes |

### `retained_suite`: PASS, 9 of 9 rows proved (report SHA-256 `e033281c7b72d37c5b9871c8196412b570aecc40cf01d852296ff1b3f34ae7f3`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `retained.withdrawn` | 9 | 9 | 72 | 0 | 0 | yes |
| `retained.admission` | 9 | 9 | 72 | 0 | 0 | yes |
| `retained.recipe` | 9 | 9 | 72 | 0 | 0 | yes |
| `retained.family` | 9 | 9 | 72 | 0 | 0 | yes |
| `retained.identity` | 9 | 9 | 72 | 0 | 0 | yes |
| `retained.body` | 9 | 9 | 72 | 0 | 0 | yes |
| `retained.sequence` | 9 | 9 | 72 | 0 | 0 | yes |
| `retained.observed` | 9 | 9 | 72 | 0 | 0 | yes |
| `retained.persisted` | 9 | 9 | 72 | 0 | 0 | yes |

### `references_suite`: PASS, 4 of 4 rows proved (report SHA-256 `3094c44a8b40480eef31edb1366f9cefc1db13c15f6389d788a250531d3046c3`)

| Row | Own negatives | Flip when cut | Other cases unchanged | Masked | Unrelated changes | Proved |
|---|---:|---:|---:|---:|---:|---|
| `references.anchor_form` | 2 | 2 | 3 | 0 | 0 | yes |
| `references.base_known` | 1 | 1 | 4 | 0 | 0 | yes |
| `references.target_exists` | 1 | 1 | 4 | 0 | 0 | yes |
| `references.target_schema` | 1 | 1 | 4 | 0 | 0 | yes |
