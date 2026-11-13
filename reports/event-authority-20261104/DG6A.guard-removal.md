# DG6A round 7 — serial guard-removal table

Code `f34fec9eb0c00754638a05e65b456e576b9d818a`. Source/current/checkpoint/History matrices run one family and one guard or named duplicate set at a time. Production guards remain enabled. Every mutation is in memory and restored in `finally`.

**509/509 full source/history rows pass** over 1829 current negatives and 522 historical negatives. **26 named duplicate matrices** retain exact flipped sets and rejection complements. **1620 field/input-domain rows** are separate component proofs, supported by 73026 standalone and composed observations.

The JSON files below give every negative name/value, flipping set, rejected complement and changed diagnostic. Source rows summarize examples; their complete complements are pinned by SHA-256. Domain rows remove an exercised field rule or named same-field duplicate set and rerun that field’s entire negative set. They are not a claim of native execution or of full composition from a scalar predicate alone.

| Family | Source/history rows | Current negatives | History negatives | Named matrices | Domain rows | Observations |
|---|---:|---:|---:|---:|---:|---:|
| alert.acknowledged | 67 | 248 | 58 | 3 | 215 | 9197 |
| alert.dismissed | 67 | 248 | 58 | 3 | 215 | 9323 |
| alert.rule_muted | 69 | 249 | 58 | 3 | 222 | 9513 |
| alert.snoozed | 70 | 262 | 58 | 3 | 221 | 10054 |
| concern.created | 68 | 292 | 58 | 5 | 329 | 12144 |
| panel.redocked | 84 | 265 | 116 | 5 | 209 | 11403 |
| panel.undocked | 84 | 265 | 116 | 4 | 209 | 11392 |

| Family | Evidence | SHA-256 |
|---|---|---|
| alert.acknowledged | [alert_acknowledged.guard.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/alert_acknowledged.guard.json) | `d26e6b0b9cf86ef817d2093c84fa2cbaa42d406f2814ce39d1f153e4079d7e12` |
| alert.acknowledged | [alert_acknowledged.domain.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/alert_acknowledged.domain.json) | `1a28d2582603474d5a0c9d801b4e6de939db6152ebf60f95f7b184860fa00090` |
| alert.dismissed | [alert_dismissed.guard.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/alert_dismissed.guard.json) | `f6c7b1eb5d94ab67715d338ab4e976f774427841151748a2fbf5cf09983f2161` |
| alert.dismissed | [alert_dismissed.domain.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/alert_dismissed.domain.json) | `4046e1fe6ebcfc1b814013359c86fc47d9a94783a0adf6aa7ac9b06719c3f769` |
| alert.rule_muted | [alert_rule_muted.guard.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/alert_rule_muted.guard.json) | `9778a028b8fe25fd8c2fdd49dc2ef1b4a4bec6b35eda1c90ea943428688b6599` |
| alert.rule_muted | [alert_rule_muted.domain.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/alert_rule_muted.domain.json) | `df8dd68c6ca394b994e619b9e3bd00c3a97bf4e1303d1558fbfedcf63c298b4e` |
| alert.snoozed | [alert_snoozed.guard.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/alert_snoozed.guard.json) | `19c1ed4a42c17726438d1fd09a7409a67a64f1266157cef3b60039f7946cd8c3` |
| alert.snoozed | [alert_snoozed.domain.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/alert_snoozed.domain.json) | `e363fd6a0d2d9f37693123fd72a2fd84145e15c27f5ede4c43368c85d904f366` |
| concern.created | [concern_created.guard.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/concern_created.guard.json) | `20bed0acc3b6d25562edda2554f0005ed2b39a1e5b6ffaf276012c165c478ecc` |
| concern.created | [concern_created.domain.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/concern_created.domain.json) | `1f8cd71432dbac3f8eeb7a001709c0c3f1d3a8a326fb2fa0254ebbaf1b38f0fb` |
| panel.redocked | [panel_redocked.guard.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/panel_redocked.guard.json) | `4e72debc0d00b70dea0a79750d1b897a4df45f7b61814becf4851b3508bd5ace` |
| panel.redocked | [panel_redocked.domain.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/panel_redocked.domain.json) | `fc7799c8bba144d4dd025c6e6cb118705502c08c287bc5199d9afaa5e7b03bec` |
| panel.undocked | [panel_undocked.guard.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/panel_undocked.guard.json) | `e85d28f237aa3051823ee43d5b6ddd5200409b7c1b2cf71ed9a8e9d286f3d3ed` |
| panel.undocked | [panel_undocked.domain.json](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/panel_undocked.domain.json) | `fe7d23d6d247ae3bc213349e0aba0ea0c13d81eb78e1c1e307ec934af89f56be` |

## alert.acknowledged — full source and History matrix

| Guard | Named duplicate | Negatives that flip | Other negatives still rejected |
|---|---|---|---|
| checkpoint schema::additionalProperties |  | 2: alert.acknowledged:checkpoint_partition_only, alert.acknowledged:checkpoint_schema_only | 246; exact complement in JSON |
| checkpoint schema::properties/index_read_token/additionalProperties |  | 2: alert.acknowledged:checkpoint_cases/persisted_snapshot_forbidden, alert.acknowledged:checkpoint_cases/otherwise_valid_token_with_snapshot | 246; exact complement in JSON |
| checkpoint schema::required |  | 1: alert.acknowledged:checkpoint_cases/missing_token | 247; exact complement in JSON |
| errors:30:schema validation |  | 9: alert.acknowledged:payload_extra_secret_field, alert.acknowledged:payload_missing_identity, alert.acknowledged:payload_wrong_handler … | 239; exact complement in JSON |
| errors:34:'non-successor' |  | 6: alert.acknowledged:payload_no_change_revision, alert.acknowledged:payload_skipped_revision, alert.acknowledged:payload_cases/no_change_revision … | 242; exact complement in JSON |
| errors:36:'uncommitted/stale/refused' |  | 14: alert.acknowledged:payload_stale_currentness, alert.acknowledged:payload_refused, alert.acknowledged:payload_failed_commit … | 234; exact complement in JSON |
| errors:38:'invalid protection proof' |  | 1: alert.acknowledged:typed_payload_guard_protected | 247; exact complement in JSON |
| operation_errors:83:schema validation |  | 3: alert.acknowledged:operation_schema_only, alert.acknowledged:operation_cases/settled_without_original_receipt, alert.acknowledged:executed/operation_errors/9 | 245; exact complement in JSON |
| operation_errors:87:'operation exceeds 16384 encoded bytes' |  | 3: alert.acknowledged:operation_bytes_only, alert.acknowledged:executed/operation_errors/10, alert.acknowledged:executed/operation_errors/11 | 245; exact complement in JSON |
| operation_errors:95:'operation identity digest mismatch' |  | 1: alert.acknowledged:arbitrary_operation_digest | 247; exact complement in JSON |
| operation_errors:97:'event identity mismatch' |  | 1: alert.acknowledged:forged_event_id | 247; exact complement in JSON |
| operation_errors:99:'frozen command digest mismatch' |  | 4: alert.acknowledged:arbitrary_request_digest, alert.acknowledged:representation_request_digest_uppercase, alert.acknowledged:representation_request_digest_spaced … | 244; exact complement in JSON |
| operation_errors:102:'original command/payload field presence' |  | 1: alert.acknowledged:optional_payload_without_command | 247; exact complement in JSON |
| operation_errors:110:'non-successor' |  | 1: alert.acknowledged:non_successor | 247; exact complement in JSON |
| operation_errors:105:'original command/payload ' + key |  | 8: alert.acknowledged:command_join_project_id, alert.acknowledged:command_join_alert_id, alert.acknowledged:command_join_alert_record_ref … | 240; exact complement in JSON |
| operation_errors:108:'operation/payload ' + key |  | 2: alert.acknowledged:scope_join_project_id, alert.acknowledged:scope_join_idempotency_key | 246; exact complement in JSON |
| operation_errors:122:name + ' owner ' + field |  | 10: alert.acknowledged:prior_owner_state_project_id, alert.acknowledged:prior_owner_state_alert_id, alert.acknowledged:prior_owner_state_revision … | 238; exact complement in JSON |
| operation_errors:134:'candidate owner ' + field |  | 5: alert.acknowledged:prior_owner_state_inbox_visible, alert.acknowledged:prior_owner_state_snooze_until, alert.acknowledged:candidate_owner_state_unread … | 243; exact complement in JSON |
| protocol_errors:185:['invalid protocol shape'] |  | 1: alert.acknowledged:missing_protocol_append_navigation | 247; exact complement in JSON |
| protocol_errors:192:'wrong original receipt' |  | 1: alert.acknowledged:protocol_receipt_event_id | 247; exact complement in JSON |
| protocol_errors:194:'idempotency_conflict' |  | 2: alert.acknowledged:retry_retry_payload, alert.acknowledged:retry_retry_command | 246; exact complement in JSON |
| protocol_errors:190:field |  | 8: alert.acknowledged:protocol_admitted, alert.acknowledged:protocol_allowed, alert.acknowledged:protocol_current … | 240; exact complement in JSON |
| checkpoint_errors:266:schema validation |  | 9: alert.acknowledged:checkpoint_partition_only, alert.acknowledged:checkpoint_schema_only, alert.acknowledged:checkpoint_cases/missing_token … | 239; exact complement in JSON |
| checkpoint_errors:270:'checkpoint exceeds 16384 encoded bytes' |  | 2: alert.acknowledged:checkpoint_bytes_only, alert.acknowledged:executed/checkpoint_errors/19 | 246; exact complement in JSON |
| checkpoint_errors:274:'foreign Storage token' |  | 3: alert.acknowledged:checkpoint_token_storage, alert.acknowledged:checkpoint_cases/foreign_storage_token, alert.acknowledged:executed/checkpoint_errors/15 | 245; exact complement in JSON |
| checkpoint_errors:277:'foreign original-event context: ' + field |  | 1: alert.acknowledged:checkpoint_original_storage | 247; exact complement in JSON |
| profile_errors:296:['missing profile'] |  | 1: alert.acknowledged:profile_missing | 247; exact complement in JSON |
| profile_errors:299:['wrong physical binding'] |  | 2: alert.acknowledged:profile_redb_file_derived, alert.acknowledged:profile_storage_group_wrong | 246; exact complement in JSON |
| profile_errors:302:['non-integer maximum'] |  | 2: alert.acknowledged:typed_storage_maximum_boolean, alert.acknowledged:typed_storage_maximum_float | 246; exact complement in JSON |
| profile_errors:304:['missing/oversized maximum'] |  | 2: alert.acknowledged:profile_max_value_bytes_0, alert.acknowledged:profile_max_value_bytes_16385 | 246; exact complement in JSON |
| writer_policy_errors:308:replay-only rejection (duplicates unsupported-policy rejection) | writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: alert.acknowledged:protocol_replay_policy, alert.acknowledged:policy_projector_replay_only, alert.acknowledged:policy_unknown … | 244; exact complement in JSON |
| writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |  | 1: alert.acknowledged:policy_unknown | 247; exact complement in JSON |
| schema_ref_errors:67:ValueError('target is not a schema') |  | 1: alert.acknowledged:ref_non_schema | 247; exact complement in JSON |
| schema_ref_errors:69:'unresolved schema reference: ' + str(ref) |  | 4: alert.acknowledged:ref_dangling, alert.acknowledged:ref_non_schema, alert.acknowledged:ref_external … | 244; exact complement in JSON |
| schema_ref_errors:62:ValueError('unsupported non-local reference') |  | 1: alert.acknowledged:ref_external | 247; exact complement in JSON |
| history_page:374:cursor_errors(after, frontier) |  | 1: alert.acknowledged:pager_cursor | 247; exact complement in JSON |
| history_page:376:len(packed(response([], after))) > 16384 |  | 1: alert.acknowledged:pager_metadata | 247; exact complement in JSON |
| history_page:381:not after < seq <= frontier |  | 2: alert.acknowledged:pager_past, alert.acknowledged:pager_future | 246; exact complement in JSON |
| history_page:383:exact event family and Project filter |  | 2: alert.acknowledged:pager_foreign_family, alert.acknowledged:pager_foreign_project | 246; exact complement in JSON |
| history_page:385:scanned == 256 or len(candidate) > 64 |  | 2: alert.acknowledged:pager_scan, alert.acknowledged:pager_matches | 246; exact complement in JSON |
| history_page:387:len(packed(response(candidate, seq))) > 16384 |  | 2: alert.acknowledged:pager_single_ref, alert.acknowledged:pager_response_bytes | 246; exact complement in JSON |
| history_page:388:not result |  | 1: alert.acknowledged:pager_single_ref | 247; exact complement in JSON |
| check_schema:79:schema metaschema validity |  | 1: alert.acknowledged:schema_metaschema | 247; exact complement in JSON |
| check_schema:80:eager resolution of every schema reference |  | 1: alert.acknowledged:schema_unused_ref | 247; exact complement in JSON |
| exact_value:502:exact JSON value type |  | 1: alert.acknowledged:source_comparison_type | 247; exact complement in JSON |
| exact_value:508:scalar value |  | 90: alert.acknowledged:source_comparison_object_value, alert.acknowledged:source_comparison_array_value, alert.acknowledged:source_comparison_scalar_value … | 158; exact complement in JSON |
| exact_value:505:object keys |  | 1: alert.acknowledged:source_comparison_object_keys | 247; exact complement in JSON |
| exact_value:505:object child values |  | 84: alert.acknowledged:source_comparison_object_value, alert.acknowledged:committed_resolved_event_type, alert.acknowledged:committed_resolved_event_id … | 164; exact complement in JSON |
| exact_value:507:array length |  | 1: alert.acknowledged:source_comparison_array_length | 247; exact complement in JSON |
| exact_value:507:array child values |  | 1: alert.acknowledged:source_comparison_array_value | 247; exact complement in JSON |
| append_result_errors:211:'resolved original append evidence mismatch' |  | 82: alert.acknowledged:committed_resolved_event_type, alert.acknowledged:committed_resolved_event_id, alert.acknowledged:committed_resolved_event_ref … | 166; exact complement in JSON |
| append_result_errors:218:'foreign original append family/scope/identity' |  | 4: alert.acknowledged:append_original_event_id, alert.acknowledged:append_original_storage_instance_id, alert.acknowledged:append_original_project_id … | 244; exact complement in JSON |
| append_result_errors:222:'foreign original append-result reference' |  | 1: alert.acknowledged:foreign_original_append_result_ref | 247; exact complement in JSON |
| append_result_errors:224:'unsettled operation carries append-result reference' |  | 1: alert.acknowledged:committed_foreign_append_reference | 247; exact complement in JSON |
| cursor_errors:238:['invalid unsigned cursor/frontier'] |  | 28: alert.acknowledged:pager_cursor, alert.acknowledged:cursor_after_0, alert.acknowledged:cursor_after_1 … | 220; exact complement in JSON |
| historical_guards:current:checkpoint_publication |  | 2: withdrawn_checkpoint, staged_checkpoint | 56; exact complement in JSON |
| historical_guards:current:checkpoint_original |  | 4: forged_checkpoint_publication, foreign_checkpoint_storage, forged_checkpoint_token … | 54; exact complement in JSON |
| historical_guards:current:event_publication |  | 2: withdrawn_event, staged_event | 56; exact complement in JSON |
| historical_guards:current:event_original |  | 9: forged_event_ref, forged_event_id, foreign_event_storage … | 49; exact complement in JSON |
| historical_guards:current:historical_payload |  | 4: forged_schema_valid_payload, forged_schema_invalid_payload, unknown_historical_version … | 54; exact complement in JSON |
| historical_guards:current:original_receipt |  | 27: forged_receipt_event, foreign_receipt_storage, forged_original_result … | 31; exact complement in JSON |
| historical_guards:current:original_source |  | 3: forged_source_selection, foreign_source_storage, typed_source_generation | 55; exact complement in JSON |
| historical_guards:current:original_admission |  | 1: not_valid_when_written | 57; exact complement in JSON |
| historical_guards:current:current_permission |  | 3: current_permission_denied, current_membership_denied, current_source_access_denied | 55; exact complement in JSON |
| historical_guards:current:source_retained |  | 1: source_deleted | 57; exact complement in JSON |
| historical_guards:current:current_withdrawal |  | 1: current_withdrawal | 57; exact complement in JSON |
| historical_guards:current:history_shape |  | 1: wrong_payload_container | 57; exact complement in JSON |

### alert.acknowledged — named duplicate matrices

| Removed set | Negatives that flip | Other negatives still rejected |
|---|---|---|
| writer_policy_errors:replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: alert.acknowledged:protocol_replay_policy, alert.acknowledged:policy_projector_replay_only, alert.acknowledged:policy_unknown … | 244; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'operation identity digest mismatch' | 8: alert.acknowledged:arbitrary_operation_digest, alert.acknowledged:operation_schema_only, alert.acknowledged:representation_operation_digest_integer … | 240; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'frozen command digest mismatch' | 8: alert.acknowledged:arbitrary_request_digest, alert.acknowledged:operation_schema_only, alert.acknowledged:representation_request_digest_integer … | 240; exact complement in JSON |

### alert.acknowledged — field/input-domain matrix

| Schema or predicate | Field/rule | Named duplicates | Negatives that flip | Other negatives still rejected |
|---|---|---|---:|---:|
| Plans/event_payloads/attention/alert_acknowledged.schema.json | type |  | 10 | 0 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/prior_revision/type |  | 14 | 6 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/prior_revision/minimum |  | 2 | 18 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/prior_revision/maximum |  | 3 | 17 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/result_revision/type |  | 13 | 8 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/result_revision/minimum |  | 3 | 18 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/result_revision/minimum/type | minimum + type | 18 | 3 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/result_revision/maximum |  | 3 | 18 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/prior_acknowledgement_state/enum |  | 12 | 0 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/result_acknowledgement_state/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/handler_target/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/command_id/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/ts/format |  | 28 | 9 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | properties/ts/type |  | 9 | 28 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | $defs/non_empty_id/type |  | 9 | 0 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | $defs/non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | $defs/non_secret_ref/type |  | 9 | 3 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | $defs/reason_code/pattern |  | 1 | 9 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | $defs/reason_code/type |  | 9 | 1 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | $defs/origin/enum |  | 12 | 0 |
| Plans/event_payloads/attention/alert_acknowledged.schema.json | $defs/ref_array/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/operation_digest/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/operation_digest/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/event_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/idempotency_key/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/request_digest/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/prior_revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/prior_revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/prior_revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/result_revision/type |  | 13 | 8 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/result_revision/minimum |  | 3 | 18 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/result_revision/minimum/type | minimum + type | 18 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/result_revision/maximum |  | 3 | 18 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/prior_acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/result_acknowledgement_state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/handler_target/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/command_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/ts/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/payload/properties/ts/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/owner_commit_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/owner_commit_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/result_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/dispatch_receipt_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/dispatch_receipt_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_append_result_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_append_result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/prior_owner_state/properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/candidate_owner_state/properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/properties/prior_revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/properties/prior_revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/properties/prior_revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/properties/prior_acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/properties/handler_target/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/properties/command_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/properties/ts/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | properties/original_command/properties/ts/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | $defs/payload_non_empty_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | $defs/payload_non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | $defs/payload_non_secret_ref/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | $defs/payload_reason_code/pattern |  | 1 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | $defs/payload_reason_code/type |  | 9 | 1 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | $defs/payload_origin/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | $defs/payload_ref_array/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/0/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/0/then/properties/owner_commit_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/0/then/properties/result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/0/then/properties/dispatch_receipt_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/0/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/1/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/1/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/1/then/properties/result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/1/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/1/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/2/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/2/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/2/then/properties/result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/2/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_operation.schema.json | allOf/2/then/properties/original_append_result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/consumer_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/consumer_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/publication_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_key/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/generation_id/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/generation_id/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/index_dataset_name/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_ref/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_ref/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/through_sequence_id/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/through_sequence_id/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/through_sequence_id/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/last_event_id/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json | properties/last_event_id/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/alert_rule_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/root_cause_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/1/type |  | 11 | 0 |
| semantic_numbers | recursive exact input domain |  | 6 | 25 |
| semantic_formats | recursive exact input domain |  | 25 | 6 |
| history_shape | navigation types/presence |  | 46 | 0 |

## alert.dismissed — full source and History matrix

| Guard | Named duplicate | Negatives that flip | Other negatives still rejected |
|---|---|---|---|
| checkpoint schema::additionalProperties |  | 2: alert.dismissed:checkpoint_partition_only, alert.dismissed:checkpoint_schema_only | 246; exact complement in JSON |
| checkpoint schema::properties/index_read_token/additionalProperties |  | 2: alert.dismissed:checkpoint_cases/persisted_snapshot_forbidden, alert.dismissed:checkpoint_cases/otherwise_valid_token_with_snapshot | 246; exact complement in JSON |
| checkpoint schema::required |  | 1: alert.dismissed:checkpoint_cases/missing_token | 247; exact complement in JSON |
| errors:30:schema validation |  | 9: alert.dismissed:payload_extra_secret_field, alert.dismissed:payload_missing_identity, alert.dismissed:payload_wrong_handler … | 239; exact complement in JSON |
| errors:34:'non-successor' |  | 6: alert.dismissed:payload_no_change_revision, alert.dismissed:payload_skipped_revision, alert.dismissed:payload_cases/no_change_revision … | 242; exact complement in JSON |
| errors:36:'uncommitted/stale/refused' |  | 14: alert.dismissed:payload_stale_currentness, alert.dismissed:payload_refused, alert.dismissed:payload_failed_commit … | 234; exact complement in JSON |
| errors:38:'invalid protection proof' |  | 1: alert.dismissed:typed_payload_guard_protected | 247; exact complement in JSON |
| operation_errors:83:schema validation |  | 3: alert.dismissed:operation_schema_only, alert.dismissed:operation_cases/settled_without_original_receipt, alert.dismissed:executed/operation_errors/9 | 245; exact complement in JSON |
| operation_errors:87:'operation exceeds 16384 encoded bytes' |  | 3: alert.dismissed:operation_bytes_only, alert.dismissed:executed/operation_errors/10, alert.dismissed:executed/operation_errors/11 | 245; exact complement in JSON |
| operation_errors:95:'operation identity digest mismatch' |  | 1: alert.dismissed:arbitrary_operation_digest | 247; exact complement in JSON |
| operation_errors:97:'event identity mismatch' |  | 1: alert.dismissed:forged_event_id | 247; exact complement in JSON |
| operation_errors:99:'frozen command digest mismatch' |  | 4: alert.dismissed:arbitrary_request_digest, alert.dismissed:representation_request_digest_uppercase, alert.dismissed:representation_request_digest_spaced … | 244; exact complement in JSON |
| operation_errors:102:'original command/payload field presence' |  | 1: alert.dismissed:optional_payload_without_command | 247; exact complement in JSON |
| operation_errors:110:'non-successor' |  | 1: alert.dismissed:non_successor | 247; exact complement in JSON |
| operation_errors:105:'original command/payload ' + key |  | 8: alert.dismissed:command_join_project_id, alert.dismissed:command_join_alert_id, alert.dismissed:command_join_alert_record_ref … | 240; exact complement in JSON |
| operation_errors:108:'operation/payload ' + key |  | 2: alert.dismissed:scope_join_project_id, alert.dismissed:scope_join_idempotency_key | 246; exact complement in JSON |
| operation_errors:122:name + ' owner ' + field |  | 10: alert.dismissed:prior_owner_state_project_id, alert.dismissed:prior_owner_state_alert_id, alert.dismissed:prior_owner_state_revision … | 238; exact complement in JSON |
| operation_errors:134:'candidate owner ' + field |  | 5: alert.dismissed:prior_owner_state_unread, alert.dismissed:prior_owner_state_snooze_until, alert.dismissed:candidate_owner_state_unread … | 243; exact complement in JSON |
| protocol_errors:185:['invalid protocol shape'] |  | 1: alert.dismissed:missing_protocol_append_navigation | 247; exact complement in JSON |
| protocol_errors:192:'wrong original receipt' |  | 1: alert.dismissed:protocol_receipt_event_id | 247; exact complement in JSON |
| protocol_errors:194:'idempotency_conflict' |  | 2: alert.dismissed:retry_retry_payload, alert.dismissed:retry_retry_command | 246; exact complement in JSON |
| protocol_errors:190:field |  | 8: alert.dismissed:protocol_admitted, alert.dismissed:protocol_allowed, alert.dismissed:protocol_current … | 240; exact complement in JSON |
| checkpoint_errors:266:schema validation |  | 9: alert.dismissed:checkpoint_partition_only, alert.dismissed:checkpoint_schema_only, alert.dismissed:checkpoint_cases/missing_token … | 239; exact complement in JSON |
| checkpoint_errors:270:'checkpoint exceeds 16384 encoded bytes' |  | 2: alert.dismissed:checkpoint_bytes_only, alert.dismissed:executed/checkpoint_errors/19 | 246; exact complement in JSON |
| checkpoint_errors:274:'foreign Storage token' |  | 3: alert.dismissed:checkpoint_token_storage, alert.dismissed:checkpoint_cases/foreign_storage_token, alert.dismissed:executed/checkpoint_errors/15 | 245; exact complement in JSON |
| checkpoint_errors:277:'foreign original-event context: ' + field |  | 1: alert.dismissed:checkpoint_original_storage | 247; exact complement in JSON |
| profile_errors:296:['missing profile'] |  | 1: alert.dismissed:profile_missing | 247; exact complement in JSON |
| profile_errors:299:['wrong physical binding'] |  | 2: alert.dismissed:profile_redb_file_derived, alert.dismissed:profile_storage_group_wrong | 246; exact complement in JSON |
| profile_errors:302:['non-integer maximum'] |  | 2: alert.dismissed:typed_storage_maximum_boolean, alert.dismissed:typed_storage_maximum_float | 246; exact complement in JSON |
| profile_errors:304:['missing/oversized maximum'] |  | 2: alert.dismissed:profile_max_value_bytes_0, alert.dismissed:profile_max_value_bytes_16385 | 246; exact complement in JSON |
| writer_policy_errors:308:replay-only rejection (duplicates unsupported-policy rejection) | writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: alert.dismissed:protocol_replay_policy, alert.dismissed:policy_projector_replay_only, alert.dismissed:policy_unknown … | 244; exact complement in JSON |
| writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |  | 1: alert.dismissed:policy_unknown | 247; exact complement in JSON |
| schema_ref_errors:67:ValueError('target is not a schema') |  | 1: alert.dismissed:ref_non_schema | 247; exact complement in JSON |
| schema_ref_errors:69:'unresolved schema reference: ' + str(ref) |  | 4: alert.dismissed:ref_dangling, alert.dismissed:ref_non_schema, alert.dismissed:ref_external … | 244; exact complement in JSON |
| schema_ref_errors:62:ValueError('unsupported non-local reference') |  | 1: alert.dismissed:ref_external | 247; exact complement in JSON |
| history_page:374:cursor_errors(after, frontier) |  | 1: alert.dismissed:pager_cursor | 247; exact complement in JSON |
| history_page:376:len(packed(response([], after))) > 16384 |  | 1: alert.dismissed:pager_metadata | 247; exact complement in JSON |
| history_page:381:not after < seq <= frontier |  | 2: alert.dismissed:pager_past, alert.dismissed:pager_future | 246; exact complement in JSON |
| history_page:383:exact event family and Project filter |  | 2: alert.dismissed:pager_foreign_family, alert.dismissed:pager_foreign_project | 246; exact complement in JSON |
| history_page:385:scanned == 256 or len(candidate) > 64 |  | 2: alert.dismissed:pager_scan, alert.dismissed:pager_matches | 246; exact complement in JSON |
| history_page:387:len(packed(response(candidate, seq))) > 16384 |  | 2: alert.dismissed:pager_single_ref, alert.dismissed:pager_response_bytes | 246; exact complement in JSON |
| history_page:388:not result |  | 1: alert.dismissed:pager_single_ref | 247; exact complement in JSON |
| check_schema:79:schema metaschema validity |  | 1: alert.dismissed:schema_metaschema | 247; exact complement in JSON |
| check_schema:80:eager resolution of every schema reference |  | 1: alert.dismissed:schema_unused_ref | 247; exact complement in JSON |
| exact_value:502:exact JSON value type |  | 1: alert.dismissed:source_comparison_type | 247; exact complement in JSON |
| exact_value:508:scalar value |  | 90: alert.dismissed:source_comparison_object_value, alert.dismissed:source_comparison_array_value, alert.dismissed:source_comparison_scalar_value … | 158; exact complement in JSON |
| exact_value:505:object keys |  | 1: alert.dismissed:source_comparison_object_keys | 247; exact complement in JSON |
| exact_value:505:object child values |  | 84: alert.dismissed:source_comparison_object_value, alert.dismissed:committed_resolved_event_type, alert.dismissed:committed_resolved_event_id … | 164; exact complement in JSON |
| exact_value:507:array length |  | 1: alert.dismissed:source_comparison_array_length | 247; exact complement in JSON |
| exact_value:507:array child values |  | 1: alert.dismissed:source_comparison_array_value | 247; exact complement in JSON |
| append_result_errors:211:'resolved original append evidence mismatch' |  | 82: alert.dismissed:committed_resolved_event_type, alert.dismissed:committed_resolved_event_id, alert.dismissed:committed_resolved_event_ref … | 166; exact complement in JSON |
| append_result_errors:218:'foreign original append family/scope/identity' |  | 4: alert.dismissed:append_original_event_id, alert.dismissed:append_original_storage_instance_id, alert.dismissed:append_original_project_id … | 244; exact complement in JSON |
| append_result_errors:222:'foreign original append-result reference' |  | 1: alert.dismissed:foreign_original_append_result_ref | 247; exact complement in JSON |
| append_result_errors:224:'unsettled operation carries append-result reference' |  | 1: alert.dismissed:committed_foreign_append_reference | 247; exact complement in JSON |
| cursor_errors:238:['invalid unsigned cursor/frontier'] |  | 28: alert.dismissed:pager_cursor, alert.dismissed:cursor_after_0, alert.dismissed:cursor_after_1 … | 220; exact complement in JSON |
| historical_guards:current:checkpoint_publication |  | 2: withdrawn_checkpoint, staged_checkpoint | 56; exact complement in JSON |
| historical_guards:current:checkpoint_original |  | 4: forged_checkpoint_publication, foreign_checkpoint_storage, forged_checkpoint_token … | 54; exact complement in JSON |
| historical_guards:current:event_publication |  | 2: withdrawn_event, staged_event | 56; exact complement in JSON |
| historical_guards:current:event_original |  | 9: forged_event_ref, forged_event_id, foreign_event_storage … | 49; exact complement in JSON |
| historical_guards:current:historical_payload |  | 4: forged_schema_valid_payload, forged_schema_invalid_payload, unknown_historical_version … | 54; exact complement in JSON |
| historical_guards:current:original_receipt |  | 27: forged_receipt_event, foreign_receipt_storage, forged_original_result … | 31; exact complement in JSON |
| historical_guards:current:original_source |  | 3: forged_source_selection, foreign_source_storage, typed_source_generation | 55; exact complement in JSON |
| historical_guards:current:original_admission |  | 1: not_valid_when_written | 57; exact complement in JSON |
| historical_guards:current:current_permission |  | 3: current_permission_denied, current_membership_denied, current_source_access_denied | 55; exact complement in JSON |
| historical_guards:current:source_retained |  | 1: source_deleted | 57; exact complement in JSON |
| historical_guards:current:current_withdrawal |  | 1: current_withdrawal | 57; exact complement in JSON |
| historical_guards:current:history_shape |  | 1: wrong_payload_container | 57; exact complement in JSON |

### alert.dismissed — named duplicate matrices

| Removed set | Negatives that flip | Other negatives still rejected |
|---|---|---|
| writer_policy_errors:replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: alert.dismissed:protocol_replay_policy, alert.dismissed:policy_projector_replay_only, alert.dismissed:policy_unknown … | 244; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'operation identity digest mismatch' | 8: alert.dismissed:arbitrary_operation_digest, alert.dismissed:operation_schema_only, alert.dismissed:representation_operation_digest_integer … | 240; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'frozen command digest mismatch' | 8: alert.dismissed:arbitrary_request_digest, alert.dismissed:operation_schema_only, alert.dismissed:representation_request_digest_integer … | 240; exact complement in JSON |

### alert.dismissed — field/input-domain matrix

| Schema or predicate | Field/rule | Named duplicates | Negatives that flip | Other negatives still rejected |
|---|---|---|---:|---:|
| Plans/event_payloads/attention/alert_dismissed.schema.json | type |  | 10 | 0 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/prior_revision/type |  | 14 | 6 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/prior_revision/minimum |  | 2 | 18 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/prior_revision/maximum |  | 3 | 17 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/result_revision/type |  | 13 | 8 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/result_revision/minimum |  | 3 | 18 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/result_revision/minimum/type | minimum + type | 18 | 3 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/result_revision/maximum |  | 3 | 18 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/prior_alert_state/enum |  | 12 | 0 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/result_alert_state/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/handler_target/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/command_id/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/ts/format |  | 28 | 9 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | properties/ts/type |  | 9 | 28 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | $defs/non_empty_id/type |  | 9 | 0 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | $defs/non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | $defs/non_secret_ref/type |  | 9 | 3 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | $defs/reason_code/pattern |  | 1 | 9 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | $defs/reason_code/type |  | 9 | 1 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | $defs/origin/enum |  | 12 | 0 |
| Plans/event_payloads/attention/alert_dismissed.schema.json | $defs/ref_array/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/operation_digest/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/operation_digest/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/event_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/idempotency_key/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/request_digest/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/prior_revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/prior_revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/prior_revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/result_revision/type |  | 13 | 8 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/result_revision/minimum |  | 3 | 18 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/result_revision/minimum/type | minimum + type | 18 | 3 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/result_revision/maximum |  | 3 | 18 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/prior_alert_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/result_alert_state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/handler_target/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/command_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/ts/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/payload/properties/ts/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/owner_commit_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/owner_commit_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/result_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/dispatch_receipt_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/dispatch_receipt_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_append_result_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_append_result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/prior_owner_state/properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/candidate_owner_state/properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/properties/prior_revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/properties/prior_revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/properties/prior_revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/properties/prior_alert_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/properties/handler_target/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/properties/command_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/properties/ts/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | properties/original_command/properties/ts/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | $defs/payload_non_empty_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | $defs/payload_non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | $defs/payload_non_secret_ref/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | $defs/payload_reason_code/pattern |  | 1 | 9 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | $defs/payload_reason_code/type |  | 9 | 1 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | $defs/payload_origin/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | $defs/payload_ref_array/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/0/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/0/then/properties/owner_commit_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/0/then/properties/result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/0/then/properties/dispatch_receipt_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/0/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/1/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/1/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/1/then/properties/result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/1/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/1/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/2/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/2/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/2/then/properties/result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/2/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_operation.schema.json | allOf/2/then/properties/original_append_result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/consumer_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/consumer_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/publication_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_key/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/generation_id/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/generation_id/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/index_dataset_name/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_ref/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_ref/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/through_sequence_id/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/through_sequence_id/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/through_sequence_id/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/last_event_id/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json | properties/last_event_id/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/alert_rule_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/root_cause_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/1/type |  | 11 | 0 |
| semantic_numbers | recursive exact input domain |  | 6 | 25 |
| semantic_formats | recursive exact input domain |  | 25 | 6 |
| history_shape | navigation types/presence |  | 46 | 0 |

## alert.rule_muted — full source and History matrix

| Guard | Named duplicate | Negatives that flip | Other negatives still rejected |
|---|---|---|---|
| checkpoint schema::additionalProperties |  | 2: alert.rule_muted:checkpoint_partition_only, alert.rule_muted:checkpoint_schema_only | 247; exact complement in JSON |
| checkpoint schema::properties/index_read_token/additionalProperties |  | 2: alert.rule_muted:checkpoint_cases/persisted_snapshot_forbidden, alert.rule_muted:checkpoint_cases/otherwise_valid_token_with_snapshot | 247; exact complement in JSON |
| checkpoint schema::required |  | 1: alert.rule_muted:checkpoint_cases/missing_token | 248; exact complement in JSON |
| errors:30:schema validation |  | 9: alert.rule_muted:payload_extra_secret_field, alert.rule_muted:payload_missing_identity, alert.rule_muted:payload_wrong_handler … | 240; exact complement in JSON |
| errors:34:'non-successor' |  | 6: alert.rule_muted:payload_no_change_revision, alert.rule_muted:payload_skipped_revision, alert.rule_muted:payload_cases/no_change_revision … | 243; exact complement in JSON |
| errors:36:'uncommitted/stale/refused' |  | 14: alert.rule_muted:payload_stale_currentness, alert.rule_muted:payload_refused, alert.rule_muted:payload_failed_commit … | 235; exact complement in JSON |
| errors:38:'invalid protection proof' |  | 1: alert.rule_muted:typed_payload_guard_protected | 248; exact complement in JSON |
| errors:42:'protected interruption' |  | 3: alert.rule_muted:payload_protected_interruption, alert.rule_muted:payload_cases/protected_interruption, alert.rule_muted:executed/errors/9 | 246; exact complement in JSON |
| operation_errors:83:schema validation |  | 3: alert.rule_muted:operation_schema_only, alert.rule_muted:operation_cases/settled_without_original_receipt, alert.rule_muted:executed/operation_errors/10 | 246; exact complement in JSON |
| operation_errors:87:'operation exceeds 16384 encoded bytes' |  | 3: alert.rule_muted:operation_bytes_only, alert.rule_muted:executed/operation_errors/11, alert.rule_muted:executed/operation_errors/12 | 246; exact complement in JSON |
| operation_errors:95:'operation identity digest mismatch' |  | 1: alert.rule_muted:arbitrary_operation_digest | 248; exact complement in JSON |
| operation_errors:97:'event identity mismatch' |  | 1: alert.rule_muted:forged_event_id | 248; exact complement in JSON |
| operation_errors:99:'frozen command digest mismatch' |  | 4: alert.rule_muted:arbitrary_request_digest, alert.rule_muted:representation_request_digest_uppercase, alert.rule_muted:representation_request_digest_spaced … | 245; exact complement in JSON |
| operation_errors:102:'original command/payload field presence' |  | 1: alert.rule_muted:optional_payload_without_command | 248; exact complement in JSON |
| operation_errors:110:'non-successor' |  | 1: alert.rule_muted:non_successor | 248; exact complement in JSON |
| operation_errors:105:'original command/payload ' + key |  | 8: alert.rule_muted:command_join_project_id, alert.rule_muted:command_join_alert_rule_id, alert.rule_muted:command_join_alert_rule_ref … | 241; exact complement in JSON |
| operation_errors:108:'operation/payload ' + key |  | 2: alert.rule_muted:scope_join_project_id, alert.rule_muted:scope_join_idempotency_key | 247; exact complement in JSON |
| operation_errors:125:'candidate owner root_cause_ref' |  | 2: alert.rule_muted:prior_owner_state_root_cause_ref, alert.rule_muted:candidate_owner_state_root_cause_ref | 247; exact complement in JSON |
| operation_errors:127:'candidate owner mute_expires_at' |  | 1: alert.rule_muted:candidate_owner_state_mute_expires_at | 248; exact complement in JSON |
| operation_errors:122:name + ' owner ' + field |  | 10: alert.rule_muted:prior_owner_state_project_id, alert.rule_muted:prior_owner_state_alert_rule_id, alert.rule_muted:prior_owner_state_revision … | 239; exact complement in JSON |
| protocol_errors:185:['invalid protocol shape'] |  | 1: alert.rule_muted:missing_protocol_append_navigation | 248; exact complement in JSON |
| protocol_errors:192:'wrong original receipt' |  | 1: alert.rule_muted:protocol_receipt_event_id | 248; exact complement in JSON |
| protocol_errors:194:'idempotency_conflict' |  | 2: alert.rule_muted:retry_retry_payload, alert.rule_muted:retry_retry_command | 247; exact complement in JSON |
| protocol_errors:190:field |  | 8: alert.rule_muted:protocol_admitted, alert.rule_muted:protocol_allowed, alert.rule_muted:protocol_current … | 241; exact complement in JSON |
| checkpoint_errors:266:schema validation |  | 9: alert.rule_muted:checkpoint_partition_only, alert.rule_muted:checkpoint_schema_only, alert.rule_muted:checkpoint_cases/missing_token … | 240; exact complement in JSON |
| checkpoint_errors:270:'checkpoint exceeds 16384 encoded bytes' |  | 2: alert.rule_muted:checkpoint_bytes_only, alert.rule_muted:executed/checkpoint_errors/20 | 247; exact complement in JSON |
| checkpoint_errors:274:'foreign Storage token' |  | 3: alert.rule_muted:checkpoint_token_storage, alert.rule_muted:checkpoint_cases/foreign_storage_token, alert.rule_muted:executed/checkpoint_errors/16 | 246; exact complement in JSON |
| checkpoint_errors:277:'foreign original-event context: ' + field |  | 1: alert.rule_muted:checkpoint_original_storage | 248; exact complement in JSON |
| profile_errors:296:['missing profile'] |  | 1: alert.rule_muted:profile_missing | 248; exact complement in JSON |
| profile_errors:299:['wrong physical binding'] |  | 2: alert.rule_muted:profile_redb_file_derived, alert.rule_muted:profile_storage_group_wrong | 247; exact complement in JSON |
| profile_errors:302:['non-integer maximum'] |  | 2: alert.rule_muted:typed_storage_maximum_boolean, alert.rule_muted:typed_storage_maximum_float | 247; exact complement in JSON |
| profile_errors:304:['missing/oversized maximum'] |  | 2: alert.rule_muted:profile_max_value_bytes_0, alert.rule_muted:profile_max_value_bytes_16385 | 247; exact complement in JSON |
| writer_policy_errors:308:replay-only rejection (duplicates unsupported-policy rejection) | writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: alert.rule_muted:protocol_replay_policy, alert.rule_muted:policy_projector_replay_only, alert.rule_muted:policy_unknown … | 245; exact complement in JSON |
| writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |  | 1: alert.rule_muted:policy_unknown | 248; exact complement in JSON |
| schema_ref_errors:67:ValueError('target is not a schema') |  | 1: alert.rule_muted:ref_non_schema | 248; exact complement in JSON |
| schema_ref_errors:69:'unresolved schema reference: ' + str(ref) |  | 4: alert.rule_muted:ref_dangling, alert.rule_muted:ref_non_schema, alert.rule_muted:ref_external … | 245; exact complement in JSON |
| schema_ref_errors:62:ValueError('unsupported non-local reference') |  | 1: alert.rule_muted:ref_external | 248; exact complement in JSON |
| history_page:374:cursor_errors(after, frontier) |  | 1: alert.rule_muted:pager_cursor | 248; exact complement in JSON |
| history_page:376:len(packed(response([], after))) > 16384 |  | 1: alert.rule_muted:pager_metadata | 248; exact complement in JSON |
| history_page:381:not after < seq <= frontier |  | 2: alert.rule_muted:pager_past, alert.rule_muted:pager_future | 247; exact complement in JSON |
| history_page:383:exact event family and Project filter |  | 2: alert.rule_muted:pager_foreign_family, alert.rule_muted:pager_foreign_project | 247; exact complement in JSON |
| history_page:385:scanned == 256 or len(candidate) > 64 |  | 2: alert.rule_muted:pager_scan, alert.rule_muted:pager_matches | 247; exact complement in JSON |
| history_page:387:len(packed(response(candidate, seq))) > 16384 |  | 2: alert.rule_muted:pager_single_ref, alert.rule_muted:pager_response_bytes | 247; exact complement in JSON |
| history_page:388:not result |  | 1: alert.rule_muted:pager_single_ref | 248; exact complement in JSON |
| check_schema:79:schema metaschema validity |  | 1: alert.rule_muted:schema_metaschema | 248; exact complement in JSON |
| check_schema:80:eager resolution of every schema reference |  | 1: alert.rule_muted:schema_unused_ref | 248; exact complement in JSON |
| exact_value:502:exact JSON value type |  | 1: alert.rule_muted:source_comparison_type | 248; exact complement in JSON |
| exact_value:508:scalar value |  | 90: alert.rule_muted:source_comparison_object_value, alert.rule_muted:source_comparison_array_value, alert.rule_muted:source_comparison_scalar_value … | 159; exact complement in JSON |
| exact_value:505:object keys |  | 1: alert.rule_muted:source_comparison_object_keys | 248; exact complement in JSON |
| exact_value:505:object child values |  | 84: alert.rule_muted:source_comparison_object_value, alert.rule_muted:committed_resolved_event_type, alert.rule_muted:committed_resolved_event_id … | 165; exact complement in JSON |
| exact_value:507:array length |  | 1: alert.rule_muted:source_comparison_array_length | 248; exact complement in JSON |
| exact_value:507:array child values |  | 1: alert.rule_muted:source_comparison_array_value | 248; exact complement in JSON |
| append_result_errors:211:'resolved original append evidence mismatch' |  | 82: alert.rule_muted:committed_resolved_event_type, alert.rule_muted:committed_resolved_event_id, alert.rule_muted:committed_resolved_event_ref … | 167; exact complement in JSON |
| append_result_errors:218:'foreign original append family/scope/identity' |  | 4: alert.rule_muted:append_original_event_id, alert.rule_muted:append_original_storage_instance_id, alert.rule_muted:append_original_project_id … | 245; exact complement in JSON |
| append_result_errors:222:'foreign original append-result reference' |  | 1: alert.rule_muted:foreign_original_append_result_ref | 248; exact complement in JSON |
| append_result_errors:224:'unsettled operation carries append-result reference' |  | 1: alert.rule_muted:committed_foreign_append_reference | 248; exact complement in JSON |
| cursor_errors:238:['invalid unsigned cursor/frontier'] |  | 28: alert.rule_muted:pager_cursor, alert.rule_muted:cursor_after_0, alert.rule_muted:cursor_after_1 … | 221; exact complement in JSON |
| historical_guards:current:checkpoint_publication |  | 2: withdrawn_checkpoint, staged_checkpoint | 56; exact complement in JSON |
| historical_guards:current:checkpoint_original |  | 4: forged_checkpoint_publication, foreign_checkpoint_storage, forged_checkpoint_token … | 54; exact complement in JSON |
| historical_guards:current:event_publication |  | 2: withdrawn_event, staged_event | 56; exact complement in JSON |
| historical_guards:current:event_original |  | 9: forged_event_ref, forged_event_id, foreign_event_storage … | 49; exact complement in JSON |
| historical_guards:current:historical_payload |  | 4: forged_schema_valid_payload, forged_schema_invalid_payload, unknown_historical_version … | 54; exact complement in JSON |
| historical_guards:current:original_receipt |  | 27: forged_receipt_event, foreign_receipt_storage, forged_original_result … | 31; exact complement in JSON |
| historical_guards:current:original_source |  | 3: forged_source_selection, foreign_source_storage, typed_source_generation | 55; exact complement in JSON |
| historical_guards:current:original_admission |  | 1: not_valid_when_written | 57; exact complement in JSON |
| historical_guards:current:current_permission |  | 3: current_permission_denied, current_membership_denied, current_source_access_denied | 55; exact complement in JSON |
| historical_guards:current:source_retained |  | 1: source_deleted | 57; exact complement in JSON |
| historical_guards:current:current_withdrawal |  | 1: current_withdrawal | 57; exact complement in JSON |
| historical_guards:current:history_shape |  | 1: wrong_payload_container | 57; exact complement in JSON |

### alert.rule_muted — named duplicate matrices

| Removed set | Negatives that flip | Other negatives still rejected |
|---|---|---|
| writer_policy_errors:replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: alert.rule_muted:protocol_replay_policy, alert.rule_muted:policy_projector_replay_only, alert.rule_muted:policy_unknown … | 245; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'operation identity digest mismatch' | 8: alert.rule_muted:arbitrary_operation_digest, alert.rule_muted:operation_schema_only, alert.rule_muted:representation_operation_digest_integer … | 241; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'frozen command digest mismatch' | 8: alert.rule_muted:arbitrary_request_digest, alert.rule_muted:operation_schema_only, alert.rule_muted:representation_request_digest_integer … | 241; exact complement in JSON |

### alert.rule_muted — field/input-domain matrix

| Schema or predicate | Field/rule | Named duplicates | Negatives that flip | Other negatives still rejected |
|---|---|---|---:|---:|
| Plans/event_payloads/attention/alert_rule_muted.schema.json | type |  | 10 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/prior_revision/type |  | 14 | 6 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/prior_revision/minimum |  | 2 | 18 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/prior_revision/maximum |  | 3 | 17 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/result_revision/type |  | 13 | 8 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/result_revision/minimum |  | 3 | 18 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/result_revision/minimum/type | minimum + type | 18 | 3 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/result_revision/maximum |  | 3 | 18 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/prior_mute_state/enum |  | 12 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/result_mute_state/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/mute_scope/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/mute_expires_at/format |  | 28 | 9 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/mute_expires_at/type |  | 9 | 28 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/handler_target/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/command_id/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/ts/format |  | 28 | 9 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | properties/ts/type |  | 9 | 28 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | $defs/non_empty_id/type |  | 9 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | $defs/non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | $defs/non_secret_ref/type |  | 9 | 3 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | $defs/reason_code/pattern |  | 1 | 9 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | $defs/reason_code/type |  | 9 | 1 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | $defs/origin/enum |  | 12 | 0 |
| Plans/event_payloads/attention/alert_rule_muted.schema.json | $defs/ref_array/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/operation_digest/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/operation_digest/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/event_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/idempotency_key/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/request_digest/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/prior_revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/prior_revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/prior_revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/result_revision/type |  | 13 | 8 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/result_revision/minimum |  | 3 | 18 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/result_revision/minimum/type | minimum + type | 18 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/result_revision/maximum |  | 3 | 18 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/prior_mute_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/result_mute_state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/mute_scope/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/mute_expires_at/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/mute_expires_at/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/handler_target/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/command_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/ts/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/payload/properties/ts/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/owner_commit_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/owner_commit_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/result_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/dispatch_receipt_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/dispatch_receipt_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_append_result_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_append_result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/alert_rule_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/root_cause_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/mute_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/mute_expires_at/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/mute_expires_at/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/prior_owner_state/properties/mute_expires_at/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/alert_rule_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/root_cause_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/mute_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/mute_expires_at/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/mute_expires_at/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/candidate_owner_state/properties/mute_expires_at/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/prior_revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/prior_revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/prior_revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/prior_mute_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/mute_scope/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/mute_expires_at/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/mute_expires_at/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/handler_target/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/command_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/ts/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | properties/original_command/properties/ts/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | $defs/payload_non_empty_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | $defs/payload_non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | $defs/payload_non_secret_ref/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | $defs/payload_reason_code/pattern |  | 1 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | $defs/payload_reason_code/type |  | 9 | 1 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | $defs/payload_origin/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | $defs/payload_ref_array/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/0/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/0/then/properties/owner_commit_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/0/then/properties/result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/0/then/properties/dispatch_receipt_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/0/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/1/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/1/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/1/then/properties/result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/1/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/1/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/2/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/2/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/2/then/properties/result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/2/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_operation.schema.json | allOf/2/then/properties/original_append_result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/consumer_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/consumer_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/publication_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_key/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/generation_id/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/generation_id/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/index_dataset_name/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_ref/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_ref/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/through_sequence_id/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/through_sequence_id/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/through_sequence_id/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/last_event_id/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json | properties/last_event_id/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/alert_rule_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/root_cause_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/1/type |  | 11 | 0 |
| semantic_numbers | recursive exact input domain |  | 6 | 25 |
| semantic_formats | recursive exact input domain |  | 25 | 6 |
| history_shape | navigation types/presence |  | 46 | 0 |

## alert.snoozed — full source and History matrix

| Guard | Named duplicate | Negatives that flip | Other negatives still rejected |
|---|---|---|---|
| checkpoint schema::additionalProperties |  | 2: alert.snoozed:checkpoint_partition_only, alert.snoozed:checkpoint_schema_only | 260; exact complement in JSON |
| checkpoint schema::properties/index_read_token/additionalProperties |  | 2: alert.snoozed:checkpoint_cases/persisted_snapshot_forbidden, alert.snoozed:checkpoint_cases/otherwise_valid_token_with_snapshot | 260; exact complement in JSON |
| checkpoint schema::required |  | 1: alert.snoozed:checkpoint_cases/missing_token | 261; exact complement in JSON |
| errors:30:schema validation |  | 9: alert.snoozed:payload_extra_secret_field, alert.snoozed:payload_missing_identity, alert.snoozed:payload_wrong_handler … | 253; exact complement in JSON |
| errors:34:'non-successor' |  | 6: alert.snoozed:payload_no_change_revision, alert.snoozed:payload_skipped_revision, alert.snoozed:payload_cases/no_change_revision … | 256; exact complement in JSON |
| errors:36:'uncommitted/stale/refused' |  | 14: alert.snoozed:payload_stale_currentness, alert.snoozed:payload_refused, alert.snoozed:payload_failed_commit … | 248; exact complement in JSON |
| errors:38:'invalid protection proof' |  | 1: alert.snoozed:typed_payload_guard_protected | 261; exact complement in JSON |
| errors:40:'expired snooze' |  | 9: alert.snoozed:payload_expired_snooze, alert.snoozed:payload_offset_past, alert.snoozed:payload_offset_same_instant … | 253; exact complement in JSON |
| errors:42:'protected interruption' |  | 3: alert.snoozed:payload_protected_interruption, alert.snoozed:payload_cases/protected_interruption, alert.snoozed:executed/errors/9 | 259; exact complement in JSON |
| operation_errors:83:schema validation |  | 3: alert.snoozed:operation_schema_only, alert.snoozed:operation_cases/settled_without_original_receipt, alert.snoozed:executed/operation_errors/13 | 259; exact complement in JSON |
| operation_errors:87:'operation exceeds 16384 encoded bytes' |  | 3: alert.snoozed:operation_bytes_only, alert.snoozed:executed/operation_errors/14, alert.snoozed:executed/operation_errors/15 | 259; exact complement in JSON |
| operation_errors:95:'operation identity digest mismatch' |  | 1: alert.snoozed:arbitrary_operation_digest | 261; exact complement in JSON |
| operation_errors:97:'event identity mismatch' |  | 1: alert.snoozed:forged_event_id | 261; exact complement in JSON |
| operation_errors:99:'frozen command digest mismatch' |  | 4: alert.snoozed:arbitrary_request_digest, alert.snoozed:representation_request_digest_uppercase, alert.snoozed:representation_request_digest_spaced … | 258; exact complement in JSON |
| operation_errors:102:'original command/payload field presence' |  | 1: alert.snoozed:optional_payload_without_command | 261; exact complement in JSON |
| operation_errors:110:'non-successor' |  | 1: alert.snoozed:non_successor | 261; exact complement in JSON |
| operation_errors:136:'expired snooze' |  | 3: alert.snoozed:expired_original_deadline, alert.snoozed:operation_offset_past, alert.snoozed:operation_offset_same_instant | 259; exact complement in JSON |
| operation_errors:105:'original command/payload ' + key |  | 8: alert.snoozed:command_join_project_id, alert.snoozed:command_join_alert_id, alert.snoozed:command_join_alert_record_ref … | 254; exact complement in JSON |
| operation_errors:108:'operation/payload ' + key |  | 2: alert.snoozed:scope_join_project_id, alert.snoozed:scope_join_idempotency_key | 260; exact complement in JSON |
| operation_errors:122:name + ' owner ' + field |  | 10: alert.snoozed:prior_owner_state_project_id, alert.snoozed:prior_owner_state_alert_id, alert.snoozed:prior_owner_state_revision … | 252; exact complement in JSON |
| operation_errors:134:'candidate owner ' + field |  | 4: alert.snoozed:prior_owner_state_unread, alert.snoozed:candidate_owner_state_unread, alert.snoozed:candidate_owner_state_inbox_visible … | 258; exact complement in JSON |
| protocol_errors:185:['invalid protocol shape'] |  | 1: alert.snoozed:missing_protocol_append_navigation | 261; exact complement in JSON |
| protocol_errors:192:'wrong original receipt' |  | 1: alert.snoozed:protocol_receipt_event_id | 261; exact complement in JSON |
| protocol_errors:194:'idempotency_conflict' |  | 2: alert.snoozed:retry_retry_payload, alert.snoozed:retry_retry_command | 260; exact complement in JSON |
| protocol_errors:190:field |  | 8: alert.snoozed:protocol_admitted, alert.snoozed:protocol_allowed, alert.snoozed:protocol_current … | 254; exact complement in JSON |
| checkpoint_errors:266:schema validation |  | 9: alert.snoozed:checkpoint_partition_only, alert.snoozed:checkpoint_schema_only, alert.snoozed:checkpoint_cases/missing_token … | 253; exact complement in JSON |
| checkpoint_errors:270:'checkpoint exceeds 16384 encoded bytes' |  | 2: alert.snoozed:checkpoint_bytes_only, alert.snoozed:executed/checkpoint_errors/23 | 260; exact complement in JSON |
| checkpoint_errors:274:'foreign Storage token' |  | 3: alert.snoozed:checkpoint_token_storage, alert.snoozed:checkpoint_cases/foreign_storage_token, alert.snoozed:executed/checkpoint_errors/19 | 259; exact complement in JSON |
| checkpoint_errors:277:'foreign original-event context: ' + field |  | 1: alert.snoozed:checkpoint_original_storage | 261; exact complement in JSON |
| profile_errors:296:['missing profile'] |  | 1: alert.snoozed:profile_missing | 261; exact complement in JSON |
| profile_errors:299:['wrong physical binding'] |  | 2: alert.snoozed:profile_redb_file_derived, alert.snoozed:profile_storage_group_wrong | 260; exact complement in JSON |
| profile_errors:302:['non-integer maximum'] |  | 2: alert.snoozed:typed_storage_maximum_boolean, alert.snoozed:typed_storage_maximum_float | 260; exact complement in JSON |
| profile_errors:304:['missing/oversized maximum'] |  | 2: alert.snoozed:profile_max_value_bytes_0, alert.snoozed:profile_max_value_bytes_16385 | 260; exact complement in JSON |
| writer_policy_errors:308:replay-only rejection (duplicates unsupported-policy rejection) | writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: alert.snoozed:protocol_replay_policy, alert.snoozed:policy_projector_replay_only, alert.snoozed:policy_unknown … | 258; exact complement in JSON |
| writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |  | 1: alert.snoozed:policy_unknown | 261; exact complement in JSON |
| schema_ref_errors:67:ValueError('target is not a schema') |  | 1: alert.snoozed:ref_non_schema | 261; exact complement in JSON |
| schema_ref_errors:69:'unresolved schema reference: ' + str(ref) |  | 4: alert.snoozed:ref_dangling, alert.snoozed:ref_non_schema, alert.snoozed:ref_external … | 258; exact complement in JSON |
| schema_ref_errors:62:ValueError('unsupported non-local reference') |  | 1: alert.snoozed:ref_external | 261; exact complement in JSON |
| history_page:374:cursor_errors(after, frontier) |  | 1: alert.snoozed:pager_cursor | 261; exact complement in JSON |
| history_page:376:len(packed(response([], after))) > 16384 |  | 1: alert.snoozed:pager_metadata | 261; exact complement in JSON |
| history_page:381:not after < seq <= frontier |  | 2: alert.snoozed:pager_past, alert.snoozed:pager_future | 260; exact complement in JSON |
| history_page:383:exact event family and Project filter |  | 2: alert.snoozed:pager_foreign_family, alert.snoozed:pager_foreign_project | 260; exact complement in JSON |
| history_page:385:scanned == 256 or len(candidate) > 64 |  | 2: alert.snoozed:pager_scan, alert.snoozed:pager_matches | 260; exact complement in JSON |
| history_page:387:len(packed(response(candidate, seq))) > 16384 |  | 2: alert.snoozed:pager_single_ref, alert.snoozed:pager_response_bytes | 260; exact complement in JSON |
| history_page:388:not result |  | 1: alert.snoozed:pager_single_ref | 261; exact complement in JSON |
| check_schema:79:schema metaschema validity |  | 1: alert.snoozed:schema_metaschema | 261; exact complement in JSON |
| check_schema:80:eager resolution of every schema reference |  | 1: alert.snoozed:schema_unused_ref | 261; exact complement in JSON |
| exact_value:502:exact JSON value type |  | 1: alert.snoozed:source_comparison_type | 261; exact complement in JSON |
| exact_value:508:scalar value |  | 90: alert.snoozed:source_comparison_object_value, alert.snoozed:source_comparison_array_value, alert.snoozed:source_comparison_scalar_value … | 172; exact complement in JSON |
| exact_value:505:object keys |  | 1: alert.snoozed:source_comparison_object_keys | 261; exact complement in JSON |
| exact_value:505:object child values |  | 84: alert.snoozed:source_comparison_object_value, alert.snoozed:committed_resolved_event_type, alert.snoozed:committed_resolved_event_id … | 178; exact complement in JSON |
| exact_value:507:array length |  | 1: alert.snoozed:source_comparison_array_length | 261; exact complement in JSON |
| exact_value:507:array child values |  | 1: alert.snoozed:source_comparison_array_value | 261; exact complement in JSON |
| append_result_errors:211:'resolved original append evidence mismatch' |  | 82: alert.snoozed:committed_resolved_event_type, alert.snoozed:committed_resolved_event_id, alert.snoozed:committed_resolved_event_ref … | 180; exact complement in JSON |
| append_result_errors:218:'foreign original append family/scope/identity' |  | 4: alert.snoozed:append_original_event_id, alert.snoozed:append_original_storage_instance_id, alert.snoozed:append_original_project_id … | 258; exact complement in JSON |
| append_result_errors:222:'foreign original append-result reference' |  | 1: alert.snoozed:foreign_original_append_result_ref | 261; exact complement in JSON |
| append_result_errors:224:'unsettled operation carries append-result reference' |  | 1: alert.snoozed:committed_foreign_append_reference | 261; exact complement in JSON |
| cursor_errors:238:['invalid unsigned cursor/frontier'] |  | 28: alert.snoozed:pager_cursor, alert.snoozed:cursor_after_0, alert.snoozed:cursor_after_1 … | 234; exact complement in JSON |
| historical_guards:current:checkpoint_publication |  | 2: withdrawn_checkpoint, staged_checkpoint | 56; exact complement in JSON |
| historical_guards:current:checkpoint_original |  | 4: forged_checkpoint_publication, foreign_checkpoint_storage, forged_checkpoint_token … | 54; exact complement in JSON |
| historical_guards:current:event_publication |  | 2: withdrawn_event, staged_event | 56; exact complement in JSON |
| historical_guards:current:event_original |  | 9: forged_event_ref, forged_event_id, foreign_event_storage … | 49; exact complement in JSON |
| historical_guards:current:historical_payload |  | 4: forged_schema_valid_payload, forged_schema_invalid_payload, unknown_historical_version … | 54; exact complement in JSON |
| historical_guards:current:original_receipt |  | 27: forged_receipt_event, foreign_receipt_storage, forged_original_result … | 31; exact complement in JSON |
| historical_guards:current:original_source |  | 3: forged_source_selection, foreign_source_storage, typed_source_generation | 55; exact complement in JSON |
| historical_guards:current:original_admission |  | 1: not_valid_when_written | 57; exact complement in JSON |
| historical_guards:current:current_permission |  | 3: current_permission_denied, current_membership_denied, current_source_access_denied | 55; exact complement in JSON |
| historical_guards:current:source_retained |  | 1: source_deleted | 57; exact complement in JSON |
| historical_guards:current:current_withdrawal |  | 1: current_withdrawal | 57; exact complement in JSON |
| historical_guards:current:history_shape |  | 1: wrong_payload_container | 57; exact complement in JSON |

### alert.snoozed — named duplicate matrices

| Removed set | Negatives that flip | Other negatives still rejected |
|---|---|---|
| writer_policy_errors:replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: alert.snoozed:protocol_replay_policy, alert.snoozed:policy_projector_replay_only, alert.snoozed:policy_unknown … | 258; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'operation identity digest mismatch' | 8: alert.snoozed:arbitrary_operation_digest, alert.snoozed:operation_schema_only, alert.snoozed:representation_operation_digest_integer … | 254; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'frozen command digest mismatch' | 8: alert.snoozed:arbitrary_request_digest, alert.snoozed:operation_schema_only, alert.snoozed:representation_request_digest_integer … | 254; exact complement in JSON |

### alert.snoozed — field/input-domain matrix

| Schema or predicate | Field/rule | Named duplicates | Negatives that flip | Other negatives still rejected |
|---|---|---|---:|---:|
| Plans/event_payloads/attention/alert_snoozed.schema.json | type |  | 10 | 0 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/prior_revision/type |  | 14 | 6 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/prior_revision/minimum |  | 2 | 18 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/prior_revision/maximum |  | 3 | 17 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/result_revision/type |  | 13 | 8 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/result_revision/minimum |  | 3 | 18 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/result_revision/minimum/type | minimum + type | 18 | 3 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/result_revision/maximum |  | 3 | 18 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/prior_alert_state/enum |  | 12 | 0 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/result_alert_state/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/snooze_until/format |  | 28 | 9 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/snooze_until/type |  | 9 | 28 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/handler_target/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/command_id/const |  | 12 | 0 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/ts/format |  | 28 | 9 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | properties/ts/type |  | 9 | 28 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | $defs/non_empty_id/type |  | 9 | 0 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | $defs/non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | $defs/non_secret_ref/type |  | 9 | 3 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | $defs/reason_code/pattern |  | 1 | 9 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | $defs/reason_code/type |  | 9 | 1 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | $defs/origin/enum |  | 12 | 0 |
| Plans/event_payloads/attention/alert_snoozed.schema.json | $defs/ref_array/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/operation_digest/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/operation_digest/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/event_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/idempotency_key/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/request_digest/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/prior_revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/prior_revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/prior_revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/result_revision/type |  | 13 | 8 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/result_revision/minimum |  | 3 | 18 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/result_revision/minimum/type | minimum + type | 18 | 3 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/result_revision/maximum |  | 3 | 18 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/prior_alert_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/result_alert_state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/snooze_until/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/snooze_until/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/handler_target/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/command_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/ts/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/payload/properties/ts/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/owner_commit_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/owner_commit_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/result_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/dispatch_receipt_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/dispatch_receipt_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_append_result_ref/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_append_result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/prior_owner_state/properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/candidate_owner_state/properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/prior_revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/prior_revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/prior_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/prior_revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/prior_alert_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/snooze_until/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/snooze_until/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/handler_target/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/command_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/ts/format |  | 28 | 9 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | properties/original_command/properties/ts/type |  | 9 | 28 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | $defs/payload_non_empty_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | $defs/payload_non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | $defs/payload_non_secret_ref/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | $defs/payload_reason_code/pattern |  | 1 | 9 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | $defs/payload_reason_code/type |  | 9 | 1 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | $defs/payload_origin/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | $defs/payload_ref_array/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/0/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/0/then/properties/owner_commit_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/0/then/properties/result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/0/then/properties/dispatch_receipt_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/0/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/1/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/1/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/1/then/properties/result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/1/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/1/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/2/if/properties/state/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/2/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/2/then/properties/result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/2/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_operation.schema.json | allOf/2/then/properties/original_append_result_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/consumer_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/consumer_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/publication_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_key/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/generation_id/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/generation_id/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/index_dataset_name/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/type |  | 10 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_ref/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_ref/const |  | 12 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern |  | 3 | 9 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type |  | 9 | 3 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/through_sequence_id/type |  | 15 | 2 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/through_sequence_id/maximum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/through_sequence_id/minimum |  | 1 | 16 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/last_event_id/anyOf/0/type |  | 9 | 0 |
| Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json | properties/last_event_id/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/alert_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/acknowledgement_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/unread/type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/inbox_visible/type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/shared_alert_state.schema.json | properties/snooze_until/anyOf/1/type |  | 11 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | type |  | 10 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/alert_rule_id/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/type |  | 14 | 6 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/minimum |  | 2 | 18 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/revision/maximum |  | 3 | 17 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/source_record_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/root_cause_ref/type |  | 9 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_state/enum |  | 12 | 0 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/0/format |  | 28 | 9 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/0/type |  | 9 | 28 |
| Plans/alert_event_contracts/shared_alert_rule_state.schema.json | properties/mute_expires_at/anyOf/1/type |  | 11 | 0 |
| semantic_numbers | recursive exact input domain |  | 6 | 25 |
| semantic_formats | recursive exact input domain |  | 25 | 6 |
| history_shape | navigation types/presence |  | 46 | 0 |

## concern.created — full source and History matrix

| Guard | Named duplicate | Negatives that flip | Other negatives still rejected |
|---|---|---|---|
| checkpoint schema::additionalProperties |  | 1: concern.created:checkpoint_schema_only | 291; exact complement in JSON |
| operation_errors:46:schema validation |  | 7: concern.created:operation_schema_only, concern.created:executed/operation_errors/0, concern.created:executed/operation_errors/2 … | 285; exact complement in JSON |
| operation_errors:54:nested payload schema validation | operation_errors:46:schema validation | 9: concern.created:operation_schema_only, concern.created:nested_payload_schema_only, concern.created:executed/operation_errors/0 … | 283; exact complement in JSON |
| operation_errors:50:'operation exceeds 16384 bytes' |  | 1: concern.created:operation_bytes_only | 291; exact complement in JSON |
| operation_errors:58:'original identity mismatch' |  | 3: concern.created:forged_event_id, concern.created:arbitrary_operation_digest, concern.created:executed/operation_errors/31 | 289; exact complement in JSON |
| operation_errors:60:'frozen command/payload/record digest mismatch' |  | 4: concern.created:arbitrary_request_digest, concern.created:executed/operation_errors/24, concern.created:executed/operation_errors/25 … | 288; exact complement in JSON |
| operation_errors:62:'Project partition mismatch' |  | 2: concern.created:partition_only, concern.created:executed/operation_errors/33 | 290; exact complement in JSON |
| operation_errors:68:'original scope/key mismatch' |  | 2: concern.created:scope_record_project, concern.created:scope_payload_key | 290; exact complement in JSON |
| operation_errors:70:'creator/actor mismatch' |  | 1: concern.created:creator_actor_join | 291; exact complement in JSON |
| operation_errors:72:'original revision-one record ref mismatch' |  | 1: concern.created:revision_one_ref_join | 291; exact complement in JSON |
| operation_errors:65:'original command/payload ' + key |  | 3: concern.created:command_join_origin, concern.created:command_join_correlation_id, concern.created:command_join_currentness_basis_ref | 289; exact complement in JSON |
| operation_errors:86:'original candidate record ' + key |  | 31: concern.created:candidate_record_record_id, concern.created:candidate_record_concern_id, concern.created:candidate_record_revision … | 261; exact complement in JSON |
| protocol_errors:92:['invalid protocol shape'] |  | 1: concern.created:missing_protocol_append_navigation | 291; exact complement in JSON |
| protocol_errors:99:'invalid concern existence proof' |  | 2: concern.created:typed_protocol_subject_already_active, concern.created:typed_protocol_concern_key_exists | 290; exact complement in JSON |
| protocol_errors:101:'existing concern cannot be recreated' |  | 5: concern.created:protocol_subject_already_active, concern.created:protocol_concern_key_exists, concern.created:executed/protocol_errors/16 … | 287; exact complement in JSON |
| protocol_errors:107:'nomination or owner label grants no creation' |  | 8: concern.created:forbidden_creator_Worker, concern.created:forbidden_creator_User, concern.created:forbidden_creator_External Resource … | 284; exact complement in JSON |
| protocol_errors:109:'wrong original receipt' |  | 2: concern.created:protocol_receipt_event_id, concern.created:executed/protocol_errors/12 | 290; exact complement in JSON |
| protocol_errors:111:'idempotency_conflict' |  | 2: concern.created:protocol_retry_digest, concern.created:executed/protocol_errors/13 | 290; exact complement in JSON |
| protocol_errors:113:'changed caller semantic body' |  | 13: concern.created:retry_changed_caller_body, concern.created:retry_body_project_id, concern.created:retry_body_severity … | 279; exact complement in JSON |
| protocol_errors:115:'withdrawn History' |  | 2: concern.created:protocol_publication_state, concern.created:executed/protocol_errors/14 | 290; exact complement in JSON |
| protocol_errors:97:key |  | 12: concern.created:protocol_admitted, concern.created:protocol_authority_verified, concern.created:protocol_source_current … | 280; exact complement in JSON |
| protocol_errors:105:'independent authority ' + key |  | 13: concern.created:authority_join_actor_ref, concern.created:authority_join_project_id, concern.created:authority_join_authority_basis_ref … | 279; exact complement in JSON |
| checkpoint_errors:136:'Project checkpoint partition mismatch' |  | 1: concern.created:checkpoint_partition_only | 291; exact complement in JSON |
| checkpoint_errors:266:schema validation |  | 5: concern.created:checkpoint_schema_only, concern.created:executed/checkpoint_errors/43, concern.created:executed/checkpoint_errors/44 … | 287; exact complement in JSON |
| checkpoint_errors:270:'checkpoint exceeds 16384 encoded bytes' |  | 3: concern.created:checkpoint_bytes_only, concern.created:executed/checkpoint_errors/49, concern.created:executed/checkpoint_errors/50 | 289; exact complement in JSON |
| checkpoint_errors:274:'foreign Storage token' |  | 5: concern.created:checkpoint_token_storage, concern.created:executed/checkpoint_errors/37, concern.created:executed/checkpoint_errors/38 … | 287; exact complement in JSON |
| checkpoint_errors:277:'foreign original-event context: ' + field |  | 4: concern.created:checkpoint_original_storage, concern.created:executed/checkpoint_errors/39, concern.created:executed/checkpoint_errors/40 … | 288; exact complement in JSON |
| profile_errors:296:['missing profile'] |  | 1: concern.created:profile_missing | 291; exact complement in JSON |
| profile_errors:299:['wrong physical binding'] |  | 2: concern.created:profile_redb_file_derived, concern.created:profile_storage_group_wrong | 290; exact complement in JSON |
| profile_errors:302:['non-integer maximum'] |  | 2: concern.created:typed_storage_maximum_boolean, concern.created:typed_storage_maximum_float | 290; exact complement in JSON |
| profile_errors:304:['missing/oversized maximum'] |  | 2: concern.created:profile_max_value_bytes_0, concern.created:profile_max_value_bytes_16385 | 290; exact complement in JSON |
| writer_policy_errors:308:replay-only rejection (duplicates unsupported-policy rejection) | writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: concern.created:protocol_replay_policy, concern.created:policy_projector_replay_only, concern.created:policy_unknown … | 288; exact complement in JSON |
| writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |  | 1: concern.created:policy_unknown | 291; exact complement in JSON |
| schema_ref_errors:67:ValueError('target is not a schema') |  | 1: concern.created:ref_non_schema | 291; exact complement in JSON |
| schema_ref_errors:69:'unresolved schema reference: ' + str(ref) |  | 4: concern.created:ref_dangling, concern.created:ref_non_schema, concern.created:ref_external … | 288; exact complement in JSON |
| schema_ref_errors:62:ValueError('unsupported non-local reference') |  | 1: concern.created:ref_external | 291; exact complement in JSON |
| history_page:374:cursor_errors(after, frontier) |  | 1: concern.created:pager_cursor | 291; exact complement in JSON |
| history_page:376:len(packed(response([], after))) > 16384 |  | 1: concern.created:pager_metadata | 291; exact complement in JSON |
| history_page:381:not after < seq <= frontier |  | 2: concern.created:pager_past, concern.created:pager_future | 290; exact complement in JSON |
| history_page:383:exact event family and Project filter |  | 2: concern.created:pager_foreign_family, concern.created:pager_foreign_project | 290; exact complement in JSON |
| history_page:385:scanned == 256 or len(candidate) > 64 |  | 2: concern.created:pager_scan, concern.created:pager_matches | 290; exact complement in JSON |
| history_page:387:len(packed(response(candidate, seq))) > 16384 |  | 2: concern.created:pager_single_ref, concern.created:pager_response_bytes | 290; exact complement in JSON |
| history_page:388:not result |  | 1: concern.created:pager_single_ref | 291; exact complement in JSON |
| check_schema:79:schema metaschema validity |  | 1: concern.created:schema_metaschema | 291; exact complement in JSON |
| check_schema:80:eager resolution of every schema reference |  | 1: concern.created:schema_unused_ref | 291; exact complement in JSON |
| exact_value:502:exact JSON value type |  | 1: concern.created:source_comparison_type | 291; exact complement in JSON |
| exact_value:508:scalar value |  | 97: concern.created:source_comparison_object_value, concern.created:source_comparison_array_value, concern.created:source_comparison_scalar_value … | 195; exact complement in JSON |
| exact_value:505:object keys |  | 2: concern.created:source_comparison_object_keys, concern.created:retry_body_wrong_type_4 | 290; exact complement in JSON |
| exact_value:505:object child values |  | 90: concern.created:source_comparison_object_value, concern.created:retry_changed_caller_body, concern.created:retry_body_project_id … | 202; exact complement in JSON |
| exact_value:507:array length |  | 1: concern.created:source_comparison_array_length | 291; exact complement in JSON |
| exact_value:507:array child values |  | 2: concern.created:source_comparison_array_value, concern.created:retry_body_source_refs | 290; exact complement in JSON |
| append_result_errors:211:'resolved original append evidence mismatch' |  | 82: concern.created:committed_resolved_event_type, concern.created:committed_resolved_event_id, concern.created:committed_resolved_event_ref … | 210; exact complement in JSON |
| append_result_errors:218:'foreign original append family/scope/identity' |  | 5: concern.created:append_original_event_id, concern.created:append_original_storage_instance_id, concern.created:append_original_project_id … | 287; exact complement in JSON |
| append_result_errors:222:'foreign original append-result reference' |  | 1: concern.created:foreign_original_append_result_ref | 291; exact complement in JSON |
| append_result_errors:224:'unsettled operation carries append-result reference' |  | 1: concern.created:committed_foreign_append_reference | 291; exact complement in JSON |
| cursor_errors:238:['invalid unsigned cursor/frontier'] |  | 28: concern.created:pager_cursor, concern.created:cursor_after_0, concern.created:cursor_after_1 … | 264; exact complement in JSON |
| historical_guards:current:checkpoint_publication |  | 2: withdrawn_checkpoint, staged_checkpoint | 56; exact complement in JSON |
| historical_guards:current:checkpoint_original |  | 4: forged_checkpoint_publication, foreign_checkpoint_storage, forged_checkpoint_token … | 54; exact complement in JSON |
| historical_guards:current:event_publication |  | 2: withdrawn_event, staged_event | 56; exact complement in JSON |
| historical_guards:current:event_original |  | 9: forged_event_ref, forged_event_id, foreign_event_storage … | 49; exact complement in JSON |
| historical_guards:current:historical_payload |  | 4: forged_schema_valid_payload, forged_schema_invalid_payload, unknown_historical_version … | 54; exact complement in JSON |
| historical_guards:current:original_receipt |  | 27: forged_receipt_event, foreign_receipt_storage, forged_original_result … | 31; exact complement in JSON |
| historical_guards:current:original_source |  | 3: forged_source_selection, foreign_source_storage, typed_source_generation | 55; exact complement in JSON |
| historical_guards:current:original_admission |  | 1: not_valid_when_written | 57; exact complement in JSON |
| historical_guards:current:current_permission |  | 3: current_permission_denied, current_membership_denied, current_source_access_denied | 55; exact complement in JSON |
| historical_guards:current:source_retained |  | 1: source_deleted | 57; exact complement in JSON |
| historical_guards:current:current_withdrawal |  | 1: current_withdrawal | 57; exact complement in JSON |
| historical_guards:current:history_shape |  | 1: wrong_payload_container | 57; exact complement in JSON |

### concern.created — named duplicate matrices

| Removed set | Negatives that flip | Other negatives still rejected |
|---|---|---|
| writer_policy_errors:replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: concern.created:protocol_replay_policy, concern.created:policy_projector_replay_only, concern.created:policy_unknown … | 288; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'original identity mismatch' | 14: concern.created:forged_event_id, concern.created:arbitrary_operation_digest, concern.created:operation_schema_only … | 278; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'frozen command/payload/record digest mismatch' | 15: concern.created:arbitrary_request_digest, concern.created:operation_schema_only, concern.created:representation_request_digest_integer … | 277; exact complement in JSON |
| operation_errors:schema validation + operation_errors:nested payload schema validation | 9: concern.created:operation_schema_only, concern.created:nested_payload_schema_only, concern.created:executed/operation_errors/0 … | 283; exact complement in JSON |
| checkpoint_errors:'Project checkpoint partition mismatch' + checkpoint_errors:'foreign original-event context: ' + field | 6: concern.created:checkpoint_partition_only, concern.created:checkpoint_original_storage, concern.created:executed/checkpoint_errors/39 … | 286; exact complement in JSON |

### concern.created — field/input-domain matrix

| Schema or predicate | Field/rule | Named duplicates | Negatives that flip | Other negatives still rejected |
|---|---|---|---:|---:|
| Plans/event_payloads/concern/concern_created.schema.json | type |  | 10 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/concern_revision/const/type | const + type | 17 | 3 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/concern_revision/const |  | 2 | 18 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/concern_revision/type |  | 3 | 17 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/concern_revision/const/maximum | const + maximum | 5 | 15 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/state/const |  | 12 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/severity/enum |  | 12 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/handler_target/const |  | 12 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/command_id/const |  | 12 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/ts/format |  | 28 | 9 |
| Plans/event_payloads/concern/concern_created.schema.json | properties/ts/type |  | 9 | 28 |
| Plans/event_payloads/concern/concern_created.schema.json | $defs/non_empty_id/type |  | 9 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | $defs/non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/event_payloads/concern/concern_created.schema.json | $defs/non_secret_ref/type |  | 9 | 3 |
| Plans/event_payloads/concern/concern_created.schema.json | $defs/reason_code/pattern |  | 1 | 9 |
| Plans/event_payloads/concern/concern_created.schema.json | $defs/reason_code/type |  | 9 | 1 |
| Plans/event_payloads/concern/concern_created.schema.json | $defs/origin/enum |  | 12 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | $defs/owner_kind/enum |  | 12 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | $defs/ref_array/type |  | 11 | 0 |
| Plans/event_payloads/concern/concern_created.schema.json | $defs/non_empty_ref_array/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/scope_partition/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/operation_digest/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/operation_digest/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/event_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/idempotency_key/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/request_digest/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/request_digest/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/command_id/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/handler_target/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/project_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/actor_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/actor_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/creator_kind/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/authority_basis_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/authority_basis_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/permission_snapshot_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/permission_snapshot_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/currentness_basis_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/currentness_basis_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/title_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/title_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/subject_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/subject_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/scope_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/scope_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/scope_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/run_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/run_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/run_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/severity/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/category/pattern |  | 1 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/category/type |  | 9 | 1 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/owner_kind/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/owner_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/owner_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/source_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/source_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/source_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/evidence_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/evidence_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/evidence_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/artifact_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/artifact_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/artifact_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/lineage_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/lineage_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/lineage_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/visibility_level/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/attention_level/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/chatworthy/type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/blocking_effect_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/blocking_effect_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/blocking_effect_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/origin/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/correlation_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/idempotency_key/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/ts/format |  | 28 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_command/properties/ts/type |  | 9 | 28 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/schema_id/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/schema_version/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/concern_revision/const/type | const + type | 17 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/concern_revision/const |  | 2 | 18 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/concern_revision/type |  | 3 | 17 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/concern_revision/const/maximum | const + maximum | 5 | 15 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/state/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/severity/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/handler_target/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/command_id/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/ts/format |  | 28 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/payload/properties/ts/type |  | 9 | 28 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/prior_record/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/schema_id/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/schema_version/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/record_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/record_kind/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/concern_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/project_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/revision/type |  | 14 | 6 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/revision/minimum |  | 2 | 18 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/revision/maximum |  | 3 | 17 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/concern_category/pattern |  | 1 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/concern_category/type |  | 9 | 1 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/severity/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/status/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/owner_kind/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/owner_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/owner_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/creator_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/creator_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/created_by_kind/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/created_by_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/created_by_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/subject_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/subject_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/source_event_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/source_event_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/source_event_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/evidence_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/evidence_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/evidence_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/artifact_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/artifact_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/artifact_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/lineage_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/lineage_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/lineage_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/summary/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/summary/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/created_at/format |  | 28 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/created_at/type |  | 9 | 28 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/updated_at/format |  | 28 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/updated_at/type |  | 9 | 28 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/visibility_level/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/attention_level/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/chatworthy/type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/blocking_effect_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/blocking_effect_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/blocking_effect_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/resolution_kind/enum |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/resolver_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/resolver_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/resolver_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/resolved_at/format |  | 28 | 8 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/resolved_at/type |  | 8 | 28 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/run_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/run_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/run_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/scope_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/scope_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/scope_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/candidate_record/properties/redaction_profile/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/owner_commit_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/owner_commit_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/owner_commit_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/result_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/result_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/dispatch_receipt_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/dispatch_receipt_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/dispatch_receipt_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_append_result_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_append_result_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | properties/original_append_result_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | $defs/payload_non_empty_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | $defs/payload_non_secret_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | $defs/payload_non_secret_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | $defs/payload_reason_code/pattern |  | 1 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | $defs/payload_reason_code/type |  | 9 | 1 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | $defs/payload_origin/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | $defs/payload_owner_kind/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | $defs/payload_ref_array/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | $defs/payload_non_empty_ref_array/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/0/if/properties/state/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/0/then/properties/owner_commit_ref/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/0/then/properties/result_ref/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/0/then/properties/dispatch_receipt_ref/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/0/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/1/if/properties/state/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/1/then/properties/owner_commit_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/1/then/properties/owner_commit_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/1/then/properties/result_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/1/then/properties/result_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/1/then/properties/dispatch_receipt_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/1/then/properties/dispatch_receipt_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/1/then/properties/original_append_result_ref/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/2/if/properties/state/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/2/then/properties/owner_commit_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/2/then/properties/owner_commit_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/2/then/properties/result_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/2/then/properties/result_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/2/then/properties/dispatch_receipt_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/2/then/properties/dispatch_receipt_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/2/then/properties/original_append_result_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_created_operation.schema.json | allOf/2/then/properties/original_append_result_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/consumer_id/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/consumer_version/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/publication_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_key/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_ref/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/generation_id/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/generation_id/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/type |  | 15 | 2 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/maximum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/minimum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/index_dataset_name/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_ref/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type |  | 15 | 2 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_ref/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/type |  | 15 | 2 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/type |  | 15 | 2 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern |  | 3 | 9 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/through_sequence_id/type |  | 15 | 2 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/through_sequence_id/maximum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/through_sequence_id/minimum |  | 1 | 16 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/last_event_id/anyOf/0/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/last_event_id/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_created_checkpoint.schema.json | properties/scope_partition/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/record_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/record_kind/const |  | 12 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/concern_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/project_id/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/revision/type |  | 14 | 6 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/revision/minimum |  | 2 | 18 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/revision/minimum/type | minimum + type | 17 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/revision/maximum |  | 3 | 17 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/concern_category/pattern |  | 1 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/concern_category/type |  | 9 | 1 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/severity/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/status/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/owner_kind/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/owner_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/owner_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/creator_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/creator_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/created_by_kind/enum |  | 12 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/created_by_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/created_by_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/subject_ref/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/subject_ref/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/source_event_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/source_event_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/source_event_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/evidence_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/evidence_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/evidence_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/artifact_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/artifact_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/artifact_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/lineage_refs/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/lineage_refs/items/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/lineage_refs/items/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/summary/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/summary/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/created_at/format |  | 28 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/created_at/type |  | 9 | 28 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/updated_at/format |  | 28 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/updated_at/type |  | 9 | 28 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/visibility_level/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/attention_level/type |  | 9 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/chatworthy/type |  | 10 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/blocking_effect_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/blocking_effect_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/blocking_effect_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/resolution_kind/enum |  | 11 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/resolver_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/resolver_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/resolver_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/resolved_at/format |  | 28 | 8 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/resolved_at/type |  | 8 | 28 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/run_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/run_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/run_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/scope_ref/anyOf/0/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/scope_ref/anyOf/0/type |  | 9 | 3 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/scope_ref/anyOf/1/type |  | 11 | 0 |
| Plans/concern_created_contracts/concern_record.schema.json | properties/redaction_profile/const |  | 12 | 0 |
| semantic_numbers | recursive exact input domain |  | 6 | 25 |
| semantic_formats | recursive exact input domain |  | 25 | 6 |
| history_shape | navigation types/presence |  | 46 | 0 |

## panel.redocked — full source and History matrix

| Guard | Named duplicate | Negatives that flip | Other negatives still rejected |
|---|---|---|---|
| checkpoint schema::additionalProperties |  | 1: panel.redocked:checkpoint_schema_only | 264; exact complement in JSON |
| operation_errors:59:schema validation |  | 2: panel.redocked:operation_schema_only, panel.redocked:executed/operation_errors/15 | 263; exact complement in JSON |
| operation_errors:63:'operation too large' |  | 1: panel.redocked:operation_bytes_only | 264; exact complement in JSON |
| operation_errors:70:'frozen command digest mismatch' |  | 5: panel.redocked:arbitrary_request_digest, panel.redocked:executed/operation_errors/11, panel.redocked:executed/operation_errors/12 … | 260; exact complement in JSON |
| operation_errors:75:'frozen command window mismatch' | operation_errors:73:'frozen command/payload ' + key | 3: panel.redocked:command_join_actor_ref, panel.redocked:command_join_correlation_id, panel.redocked:command_window_join | 262; exact complement in JSON |
| operation_errors:81:'original identity mismatch' |  | 6: panel.redocked:forged_event_id, panel.redocked:arbitrary_operation_digest, panel.redocked:representation_operation_digest_uppercase … | 259; exact complement in JSON |
| operation_errors:73:'frozen command/payload ' + key |  | 2: panel.redocked:command_join_actor_ref, panel.redocked:command_join_correlation_id | 263; exact complement in JSON |
| operation_errors:78:'operation/payload ' + key |  | 7: panel.redocked:scope_join_storage_instance_id, panel.redocked:scope_join_server_id, panel.redocked:scope_join_project_id … | 258; exact complement in JSON |
| operation_errors:87:'original host snapshot mismatch' |  | 6: panel.redocked:prior_host_snapshot_app_session_id, panel.redocked:prior_host_snapshot_host_revision, panel.redocked:prior_host_snapshot_host … | 259; exact complement in JSON |
| operation_errors:89:'original window mismatch' |  | 2: panel.redocked:prior_host_snapshot_window_id, panel.redocked:candidate_host_snapshot_window_id | 263; exact complement in JSON |
| operation_errors:94:'original result/receipt mismatch' |  | 3: panel.redocked:original_result_owner_commit_ref, panel.redocked:original_result_result_ref, panel.redocked:original_result_dispatch_receipt_ref | 262; exact complement in JSON |
| protocol_errors:104:['invalid protocol shape'] |  | 1: panel.redocked:missing_protocol_append_navigation | 264; exact complement in JSON |
| protocol_errors:110:'family absent' |  | 3: panel.redocked:protocol_admitted, panel.redocked:typed_protocol_admitted, panel.redocked:executed/protocol_errors/19 | 262; exact complement in JSON |
| protocol_errors:112:'unsupported web' |  | 3: panel.redocked:protocol_desktop, panel.redocked:typed_protocol_desktop, panel.redocked:executed/protocol_errors/28 | 262; exact complement in JSON |
| protocol_errors:114:'unverified source' |  | 3: panel.redocked:protocol_source_verified, panel.redocked:typed_protocol_source_verified, panel.redocked:executed/protocol_errors/20 | 262; exact complement in JSON |
| protocol_errors:116:'wrong original receipt' |  | 2: panel.redocked:protocol_receipt_event_id, panel.redocked:executed/protocol_errors/21 | 263; exact complement in JSON |
| protocol_errors:118:'forged original event identity' |  | 1: panel.redocked:protocol_coherently_forged_identity | 264; exact complement in JSON |
| protocol_errors:120:'prior session cannot act' |  | 3: panel.redocked:protocol_session, panel.redocked:executed/protocol_errors/22, panel.redocked:executed/protocol_errors/29 | 262; exact complement in JSON |
| protocol_errors:122:'wrong window' |  | 3: panel.redocked:protocol_window, panel.redocked:executed/protocol_errors/23, panel.redocked:executed/protocol_errors/30 | 262; exact complement in JSON |
| protocol_errors:124:'retry changed' |  | 4: panel.redocked:retry_retry_payload, panel.redocked:retry_retry_command, panel.redocked:executed/protocol_errors/24 … | 261; exact complement in JSON |
| protocol_errors:126:'unavailable publication/cursor' |  | 4: panel.redocked:protocol_publication_state, panel.redocked:protocol_cursor, panel.redocked:executed/protocol_errors/26 … | 261; exact complement in JSON |
| checkpoint_errors:54:'checkpoint scope mismatch' |  | 1: panel.redocked:checkpoint_partition_only | 264; exact complement in JSON |
| payload_errors:26:schema validation |  | 22: panel.redocked:payload_non_chat, panel.redocked:payload_coemission, panel.redocked:payload_saved_host … | 243; exact complement in JSON |
| payload_errors:31:'scope mismatch' |  | 3: panel.redocked:payload_scope_join_mismatch, panel.redocked:payload_cases/scope_join_mismatch, panel.redocked:executed/payload_errors/8 | 262; exact complement in JSON |
| payload_errors:37:'missing original Home context' |  | 1: panel.redocked:home_context_only | 264; exact complement in JSON |
| payload_errors:39:'not host revision successor' |  | 4: panel.redocked:payload_no_successor, panel.redocked:successor_only, panel.redocked:payload_cases/no_successor … | 261; exact complement in JSON |
| payload_errors:35:'CV-366 application idempotency key mismatch' |  | 3: panel.redocked:payload_application_key_missing_server_and_operation, panel.redocked:payload_cases/application_key_missing_server_and_operation, panel.redocked:executed/payload_errors/9 | 262; exact complement in JSON |
| checkpoint_errors:266:schema validation |  | 3: panel.redocked:checkpoint_schema_only, panel.redocked:executed/checkpoint_errors/41, panel.redocked:executed/checkpoint_errors/42 | 262; exact complement in JSON |
| checkpoint_errors:270:'checkpoint exceeds 16384 encoded bytes' |  | 3: panel.redocked:checkpoint_bytes_only, panel.redocked:executed/checkpoint_errors/39, panel.redocked:executed/checkpoint_errors/40 | 262; exact complement in JSON |
| checkpoint_errors:274:'foreign Storage token' |  | 3: panel.redocked:checkpoint_token_storage, panel.redocked:executed/checkpoint_errors/31, panel.redocked:executed/checkpoint_errors/32 | 262; exact complement in JSON |
| checkpoint_errors:277:'foreign original-event context: ' + field |  | 6: panel.redocked:checkpoint_original_storage, panel.redocked:executed/checkpoint_errors/33, panel.redocked:executed/checkpoint_errors/34 … | 259; exact complement in JSON |
| profile_errors:296:['missing profile'] |  | 1: panel.redocked:profile_missing | 264; exact complement in JSON |
| profile_errors:299:['wrong physical binding'] |  | 2: panel.redocked:profile_redb_file_derived, panel.redocked:profile_storage_group_wrong | 263; exact complement in JSON |
| profile_errors:302:['non-integer maximum'] |  | 2: panel.redocked:typed_storage_maximum_boolean, panel.redocked:typed_storage_maximum_float | 263; exact complement in JSON |
| profile_errors:304:['missing/oversized maximum'] |  | 2: panel.redocked:profile_max_value_bytes_0, panel.redocked:profile_max_value_bytes_16385 | 263; exact complement in JSON |
| writer_policy_errors:308:replay-only rejection (duplicates unsupported-policy rejection) | writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: panel.redocked:protocol_replay_policy, panel.redocked:policy_projector_replay_only, panel.redocked:policy_unknown … | 261; exact complement in JSON |
| writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |  | 1: panel.redocked:policy_unknown | 264; exact complement in JSON |
| schema_ref_errors:67:ValueError('target is not a schema') |  | 1: panel.redocked:ref_non_schema | 264; exact complement in JSON |
| schema_ref_errors:69:'unresolved schema reference: ' + str(ref) |  | 4: panel.redocked:ref_dangling, panel.redocked:ref_non_schema, panel.redocked:ref_external … | 261; exact complement in JSON |
| schema_ref_errors:62:ValueError('unsupported non-local reference') |  | 1: panel.redocked:ref_external | 264; exact complement in JSON |
| history_page:374:cursor_errors(after, frontier) |  | 1: panel.redocked:pager_cursor | 264; exact complement in JSON |
| history_page:376:len(packed(response([], after))) > 16384 |  | 1: panel.redocked:pager_metadata | 264; exact complement in JSON |
| history_page:381:not after < seq <= frontier |  | 2: panel.redocked:pager_past, panel.redocked:pager_future | 263; exact complement in JSON |
| history_page:383:exact event family and Project filter |  | 2: panel.redocked:pager_foreign_family, panel.redocked:pager_foreign_project | 263; exact complement in JSON |
| history_page:385:scanned == 256 or len(candidate) > 64 |  | 2: panel.redocked:pager_scan, panel.redocked:pager_matches | 263; exact complement in JSON |
| history_page:387:len(packed(response(candidate, seq))) > 16384 |  | 2: panel.redocked:pager_single_ref, panel.redocked:pager_response_bytes | 263; exact complement in JSON |
| history_page:388:not result |  | 1: panel.redocked:pager_single_ref | 264; exact complement in JSON |
| check_schema:79:schema metaschema validity |  | 1: panel.redocked:schema_metaschema | 264; exact complement in JSON |
| check_schema:80:eager resolution of every schema reference |  | 1: panel.redocked:schema_unused_ref | 264; exact complement in JSON |
| exact_value:502:exact JSON value type |  | 1: panel.redocked:source_comparison_type | 264; exact complement in JSON |
| exact_value:508:scalar value |  | 91: panel.redocked:source_comparison_object_value, panel.redocked:source_comparison_array_value, panel.redocked:source_comparison_scalar_value … | 174; exact complement in JSON |
| exact_value:505:object keys |  | 1: panel.redocked:source_comparison_object_keys | 264; exact complement in JSON |
| exact_value:505:object child values |  | 84: panel.redocked:source_comparison_object_value, panel.redocked:committed_resolved_event_type, panel.redocked:committed_resolved_event_id … | 181; exact complement in JSON |
| exact_value:507:array length |  | 1: panel.redocked:source_comparison_array_length | 264; exact complement in JSON |
| exact_value:507:array child values |  | 1: panel.redocked:source_comparison_array_value | 264; exact complement in JSON |
| append_result_errors:211:'resolved original append evidence mismatch' |  | 82: panel.redocked:committed_resolved_event_type, panel.redocked:committed_resolved_event_id, panel.redocked:committed_resolved_event_ref … | 183; exact complement in JSON |
| append_result_errors:218:'foreign original append family/scope/identity' |  | 5: panel.redocked:append_original_event_id, panel.redocked:append_original_storage_instance_id, panel.redocked:append_original_project_id … | 260; exact complement in JSON |
| append_result_errors:222:'foreign original append-result reference' |  | 1: panel.redocked:foreign_original_append_result_ref | 264; exact complement in JSON |
| append_result_errors:224:'unsettled operation carries append-result reference' |  | 1: panel.redocked:committed_foreign_append_reference | 264; exact complement in JSON |
| cursor_errors:238:['invalid unsigned cursor/frontier'] |  | 30: panel.redocked:protocol_cursor, panel.redocked:pager_cursor, panel.redocked:cursor_after_0 … | 235; exact complement in JSON |
| historical_guards:current:checkpoint_publication |  | 2: withdrawn_checkpoint, staged_checkpoint | 56; exact complement in JSON |
| historical_guards:current:checkpoint_original |  | 4: forged_checkpoint_publication, foreign_checkpoint_storage, forged_checkpoint_token … | 54; exact complement in JSON |
| historical_guards:current:event_publication |  | 2: withdrawn_event, staged_event | 56; exact complement in JSON |
| historical_guards:current:event_original |  | 9: forged_event_ref, forged_event_id, foreign_event_storage … | 49; exact complement in JSON |
| historical_guards:current:historical_payload |  | 4: forged_schema_valid_payload, forged_schema_invalid_payload, unknown_historical_version … | 54; exact complement in JSON |
| historical_guards:current:original_receipt |  | 27: forged_receipt_event, foreign_receipt_storage, forged_original_result … | 31; exact complement in JSON |
| historical_guards:current:original_source |  | 3: forged_source_selection, foreign_source_storage, typed_source_generation | 55; exact complement in JSON |
| historical_guards:current:original_admission |  | 1: not_valid_when_written | 57; exact complement in JSON |
| historical_guards:current:current_permission |  | 3: current_permission_denied, current_membership_denied, current_source_access_denied | 55; exact complement in JSON |
| historical_guards:current:source_retained |  | 1: source_deleted | 57; exact complement in JSON |
| historical_guards:current:current_withdrawal |  | 1: current_withdrawal | 57; exact complement in JSON |
| historical_guards:current:history_shape |  | 1: wrong_payload_container | 57; exact complement in JSON |
| historical_guards:v1:checkpoint_publication |  | 2: withdrawn_checkpoint, staged_checkpoint | 56; exact complement in JSON |
| historical_guards:v1:checkpoint_original |  | 4: forged_checkpoint_publication, foreign_checkpoint_storage, forged_checkpoint_token … | 54; exact complement in JSON |
| historical_guards:v1:event_publication |  | 2: withdrawn_event, staged_event | 56; exact complement in JSON |
| historical_guards:v1:event_original |  | 9: forged_event_ref, forged_event_id, foreign_event_storage … | 49; exact complement in JSON |
| historical_guards:v1:historical_payload |  | 4: forged_schema_valid_payload, forged_schema_invalid_payload, unknown_historical_version … | 54; exact complement in JSON |
| historical_guards:v1:original_receipt |  | 27: forged_receipt_event, foreign_receipt_storage, forged_original_result … | 31; exact complement in JSON |
| historical_guards:v1:original_source |  | 3: forged_source_selection, foreign_source_storage, typed_source_generation | 55; exact complement in JSON |
| historical_guards:v1:original_admission |  | 1: not_valid_when_written | 57; exact complement in JSON |
| historical_guards:v1:current_permission |  | 3: current_permission_denied, current_membership_denied, current_source_access_denied | 55; exact complement in JSON |
| historical_guards:v1:source_retained |  | 1: source_deleted | 57; exact complement in JSON |
| historical_guards:v1:current_withdrawal |  | 1: current_withdrawal | 57; exact complement in JSON |
| historical_guards:v1:history_shape |  | 1: wrong_payload_container | 57; exact complement in JSON |

### panel.redocked — named duplicate matrices

| Removed set | Negatives that flip | Other negatives still rejected |
|---|---|---|
| operation_errors:'frozen command window mismatch' + operation_errors:'frozen command/payload ' + key | 3: panel.redocked:command_join_actor_ref, panel.redocked:command_join_correlation_id, panel.redocked:command_window_join | 262; exact complement in JSON |
| writer_policy_errors:replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: panel.redocked:protocol_replay_policy, panel.redocked:policy_projector_replay_only, panel.redocked:policy_unknown … | 261; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'original identity mismatch' | 9: panel.redocked:forged_event_id, panel.redocked:arbitrary_operation_digest, panel.redocked:operation_schema_only … | 256; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'frozen command digest mismatch' | 11: panel.redocked:arbitrary_request_digest, panel.redocked:operation_schema_only, panel.redocked:representation_request_digest_integer … | 254; exact complement in JSON |
| checkpoint_errors:'checkpoint scope mismatch' + checkpoint_errors:'foreign original-event context: ' + field | 8: panel.redocked:checkpoint_partition_only, panel.redocked:checkpoint_original_storage, panel.redocked:executed/checkpoint_errors/33 … | 257; exact complement in JSON |

### panel.redocked — field/input-domain matrix

| Schema or predicate | Field/rule | Named duplicates | Negatives that flip | Other negatives still rejected |
|---|---|---|---:|---:|
| Plans/event_payloads/panel_redocked_v2.schema.json | type |  | 10 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/server_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/scope_partition/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/app_session_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/interaction_transaction_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/actor_ref/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/correlation_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/idempotency_key/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/window_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/command_result_ref/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/project_id/type |  | 8 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/workspace_tab_id/type |  | 8 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/panel_id/const |  | 12 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/command_id/const |  | 12 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/origin/enum |  | 12 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/source_host/const |  | 12 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/target_host/const |  | 12 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/prior_host_revision/type |  | 15 | 4 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/prior_host_revision/maximum |  | 3 | 16 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/prior_host_revision/minimum |  | 1 | 18 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/new_host_revision/type |  | 14 | 6 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/new_host_revision/minimum |  | 2 | 18 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/new_host_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/new_host_revision/maximum |  | 3 | 17 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/settled_at_utc/format |  | 28 | 9 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/settled_at_utc/type |  | 9 | 28 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/settled_only/const |  | 11 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/preview_state_included/const |  | 11 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/persisted/const |  | 11 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/host_state_persisted/const |  | 11 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/workspace_layout_changed_coemitted/const |  | 11 | 0 |
| Plans/event_payloads/panel_redocked_v2.schema.json | properties/workspace_layout_event_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/server_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/scope_partition/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/operation_digest/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/event_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/idempotency_key/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/request_digest/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/request_digest/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/project_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/storage_instance_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/server_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/scope_partition/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/interaction_transaction_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/actor_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/correlation_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/idempotency_key/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/window_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/command_result_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/schema_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/schema_version/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/project_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/workspace_tab_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/panel_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/command_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/origin/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/source_host/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/target_host/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/prior_host_revision/type |  | 15 | 4 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/prior_host_revision/maximum |  | 3 | 16 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/prior_host_revision/minimum |  | 1 | 18 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/new_host_revision/type |  | 14 | 6 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/new_host_revision/minimum |  | 2 | 18 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/new_host_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/new_host_revision/maximum |  | 3 | 17 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/settled_at_utc/format |  | 28 | 9 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/settled_at_utc/type |  | 9 | 28 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/settled_only/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/preview_state_included/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/persisted/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/host_state_persisted/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/workspace_layout_changed_coemitted/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/payload/properties/workspace_layout_event_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/prior_host_snapshot/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/prior_host_snapshot/properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/prior_host_snapshot/properties/host_revision/type |  | 15 | 4 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/prior_host_snapshot/properties/host_revision/maximum |  | 3 | 16 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/prior_host_snapshot/properties/host_revision/minimum |  | 1 | 18 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/prior_host_snapshot/properties/host/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/prior_host_snapshot/properties/window_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/candidate_host_snapshot/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/candidate_host_snapshot/properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/candidate_host_snapshot/properties/host_revision/type |  | 15 | 4 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/candidate_host_snapshot/properties/host_revision/maximum |  | 3 | 16 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/candidate_host_snapshot/properties/host_revision/minimum |  | 1 | 18 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/candidate_host_snapshot/properties/host/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/candidate_host_snapshot/properties/window_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/owner_commit_ref/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/result_ref/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/dispatch_receipt_ref/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_append_result_ref/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/storage_instance_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/server_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/project_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/workspace_tab_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/scope_partition/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/actor_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/correlation_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/idempotency_key/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/origin/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/command_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/panel_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/prior_host_revision/type |  | 15 | 4 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/prior_host_revision/maximum |  | 3 | 16 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/prior_host_revision/minimum |  | 1 | 18 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/expected_layout_revision/type |  | 14 | 4 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/expected_layout_revision/maximum |  | 3 | 15 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/expected_layout_revision/minimum |  | 1 | 17 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/window_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | properties/original_command/properties/target_host/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/0/if/properties/state/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/0/then/properties/owner_commit_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/0/then/properties/result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/0/then/properties/dispatch_receipt_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/0/then/properties/original_append_result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/1/if/properties/state/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/1/then/properties/owner_commit_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/1/then/properties/result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/1/then/properties/dispatch_receipt_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/1/then/properties/original_append_result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/2/if/properties/state/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/2/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/2/then/properties/result_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/2/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/2/then/properties/original_append_result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/3/if/properties/state/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/3/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/3/then/properties/result_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/3/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_operation.schema.json | allOf/3/then/properties/original_append_result_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/project_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/consumer_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/consumer_version/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/publication_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_key/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/generation_id/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/generation_id/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/index_dataset_name/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_ref/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_ref/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/through_sequence_id/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/through_sequence_id/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/through_sequence_id/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/last_event_id/anyOf/0/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/last_event_id/anyOf/1/type |  | 11 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/scope_partition/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json | properties/server_id/type |  | 9 | 0 |
| semantic_numbers | recursive exact input domain |  | 6 | 25 |
| semantic_formats | recursive exact input domain |  | 25 | 6 |
| history_shape | navigation types/presence |  | 46 | 0 |

## panel.undocked — full source and History matrix

| Guard | Named duplicate | Negatives that flip | Other negatives still rejected |
|---|---|---|---|
| checkpoint schema::additionalProperties |  | 1: panel.undocked:checkpoint_schema_only | 264; exact complement in JSON |
| operation_errors:59:schema validation |  | 2: panel.undocked:operation_schema_only, panel.undocked:executed/operation_errors/15 | 263; exact complement in JSON |
| operation_errors:63:'operation too large' |  | 1: panel.undocked:operation_bytes_only | 264; exact complement in JSON |
| operation_errors:70:'frozen command digest mismatch' |  | 5: panel.undocked:arbitrary_request_digest, panel.undocked:executed/operation_errors/11, panel.undocked:executed/operation_errors/12 … | 260; exact complement in JSON |
| operation_errors:75:'frozen command window mismatch' |  | 1: panel.undocked:command_window_join | 264; exact complement in JSON |
| operation_errors:81:'original identity mismatch' |  | 6: panel.undocked:forged_event_id, panel.undocked:arbitrary_operation_digest, panel.undocked:representation_operation_digest_uppercase … | 259; exact complement in JSON |
| operation_errors:73:'frozen command/payload ' + key |  | 2: panel.undocked:command_join_actor_ref, panel.undocked:command_join_correlation_id | 263; exact complement in JSON |
| operation_errors:78:'operation/payload ' + key |  | 7: panel.undocked:scope_join_storage_instance_id, panel.undocked:scope_join_server_id, panel.undocked:scope_join_project_id … | 258; exact complement in JSON |
| operation_errors:87:'original host snapshot mismatch' |  | 6: panel.undocked:prior_host_snapshot_app_session_id, panel.undocked:prior_host_snapshot_host_revision, panel.undocked:prior_host_snapshot_host … | 259; exact complement in JSON |
| operation_errors:89:'original window mismatch' |  | 2: panel.undocked:prior_host_snapshot_window_id, panel.undocked:candidate_host_snapshot_window_id | 263; exact complement in JSON |
| operation_errors:94:'original result/receipt mismatch' |  | 3: panel.undocked:original_result_owner_commit_ref, panel.undocked:original_result_result_ref, panel.undocked:original_result_dispatch_receipt_ref | 262; exact complement in JSON |
| protocol_errors:104:['invalid protocol shape'] |  | 1: panel.undocked:missing_protocol_append_navigation | 264; exact complement in JSON |
| protocol_errors:110:'family absent' |  | 3: panel.undocked:protocol_admitted, panel.undocked:typed_protocol_admitted, panel.undocked:executed/protocol_errors/19 | 262; exact complement in JSON |
| protocol_errors:112:'unsupported web' |  | 3: panel.undocked:protocol_desktop, panel.undocked:typed_protocol_desktop, panel.undocked:executed/protocol_errors/28 | 262; exact complement in JSON |
| protocol_errors:114:'unverified source' |  | 3: panel.undocked:protocol_source_verified, panel.undocked:typed_protocol_source_verified, panel.undocked:executed/protocol_errors/20 | 262; exact complement in JSON |
| protocol_errors:116:'wrong original receipt' |  | 2: panel.undocked:protocol_receipt_event_id, panel.undocked:executed/protocol_errors/21 | 263; exact complement in JSON |
| protocol_errors:118:'forged original event identity' |  | 1: panel.undocked:protocol_coherently_forged_identity | 264; exact complement in JSON |
| protocol_errors:120:'prior session cannot act' |  | 3: panel.undocked:protocol_session, panel.undocked:executed/protocol_errors/22, panel.undocked:executed/protocol_errors/29 | 262; exact complement in JSON |
| protocol_errors:122:'wrong window' |  | 3: panel.undocked:protocol_window, panel.undocked:executed/protocol_errors/23, panel.undocked:executed/protocol_errors/30 | 262; exact complement in JSON |
| protocol_errors:124:'retry changed' |  | 4: panel.undocked:retry_retry_payload, panel.undocked:retry_retry_command, panel.undocked:executed/protocol_errors/24 … | 261; exact complement in JSON |
| protocol_errors:126:'unavailable publication/cursor' |  | 4: panel.undocked:protocol_publication_state, panel.undocked:protocol_cursor, panel.undocked:executed/protocol_errors/26 … | 261; exact complement in JSON |
| checkpoint_errors:54:'checkpoint scope mismatch' |  | 1: panel.undocked:checkpoint_partition_only | 264; exact complement in JSON |
| payload_errors:26:schema validation |  | 22: panel.undocked:payload_non_chat, panel.undocked:payload_coemission, panel.undocked:payload_saved_host … | 243; exact complement in JSON |
| payload_errors:31:'scope mismatch' |  | 3: panel.undocked:payload_scope_join_mismatch, panel.undocked:payload_cases/scope_join_mismatch, panel.undocked:executed/payload_errors/8 | 262; exact complement in JSON |
| payload_errors:37:'missing original Home context' |  | 1: panel.undocked:home_context_only | 264; exact complement in JSON |
| payload_errors:39:'not host revision successor' |  | 4: panel.undocked:payload_no_successor, panel.undocked:successor_only, panel.undocked:payload_cases/no_successor … | 261; exact complement in JSON |
| payload_errors:35:'CV-366 application idempotency key mismatch' |  | 3: panel.undocked:payload_application_key_missing_server_and_operation, panel.undocked:payload_cases/application_key_missing_server_and_operation, panel.undocked:executed/payload_errors/9 | 262; exact complement in JSON |
| checkpoint_errors:266:schema validation |  | 3: panel.undocked:checkpoint_schema_only, panel.undocked:executed/checkpoint_errors/41, panel.undocked:executed/checkpoint_errors/42 | 262; exact complement in JSON |
| checkpoint_errors:270:'checkpoint exceeds 16384 encoded bytes' |  | 3: panel.undocked:checkpoint_bytes_only, panel.undocked:executed/checkpoint_errors/39, panel.undocked:executed/checkpoint_errors/40 | 262; exact complement in JSON |
| checkpoint_errors:274:'foreign Storage token' |  | 3: panel.undocked:checkpoint_token_storage, panel.undocked:executed/checkpoint_errors/31, panel.undocked:executed/checkpoint_errors/32 | 262; exact complement in JSON |
| checkpoint_errors:277:'foreign original-event context: ' + field |  | 6: panel.undocked:checkpoint_original_storage, panel.undocked:executed/checkpoint_errors/33, panel.undocked:executed/checkpoint_errors/34 … | 259; exact complement in JSON |
| profile_errors:296:['missing profile'] |  | 1: panel.undocked:profile_missing | 264; exact complement in JSON |
| profile_errors:299:['wrong physical binding'] |  | 2: panel.undocked:profile_redb_file_derived, panel.undocked:profile_storage_group_wrong | 263; exact complement in JSON |
| profile_errors:302:['non-integer maximum'] |  | 2: panel.undocked:typed_storage_maximum_boolean, panel.undocked:typed_storage_maximum_float | 263; exact complement in JSON |
| profile_errors:304:['missing/oversized maximum'] |  | 2: panel.undocked:profile_max_value_bytes_0, panel.undocked:profile_max_value_bytes_16385 | 263; exact complement in JSON |
| writer_policy_errors:308:replay-only rejection (duplicates unsupported-policy rejection) | writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: panel.undocked:protocol_replay_policy, panel.undocked:policy_projector_replay_only, panel.undocked:policy_unknown … | 261; exact complement in JSON |
| writer_policy_errors:310:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |  | 1: panel.undocked:policy_unknown | 264; exact complement in JSON |
| schema_ref_errors:67:ValueError('target is not a schema') |  | 1: panel.undocked:ref_non_schema | 264; exact complement in JSON |
| schema_ref_errors:69:'unresolved schema reference: ' + str(ref) |  | 4: panel.undocked:ref_dangling, panel.undocked:ref_non_schema, panel.undocked:ref_external … | 261; exact complement in JSON |
| schema_ref_errors:62:ValueError('unsupported non-local reference') |  | 1: panel.undocked:ref_external | 264; exact complement in JSON |
| history_page:374:cursor_errors(after, frontier) |  | 1: panel.undocked:pager_cursor | 264; exact complement in JSON |
| history_page:376:len(packed(response([], after))) > 16384 |  | 1: panel.undocked:pager_metadata | 264; exact complement in JSON |
| history_page:381:not after < seq <= frontier |  | 2: panel.undocked:pager_past, panel.undocked:pager_future | 263; exact complement in JSON |
| history_page:383:exact event family and Project filter |  | 2: panel.undocked:pager_foreign_family, panel.undocked:pager_foreign_project | 263; exact complement in JSON |
| history_page:385:scanned == 256 or len(candidate) > 64 |  | 2: panel.undocked:pager_scan, panel.undocked:pager_matches | 263; exact complement in JSON |
| history_page:387:len(packed(response(candidate, seq))) > 16384 |  | 2: panel.undocked:pager_single_ref, panel.undocked:pager_response_bytes | 263; exact complement in JSON |
| history_page:388:not result |  | 1: panel.undocked:pager_single_ref | 264; exact complement in JSON |
| check_schema:79:schema metaschema validity |  | 1: panel.undocked:schema_metaschema | 264; exact complement in JSON |
| check_schema:80:eager resolution of every schema reference |  | 1: panel.undocked:schema_unused_ref | 264; exact complement in JSON |
| exact_value:502:exact JSON value type |  | 1: panel.undocked:source_comparison_type | 264; exact complement in JSON |
| exact_value:508:scalar value |  | 91: panel.undocked:source_comparison_object_value, panel.undocked:source_comparison_array_value, panel.undocked:source_comparison_scalar_value … | 174; exact complement in JSON |
| exact_value:505:object keys |  | 1: panel.undocked:source_comparison_object_keys | 264; exact complement in JSON |
| exact_value:505:object child values |  | 84: panel.undocked:source_comparison_object_value, panel.undocked:committed_resolved_event_type, panel.undocked:committed_resolved_event_id … | 181; exact complement in JSON |
| exact_value:507:array length |  | 1: panel.undocked:source_comparison_array_length | 264; exact complement in JSON |
| exact_value:507:array child values |  | 1: panel.undocked:source_comparison_array_value | 264; exact complement in JSON |
| append_result_errors:211:'resolved original append evidence mismatch' |  | 82: panel.undocked:committed_resolved_event_type, panel.undocked:committed_resolved_event_id, panel.undocked:committed_resolved_event_ref … | 183; exact complement in JSON |
| append_result_errors:218:'foreign original append family/scope/identity' |  | 5: panel.undocked:append_original_event_id, panel.undocked:append_original_storage_instance_id, panel.undocked:append_original_project_id … | 260; exact complement in JSON |
| append_result_errors:222:'foreign original append-result reference' |  | 1: panel.undocked:foreign_original_append_result_ref | 264; exact complement in JSON |
| append_result_errors:224:'unsettled operation carries append-result reference' |  | 1: panel.undocked:committed_foreign_append_reference | 264; exact complement in JSON |
| cursor_errors:238:['invalid unsigned cursor/frontier'] |  | 30: panel.undocked:protocol_cursor, panel.undocked:pager_cursor, panel.undocked:cursor_after_0 … | 235; exact complement in JSON |
| historical_guards:current:checkpoint_publication |  | 2: withdrawn_checkpoint, staged_checkpoint | 56; exact complement in JSON |
| historical_guards:current:checkpoint_original |  | 4: forged_checkpoint_publication, foreign_checkpoint_storage, forged_checkpoint_token … | 54; exact complement in JSON |
| historical_guards:current:event_publication |  | 2: withdrawn_event, staged_event | 56; exact complement in JSON |
| historical_guards:current:event_original |  | 9: forged_event_ref, forged_event_id, foreign_event_storage … | 49; exact complement in JSON |
| historical_guards:current:historical_payload |  | 4: forged_schema_valid_payload, forged_schema_invalid_payload, unknown_historical_version … | 54; exact complement in JSON |
| historical_guards:current:original_receipt |  | 27: forged_receipt_event, foreign_receipt_storage, forged_original_result … | 31; exact complement in JSON |
| historical_guards:current:original_source |  | 3: forged_source_selection, foreign_source_storage, typed_source_generation | 55; exact complement in JSON |
| historical_guards:current:original_admission |  | 1: not_valid_when_written | 57; exact complement in JSON |
| historical_guards:current:current_permission |  | 3: current_permission_denied, current_membership_denied, current_source_access_denied | 55; exact complement in JSON |
| historical_guards:current:source_retained |  | 1: source_deleted | 57; exact complement in JSON |
| historical_guards:current:current_withdrawal |  | 1: current_withdrawal | 57; exact complement in JSON |
| historical_guards:current:history_shape |  | 1: wrong_payload_container | 57; exact complement in JSON |
| historical_guards:v1:checkpoint_publication |  | 2: withdrawn_checkpoint, staged_checkpoint | 56; exact complement in JSON |
| historical_guards:v1:checkpoint_original |  | 4: forged_checkpoint_publication, foreign_checkpoint_storage, forged_checkpoint_token … | 54; exact complement in JSON |
| historical_guards:v1:event_publication |  | 2: withdrawn_event, staged_event | 56; exact complement in JSON |
| historical_guards:v1:event_original |  | 9: forged_event_ref, forged_event_id, foreign_event_storage … | 49; exact complement in JSON |
| historical_guards:v1:historical_payload |  | 4: forged_schema_valid_payload, forged_schema_invalid_payload, unknown_historical_version … | 54; exact complement in JSON |
| historical_guards:v1:original_receipt |  | 27: forged_receipt_event, foreign_receipt_storage, forged_original_result … | 31; exact complement in JSON |
| historical_guards:v1:original_source |  | 3: forged_source_selection, foreign_source_storage, typed_source_generation | 55; exact complement in JSON |
| historical_guards:v1:original_admission |  | 1: not_valid_when_written | 57; exact complement in JSON |
| historical_guards:v1:current_permission |  | 3: current_permission_denied, current_membership_denied, current_source_access_denied | 55; exact complement in JSON |
| historical_guards:v1:source_retained |  | 1: source_deleted | 57; exact complement in JSON |
| historical_guards:v1:current_withdrawal |  | 1: current_withdrawal | 57; exact complement in JSON |
| historical_guards:v1:history_shape |  | 1: wrong_payload_container | 57; exact complement in JSON |

### panel.undocked — named duplicate matrices

| Removed set | Negatives that flip | Other negatives still rejected |
|---|---|---|
| writer_policy_errors:replay-only rejection (duplicates unsupported-policy rejection) + writer_policy_errors:[] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4: panel.undocked:protocol_replay_policy, panel.undocked:policy_projector_replay_only, panel.undocked:policy_unknown … | 261; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'original identity mismatch' | 9: panel.undocked:forged_event_id, panel.undocked:arbitrary_operation_digest, panel.undocked:operation_schema_only … | 256; exact complement in JSON |
| operation_errors:schema validation + operation_errors:'frozen command digest mismatch' | 11: panel.undocked:arbitrary_request_digest, panel.undocked:operation_schema_only, panel.undocked:representation_request_digest_integer … | 254; exact complement in JSON |
| checkpoint_errors:'checkpoint scope mismatch' + checkpoint_errors:'foreign original-event context: ' + field | 8: panel.undocked:checkpoint_partition_only, panel.undocked:checkpoint_original_storage, panel.undocked:executed/checkpoint_errors/33 … | 257; exact complement in JSON |

### panel.undocked — field/input-domain matrix

| Schema or predicate | Field/rule | Named duplicates | Negatives that flip | Other negatives still rejected |
|---|---|---|---:|---:|
| Plans/event_payloads/panel_undocked_v2.schema.json | type |  | 10 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/server_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/scope_partition/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/app_session_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/interaction_transaction_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/actor_ref/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/correlation_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/idempotency_key/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/window_id/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/command_result_ref/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/project_id/type |  | 8 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/workspace_tab_id/type |  | 8 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/panel_id/const |  | 12 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/command_id/const |  | 12 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/origin/enum |  | 12 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/source_host/const |  | 12 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/target_host/const |  | 12 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/prior_host_revision/type |  | 15 | 4 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/prior_host_revision/maximum |  | 3 | 16 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/prior_host_revision/minimum |  | 1 | 18 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/new_host_revision/type |  | 14 | 6 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/new_host_revision/minimum |  | 2 | 18 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/new_host_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/new_host_revision/maximum |  | 3 | 17 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/settled_at_utc/format |  | 28 | 9 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/settled_at_utc/type |  | 9 | 28 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/settled_only/const |  | 11 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/preview_state_included/const |  | 11 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/persisted/const |  | 11 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/host_state_persisted/const |  | 11 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/workspace_layout_changed_coemitted/const |  | 11 | 0 |
| Plans/event_payloads/panel_undocked_v2.schema.json | properties/workspace_layout_event_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/server_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/scope_partition/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/operation_digest/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/event_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/idempotency_key/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/request_digest/minLength/pattern | minLength + pattern | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/request_digest/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/project_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/storage_instance_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/server_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/scope_partition/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/interaction_transaction_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/actor_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/correlation_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/idempotency_key/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/window_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/command_result_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/schema_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/schema_version/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/project_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/workspace_tab_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/panel_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/command_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/origin/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/source_host/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/target_host/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/prior_host_revision/type |  | 15 | 4 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/prior_host_revision/maximum |  | 3 | 16 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/prior_host_revision/minimum |  | 1 | 18 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/new_host_revision/type |  | 14 | 6 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/new_host_revision/minimum |  | 2 | 18 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/new_host_revision/minimum/type | minimum + type | 17 | 3 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/new_host_revision/maximum |  | 3 | 17 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/settled_at_utc/format |  | 28 | 9 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/settled_at_utc/type |  | 9 | 28 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/settled_only/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/preview_state_included/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/persisted/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/host_state_persisted/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/workspace_layout_changed_coemitted/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/payload/properties/workspace_layout_event_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/prior_host_snapshot/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/prior_host_snapshot/properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/prior_host_snapshot/properties/host_revision/type |  | 15 | 4 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/prior_host_snapshot/properties/host_revision/maximum |  | 3 | 16 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/prior_host_snapshot/properties/host_revision/minimum |  | 1 | 18 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/prior_host_snapshot/properties/host/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/prior_host_snapshot/properties/window_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/candidate_host_snapshot/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/candidate_host_snapshot/properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/candidate_host_snapshot/properties/host_revision/type |  | 15 | 4 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/candidate_host_snapshot/properties/host_revision/maximum |  | 3 | 16 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/candidate_host_snapshot/properties/host_revision/minimum |  | 1 | 18 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/candidate_host_snapshot/properties/host/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/candidate_host_snapshot/properties/window_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/owner_commit_ref/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/result_ref/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/dispatch_receipt_ref/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_append_result_ref/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/storage_instance_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/server_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/project_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/workspace_tab_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/scope_partition/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/app_session_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/actor_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/correlation_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/idempotency_key/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/origin/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/command_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/panel_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/prior_host_revision/type |  | 15 | 4 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/prior_host_revision/maximum |  | 3 | 16 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/prior_host_revision/minimum |  | 1 | 18 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/expected_layout_revision/type |  | 14 | 4 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/expected_layout_revision/maximum |  | 3 | 15 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/expected_layout_revision/minimum |  | 1 | 17 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/current_host/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | properties/original_command/properties/target_window/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/0/if/properties/state/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/0/then/properties/owner_commit_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/0/then/properties/result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/0/then/properties/dispatch_receipt_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/0/then/properties/original_append_result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/1/if/properties/state/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/1/then/properties/owner_commit_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/1/then/properties/result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/1/then/properties/dispatch_receipt_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/1/then/properties/original_append_result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/2/if/properties/state/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/2/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/2/then/properties/result_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/2/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/2/then/properties/original_append_result_ref/const |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/3/if/properties/state/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/3/then/properties/owner_commit_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/3/then/properties/result_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/3/then/properties/dispatch_receipt_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_operation.schema.json | allOf/3/then/properties/original_append_result_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/schema_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/schema_version/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/storage_instance_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/project_id/type |  | 8 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/consumer_id/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/consumer_version/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/publication_id/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/state/enum |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_key/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/checkpoint_ref/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/generation_id/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/generation_id/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/generation_anchor_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_revision/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/frontier_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/index_dataset_name/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/type |  | 10 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/format |  | 7 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/storage_instance_id/type |  | 9 | 7 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_ref/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/current_bytes_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_ref/const |  | 12 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/pattern |  | 3 | 9 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/index_read_token/properties/source_selection/properties/retired_inputs_sha256/type |  | 9 | 3 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/through_sequence_id/type |  | 15 | 2 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/through_sequence_id/maximum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/through_sequence_id/minimum |  | 1 | 16 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/last_event_id/anyOf/0/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/last_event_id/anyOf/1/type |  | 11 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/scope_partition/type |  | 9 | 0 |
| Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json | properties/server_id/type |  | 9 | 0 |
| semantic_numbers | recursive exact input domain |  | 6 | 25 |
| semantic_formats | recursive exact input domain |  | 25 | 6 |
| history_shape | navigation types/presence |  | 46 | 0 |

## Parser and instant implementation guards

Additional 35 rows pass. [Exact evidence](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/parser-format-guards.json), SHA-256 `00cc18ec8c276aa0ba5b108e015400aa7ecfd47b23e59f7771b7eb378f954cb2`.

| Family | Removed guard/set | Negatives that flip | Other negatives still rejected |
|---|---|---|---|
| alert.acknowledged | instant grammar | 2026-11-04, 2026-11-04T18:00:00, 2026-11-04 18:00:00Z … (8) | 26 |
| alert.acknowledged | instant calendar | 2026-13-04T18:00:00Z, 2026-00-04T18:00:00Z, 2026-11-00T18:00:00Z … (6) | 28 |
| alert.acknowledged | instant grammar+calendar+leap | false, 0,  … (25) | 9 |
| alert.acknowledged | integer_token | -0 (1) | 5 |
| alert.acknowledged | invalid_constant | NaN, Infinity, -Infinity (3) | 3 |
| alert.dismissed | instant grammar | 2026-11-04, 2026-11-04T18:00:00, 2026-11-04 18:00:00Z … (8) | 26 |
| alert.dismissed | instant calendar | 2026-13-04T18:00:00Z, 2026-00-04T18:00:00Z, 2026-11-00T18:00:00Z … (6) | 28 |
| alert.dismissed | instant grammar+calendar+leap | false, 0,  … (25) | 9 |
| alert.dismissed | integer_token | -0 (1) | 5 |
| alert.dismissed | invalid_constant | NaN, Infinity, -Infinity (3) | 3 |
| alert.rule_muted | instant grammar | 2026-11-04, 2026-11-04T18:00:00, 2026-11-04 18:00:00Z … (8) | 26 |
| alert.rule_muted | instant calendar | 2026-13-04T18:00:00Z, 2026-00-04T18:00:00Z, 2026-11-00T18:00:00Z … (6) | 28 |
| alert.rule_muted | instant grammar+calendar+leap | false, 0,  … (25) | 9 |
| alert.rule_muted | integer_token | -0 (1) | 5 |
| alert.rule_muted | invalid_constant | NaN, Infinity, -Infinity (3) | 3 |
| alert.snoozed | instant grammar | 2026-11-04, 2026-11-04T18:00:00, 2026-11-04 18:00:00Z … (8) | 26 |
| alert.snoozed | instant calendar | 2026-13-04T18:00:00Z, 2026-00-04T18:00:00Z, 2026-11-00T18:00:00Z … (6) | 28 |
| alert.snoozed | instant grammar+calendar+leap | false, 0,  … (25) | 9 |
| alert.snoozed | integer_token | -0 (1) | 5 |
| alert.snoozed | invalid_constant | NaN, Infinity, -Infinity (3) | 3 |
| concern.created | instant grammar | 2026-11-04, 2026-11-04T18:00:00, 2026-11-04 18:00:00Z … (8) | 26 |
| concern.created | instant calendar | 2026-13-04T18:00:00Z, 2026-00-04T18:00:00Z, 2026-11-00T18:00:00Z … (6) | 28 |
| concern.created | instant grammar+calendar+leap | false, 0,  … (25) | 9 |
| concern.created | integer_token | -0 (1) | 5 |
| concern.created | invalid_constant | NaN, Infinity, -Infinity (3) | 3 |
| panel.redocked | instant grammar | 2026-11-04, 2026-11-04T18:00:00, 2026-11-04 18:00:00Z … (8) | 26 |
| panel.redocked | instant calendar | 2026-13-04T18:00:00Z, 2026-00-04T18:00:00Z, 2026-11-00T18:00:00Z … (6) | 28 |
| panel.redocked | instant grammar+calendar+leap | false, 0,  … (25) | 9 |
| panel.redocked | integer_token | -0 (1) | 5 |
| panel.redocked | invalid_constant | NaN, Infinity, -Infinity (3) | 3 |
| panel.undocked | instant grammar | 2026-11-04, 2026-11-04T18:00:00, 2026-11-04 18:00:00Z … (8) | 26 |
| panel.undocked | instant calendar | 2026-13-04T18:00:00Z, 2026-00-04T18:00:00Z, 2026-11-00T18:00:00Z … (6) | 28 |
| panel.undocked | instant grammar+calendar+leap | false, 0,  … (25) | 9 |
| panel.undocked | integer_token | -0 (1) | 5 |
| panel.undocked | invalid_constant | NaN, Infinity, -Infinity (3) | 3 |
