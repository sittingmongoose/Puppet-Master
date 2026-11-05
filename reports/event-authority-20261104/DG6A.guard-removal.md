# DG6A round 6 — serial guard-removal table

Code: `7a56f2132d37b48085cb5e39c94c4f4e23da7f97`. One family and one guard or named duplicate set at a time. No production guard is disabled. Mutants exist only in memory and are restored in `finally`.

**493/493 rows pass**, 1822 current predicate negatives, 513 historical negatives, 26 named duplicate-set matrices. Unreachable snooze/rule branches are proved by their own family, never counted as passes in another family.

Current cases include all isolated fixtures, every negative payload/operation/checkpoint collection, and actual generated predicate calls captured from each normal family checker. Retained history uses the separate composed matrix across nine versions. Cursor classification has exact-domain guard witnesses plus composed-reader refusal/boundary tests. Checkpoint schema required/additionalProperties rules are removed individually through the full checkpoint checker.

Every row lists the exact flipping set and complement in its hashed JSON. The examples below are abbreviated for readability. A remaining rejection must retain its diagnostic or have the named duplicate proof in that same JSON; exceptions and unknown masked cases fail the audit.

| Family | Guard rows | Current negatives | Duplicate witnesses | Set matrices | Evidence SHA-256 |
|---|---:|---:|---:|---:|---|
| alert.acknowledged | 65 | 247 | 8 | 3 | `56a22bdccad2dbf30502a231397df61d8c25c1e8feeafd3b1d7e6711abcb9416` |
| alert.dismissed | 65 | 247 | 8 | 3 | `fb8090cef8bad7b20e8f0bf1e415a55cc441c9361749a44f18daa5ca077dc107` |
| alert.rule_muted | 67 | 248 | 8 | 3 | `3d4e49b2096387b5e92eac6e87b6a7678b7acc57291093b404ba772a978667ba` |
| alert.snoozed | 68 | 261 | 8 | 3 | `3b422b078b15a4034180f75dbf30616eacbd27f3ff39e4a12e11e97fb8626597` |
| concern.created | 66 | 291 | 14 | 5 | `f6e8780d1d927db679f0fc25eeecb50d64768db9e5fe01ebc2e99049009dfb3b` |
| panel.redocked | 81 | 264 | 10 | 5 | `9e41b671ca018b78460307a42e5c612cfc15b5475035620f0ff6f865e8464621` |
| panel.undocked | 81 | 264 | 9 | 4 | `c46083368eccc8dc96bbcec6f11bda494249392d17489fe0fed37bb9faa0833d` |

| Family/version | Guard (`function:line`) | Negatives that flip | Negatives that stay rejected | Named duplicate |
|---|---|---|---|---|
| alert.acknowledged/current | checkpoint schema:dict additionalProperties | 2: alert.acknowledged:checkpoint_partition_only, alert.acknowledged:checkpoint_schema_only | 245 | none |
| alert.acknowledged/current | checkpoint schema:dict properties/index_read_token/additionalProperties | 2: alert.acknowledged:checkpoint_cases/persisted_snapshot_forbidden, alert.acknowledged:checkpoint_cases/otherwise_valid_token_with_snapshot | 245 | none |
| alert.acknowledged/current | checkpoint schema:dict required | 1: alert.acknowledged:checkpoint_cases/missing_token | 246 | none |
| alert.acknowledged/current | errors:25 schema validation | 9: alert.acknowledged:payload_extra_secret_field, alert.acknowledged:payload_missing_identity | 238 | none |
| alert.acknowledged/current | errors:29 'non-successor' | 6: alert.acknowledged:payload_no_change_revision, alert.acknowledged:payload_skipped_revision | 241 | none |
| alert.acknowledged/current | errors:31 'uncommitted/stale/refused' | 14: alert.acknowledged:payload_stale_currentness, alert.acknowledged:payload_refused | 233 | none |
| alert.acknowledged/current | errors:33 'invalid protection proof' | 1: alert.acknowledged:typed_payload_guard_protected | 246 | none |
| alert.acknowledged/current | operation_errors:78 schema validation | 3: alert.acknowledged:operation_schema_only, alert.acknowledged:operation_cases/settled_without_original_receipt | 244 | none |
| alert.acknowledged/current | operation_errors:80 'operation exceeds 16384 encoded bytes' | 3: alert.acknowledged:operation_bytes_only, alert.acknowledged:executed/operation_errors/10 | 244 | none |
| alert.acknowledged/current | operation_errors:88 'operation identity digest mismatch' | 1: alert.acknowledged:arbitrary_operation_digest | 246 | none |
| alert.acknowledged/current | operation_errors:90 'event identity mismatch' | 1: alert.acknowledged:forged_event_id | 246 | none |
| alert.acknowledged/current | operation_errors:92 'frozen command digest mismatch' | 4: alert.acknowledged:arbitrary_request_digest, alert.acknowledged:representation_request_digest_uppercase | 243 | none |
| alert.acknowledged/current | operation_errors:95 'original command/payload field presence' | 1: alert.acknowledged:optional_payload_without_command | 246 | none |
| alert.acknowledged/current | operation_errors:103 'non-successor' | 1: alert.acknowledged:non_successor | 246 | none |
| alert.acknowledged/current | operation_errors:98 'original command/payload ' + key | 8: alert.acknowledged:command_join_project_id, alert.acknowledged:command_join_alert_id | 239 | none |
| alert.acknowledged/current | operation_errors:101 'operation/payload ' + key | 2: alert.acknowledged:scope_join_project_id, alert.acknowledged:scope_join_idempotency_key | 245 | none |
| alert.acknowledged/current | operation_errors:115 name + ' owner ' + field | 10: alert.acknowledged:prior_owner_state_project_id, alert.acknowledged:prior_owner_state_alert_id | 237 | none |
| alert.acknowledged/current | operation_errors:127 'candidate owner ' + field | 5: alert.acknowledged:prior_owner_state_inbox_visible, alert.acknowledged:prior_owner_state_snooze_until | 242 | none |
| alert.acknowledged/current | protocol_errors:151 'wrong original receipt' | 1: alert.acknowledged:protocol_receipt_event_id | 246 | none |
| alert.acknowledged/current | protocol_errors:153 'idempotency_conflict' | 2: alert.acknowledged:retry_retry_payload, alert.acknowledged:retry_retry_command | 245 | none |
| alert.acknowledged/current | protocol_errors:149 field | 8: alert.acknowledged:protocol_admitted, alert.acknowledged:protocol_allowed | 239 | none |
| alert.acknowledged/current | checkpoint_errors:224 schema validation | 9: alert.acknowledged:checkpoint_partition_only, alert.acknowledged:checkpoint_schema_only | 238 | none |
| alert.acknowledged/current | checkpoint_errors:226 'checkpoint exceeds 16384 encoded bytes' | 2: alert.acknowledged:checkpoint_bytes_only, alert.acknowledged:executed/checkpoint_errors/19 | 245 | none |
| alert.acknowledged/current | checkpoint_errors:230 'foreign Storage token' | 3: alert.acknowledged:checkpoint_token_storage, alert.acknowledged:checkpoint_cases/foreign_storage_token | 244 | none |
| alert.acknowledged/current | checkpoint_errors:233 'foreign original-event context: ' + field | 1: alert.acknowledged:checkpoint_original_storage | 246 | none |
| alert.acknowledged/current | profile_errors:252 ['missing profile'] | 1: alert.acknowledged:profile_missing | 246 | none |
| alert.acknowledged/current | profile_errors:255 ['wrong physical binding'] | 2: alert.acknowledged:profile_redb_file_derived, alert.acknowledged:profile_storage_group_wrong | 245 | none |
| alert.acknowledged/current | profile_errors:258 ['non-integer maximum'] | 2: alert.acknowledged:typed_storage_maximum_boolean, alert.acknowledged:typed_storage_maximum_float | 245 | none |
| alert.acknowledged/current | profile_errors:260 ['missing/oversized maximum'] | 2: alert.acknowledged:profile_max_value_bytes_0, alert.acknowledged:profile_max_value_bytes_16385 | 245 | none |
| alert.acknowledged/current | writer_policy_errors:264 replay-only rejection (duplicates unsupported-policy rejection) | 4: alert.acknowledged:protocol_replay_policy, alert.acknowledged:policy_projector_replay_only | 243 | [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| alert.acknowledged/current | writer_policy_errors:266 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 1: alert.acknowledged:policy_unknown | 246 | none |
| alert.acknowledged/current | schema_ref_errors:62 ValueError('target is not a schema') | 1: alert.acknowledged:ref_non_schema | 246 | none |
| alert.acknowledged/current | schema_ref_errors:64 'unresolved schema reference: ' + str(ref) | 4: alert.acknowledged:ref_dangling, alert.acknowledged:ref_non_schema | 243 | none |
| alert.acknowledged/current | schema_ref_errors:57 ValueError('unsupported non-local reference') | 1: alert.acknowledged:ref_external | 246 | none |
| alert.acknowledged/current | history_page:322 cursor_errors(after, frontier) | 1: alert.acknowledged:pager_cursor | 246 | none |
| alert.acknowledged/current | history_page:324 len(packed(response([], after))) > 16384 | 1: alert.acknowledged:pager_metadata | 246 | none |
| alert.acknowledged/current | history_page:329 not after < seq <= frontier | 2: alert.acknowledged:pager_past, alert.acknowledged:pager_future | 245 | none |
| alert.acknowledged/current | history_page:331 exact event family and Project filter | 2: alert.acknowledged:pager_foreign_family, alert.acknowledged:pager_foreign_project | 245 | none |
| alert.acknowledged/current | history_page:333 scanned == 256 or len(candidate) > 64 | 2: alert.acknowledged:pager_scan, alert.acknowledged:pager_matches | 245 | none |
| alert.acknowledged/current | history_page:335 len(packed(response(candidate, seq))) > 16384 | 2: alert.acknowledged:pager_single_ref, alert.acknowledged:pager_response_bytes | 245 | none |
| alert.acknowledged/current | history_page:336 not result | 1: alert.acknowledged:pager_single_ref | 246 | none |
| alert.acknowledged/current | check_schema:74 schema metaschema validity | 1: alert.acknowledged:schema_metaschema | 246 | none |
| alert.acknowledged/current | check_schema:75 eager resolution of every schema reference | 1: alert.acknowledged:schema_unused_ref | 246 | none |
| alert.acknowledged/current | exact_value:416 exact JSON value type | 1: alert.acknowledged:source_comparison_type | 246 | none |
| alert.acknowledged/current | exact_value:422 scalar value | 90: alert.acknowledged:source_comparison_object_value, alert.acknowledged:source_comparison_array_value | 157 | none |
| alert.acknowledged/current | exact_value:419 object keys | 1: alert.acknowledged:source_comparison_object_keys | 246 | none |
| alert.acknowledged/current | exact_value:419 object child values | 84: alert.acknowledged:source_comparison_object_value, alert.acknowledged:committed_resolved_event_type | 163 | none |
| alert.acknowledged/current | exact_value:421 array length | 1: alert.acknowledged:source_comparison_array_length | 246 | none |
| alert.acknowledged/current | exact_value:421 array child values | 1: alert.acknowledged:source_comparison_array_value | 246 | none |
| alert.acknowledged/current | append_result_errors:170 'resolved original append evidence mismatch' | 82: alert.acknowledged:committed_resolved_event_type, alert.acknowledged:committed_resolved_event_id | 165 | none |
| alert.acknowledged/current | append_result_errors:177 'foreign original append family/scope/identity' | 4: alert.acknowledged:append_original_event_id, alert.acknowledged:append_original_storage_instance_id | 243 | none |
| alert.acknowledged/current | append_result_errors:180 'foreign original append-result reference' | 1: alert.acknowledged:foreign_original_append_result_ref | 246 | none |
| alert.acknowledged/current | append_result_errors:182 'unsettled operation carries append-result reference' | 1: alert.acknowledged:committed_foreign_append_reference | 246 | none |
| alert.acknowledged/current | cursor_errors:196 ['invalid unsigned cursor/frontier'] | 28: alert.acknowledged:pager_cursor, alert.acknowledged:cursor_after_0 | 219 | none |
| alert.acknowledged/current | historical_guards:dict checkpoint_publication | 2: withdrawn_checkpoint, staged_checkpoint | 55 | none |
| alert.acknowledged/current | historical_guards:dict checkpoint_original | 4: forged_checkpoint_publication, foreign_checkpoint_storage | 53 | none |
| alert.acknowledged/current | historical_guards:dict event_publication | 2: withdrawn_event, staged_event | 55 | none |
| alert.acknowledged/current | historical_guards:dict event_original | 9: forged_event_ref, forged_event_id | 48 | none |
| alert.acknowledged/current | historical_guards:dict historical_payload | 4: forged_schema_valid_payload, forged_schema_invalid_payload | 53 | none |
| alert.acknowledged/current | historical_guards:dict original_receipt | 27: forged_receipt_event, foreign_receipt_storage | 30 | none |
| alert.acknowledged/current | historical_guards:dict original_source | 3: forged_source_selection, foreign_source_storage | 54 | none |
| alert.acknowledged/current | historical_guards:dict original_admission | 1: not_valid_when_written | 56 | none |
| alert.acknowledged/current | historical_guards:dict current_permission | 3: current_permission_denied, current_membership_denied | 54 | none |
| alert.acknowledged/current | historical_guards:dict source_retained | 1: source_deleted | 56 | none |
| alert.acknowledged/current | historical_guards:dict current_withdrawal | 1: current_withdrawal | 56 | none |
| alert.dismissed/current | checkpoint schema:dict additionalProperties | 2: alert.dismissed:checkpoint_partition_only, alert.dismissed:checkpoint_schema_only | 245 | none |
| alert.dismissed/current | checkpoint schema:dict properties/index_read_token/additionalProperties | 2: alert.dismissed:checkpoint_cases/persisted_snapshot_forbidden, alert.dismissed:checkpoint_cases/otherwise_valid_token_with_snapshot | 245 | none |
| alert.dismissed/current | checkpoint schema:dict required | 1: alert.dismissed:checkpoint_cases/missing_token | 246 | none |
| alert.dismissed/current | errors:25 schema validation | 9: alert.dismissed:payload_extra_secret_field, alert.dismissed:payload_missing_identity | 238 | none |
| alert.dismissed/current | errors:29 'non-successor' | 6: alert.dismissed:payload_no_change_revision, alert.dismissed:payload_skipped_revision | 241 | none |
| alert.dismissed/current | errors:31 'uncommitted/stale/refused' | 14: alert.dismissed:payload_stale_currentness, alert.dismissed:payload_refused | 233 | none |
| alert.dismissed/current | errors:33 'invalid protection proof' | 1: alert.dismissed:typed_payload_guard_protected | 246 | none |
| alert.dismissed/current | operation_errors:78 schema validation | 3: alert.dismissed:operation_schema_only, alert.dismissed:operation_cases/settled_without_original_receipt | 244 | none |
| alert.dismissed/current | operation_errors:80 'operation exceeds 16384 encoded bytes' | 3: alert.dismissed:operation_bytes_only, alert.dismissed:executed/operation_errors/10 | 244 | none |
| alert.dismissed/current | operation_errors:88 'operation identity digest mismatch' | 1: alert.dismissed:arbitrary_operation_digest | 246 | none |
| alert.dismissed/current | operation_errors:90 'event identity mismatch' | 1: alert.dismissed:forged_event_id | 246 | none |
| alert.dismissed/current | operation_errors:92 'frozen command digest mismatch' | 4: alert.dismissed:arbitrary_request_digest, alert.dismissed:representation_request_digest_uppercase | 243 | none |
| alert.dismissed/current | operation_errors:95 'original command/payload field presence' | 1: alert.dismissed:optional_payload_without_command | 246 | none |
| alert.dismissed/current | operation_errors:103 'non-successor' | 1: alert.dismissed:non_successor | 246 | none |
| alert.dismissed/current | operation_errors:98 'original command/payload ' + key | 8: alert.dismissed:command_join_project_id, alert.dismissed:command_join_alert_id | 239 | none |
| alert.dismissed/current | operation_errors:101 'operation/payload ' + key | 2: alert.dismissed:scope_join_project_id, alert.dismissed:scope_join_idempotency_key | 245 | none |
| alert.dismissed/current | operation_errors:115 name + ' owner ' + field | 10: alert.dismissed:prior_owner_state_project_id, alert.dismissed:prior_owner_state_alert_id | 237 | none |
| alert.dismissed/current | operation_errors:127 'candidate owner ' + field | 5: alert.dismissed:prior_owner_state_unread, alert.dismissed:prior_owner_state_snooze_until | 242 | none |
| alert.dismissed/current | protocol_errors:151 'wrong original receipt' | 1: alert.dismissed:protocol_receipt_event_id | 246 | none |
| alert.dismissed/current | protocol_errors:153 'idempotency_conflict' | 2: alert.dismissed:retry_retry_payload, alert.dismissed:retry_retry_command | 245 | none |
| alert.dismissed/current | protocol_errors:149 field | 8: alert.dismissed:protocol_admitted, alert.dismissed:protocol_allowed | 239 | none |
| alert.dismissed/current | checkpoint_errors:224 schema validation | 9: alert.dismissed:checkpoint_partition_only, alert.dismissed:checkpoint_schema_only | 238 | none |
| alert.dismissed/current | checkpoint_errors:226 'checkpoint exceeds 16384 encoded bytes' | 2: alert.dismissed:checkpoint_bytes_only, alert.dismissed:executed/checkpoint_errors/19 | 245 | none |
| alert.dismissed/current | checkpoint_errors:230 'foreign Storage token' | 3: alert.dismissed:checkpoint_token_storage, alert.dismissed:checkpoint_cases/foreign_storage_token | 244 | none |
| alert.dismissed/current | checkpoint_errors:233 'foreign original-event context: ' + field | 1: alert.dismissed:checkpoint_original_storage | 246 | none |
| alert.dismissed/current | profile_errors:252 ['missing profile'] | 1: alert.dismissed:profile_missing | 246 | none |
| alert.dismissed/current | profile_errors:255 ['wrong physical binding'] | 2: alert.dismissed:profile_redb_file_derived, alert.dismissed:profile_storage_group_wrong | 245 | none |
| alert.dismissed/current | profile_errors:258 ['non-integer maximum'] | 2: alert.dismissed:typed_storage_maximum_boolean, alert.dismissed:typed_storage_maximum_float | 245 | none |
| alert.dismissed/current | profile_errors:260 ['missing/oversized maximum'] | 2: alert.dismissed:profile_max_value_bytes_0, alert.dismissed:profile_max_value_bytes_16385 | 245 | none |
| alert.dismissed/current | writer_policy_errors:264 replay-only rejection (duplicates unsupported-policy rejection) | 4: alert.dismissed:protocol_replay_policy, alert.dismissed:policy_projector_replay_only | 243 | [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| alert.dismissed/current | writer_policy_errors:266 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 1: alert.dismissed:policy_unknown | 246 | none |
| alert.dismissed/current | schema_ref_errors:62 ValueError('target is not a schema') | 1: alert.dismissed:ref_non_schema | 246 | none |
| alert.dismissed/current | schema_ref_errors:64 'unresolved schema reference: ' + str(ref) | 4: alert.dismissed:ref_dangling, alert.dismissed:ref_non_schema | 243 | none |
| alert.dismissed/current | schema_ref_errors:57 ValueError('unsupported non-local reference') | 1: alert.dismissed:ref_external | 246 | none |
| alert.dismissed/current | history_page:322 cursor_errors(after, frontier) | 1: alert.dismissed:pager_cursor | 246 | none |
| alert.dismissed/current | history_page:324 len(packed(response([], after))) > 16384 | 1: alert.dismissed:pager_metadata | 246 | none |
| alert.dismissed/current | history_page:329 not after < seq <= frontier | 2: alert.dismissed:pager_past, alert.dismissed:pager_future | 245 | none |
| alert.dismissed/current | history_page:331 exact event family and Project filter | 2: alert.dismissed:pager_foreign_family, alert.dismissed:pager_foreign_project | 245 | none |
| alert.dismissed/current | history_page:333 scanned == 256 or len(candidate) > 64 | 2: alert.dismissed:pager_scan, alert.dismissed:pager_matches | 245 | none |
| alert.dismissed/current | history_page:335 len(packed(response(candidate, seq))) > 16384 | 2: alert.dismissed:pager_single_ref, alert.dismissed:pager_response_bytes | 245 | none |
| alert.dismissed/current | history_page:336 not result | 1: alert.dismissed:pager_single_ref | 246 | none |
| alert.dismissed/current | check_schema:74 schema metaschema validity | 1: alert.dismissed:schema_metaschema | 246 | none |
| alert.dismissed/current | check_schema:75 eager resolution of every schema reference | 1: alert.dismissed:schema_unused_ref | 246 | none |
| alert.dismissed/current | exact_value:416 exact JSON value type | 1: alert.dismissed:source_comparison_type | 246 | none |
| alert.dismissed/current | exact_value:422 scalar value | 90: alert.dismissed:source_comparison_object_value, alert.dismissed:source_comparison_array_value | 157 | none |
| alert.dismissed/current | exact_value:419 object keys | 1: alert.dismissed:source_comparison_object_keys | 246 | none |
| alert.dismissed/current | exact_value:419 object child values | 84: alert.dismissed:source_comparison_object_value, alert.dismissed:committed_resolved_event_type | 163 | none |
| alert.dismissed/current | exact_value:421 array length | 1: alert.dismissed:source_comparison_array_length | 246 | none |
| alert.dismissed/current | exact_value:421 array child values | 1: alert.dismissed:source_comparison_array_value | 246 | none |
| alert.dismissed/current | append_result_errors:170 'resolved original append evidence mismatch' | 82: alert.dismissed:committed_resolved_event_type, alert.dismissed:committed_resolved_event_id | 165 | none |
| alert.dismissed/current | append_result_errors:177 'foreign original append family/scope/identity' | 4: alert.dismissed:append_original_event_id, alert.dismissed:append_original_storage_instance_id | 243 | none |
| alert.dismissed/current | append_result_errors:180 'foreign original append-result reference' | 1: alert.dismissed:foreign_original_append_result_ref | 246 | none |
| alert.dismissed/current | append_result_errors:182 'unsettled operation carries append-result reference' | 1: alert.dismissed:committed_foreign_append_reference | 246 | none |
| alert.dismissed/current | cursor_errors:196 ['invalid unsigned cursor/frontier'] | 28: alert.dismissed:pager_cursor, alert.dismissed:cursor_after_0 | 219 | none |
| alert.dismissed/current | historical_guards:dict checkpoint_publication | 2: withdrawn_checkpoint, staged_checkpoint | 55 | none |
| alert.dismissed/current | historical_guards:dict checkpoint_original | 4: forged_checkpoint_publication, foreign_checkpoint_storage | 53 | none |
| alert.dismissed/current | historical_guards:dict event_publication | 2: withdrawn_event, staged_event | 55 | none |
| alert.dismissed/current | historical_guards:dict event_original | 9: forged_event_ref, forged_event_id | 48 | none |
| alert.dismissed/current | historical_guards:dict historical_payload | 4: forged_schema_valid_payload, forged_schema_invalid_payload | 53 | none |
| alert.dismissed/current | historical_guards:dict original_receipt | 27: forged_receipt_event, foreign_receipt_storage | 30 | none |
| alert.dismissed/current | historical_guards:dict original_source | 3: forged_source_selection, foreign_source_storage | 54 | none |
| alert.dismissed/current | historical_guards:dict original_admission | 1: not_valid_when_written | 56 | none |
| alert.dismissed/current | historical_guards:dict current_permission | 3: current_permission_denied, current_membership_denied | 54 | none |
| alert.dismissed/current | historical_guards:dict source_retained | 1: source_deleted | 56 | none |
| alert.dismissed/current | historical_guards:dict current_withdrawal | 1: current_withdrawal | 56 | none |
| alert.rule_muted/current | checkpoint schema:dict additionalProperties | 2: alert.rule_muted:checkpoint_partition_only, alert.rule_muted:checkpoint_schema_only | 246 | none |
| alert.rule_muted/current | checkpoint schema:dict properties/index_read_token/additionalProperties | 2: alert.rule_muted:checkpoint_cases/persisted_snapshot_forbidden, alert.rule_muted:checkpoint_cases/otherwise_valid_token_with_snapshot | 246 | none |
| alert.rule_muted/current | checkpoint schema:dict required | 1: alert.rule_muted:checkpoint_cases/missing_token | 247 | none |
| alert.rule_muted/current | errors:25 schema validation | 9: alert.rule_muted:payload_extra_secret_field, alert.rule_muted:payload_missing_identity | 239 | none |
| alert.rule_muted/current | errors:29 'non-successor' | 6: alert.rule_muted:payload_no_change_revision, alert.rule_muted:payload_skipped_revision | 242 | none |
| alert.rule_muted/current | errors:31 'uncommitted/stale/refused' | 14: alert.rule_muted:payload_stale_currentness, alert.rule_muted:payload_refused | 234 | none |
| alert.rule_muted/current | errors:33 'invalid protection proof' | 1: alert.rule_muted:typed_payload_guard_protected | 247 | none |
| alert.rule_muted/current | errors:37 'protected interruption' | 3: alert.rule_muted:payload_protected_interruption, alert.rule_muted:payload_cases/protected_interruption | 245 | none |
| alert.rule_muted/current | operation_errors:78 schema validation | 3: alert.rule_muted:operation_schema_only, alert.rule_muted:operation_cases/settled_without_original_receipt | 245 | none |
| alert.rule_muted/current | operation_errors:80 'operation exceeds 16384 encoded bytes' | 3: alert.rule_muted:operation_bytes_only, alert.rule_muted:executed/operation_errors/11 | 245 | none |
| alert.rule_muted/current | operation_errors:88 'operation identity digest mismatch' | 1: alert.rule_muted:arbitrary_operation_digest | 247 | none |
| alert.rule_muted/current | operation_errors:90 'event identity mismatch' | 1: alert.rule_muted:forged_event_id | 247 | none |
| alert.rule_muted/current | operation_errors:92 'frozen command digest mismatch' | 4: alert.rule_muted:arbitrary_request_digest, alert.rule_muted:representation_request_digest_uppercase | 244 | none |
| alert.rule_muted/current | operation_errors:95 'original command/payload field presence' | 1: alert.rule_muted:optional_payload_without_command | 247 | none |
| alert.rule_muted/current | operation_errors:103 'non-successor' | 1: alert.rule_muted:non_successor | 247 | none |
| alert.rule_muted/current | operation_errors:98 'original command/payload ' + key | 8: alert.rule_muted:command_join_project_id, alert.rule_muted:command_join_alert_rule_id | 240 | none |
| alert.rule_muted/current | operation_errors:101 'operation/payload ' + key | 2: alert.rule_muted:scope_join_project_id, alert.rule_muted:scope_join_idempotency_key | 246 | none |
| alert.rule_muted/current | operation_errors:118 'candidate owner root_cause_ref' | 2: alert.rule_muted:prior_owner_state_root_cause_ref, alert.rule_muted:candidate_owner_state_root_cause_ref | 246 | none |
| alert.rule_muted/current | operation_errors:120 'candidate owner mute_expires_at' | 1: alert.rule_muted:candidate_owner_state_mute_expires_at | 247 | none |
| alert.rule_muted/current | operation_errors:115 name + ' owner ' + field | 10: alert.rule_muted:prior_owner_state_project_id, alert.rule_muted:prior_owner_state_alert_rule_id | 238 | none |
| alert.rule_muted/current | protocol_errors:151 'wrong original receipt' | 1: alert.rule_muted:protocol_receipt_event_id | 247 | none |
| alert.rule_muted/current | protocol_errors:153 'idempotency_conflict' | 2: alert.rule_muted:retry_retry_payload, alert.rule_muted:retry_retry_command | 246 | none |
| alert.rule_muted/current | protocol_errors:149 field | 8: alert.rule_muted:protocol_admitted, alert.rule_muted:protocol_allowed | 240 | none |
| alert.rule_muted/current | checkpoint_errors:224 schema validation | 9: alert.rule_muted:checkpoint_partition_only, alert.rule_muted:checkpoint_schema_only | 239 | none |
| alert.rule_muted/current | checkpoint_errors:226 'checkpoint exceeds 16384 encoded bytes' | 2: alert.rule_muted:checkpoint_bytes_only, alert.rule_muted:executed/checkpoint_errors/20 | 246 | none |
| alert.rule_muted/current | checkpoint_errors:230 'foreign Storage token' | 3: alert.rule_muted:checkpoint_token_storage, alert.rule_muted:checkpoint_cases/foreign_storage_token | 245 | none |
| alert.rule_muted/current | checkpoint_errors:233 'foreign original-event context: ' + field | 1: alert.rule_muted:checkpoint_original_storage | 247 | none |
| alert.rule_muted/current | profile_errors:252 ['missing profile'] | 1: alert.rule_muted:profile_missing | 247 | none |
| alert.rule_muted/current | profile_errors:255 ['wrong physical binding'] | 2: alert.rule_muted:profile_redb_file_derived, alert.rule_muted:profile_storage_group_wrong | 246 | none |
| alert.rule_muted/current | profile_errors:258 ['non-integer maximum'] | 2: alert.rule_muted:typed_storage_maximum_boolean, alert.rule_muted:typed_storage_maximum_float | 246 | none |
| alert.rule_muted/current | profile_errors:260 ['missing/oversized maximum'] | 2: alert.rule_muted:profile_max_value_bytes_0, alert.rule_muted:profile_max_value_bytes_16385 | 246 | none |
| alert.rule_muted/current | writer_policy_errors:264 replay-only rejection (duplicates unsupported-policy rejection) | 4: alert.rule_muted:protocol_replay_policy, alert.rule_muted:policy_projector_replay_only | 244 | [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| alert.rule_muted/current | writer_policy_errors:266 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 1: alert.rule_muted:policy_unknown | 247 | none |
| alert.rule_muted/current | schema_ref_errors:62 ValueError('target is not a schema') | 1: alert.rule_muted:ref_non_schema | 247 | none |
| alert.rule_muted/current | schema_ref_errors:64 'unresolved schema reference: ' + str(ref) | 4: alert.rule_muted:ref_dangling, alert.rule_muted:ref_non_schema | 244 | none |
| alert.rule_muted/current | schema_ref_errors:57 ValueError('unsupported non-local reference') | 1: alert.rule_muted:ref_external | 247 | none |
| alert.rule_muted/current | history_page:322 cursor_errors(after, frontier) | 1: alert.rule_muted:pager_cursor | 247 | none |
| alert.rule_muted/current | history_page:324 len(packed(response([], after))) > 16384 | 1: alert.rule_muted:pager_metadata | 247 | none |
| alert.rule_muted/current | history_page:329 not after < seq <= frontier | 2: alert.rule_muted:pager_past, alert.rule_muted:pager_future | 246 | none |
| alert.rule_muted/current | history_page:331 exact event family and Project filter | 2: alert.rule_muted:pager_foreign_family, alert.rule_muted:pager_foreign_project | 246 | none |
| alert.rule_muted/current | history_page:333 scanned == 256 or len(candidate) > 64 | 2: alert.rule_muted:pager_scan, alert.rule_muted:pager_matches | 246 | none |
| alert.rule_muted/current | history_page:335 len(packed(response(candidate, seq))) > 16384 | 2: alert.rule_muted:pager_single_ref, alert.rule_muted:pager_response_bytes | 246 | none |
| alert.rule_muted/current | history_page:336 not result | 1: alert.rule_muted:pager_single_ref | 247 | none |
| alert.rule_muted/current | check_schema:74 schema metaschema validity | 1: alert.rule_muted:schema_metaschema | 247 | none |
| alert.rule_muted/current | check_schema:75 eager resolution of every schema reference | 1: alert.rule_muted:schema_unused_ref | 247 | none |
| alert.rule_muted/current | exact_value:416 exact JSON value type | 1: alert.rule_muted:source_comparison_type | 247 | none |
| alert.rule_muted/current | exact_value:422 scalar value | 90: alert.rule_muted:source_comparison_object_value, alert.rule_muted:source_comparison_array_value | 158 | none |
| alert.rule_muted/current | exact_value:419 object keys | 1: alert.rule_muted:source_comparison_object_keys | 247 | none |
| alert.rule_muted/current | exact_value:419 object child values | 84: alert.rule_muted:source_comparison_object_value, alert.rule_muted:committed_resolved_event_type | 164 | none |
| alert.rule_muted/current | exact_value:421 array length | 1: alert.rule_muted:source_comparison_array_length | 247 | none |
| alert.rule_muted/current | exact_value:421 array child values | 1: alert.rule_muted:source_comparison_array_value | 247 | none |
| alert.rule_muted/current | append_result_errors:170 'resolved original append evidence mismatch' | 82: alert.rule_muted:committed_resolved_event_type, alert.rule_muted:committed_resolved_event_id | 166 | none |
| alert.rule_muted/current | append_result_errors:177 'foreign original append family/scope/identity' | 4: alert.rule_muted:append_original_event_id, alert.rule_muted:append_original_storage_instance_id | 244 | none |
| alert.rule_muted/current | append_result_errors:180 'foreign original append-result reference' | 1: alert.rule_muted:foreign_original_append_result_ref | 247 | none |
| alert.rule_muted/current | append_result_errors:182 'unsettled operation carries append-result reference' | 1: alert.rule_muted:committed_foreign_append_reference | 247 | none |
| alert.rule_muted/current | cursor_errors:196 ['invalid unsigned cursor/frontier'] | 28: alert.rule_muted:pager_cursor, alert.rule_muted:cursor_after_0 | 220 | none |
| alert.rule_muted/current | historical_guards:dict checkpoint_publication | 2: withdrawn_checkpoint, staged_checkpoint | 55 | none |
| alert.rule_muted/current | historical_guards:dict checkpoint_original | 4: forged_checkpoint_publication, foreign_checkpoint_storage | 53 | none |
| alert.rule_muted/current | historical_guards:dict event_publication | 2: withdrawn_event, staged_event | 55 | none |
| alert.rule_muted/current | historical_guards:dict event_original | 9: forged_event_ref, forged_event_id | 48 | none |
| alert.rule_muted/current | historical_guards:dict historical_payload | 4: forged_schema_valid_payload, forged_schema_invalid_payload | 53 | none |
| alert.rule_muted/current | historical_guards:dict original_receipt | 27: forged_receipt_event, foreign_receipt_storage | 30 | none |
| alert.rule_muted/current | historical_guards:dict original_source | 3: forged_source_selection, foreign_source_storage | 54 | none |
| alert.rule_muted/current | historical_guards:dict original_admission | 1: not_valid_when_written | 56 | none |
| alert.rule_muted/current | historical_guards:dict current_permission | 3: current_permission_denied, current_membership_denied | 54 | none |
| alert.rule_muted/current | historical_guards:dict source_retained | 1: source_deleted | 56 | none |
| alert.rule_muted/current | historical_guards:dict current_withdrawal | 1: current_withdrawal | 56 | none |
| alert.snoozed/current | checkpoint schema:dict additionalProperties | 2: alert.snoozed:checkpoint_partition_only, alert.snoozed:checkpoint_schema_only | 259 | none |
| alert.snoozed/current | checkpoint schema:dict properties/index_read_token/additionalProperties | 2: alert.snoozed:checkpoint_cases/persisted_snapshot_forbidden, alert.snoozed:checkpoint_cases/otherwise_valid_token_with_snapshot | 259 | none |
| alert.snoozed/current | checkpoint schema:dict required | 1: alert.snoozed:checkpoint_cases/missing_token | 260 | none |
| alert.snoozed/current | errors:25 schema validation | 9: alert.snoozed:payload_extra_secret_field, alert.snoozed:payload_missing_identity | 252 | none |
| alert.snoozed/current | errors:29 'non-successor' | 6: alert.snoozed:payload_no_change_revision, alert.snoozed:payload_skipped_revision | 255 | none |
| alert.snoozed/current | errors:31 'uncommitted/stale/refused' | 14: alert.snoozed:payload_stale_currentness, alert.snoozed:payload_refused | 247 | none |
| alert.snoozed/current | errors:33 'invalid protection proof' | 1: alert.snoozed:typed_payload_guard_protected | 260 | none |
| alert.snoozed/current | errors:35 'expired snooze' | 9: alert.snoozed:payload_expired_snooze, alert.snoozed:payload_offset_past | 252 | none |
| alert.snoozed/current | errors:37 'protected interruption' | 3: alert.snoozed:payload_protected_interruption, alert.snoozed:payload_cases/protected_interruption | 258 | none |
| alert.snoozed/current | operation_errors:78 schema validation | 3: alert.snoozed:operation_schema_only, alert.snoozed:operation_cases/settled_without_original_receipt | 258 | none |
| alert.snoozed/current | operation_errors:80 'operation exceeds 16384 encoded bytes' | 3: alert.snoozed:operation_bytes_only, alert.snoozed:executed/operation_errors/14 | 258 | none |
| alert.snoozed/current | operation_errors:88 'operation identity digest mismatch' | 1: alert.snoozed:arbitrary_operation_digest | 260 | none |
| alert.snoozed/current | operation_errors:90 'event identity mismatch' | 1: alert.snoozed:forged_event_id | 260 | none |
| alert.snoozed/current | operation_errors:92 'frozen command digest mismatch' | 4: alert.snoozed:arbitrary_request_digest, alert.snoozed:representation_request_digest_uppercase | 257 | none |
| alert.snoozed/current | operation_errors:95 'original command/payload field presence' | 1: alert.snoozed:optional_payload_without_command | 260 | none |
| alert.snoozed/current | operation_errors:103 'non-successor' | 1: alert.snoozed:non_successor | 260 | none |
| alert.snoozed/current | operation_errors:129 'expired snooze' | 3: alert.snoozed:expired_original_deadline, alert.snoozed:operation_offset_past | 258 | none |
| alert.snoozed/current | operation_errors:98 'original command/payload ' + key | 8: alert.snoozed:command_join_project_id, alert.snoozed:command_join_alert_id | 253 | none |
| alert.snoozed/current | operation_errors:101 'operation/payload ' + key | 2: alert.snoozed:scope_join_project_id, alert.snoozed:scope_join_idempotency_key | 259 | none |
| alert.snoozed/current | operation_errors:115 name + ' owner ' + field | 10: alert.snoozed:prior_owner_state_project_id, alert.snoozed:prior_owner_state_alert_id | 251 | none |
| alert.snoozed/current | operation_errors:127 'candidate owner ' + field | 4: alert.snoozed:prior_owner_state_unread, alert.snoozed:candidate_owner_state_unread | 257 | none |
| alert.snoozed/current | protocol_errors:151 'wrong original receipt' | 1: alert.snoozed:protocol_receipt_event_id | 260 | none |
| alert.snoozed/current | protocol_errors:153 'idempotency_conflict' | 2: alert.snoozed:retry_retry_payload, alert.snoozed:retry_retry_command | 259 | none |
| alert.snoozed/current | protocol_errors:149 field | 8: alert.snoozed:protocol_admitted, alert.snoozed:protocol_allowed | 253 | none |
| alert.snoozed/current | checkpoint_errors:224 schema validation | 9: alert.snoozed:checkpoint_partition_only, alert.snoozed:checkpoint_schema_only | 252 | none |
| alert.snoozed/current | checkpoint_errors:226 'checkpoint exceeds 16384 encoded bytes' | 2: alert.snoozed:checkpoint_bytes_only, alert.snoozed:executed/checkpoint_errors/23 | 259 | none |
| alert.snoozed/current | checkpoint_errors:230 'foreign Storage token' | 3: alert.snoozed:checkpoint_token_storage, alert.snoozed:checkpoint_cases/foreign_storage_token | 258 | none |
| alert.snoozed/current | checkpoint_errors:233 'foreign original-event context: ' + field | 1: alert.snoozed:checkpoint_original_storage | 260 | none |
| alert.snoozed/current | profile_errors:252 ['missing profile'] | 1: alert.snoozed:profile_missing | 260 | none |
| alert.snoozed/current | profile_errors:255 ['wrong physical binding'] | 2: alert.snoozed:profile_redb_file_derived, alert.snoozed:profile_storage_group_wrong | 259 | none |
| alert.snoozed/current | profile_errors:258 ['non-integer maximum'] | 2: alert.snoozed:typed_storage_maximum_boolean, alert.snoozed:typed_storage_maximum_float | 259 | none |
| alert.snoozed/current | profile_errors:260 ['missing/oversized maximum'] | 2: alert.snoozed:profile_max_value_bytes_0, alert.snoozed:profile_max_value_bytes_16385 | 259 | none |
| alert.snoozed/current | writer_policy_errors:264 replay-only rejection (duplicates unsupported-policy rejection) | 4: alert.snoozed:protocol_replay_policy, alert.snoozed:policy_projector_replay_only | 257 | [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| alert.snoozed/current | writer_policy_errors:266 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 1: alert.snoozed:policy_unknown | 260 | none |
| alert.snoozed/current | schema_ref_errors:62 ValueError('target is not a schema') | 1: alert.snoozed:ref_non_schema | 260 | none |
| alert.snoozed/current | schema_ref_errors:64 'unresolved schema reference: ' + str(ref) | 4: alert.snoozed:ref_dangling, alert.snoozed:ref_non_schema | 257 | none |
| alert.snoozed/current | schema_ref_errors:57 ValueError('unsupported non-local reference') | 1: alert.snoozed:ref_external | 260 | none |
| alert.snoozed/current | history_page:322 cursor_errors(after, frontier) | 1: alert.snoozed:pager_cursor | 260 | none |
| alert.snoozed/current | history_page:324 len(packed(response([], after))) > 16384 | 1: alert.snoozed:pager_metadata | 260 | none |
| alert.snoozed/current | history_page:329 not after < seq <= frontier | 2: alert.snoozed:pager_past, alert.snoozed:pager_future | 259 | none |
| alert.snoozed/current | history_page:331 exact event family and Project filter | 2: alert.snoozed:pager_foreign_family, alert.snoozed:pager_foreign_project | 259 | none |
| alert.snoozed/current | history_page:333 scanned == 256 or len(candidate) > 64 | 2: alert.snoozed:pager_scan, alert.snoozed:pager_matches | 259 | none |
| alert.snoozed/current | history_page:335 len(packed(response(candidate, seq))) > 16384 | 2: alert.snoozed:pager_single_ref, alert.snoozed:pager_response_bytes | 259 | none |
| alert.snoozed/current | history_page:336 not result | 1: alert.snoozed:pager_single_ref | 260 | none |
| alert.snoozed/current | check_schema:74 schema metaschema validity | 1: alert.snoozed:schema_metaschema | 260 | none |
| alert.snoozed/current | check_schema:75 eager resolution of every schema reference | 1: alert.snoozed:schema_unused_ref | 260 | none |
| alert.snoozed/current | exact_value:416 exact JSON value type | 1: alert.snoozed:source_comparison_type | 260 | none |
| alert.snoozed/current | exact_value:422 scalar value | 90: alert.snoozed:source_comparison_object_value, alert.snoozed:source_comparison_array_value | 171 | none |
| alert.snoozed/current | exact_value:419 object keys | 1: alert.snoozed:source_comparison_object_keys | 260 | none |
| alert.snoozed/current | exact_value:419 object child values | 84: alert.snoozed:source_comparison_object_value, alert.snoozed:committed_resolved_event_type | 177 | none |
| alert.snoozed/current | exact_value:421 array length | 1: alert.snoozed:source_comparison_array_length | 260 | none |
| alert.snoozed/current | exact_value:421 array child values | 1: alert.snoozed:source_comparison_array_value | 260 | none |
| alert.snoozed/current | append_result_errors:170 'resolved original append evidence mismatch' | 82: alert.snoozed:committed_resolved_event_type, alert.snoozed:committed_resolved_event_id | 179 | none |
| alert.snoozed/current | append_result_errors:177 'foreign original append family/scope/identity' | 4: alert.snoozed:append_original_event_id, alert.snoozed:append_original_storage_instance_id | 257 | none |
| alert.snoozed/current | append_result_errors:180 'foreign original append-result reference' | 1: alert.snoozed:foreign_original_append_result_ref | 260 | none |
| alert.snoozed/current | append_result_errors:182 'unsettled operation carries append-result reference' | 1: alert.snoozed:committed_foreign_append_reference | 260 | none |
| alert.snoozed/current | cursor_errors:196 ['invalid unsigned cursor/frontier'] | 28: alert.snoozed:pager_cursor, alert.snoozed:cursor_after_0 | 233 | none |
| alert.snoozed/current | historical_guards:dict checkpoint_publication | 2: withdrawn_checkpoint, staged_checkpoint | 55 | none |
| alert.snoozed/current | historical_guards:dict checkpoint_original | 4: forged_checkpoint_publication, foreign_checkpoint_storage | 53 | none |
| alert.snoozed/current | historical_guards:dict event_publication | 2: withdrawn_event, staged_event | 55 | none |
| alert.snoozed/current | historical_guards:dict event_original | 9: forged_event_ref, forged_event_id | 48 | none |
| alert.snoozed/current | historical_guards:dict historical_payload | 4: forged_schema_valid_payload, forged_schema_invalid_payload | 53 | none |
| alert.snoozed/current | historical_guards:dict original_receipt | 27: forged_receipt_event, foreign_receipt_storage | 30 | none |
| alert.snoozed/current | historical_guards:dict original_source | 3: forged_source_selection, foreign_source_storage | 54 | none |
| alert.snoozed/current | historical_guards:dict original_admission | 1: not_valid_when_written | 56 | none |
| alert.snoozed/current | historical_guards:dict current_permission | 3: current_permission_denied, current_membership_denied | 54 | none |
| alert.snoozed/current | historical_guards:dict source_retained | 1: source_deleted | 56 | none |
| alert.snoozed/current | historical_guards:dict current_withdrawal | 1: current_withdrawal | 56 | none |
| concern.created/current | checkpoint schema:dict additionalProperties | 1: concern.created:checkpoint_schema_only | 290 | none |
| concern.created/current | operation_errors:41 schema validation | 7: concern.created:operation_schema_only, concern.created:executed/operation_errors/0 | 284 | none |
| concern.created/current | operation_errors:47 nested payload schema validation | 9: concern.created:operation_schema_only, concern.created:nested_payload_schema_only | 282 | schema validation |
| concern.created/current | operation_errors:43 'operation exceeds 16384 bytes' | 1: concern.created:operation_bytes_only | 290 | none |
| concern.created/current | operation_errors:51 'original identity mismatch' | 3: concern.created:forged_event_id, concern.created:arbitrary_operation_digest | 288 | none |
| concern.created/current | operation_errors:53 'frozen command/payload/record digest mismatch' | 4: concern.created:arbitrary_request_digest, concern.created:executed/operation_errors/24 | 287 | none |
| concern.created/current | operation_errors:55 'Project partition mismatch' | 2: concern.created:partition_only, concern.created:executed/operation_errors/33 | 289 | none |
| concern.created/current | operation_errors:61 'original scope/key mismatch' | 2: concern.created:scope_record_project, concern.created:scope_payload_key | 289 | none |
| concern.created/current | operation_errors:63 'creator/actor mismatch' | 1: concern.created:creator_actor_join | 290 | none |
| concern.created/current | operation_errors:65 'original revision-one record ref mismatch' | 1: concern.created:revision_one_ref_join | 290 | none |
| concern.created/current | operation_errors:58 'original command/payload ' + key | 3: concern.created:command_join_origin, concern.created:command_join_correlation_id | 288 | none |
| concern.created/current | operation_errors:79 'original candidate record ' + key | 31: concern.created:candidate_record_record_id, concern.created:candidate_record_concern_id | 260 | none |
| concern.created/current | protocol_errors:90 'invalid concern existence proof' | 2: concern.created:typed_protocol_subject_already_active, concern.created:typed_protocol_concern_key_exists | 289 | none |
| concern.created/current | protocol_errors:92 'existing concern cannot be recreated' | 5: concern.created:protocol_subject_already_active, concern.created:protocol_concern_key_exists | 286 | none |
| concern.created/current | protocol_errors:98 'nomination or owner label grants no creation' | 8: concern.created:forbidden_creator_Worker, concern.created:forbidden_creator_User | 283 | none |
| concern.created/current | protocol_errors:100 'wrong original receipt' | 2: concern.created:protocol_receipt_event_id, concern.created:executed/protocol_errors/12 | 289 | none |
| concern.created/current | protocol_errors:102 'idempotency_conflict' | 2: concern.created:protocol_retry_digest, concern.created:executed/protocol_errors/13 | 289 | none |
| concern.created/current | protocol_errors:104 'changed caller semantic body' | 13: concern.created:retry_changed_caller_body, concern.created:retry_body_project_id | 278 | none |
| concern.created/current | protocol_errors:106 'withdrawn History' | 2: concern.created:protocol_publication_state, concern.created:executed/protocol_errors/14 | 289 | none |
| concern.created/current | protocol_errors:88 key | 12: concern.created:protocol_admitted, concern.created:protocol_authority_verified | 279 | none |
| concern.created/current | protocol_errors:96 'independent authority ' + key | 13: concern.created:authority_join_actor_ref, concern.created:authority_join_project_id | 278 | none |
| concern.created/current | checkpoint_errors:127 'Project checkpoint partition mismatch' | 1: concern.created:checkpoint_partition_only | 290 | none |
| concern.created/current | checkpoint_errors:224 schema validation | 5: concern.created:checkpoint_schema_only, concern.created:executed/checkpoint_errors/43 | 286 | none |
| concern.created/current | checkpoint_errors:226 'checkpoint exceeds 16384 encoded bytes' | 3: concern.created:checkpoint_bytes_only, concern.created:executed/checkpoint_errors/49 | 288 | none |
| concern.created/current | checkpoint_errors:230 'foreign Storage token' | 5: concern.created:checkpoint_token_storage, concern.created:executed/checkpoint_errors/37 | 286 | none |
| concern.created/current | checkpoint_errors:233 'foreign original-event context: ' + field | 4: concern.created:checkpoint_original_storage, concern.created:executed/checkpoint_errors/39 | 287 | none |
| concern.created/current | profile_errors:252 ['missing profile'] | 1: concern.created:profile_missing | 290 | none |
| concern.created/current | profile_errors:255 ['wrong physical binding'] | 2: concern.created:profile_redb_file_derived, concern.created:profile_storage_group_wrong | 289 | none |
| concern.created/current | profile_errors:258 ['non-integer maximum'] | 2: concern.created:typed_storage_maximum_boolean, concern.created:typed_storage_maximum_float | 289 | none |
| concern.created/current | profile_errors:260 ['missing/oversized maximum'] | 2: concern.created:profile_max_value_bytes_0, concern.created:profile_max_value_bytes_16385 | 289 | none |
| concern.created/current | writer_policy_errors:264 replay-only rejection (duplicates unsupported-policy rejection) | 4: concern.created:protocol_replay_policy, concern.created:policy_projector_replay_only | 287 | [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| concern.created/current | writer_policy_errors:266 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 1: concern.created:policy_unknown | 290 | none |
| concern.created/current | schema_ref_errors:62 ValueError('target is not a schema') | 1: concern.created:ref_non_schema | 290 | none |
| concern.created/current | schema_ref_errors:64 'unresolved schema reference: ' + str(ref) | 4: concern.created:ref_dangling, concern.created:ref_non_schema | 287 | none |
| concern.created/current | schema_ref_errors:57 ValueError('unsupported non-local reference') | 1: concern.created:ref_external | 290 | none |
| concern.created/current | history_page:322 cursor_errors(after, frontier) | 1: concern.created:pager_cursor | 290 | none |
| concern.created/current | history_page:324 len(packed(response([], after))) > 16384 | 1: concern.created:pager_metadata | 290 | none |
| concern.created/current | history_page:329 not after < seq <= frontier | 2: concern.created:pager_past, concern.created:pager_future | 289 | none |
| concern.created/current | history_page:331 exact event family and Project filter | 2: concern.created:pager_foreign_family, concern.created:pager_foreign_project | 289 | none |
| concern.created/current | history_page:333 scanned == 256 or len(candidate) > 64 | 2: concern.created:pager_scan, concern.created:pager_matches | 289 | none |
| concern.created/current | history_page:335 len(packed(response(candidate, seq))) > 16384 | 2: concern.created:pager_single_ref, concern.created:pager_response_bytes | 289 | none |
| concern.created/current | history_page:336 not result | 1: concern.created:pager_single_ref | 290 | none |
| concern.created/current | check_schema:74 schema metaschema validity | 1: concern.created:schema_metaschema | 290 | none |
| concern.created/current | check_schema:75 eager resolution of every schema reference | 1: concern.created:schema_unused_ref | 290 | none |
| concern.created/current | exact_value:416 exact JSON value type | 1: concern.created:source_comparison_type | 290 | none |
| concern.created/current | exact_value:422 scalar value | 97: concern.created:source_comparison_object_value, concern.created:source_comparison_array_value | 194 | none |
| concern.created/current | exact_value:419 object keys | 2: concern.created:source_comparison_object_keys, concern.created:retry_body_wrong_type_4 | 289 | none |
| concern.created/current | exact_value:419 object child values | 90: concern.created:source_comparison_object_value, concern.created:retry_changed_caller_body | 201 | none |
| concern.created/current | exact_value:421 array length | 1: concern.created:source_comparison_array_length | 290 | none |
| concern.created/current | exact_value:421 array child values | 2: concern.created:source_comparison_array_value, concern.created:retry_body_source_refs | 289 | none |
| concern.created/current | append_result_errors:170 'resolved original append evidence mismatch' | 82: concern.created:committed_resolved_event_type, concern.created:committed_resolved_event_id | 209 | none |
| concern.created/current | append_result_errors:177 'foreign original append family/scope/identity' | 5: concern.created:append_original_event_id, concern.created:append_original_storage_instance_id | 286 | none |
| concern.created/current | append_result_errors:180 'foreign original append-result reference' | 1: concern.created:foreign_original_append_result_ref | 290 | none |
| concern.created/current | append_result_errors:182 'unsettled operation carries append-result reference' | 1: concern.created:committed_foreign_append_reference | 290 | none |
| concern.created/current | cursor_errors:196 ['invalid unsigned cursor/frontier'] | 28: concern.created:pager_cursor, concern.created:cursor_after_0 | 263 | none |
| concern.created/current | historical_guards:dict checkpoint_publication | 2: withdrawn_checkpoint, staged_checkpoint | 55 | none |
| concern.created/current | historical_guards:dict checkpoint_original | 4: forged_checkpoint_publication, foreign_checkpoint_storage | 53 | none |
| concern.created/current | historical_guards:dict event_publication | 2: withdrawn_event, staged_event | 55 | none |
| concern.created/current | historical_guards:dict event_original | 9: forged_event_ref, forged_event_id | 48 | none |
| concern.created/current | historical_guards:dict historical_payload | 4: forged_schema_valid_payload, forged_schema_invalid_payload | 53 | none |
| concern.created/current | historical_guards:dict original_receipt | 27: forged_receipt_event, foreign_receipt_storage | 30 | none |
| concern.created/current | historical_guards:dict original_source | 3: forged_source_selection, foreign_source_storage | 54 | none |
| concern.created/current | historical_guards:dict original_admission | 1: not_valid_when_written | 56 | none |
| concern.created/current | historical_guards:dict current_permission | 3: current_permission_denied, current_membership_denied | 54 | none |
| concern.created/current | historical_guards:dict source_retained | 1: source_deleted | 56 | none |
| concern.created/current | historical_guards:dict current_withdrawal | 1: current_withdrawal | 56 | none |
| panel.redocked/current | checkpoint schema:dict additionalProperties | 1: panel.redocked:checkpoint_schema_only | 263 | none |
| panel.redocked/current | operation_errors:58 schema validation | 2: panel.redocked:operation_schema_only, panel.redocked:executed/operation_errors/15 | 262 | none |
| panel.redocked/current | operation_errors:60 'operation too large' | 1: panel.redocked:operation_bytes_only | 263 | none |
| panel.redocked/current | operation_errors:67 'frozen command digest mismatch' | 5: panel.redocked:arbitrary_request_digest, panel.redocked:executed/operation_errors/11 | 259 | none |
| panel.redocked/current | operation_errors:72 'frozen command window mismatch' | 3: panel.redocked:command_join_actor_ref, panel.redocked:command_join_correlation_id | 261 | 'frozen command/payload ' + key |
| panel.redocked/current | operation_errors:78 'original identity mismatch' | 6: panel.redocked:forged_event_id, panel.redocked:arbitrary_operation_digest | 258 | none |
| panel.redocked/current | operation_errors:70 'frozen command/payload ' + key | 2: panel.redocked:command_join_actor_ref, panel.redocked:command_join_correlation_id | 262 | none |
| panel.redocked/current | operation_errors:75 'operation/payload ' + key | 7: panel.redocked:scope_join_storage_instance_id, panel.redocked:scope_join_server_id | 257 | none |
| panel.redocked/current | operation_errors:84 'original host snapshot mismatch' | 6: panel.redocked:prior_host_snapshot_app_session_id, panel.redocked:prior_host_snapshot_host_revision | 258 | none |
| panel.redocked/current | operation_errors:86 'original window mismatch' | 2: panel.redocked:prior_host_snapshot_window_id, panel.redocked:candidate_host_snapshot_window_id | 262 | none |
| panel.redocked/current | operation_errors:91 'original result/receipt mismatch' | 3: panel.redocked:original_result_owner_commit_ref, panel.redocked:original_result_result_ref | 261 | none |
| panel.redocked/current | protocol_errors:105 'family absent' | 3: panel.redocked:protocol_admitted, panel.redocked:typed_protocol_admitted | 261 | none |
| panel.redocked/current | protocol_errors:107 'unsupported web' | 3: panel.redocked:protocol_desktop, panel.redocked:typed_protocol_desktop | 261 | none |
| panel.redocked/current | protocol_errors:109 'unverified source' | 3: panel.redocked:protocol_source_verified, panel.redocked:typed_protocol_source_verified | 261 | none |
| panel.redocked/current | protocol_errors:111 'wrong original receipt' | 2: panel.redocked:protocol_receipt_event_id, panel.redocked:executed/protocol_errors/21 | 262 | none |
| panel.redocked/current | protocol_errors:113 'forged original event identity' | 1: panel.redocked:protocol_coherently_forged_identity | 263 | none |
| panel.redocked/current | protocol_errors:115 'prior session cannot act' | 3: panel.redocked:protocol_session, panel.redocked:executed/protocol_errors/22 | 261 | none |
| panel.redocked/current | protocol_errors:117 'wrong window' | 3: panel.redocked:protocol_window, panel.redocked:executed/protocol_errors/23 | 261 | none |
| panel.redocked/current | protocol_errors:119 'retry changed' | 4: panel.redocked:retry_retry_payload, panel.redocked:retry_retry_command | 260 | none |
| panel.redocked/current | protocol_errors:121 'unavailable publication/cursor' | 4: panel.redocked:protocol_publication_state, panel.redocked:protocol_cursor | 260 | none |
| panel.redocked/current | checkpoint_errors:53 'checkpoint scope mismatch' | 1: panel.redocked:checkpoint_partition_only | 263 | none |
| panel.redocked/current | payload_errors:25 schema validation | 22: panel.redocked:payload_non_chat, panel.redocked:payload_coemission | 242 | none |
| panel.redocked/current | payload_errors:30 'scope mismatch' | 3: panel.redocked:payload_scope_join_mismatch, panel.redocked:payload_cases/scope_join_mismatch | 261 | none |
| panel.redocked/current | payload_errors:36 'missing original Home context' | 1: panel.redocked:home_context_only | 263 | none |
| panel.redocked/current | payload_errors:38 'not host revision successor' | 4: panel.redocked:payload_no_successor, panel.redocked:successor_only | 260 | none |
| panel.redocked/current | payload_errors:34 'CV-366 application idempotency key mismatch' | 3: panel.redocked:payload_application_key_missing_server_and_operation, panel.redocked:payload_cases/application_key_missing_server_and_operation | 261 | none |
| panel.redocked/current | checkpoint_errors:224 schema validation | 3: panel.redocked:checkpoint_schema_only, panel.redocked:executed/checkpoint_errors/41 | 261 | none |
| panel.redocked/current | checkpoint_errors:226 'checkpoint exceeds 16384 encoded bytes' | 3: panel.redocked:checkpoint_bytes_only, panel.redocked:executed/checkpoint_errors/39 | 261 | none |
| panel.redocked/current | checkpoint_errors:230 'foreign Storage token' | 3: panel.redocked:checkpoint_token_storage, panel.redocked:executed/checkpoint_errors/31 | 261 | none |
| panel.redocked/current | checkpoint_errors:233 'foreign original-event context: ' + field | 6: panel.redocked:checkpoint_original_storage, panel.redocked:executed/checkpoint_errors/33 | 258 | none |
| panel.redocked/current | profile_errors:252 ['missing profile'] | 1: panel.redocked:profile_missing | 263 | none |
| panel.redocked/current | profile_errors:255 ['wrong physical binding'] | 2: panel.redocked:profile_redb_file_derived, panel.redocked:profile_storage_group_wrong | 262 | none |
| panel.redocked/current | profile_errors:258 ['non-integer maximum'] | 2: panel.redocked:typed_storage_maximum_boolean, panel.redocked:typed_storage_maximum_float | 262 | none |
| panel.redocked/current | profile_errors:260 ['missing/oversized maximum'] | 2: panel.redocked:profile_max_value_bytes_0, panel.redocked:profile_max_value_bytes_16385 | 262 | none |
| panel.redocked/current | writer_policy_errors:264 replay-only rejection (duplicates unsupported-policy rejection) | 4: panel.redocked:protocol_replay_policy, panel.redocked:policy_projector_replay_only | 260 | [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| panel.redocked/current | writer_policy_errors:266 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 1: panel.redocked:policy_unknown | 263 | none |
| panel.redocked/current | schema_ref_errors:62 ValueError('target is not a schema') | 1: panel.redocked:ref_non_schema | 263 | none |
| panel.redocked/current | schema_ref_errors:64 'unresolved schema reference: ' + str(ref) | 4: panel.redocked:ref_dangling, panel.redocked:ref_non_schema | 260 | none |
| panel.redocked/current | schema_ref_errors:57 ValueError('unsupported non-local reference') | 1: panel.redocked:ref_external | 263 | none |
| panel.redocked/current | history_page:322 cursor_errors(after, frontier) | 1: panel.redocked:pager_cursor | 263 | none |
| panel.redocked/current | history_page:324 len(packed(response([], after))) > 16384 | 1: panel.redocked:pager_metadata | 263 | none |
| panel.redocked/current | history_page:329 not after < seq <= frontier | 2: panel.redocked:pager_past, panel.redocked:pager_future | 262 | none |
| panel.redocked/current | history_page:331 exact event family and Project filter | 2: panel.redocked:pager_foreign_family, panel.redocked:pager_foreign_project | 262 | none |
| panel.redocked/current | history_page:333 scanned == 256 or len(candidate) > 64 | 2: panel.redocked:pager_scan, panel.redocked:pager_matches | 262 | none |
| panel.redocked/current | history_page:335 len(packed(response(candidate, seq))) > 16384 | 2: panel.redocked:pager_single_ref, panel.redocked:pager_response_bytes | 262 | none |
| panel.redocked/current | history_page:336 not result | 1: panel.redocked:pager_single_ref | 263 | none |
| panel.redocked/current | check_schema:74 schema metaschema validity | 1: panel.redocked:schema_metaschema | 263 | none |
| panel.redocked/current | check_schema:75 eager resolution of every schema reference | 1: panel.redocked:schema_unused_ref | 263 | none |
| panel.redocked/current | exact_value:416 exact JSON value type | 1: panel.redocked:source_comparison_type | 263 | none |
| panel.redocked/current | exact_value:422 scalar value | 91: panel.redocked:source_comparison_object_value, panel.redocked:source_comparison_array_value | 173 | none |
| panel.redocked/current | exact_value:419 object keys | 1: panel.redocked:source_comparison_object_keys | 263 | none |
| panel.redocked/current | exact_value:419 object child values | 84: panel.redocked:source_comparison_object_value, panel.redocked:committed_resolved_event_type | 180 | none |
| panel.redocked/current | exact_value:421 array length | 1: panel.redocked:source_comparison_array_length | 263 | none |
| panel.redocked/current | exact_value:421 array child values | 1: panel.redocked:source_comparison_array_value | 263 | none |
| panel.redocked/current | append_result_errors:170 'resolved original append evidence mismatch' | 82: panel.redocked:committed_resolved_event_type, panel.redocked:committed_resolved_event_id | 182 | none |
| panel.redocked/current | append_result_errors:177 'foreign original append family/scope/identity' | 5: panel.redocked:append_original_event_id, panel.redocked:append_original_storage_instance_id | 259 | none |
| panel.redocked/current | append_result_errors:180 'foreign original append-result reference' | 1: panel.redocked:foreign_original_append_result_ref | 263 | none |
| panel.redocked/current | append_result_errors:182 'unsettled operation carries append-result reference' | 1: panel.redocked:committed_foreign_append_reference | 263 | none |
| panel.redocked/current | cursor_errors:196 ['invalid unsigned cursor/frontier'] | 30: panel.redocked:protocol_cursor, panel.redocked:pager_cursor | 234 | none |
| panel.redocked/current | historical_guards:dict checkpoint_publication | 2: withdrawn_checkpoint, staged_checkpoint | 55 | none |
| panel.redocked/current | historical_guards:dict checkpoint_original | 4: forged_checkpoint_publication, foreign_checkpoint_storage | 53 | none |
| panel.redocked/current | historical_guards:dict event_publication | 2: withdrawn_event, staged_event | 55 | none |
| panel.redocked/current | historical_guards:dict event_original | 9: forged_event_ref, forged_event_id | 48 | none |
| panel.redocked/current | historical_guards:dict historical_payload | 4: forged_schema_valid_payload, forged_schema_invalid_payload | 53 | none |
| panel.redocked/current | historical_guards:dict original_receipt | 27: forged_receipt_event, foreign_receipt_storage | 30 | none |
| panel.redocked/current | historical_guards:dict original_source | 3: forged_source_selection, foreign_source_storage | 54 | none |
| panel.redocked/current | historical_guards:dict original_admission | 1: not_valid_when_written | 56 | none |
| panel.redocked/current | historical_guards:dict current_permission | 3: current_permission_denied, current_membership_denied | 54 | none |
| panel.redocked/current | historical_guards:dict source_retained | 1: source_deleted | 56 | none |
| panel.redocked/current | historical_guards:dict current_withdrawal | 1: current_withdrawal | 56 | none |
| panel.redocked/v1 | historical_guards:dict checkpoint_publication | 2: withdrawn_checkpoint, staged_checkpoint | 55 | none |
| panel.redocked/v1 | historical_guards:dict checkpoint_original | 4: forged_checkpoint_publication, foreign_checkpoint_storage | 53 | none |
| panel.redocked/v1 | historical_guards:dict event_publication | 2: withdrawn_event, staged_event | 55 | none |
| panel.redocked/v1 | historical_guards:dict event_original | 9: forged_event_ref, forged_event_id | 48 | none |
| panel.redocked/v1 | historical_guards:dict historical_payload | 4: forged_schema_valid_payload, forged_schema_invalid_payload | 53 | none |
| panel.redocked/v1 | historical_guards:dict original_receipt | 27: forged_receipt_event, foreign_receipt_storage | 30 | none |
| panel.redocked/v1 | historical_guards:dict original_source | 3: forged_source_selection, foreign_source_storage | 54 | none |
| panel.redocked/v1 | historical_guards:dict original_admission | 1: not_valid_when_written | 56 | none |
| panel.redocked/v1 | historical_guards:dict current_permission | 3: current_permission_denied, current_membership_denied | 54 | none |
| panel.redocked/v1 | historical_guards:dict source_retained | 1: source_deleted | 56 | none |
| panel.redocked/v1 | historical_guards:dict current_withdrawal | 1: current_withdrawal | 56 | none |
| panel.undocked/current | checkpoint schema:dict additionalProperties | 1: panel.undocked:checkpoint_schema_only | 263 | none |
| panel.undocked/current | operation_errors:58 schema validation | 2: panel.undocked:operation_schema_only, panel.undocked:executed/operation_errors/15 | 262 | none |
| panel.undocked/current | operation_errors:60 'operation too large' | 1: panel.undocked:operation_bytes_only | 263 | none |
| panel.undocked/current | operation_errors:67 'frozen command digest mismatch' | 5: panel.undocked:arbitrary_request_digest, panel.undocked:executed/operation_errors/11 | 259 | none |
| panel.undocked/current | operation_errors:72 'frozen command window mismatch' | 1: panel.undocked:command_window_join | 263 | none |
| panel.undocked/current | operation_errors:78 'original identity mismatch' | 6: panel.undocked:forged_event_id, panel.undocked:arbitrary_operation_digest | 258 | none |
| panel.undocked/current | operation_errors:70 'frozen command/payload ' + key | 2: panel.undocked:command_join_actor_ref, panel.undocked:command_join_correlation_id | 262 | none |
| panel.undocked/current | operation_errors:75 'operation/payload ' + key | 7: panel.undocked:scope_join_storage_instance_id, panel.undocked:scope_join_server_id | 257 | none |
| panel.undocked/current | operation_errors:84 'original host snapshot mismatch' | 6: panel.undocked:prior_host_snapshot_app_session_id, panel.undocked:prior_host_snapshot_host_revision | 258 | none |
| panel.undocked/current | operation_errors:86 'original window mismatch' | 2: panel.undocked:prior_host_snapshot_window_id, panel.undocked:candidate_host_snapshot_window_id | 262 | none |
| panel.undocked/current | operation_errors:91 'original result/receipt mismatch' | 3: panel.undocked:original_result_owner_commit_ref, panel.undocked:original_result_result_ref | 261 | none |
| panel.undocked/current | protocol_errors:105 'family absent' | 3: panel.undocked:protocol_admitted, panel.undocked:typed_protocol_admitted | 261 | none |
| panel.undocked/current | protocol_errors:107 'unsupported web' | 3: panel.undocked:protocol_desktop, panel.undocked:typed_protocol_desktop | 261 | none |
| panel.undocked/current | protocol_errors:109 'unverified source' | 3: panel.undocked:protocol_source_verified, panel.undocked:typed_protocol_source_verified | 261 | none |
| panel.undocked/current | protocol_errors:111 'wrong original receipt' | 2: panel.undocked:protocol_receipt_event_id, panel.undocked:executed/protocol_errors/21 | 262 | none |
| panel.undocked/current | protocol_errors:113 'forged original event identity' | 1: panel.undocked:protocol_coherently_forged_identity | 263 | none |
| panel.undocked/current | protocol_errors:115 'prior session cannot act' | 3: panel.undocked:protocol_session, panel.undocked:executed/protocol_errors/22 | 261 | none |
| panel.undocked/current | protocol_errors:117 'wrong window' | 3: panel.undocked:protocol_window, panel.undocked:executed/protocol_errors/23 | 261 | none |
| panel.undocked/current | protocol_errors:119 'retry changed' | 4: panel.undocked:retry_retry_payload, panel.undocked:retry_retry_command | 260 | none |
| panel.undocked/current | protocol_errors:121 'unavailable publication/cursor' | 4: panel.undocked:protocol_publication_state, panel.undocked:protocol_cursor | 260 | none |
| panel.undocked/current | checkpoint_errors:53 'checkpoint scope mismatch' | 1: panel.undocked:checkpoint_partition_only | 263 | none |
| panel.undocked/current | payload_errors:25 schema validation | 22: panel.undocked:payload_non_chat, panel.undocked:payload_coemission | 242 | none |
| panel.undocked/current | payload_errors:30 'scope mismatch' | 3: panel.undocked:payload_scope_join_mismatch, panel.undocked:payload_cases/scope_join_mismatch | 261 | none |
| panel.undocked/current | payload_errors:36 'missing original Home context' | 1: panel.undocked:home_context_only | 263 | none |
| panel.undocked/current | payload_errors:38 'not host revision successor' | 4: panel.undocked:payload_no_successor, panel.undocked:successor_only | 260 | none |
| panel.undocked/current | payload_errors:34 'CV-366 application idempotency key mismatch' | 3: panel.undocked:payload_application_key_missing_server_and_operation, panel.undocked:payload_cases/application_key_missing_server_and_operation | 261 | none |
| panel.undocked/current | checkpoint_errors:224 schema validation | 3: panel.undocked:checkpoint_schema_only, panel.undocked:executed/checkpoint_errors/41 | 261 | none |
| panel.undocked/current | checkpoint_errors:226 'checkpoint exceeds 16384 encoded bytes' | 3: panel.undocked:checkpoint_bytes_only, panel.undocked:executed/checkpoint_errors/39 | 261 | none |
| panel.undocked/current | checkpoint_errors:230 'foreign Storage token' | 3: panel.undocked:checkpoint_token_storage, panel.undocked:executed/checkpoint_errors/31 | 261 | none |
| panel.undocked/current | checkpoint_errors:233 'foreign original-event context: ' + field | 6: panel.undocked:checkpoint_original_storage, panel.undocked:executed/checkpoint_errors/33 | 258 | none |
| panel.undocked/current | profile_errors:252 ['missing profile'] | 1: panel.undocked:profile_missing | 263 | none |
| panel.undocked/current | profile_errors:255 ['wrong physical binding'] | 2: panel.undocked:profile_redb_file_derived, panel.undocked:profile_storage_group_wrong | 262 | none |
| panel.undocked/current | profile_errors:258 ['non-integer maximum'] | 2: panel.undocked:typed_storage_maximum_boolean, panel.undocked:typed_storage_maximum_float | 262 | none |
| panel.undocked/current | profile_errors:260 ['missing/oversized maximum'] | 2: panel.undocked:profile_max_value_bytes_0, panel.undocked:profile_max_value_bytes_16385 | 262 | none |
| panel.undocked/current | writer_policy_errors:264 replay-only rejection (duplicates unsupported-policy rejection) | 4: panel.undocked:protocol_replay_policy, panel.undocked:policy_projector_replay_only | 260 | [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] |
| panel.undocked/current | writer_policy_errors:266 [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 1: panel.undocked:policy_unknown | 263 | none |
| panel.undocked/current | schema_ref_errors:62 ValueError('target is not a schema') | 1: panel.undocked:ref_non_schema | 263 | none |
| panel.undocked/current | schema_ref_errors:64 'unresolved schema reference: ' + str(ref) | 4: panel.undocked:ref_dangling, panel.undocked:ref_non_schema | 260 | none |
| panel.undocked/current | schema_ref_errors:57 ValueError('unsupported non-local reference') | 1: panel.undocked:ref_external | 263 | none |
| panel.undocked/current | history_page:322 cursor_errors(after, frontier) | 1: panel.undocked:pager_cursor | 263 | none |
| panel.undocked/current | history_page:324 len(packed(response([], after))) > 16384 | 1: panel.undocked:pager_metadata | 263 | none |
| panel.undocked/current | history_page:329 not after < seq <= frontier | 2: panel.undocked:pager_past, panel.undocked:pager_future | 262 | none |
| panel.undocked/current | history_page:331 exact event family and Project filter | 2: panel.undocked:pager_foreign_family, panel.undocked:pager_foreign_project | 262 | none |
| panel.undocked/current | history_page:333 scanned == 256 or len(candidate) > 64 | 2: panel.undocked:pager_scan, panel.undocked:pager_matches | 262 | none |
| panel.undocked/current | history_page:335 len(packed(response(candidate, seq))) > 16384 | 2: panel.undocked:pager_single_ref, panel.undocked:pager_response_bytes | 262 | none |
| panel.undocked/current | history_page:336 not result | 1: panel.undocked:pager_single_ref | 263 | none |
| panel.undocked/current | check_schema:74 schema metaschema validity | 1: panel.undocked:schema_metaschema | 263 | none |
| panel.undocked/current | check_schema:75 eager resolution of every schema reference | 1: panel.undocked:schema_unused_ref | 263 | none |
| panel.undocked/current | exact_value:416 exact JSON value type | 1: panel.undocked:source_comparison_type | 263 | none |
| panel.undocked/current | exact_value:422 scalar value | 91: panel.undocked:source_comparison_object_value, panel.undocked:source_comparison_array_value | 173 | none |
| panel.undocked/current | exact_value:419 object keys | 1: panel.undocked:source_comparison_object_keys | 263 | none |
| panel.undocked/current | exact_value:419 object child values | 84: panel.undocked:source_comparison_object_value, panel.undocked:committed_resolved_event_type | 180 | none |
| panel.undocked/current | exact_value:421 array length | 1: panel.undocked:source_comparison_array_length | 263 | none |
| panel.undocked/current | exact_value:421 array child values | 1: panel.undocked:source_comparison_array_value | 263 | none |
| panel.undocked/current | append_result_errors:170 'resolved original append evidence mismatch' | 82: panel.undocked:committed_resolved_event_type, panel.undocked:committed_resolved_event_id | 182 | none |
| panel.undocked/current | append_result_errors:177 'foreign original append family/scope/identity' | 5: panel.undocked:append_original_event_id, panel.undocked:append_original_storage_instance_id | 259 | none |
| panel.undocked/current | append_result_errors:180 'foreign original append-result reference' | 1: panel.undocked:foreign_original_append_result_ref | 263 | none |
| panel.undocked/current | append_result_errors:182 'unsettled operation carries append-result reference' | 1: panel.undocked:committed_foreign_append_reference | 263 | none |
| panel.undocked/current | cursor_errors:196 ['invalid unsigned cursor/frontier'] | 30: panel.undocked:protocol_cursor, panel.undocked:pager_cursor | 234 | none |
| panel.undocked/current | historical_guards:dict checkpoint_publication | 2: withdrawn_checkpoint, staged_checkpoint | 55 | none |
| panel.undocked/current | historical_guards:dict checkpoint_original | 4: forged_checkpoint_publication, foreign_checkpoint_storage | 53 | none |
| panel.undocked/current | historical_guards:dict event_publication | 2: withdrawn_event, staged_event | 55 | none |
| panel.undocked/current | historical_guards:dict event_original | 9: forged_event_ref, forged_event_id | 48 | none |
| panel.undocked/current | historical_guards:dict historical_payload | 4: forged_schema_valid_payload, forged_schema_invalid_payload | 53 | none |
| panel.undocked/current | historical_guards:dict original_receipt | 27: forged_receipt_event, foreign_receipt_storage | 30 | none |
| panel.undocked/current | historical_guards:dict original_source | 3: forged_source_selection, foreign_source_storage | 54 | none |
| panel.undocked/current | historical_guards:dict original_admission | 1: not_valid_when_written | 56 | none |
| panel.undocked/current | historical_guards:dict current_permission | 3: current_permission_denied, current_membership_denied | 54 | none |
| panel.undocked/current | historical_guards:dict source_retained | 1: source_deleted | 56 | none |
| panel.undocked/current | historical_guards:dict current_withdrawal | 1: current_withdrawal | 56 | none |
| panel.undocked/v1 | historical_guards:dict checkpoint_publication | 2: withdrawn_checkpoint, staged_checkpoint | 55 | none |
| panel.undocked/v1 | historical_guards:dict checkpoint_original | 4: forged_checkpoint_publication, foreign_checkpoint_storage | 53 | none |
| panel.undocked/v1 | historical_guards:dict event_publication | 2: withdrawn_event, staged_event | 55 | none |
| panel.undocked/v1 | historical_guards:dict event_original | 9: forged_event_ref, forged_event_id | 48 | none |
| panel.undocked/v1 | historical_guards:dict historical_payload | 4: forged_schema_valid_payload, forged_schema_invalid_payload | 53 | none |
| panel.undocked/v1 | historical_guards:dict original_receipt | 27: forged_receipt_event, foreign_receipt_storage | 30 | none |
| panel.undocked/v1 | historical_guards:dict original_source | 3: forged_source_selection, foreign_source_storage | 54 | none |
| panel.undocked/v1 | historical_guards:dict original_admission | 1: not_valid_when_written | 56 | none |
| panel.undocked/v1 | historical_guards:dict current_permission | 3: current_permission_denied, current_membership_denied | 54 | none |
| panel.undocked/v1 | historical_guards:dict source_retained | 1: source_deleted | 56 | none |
| panel.undocked/v1 | historical_guards:dict current_withdrawal | 1: current_withdrawal | 56 | none |

| Family | Removed named set | Flipping negatives | Other negatives still rejected |
|---|---|---:|---:|
| alert.acknowledged | replay-only rejection (duplicates unsupported-policy rejection) + [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4 | 243 |
| alert.acknowledged | schema validation + 'operation identity digest mismatch' | 8 | 239 |
| alert.acknowledged | schema validation + 'frozen command digest mismatch' | 8 | 239 |
| alert.dismissed | replay-only rejection (duplicates unsupported-policy rejection) + [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4 | 243 |
| alert.dismissed | schema validation + 'operation identity digest mismatch' | 8 | 239 |
| alert.dismissed | schema validation + 'frozen command digest mismatch' | 8 | 239 |
| alert.rule_muted | replay-only rejection (duplicates unsupported-policy rejection) + [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4 | 244 |
| alert.rule_muted | schema validation + 'operation identity digest mismatch' | 8 | 240 |
| alert.rule_muted | schema validation + 'frozen command digest mismatch' | 8 | 240 |
| alert.snoozed | replay-only rejection (duplicates unsupported-policy rejection) + [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4 | 257 |
| alert.snoozed | schema validation + 'operation identity digest mismatch' | 8 | 253 |
| alert.snoozed | schema validation + 'frozen command digest mismatch' | 8 | 253 |
| concern.created | replay-only rejection (duplicates unsupported-policy rejection) + [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4 | 287 |
| concern.created | schema validation + 'original identity mismatch' | 14 | 277 |
| concern.created | schema validation + 'frozen command/payload/record digest mismatch' | 15 | 276 |
| concern.created | schema validation + nested payload schema validation | 9 | 282 |
| concern.created | 'Project checkpoint partition mismatch' + 'foreign original-event context: ' + field | 6 | 285 |
| panel.redocked | 'frozen command window mismatch' + 'frozen command/payload ' + key | 3 | 261 |
| panel.redocked | replay-only rejection (duplicates unsupported-policy rejection) + [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4 | 260 |
| panel.redocked | schema validation + 'original identity mismatch' | 9 | 255 |
| panel.redocked | schema validation + 'frozen command digest mismatch' | 11 | 253 |
| panel.redocked | 'checkpoint scope mismatch' + 'foreign original-event context: ' + field | 8 | 256 |
| panel.undocked | replay-only rejection (duplicates unsupported-policy rejection) + [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy'] | 4 | 260 |
| panel.undocked | schema validation + 'original identity mismatch' | 9 | 255 |
| panel.undocked | schema validation + 'frozen command digest mismatch' | 11 | 253 |
| panel.undocked | 'checkpoint scope mismatch' + 'foreign original-event context: ' + field | 8 | 256 |
