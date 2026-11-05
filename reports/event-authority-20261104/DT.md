# DT-FIX5 — Event Authority technical fix round 5

Branch: `plans/ea-w2-tools-gates-approvals-20261104`. Reviewed head: `34fa8b601872791c8fa292b8e862bc78fb923ca9`. Implementation head: `7b62f6ac834edab6875e09e413bb335f30fbe9ec`. Reports-only publication follows.

**F10–F15 fixed.** Complete checker: **6345 assertions**. Prepared families: **0/17 → 16/17** under the existing wave retention exception (**0/18 → 16/18 assigned rows**). The whole `tool.denied` row and Doctor remain stopped. Membership stays ABSENT and native execution NOT_RUN. Original-owner, pack-reader and SP-278 authentication remain assumed adapters.

## Review round 5: findings and responses

- **F10 — fixed (`659353f7ddd424df378d2b356882e7e04eae308a`).** The schema table keys guards by actual schema location, condition and value. Only equivalent nullable/completed-stage copies are removed together. The domain guard owns invalid discriminators; conditional field applicability presupposes that already-mandatory domain. This factors equivalent constraints without changing accepted values. The invalid-operation and map-counter-on-read cases now flip separately. Location: `scripts/pm-dt-guard-isolation.py:458`. Verify: schema-duplicate-probe.json and schema-equivalence-probe.json; full guard table.

- **F11 — fixed (`659353f7ddd424df378d2b356882e7e04eae308a; 33c487f15eacd29120e9c8542501c8361a2dcac4`).** Historical validation accepts supported replay-only originals independently of current writer admission and live state. Current append and recovery still refuse replay-only policy. Every disclosure, family, schema, original-source and withdrawal guard remains. Supported-policy reader positives and precise compatibility/replay false-rejection full-main faults cover every family. Location: `scripts/pm-dt-event-contracts.py:584`. Verify: standing check 10 and astra-probes.json class 3.

- **F12 — fixed (`659353f7ddd424df378d2b356882e7e04eae308a`).** Measure the selected Project canonical-JSON or application MessagePack bytes of each prepared and completed source independently. Each refuses above 1048576 bytes; Project raw decoding enforces the same bound. Exact 1048576 and 1048577 byte controls keep SP-337 body externalization and every later join active. Location: `scripts/pm-dt-event-contracts.py:422`. Verify: technical_checks, source_size/source_decode_size rows and astra-probes.json class 6.

- **F13 — fixed (`659353f7ddd424df378d2b356882e7e04eae308a; 33c487f15eacd29120e9c8542501c8361a2dcac4; 30f0060ba7d66f9f64509b1b2137a74ac271273c; 7b62f6ac834edab6875e09e413bb335f30fbe9ec`).** Recovery verifies the source closure and envelope before finalization, append or return; compares selected-codec owner source bytes and typed canonical Storage event metadata with independent frozen adapter observations; joins the first receipt id/sequence and compares the full original receipt before returning it. Typed canonical comparisons distinguish booleans from numeric fields, including authenticated snapshot and receipt substitutions. No gate flag alone authorizes corrupted originals. Location: `scripts/pm-dt-event-contracts.py:509`. Verify: recovery_custody guard rows; 1128 direct Project/application checks, including all 119 original review corruptions.

- **F14 — fixed (`659353f7ddd424df378d2b356882e7e04eae308a; 7b62f6ac834edab6875e09e413bb335f30fbe9ec`).** Regenerated shards, then the plan index, after copying and SHA-256 checking all fifteen ignored currentness files. Committed all generated Storage registry shard changes and four index files. No other document shards changed. The implementation checks passed before origin/main advanced. Published-head shard verification passes; final index validation reports only the 22 unrelated comparison/ledger errors described below, with zero stale derived artifact failures. Location: `Plans/_shards/storage_value_registry/manifest.json:1`. Verify: shard-check.json and top-level index-validate.json.

- **F15 — fixed (`659353f7ddd424df378d2b356882e7e04eae308a; 7b62f6ac834edab6875e09e413bb335f30fbe9ec`).** Normalize every blocked_sequence identity component with the same exact canonical decimal spelling used by source validation/encoding. Schema-valid 1 and 1.0 now produce one key, one retry result and a valid persisted round trip. Exact values above 2^53 and u64 max stay integers. Integral floats use their actual integer value, including 18446744073709549568, instead of a rounded shortest decimal; decimal-source/binary64 body joins also retain valid history. Location: `scripts/pm-dt-event-contracts.py:272`. Verify: technical_checks and four complete-checker old-reader faults plus one old-integral-float-codec fault in numeric-reader-faults.json.

All six findings are accepted; none is disputed. Earlier confirmed findings remain:

| Finding | Current evidence / disposition |
|---|---|
| F1 | FileSafe remains stopped; exact question below. Policy/user denial only; producer and transition CONFLICT cells unchanged. |
| F2 | Original denial mapping, blocked episode, allowed actions and dispatch joins remain; authored source/semantic negatives and guard witnesses pass. |
| F3 | All three gate dispatch/score joins and bare-score negatives pass exact schema controls. |
| F4 | Usage null/absent provider-account identity remains valid; fabrication and contradictory snapshots refuse. |
| F5 | Web operation, parent/URL child lineage, batch membership and result joins remain enforced. |
| F6 | Decided retention bindings and the four existing residual/adapter cells remain unchanged; no duration, expiry or deletion authority added. |
| F7 | Full-string identifier and coherent trailing-LF controls remain; schema and standing check 5 pass. |
| F8 | Exact 21-field caller semantic projection; Storage metadata retries return the full original, caller changes conflict. |
| F9 | All references, mirrors, unused definitions and alternatives resolve eagerly; 17 precise preflight removals run every downstream oracle. |

Exact FileSafe question, unchanged: **Should FileSafe blocks emit tool.denied, reconciling Tools.md:1496 (do not emit tool.denied for FileSafe blocks) with FileSafe.md:2839-2846 (Align tool.denied emission with filesafe_blocked)?**

## All eleven standing checks

All seventeen drafted populations pass checks 1–11. Six disjoint standing groups execute **295 main invocations (227 complete 6345-assertion runs and 68 intentional schema-preflight refusals)**: every ordinary fault runs all 17 families / 6345 assertions; reference faults deliberately stop at preflight. Wrong-fixture controls use real subprocess exits. Check 10 includes changed/missing live state, withdrawal, forged originals and a valid replay-only-history false-rejection fault. The separate 17 reference-removal controls and five numeric-reader/codec faults preserve all downstream checks.

| Check | Measured contract |
|---|---|
| 1 | Current append and retry reject projector_replay_only in every family. |
| 2 | CV-366 application key formatting, or refusal of prohibited application scope. |
| 3 | Encoded project~ partition; raw Project id refused. |
| 4 | SP-337 inline/ref routing plus independent exact limits on both stored source stages and Project decode. |
| 5 | Exact full-string identifiers and coherent trailing-LF negatives. |
| 6 | Only caller semantic fields affect retry conflict; Storage-assigned metadata does not. |
| 7 | Checkpoint identities match their event Storage; coherent foreign substitution refuses. |
| 8 | A wrong pinned fixture makes the complete checker fail and exit 1. |
| 9 | Eager closure of every $ref, including unvisited and mirror branches. |
| 10 | Retained authentic history, including replay-only, survives all later live changes; disclosure and authenticity refusals remain. |
| 11 | Each guard or explicitly named equivalent duplicate set has flipping witnesses; every other named negative still rejects. |

## Guard-removal table

**159/159 AST predicates covered; zero uncovered.** Single-predicate removals run the complete remaining model. The configuration-availability row explicitly reaches a missing-schema lookup after its own guard is removed; it claims no event acceptance. Schema rows preserve actual rule paths, conditions and values. **51 named schema duplicate sets** additionally prove both individual-copy refusals and combined-copy admission. No blanket enum deletion or downstream acceptance stub remains.

Full exact table: `reports/event-authority-20261104/DT-guard-removal.json`; full raw names, remaining refusals and changed-rejection diagnostics: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix5/guard-removal-final.json`, SHA-256 `53648b4adf246a3ea7d4743507565d718e295e8776b1c0f2679f40d048e86766`.

| Guard | Negatives that flip | Negatives that stay rejected |
|---|---|---|
| `append_model: old_digest == digest` | `retry/actor_ref`, `retry/attempt_id`, `retry/causation_event_id`, `retry/correlation_id`, `retry/effective_account_ref`, `retry/event_type`, `retry/idempotency_key`, `retry/migration`, `retry/node_id`, `retry/occurred_at_utc`, `retry/parent_event_id`, `retry/payload`, `retry/payload_ref`, `retry/payload_schema_id`, `retry/producer_sequence_id`, `retry/project_id`, `retry/redaction_profile`, `retry/requested_account_ref`, `retry/run_id`, `retry/scope_kind`, `retry/thread_id` | All other named negatives; 20770 retained refusals across covered families. |
| `batch_join: pm.get('batch_role') != 'parent' or not children` | `batch/parent_role` | All other named negatives; 2211 retained refusals across covered families. |
| `batch_join: pm['child_tool_use_ids'] != [v['event']['payload']['tool_use_id'] for v in children] or len(set(pm['child_tool_use_ids'])) != len(children)` | `batch/duplicate_url_child_identity`, `batch/missing_url_child` | All other named negatives; 2210 retained refusals across covered families. |
| `batch_join: cm.get('batch_role') != 'child' or cm['batch_id'] != pm['batch_id'] or cm['parent_tool_use_id'] != p['tool_use_id'] or (e['parent_event_id'] != parent['event']['event_id']) or (not q.get('provider_attempt_ref')) or (q['tool_use_id'] == p['tool_use_id'])` | `batch/provider_attempt_missing`, `batch/wrong_batch`, `batch/wrong_parent_event`, `batch/wrong_parent_tool` | All other named negatives; 2208 retained refusals across covered families. |
| `batch_join: any((e[k] != parent['event'][k] for k in ['run_id', 'attempt_id', 'project_id', 'scope_kind']))` | `batch/cross_run` | All other named negatives; 2211 retained refusals across covered families. |
| `batch_join: p['success'] == all((v['event']['payload']['success'] for v in children))` | `batch/wrong_aggregate` | All other named negatives; 2211 retained refusals across covered families. |
| `checkpoint_result: list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(proposed))` | `checkpoint/future_checkpoint_version`, `checkpoint/persisted_snapshot_forbidden` | All other named negatives; 21093 retained refusals across covered families. |
| `checkpoint_result: not context['admitted'] or not context['reader_installed'] or context['withdrawn'] or (not context['permission']) or context['deleted']` | `checkpoint/append_withdrawn`, `checkpoint/read_permission_revoked`, `checkpoint/reader_uninstalled`, `checkpoint/reader_withdrawn`, `checkpoint/source_deleted` | All other named negatives; 21042 retained refusals across covered families. |
| `checkpoint_result: context['expected_previous'] != old or not context['lease_current']` | `checkpoint/cas_loss`, `checkpoint/lease_lost` | All other named negatives; 21093 retained refusals across covered families. |
| `checkpoint_result: proposed['index_read_token'] != context['current_token']` | `checkpoint/current_token_changed_frontier_revision`, `checkpoint/current_token_changed_frontier_sha256`, `checkpoint/current_token_changed_generation_anchor_sha256`, `checkpoint/current_token_changed_generation_id`, `checkpoint/current_token_changed_index_dataset_name`, `checkpoint/current_token_changed_source_selection` | All other named negatives; 21025 retained refusals across covered families. |
| `checkpoint_result: t['storage_instance_id'] != context['source_storage_instance_id']` | `storage/coherent_foreign` | All other named negatives; 21110 retained refusals across covered families. |
| `checkpoint_result: proposed['storage_instance_id'] != t['storage_instance_id'] or t['source_selection']['storage_instance_id'] != t['storage_instance_id']` | `storage/index_read_token/source_selection/storage_instance_id`, `storage/storage_instance_id` | All other named negatives; 21093 retained refusals across covered families. |
| `checkpoint_result: t['checkpoint_key'] != 'event_record_index_checkpoint.v1:' + t['storage_instance_id'] or t['checkpoint_ref'] != t['checkpoint_key'] + '#/generations/' + t['generation_id'] or t['index_dataset_name'] != 'event_record_index.v2@' + t['generation_id']` | `checkpoint/token_binding/checkpoint_key`, `checkpoint/token_binding/checkpoint_ref`, `checkpoint/token_binding/index_dataset_name` | All other named negatives; 21076 retained refusals across covered families. |
| `checkpoint_result: proposed['scope_partition'] != context['scope_partition'] or not context['source_verified'] or (not context['coverage_complete']) or (not context['versions_supported'])` | `checkpoint/future_source_version`, `checkpoint/source_gap`, `checkpoint/unverified_source`, `checkpoint/wrong_partition` | All other named negatives; 21059 retained refusals across covered families. |
| `checkpoint_result: prefix != expected_prefix` | `checkpoint/row_transplant_without_source_proof` | All other named negatives; 21110 retained refusals across covered families. |
| `checkpoint_result: proposed['examined_through_sequence_id'] != through or proposed['last_applied_event_id'] != last or (not proposed['filter_complete'])` | `checkpoint/filtered_row_max_is_not_global_cursor`, `checkpoint/incomplete_filter`, `checkpoint/wrong_matching_event` | All other named negatives; 21076 retained refusals across covered families. |
| `checkpoint_result: proposed['state'] != 'current' or proposed['health'] != 'healthy' or proposed['withdrawn_at_utc'] is not None` | `checkpoint/state/health`, `checkpoint/state/state`, `checkpoint/state/withdrawn_at_utc` | All other named negatives; 21076 retained refusals across covered families. |
| `checkpoint_result: old and old['state'] == 'withdrawn' and (not context['governed_rebuild'])` | `checkpoint/withdrawn_cursor_does_not_resume` | All other named negatives; 21110 retained refusals across covered families. |
| `checkpoint_result: old and old['examined_through_sequence_id'] is not None and (through is None or through < old['examined_through_sequence_id']) and (not context['governed_rebuild'])` | `checkpoint/rollback` | All other named negatives; 21110 retained refusals across covered families. |
| `checkpoint_schema: checkpoint_schema/future_checkpoint_version` | `checkpoint/future_checkpoint_version` | All other named negatives; 21110 retained refusals across covered families. |
| `checkpoint_schema: checkpoint_schema/persisted_snapshot_forbidden` | `checkpoint/persisted_snapshot_forbidden` | All other named negatives; 21110 retained refusals across covered families. |
| `decode_source: len(raw) > 1048576` | `source_decode_size/completed`, `source_decode_size/prepared` | All other named negatives; 21093 retained refusals across covered families. |
| `denial_emission: before['denial_origin'] not in ['policy', 'user'] or before['policy_decision'] != 'deny' or before['dispatch_state'] != 'not_dispatched'` | `boundary/transition controls`, `semantic/already_dispatched`, `semantic/not_denied`, `source_join/allow_is_not_denial`, `source_join/already_dispatched_cannot_deny`, `source_join/schema_refusal_is_not_policy_denial` | All other named negatives; 483 retained refusals across covered families. |
| `gate_score_join: canonical([payload.get('score'), payload.get('score_threshold')]) != canonical([outcome['score'], before['score_threshold']])` | `boundary/gate_score_join controls`, `boundary/transition controls`, `source_join/altered_score`, `source_join/altered_score_threshold` | All other named negatives; 2346 retained refusals across covered families. |
| `gate_score_join: any((canonical(payload.get(k)) != canonical(before[k]) for k in ['dispatch_score_ref', 'dispatch_score_tuple']))` | `boundary/gate_score_join controls`, `boundary/transition controls`, `source_join/wrong_original_dispatch_ref`, `source_join/wrong_original_dispatch_tuple` | All other named negatives; 1422 retained refusals across covered families. |
| `gate_score_join: bool(payload.get('dispatch_score_ref'))` | `boundary/gate_score_join controls`, `boundary/transition controls` | All other named negatives; 2469 retained refusals across covered families. |
| `gate_score_join: context is not None` | `boundary/gate_score_join controls` | All other named negatives; 2493 retained refusals across covered families. |
| `gate_score_join: payload.get('node_id') == node_id` | `boundary/gate_score_join controls`, `boundary/transition controls` | All other named negatives; 2364 retained refusals across covered families. |
| `historical_read: not context['reader_installed'] or context['withdrawn'] or (not context['permission']) or context['deleted'] or (not context['source_present']) or (not context['owner_proven']) or (not context['versions_supported'])` | `history/deleted`, `history/owner_proven`, `history/permission`, `history/reader_installed`, `history/source_present`, `history/versions_supported`, `history/withdrawn` | All other named negatives; 21008 retained refusals across covered families. |
| `historical_read: source_bytes(prepared) != source_bytes(context['authenticated_original']['prepared']) or source_bytes(completed) != source_bytes(context['authenticated_original']['completed']) or canonical(event) != canonical(context['authenticated_original']['event'])` | `history/forged_event`, `history/forged_original_storage_type`, `history/forged_source`, `history/forged_storage_metadata` | All other named negatives; 21059 retained refusals across covered families. |
| `historical_read: not Draft202012Validator(load('Plans/event_record.schema.json'), format_checker=FormatChecker()).is_valid(event)` | `history/envelope_schema`, `history/replay_policy_domain` | All other named negatives; 21093 retained refusals across covered families. |
| `historical_read: source_valid(c, prepared, completed, event, schemas, context.get('resolved_payload'), context.get('payload_ref_verified', False), historical=True) != 'accepted'` | `history/source_contract` | All other named negatives; 21110 retained refusals across covered families. |
| `identity: operation != application['owner_operation_id']` | `application_identity/changed_operation` | All other named negatives; 16862 retained refusals across covered families. |
| `recovery: case.get('replay_policy', f['event_record']['replay_policy']) == 'projector_replay_only'` | `recovery/replay_only` | All other named negatives; 21110 retained refusals across covered families. |
| `recovery: not case['admitted']` | `recovery/no_admission` | All other named negatives; 21110 retained refusals across covered families. |
| `recovery: not case['source_present'] or not case['owner_proven'] or (not case['backup_coherent']) or (not case['permission']) or case['deleted']` | `recovery/deleted_before_publication`, `recovery/missing_original_source`, `recovery/older_incoherent_restore`, `recovery/revoked_before_publication`, `recovery/unprovable_owner_outcome` | All other named negatives; 21042 retained refusals across covered families. |
| `recovery: not case['outcome_committed']` | `recovery/before_owner_commit` | All other named negatives; 21110 retained refusals across covered families. |
| `recovery: not Draft202012Validator(load('Plans/event_record.schema.json'), format_checker=FormatChecker()).is_valid(event)` | `recovery_custody/after_owner_commit_before_source_promotion/envelope_schema`, `recovery_custody/after_source_before_append/envelope_schema`, `recovery_custody/lost_ack_returns_original/envelope_schema` | All other named negatives; 21076 retained refusals across covered families. |
| `recovery: source_valid(c, prepared, completed, event, schemas, case.get('resolved_payload'), case.get('payload_ref_verified', False)) != 'accepted'` | `recovery_custody/after_owner_commit_before_source_promotion/event_id`, `recovery_custody/after_owner_commit_before_source_promotion/event_type`, `recovery_custody/after_owner_commit_before_source_promotion/prepare_commitment`, `recovery_custody/after_source_before_append/event_id`, `recovery_custody/after_source_before_append/event_type`, `recovery_custody/after_source_before_append/prepare_commitment`, `recovery_custody/lost_ack_returns_original/event_id`, `recovery_custody/lost_ack_returns_original/event_type`, `recovery_custody/lost_ack_returns_original/prepare_commitment` | All other named negatives; 20974 retained refusals across covered families. |
| `recovery: source_bytes(prepared) != source_bytes(original['prepared']) or source_bytes(completed) != source_bytes(original['completed'])` | `recovery_custody/after_owner_commit_before_source_promotion/authenticated_owner`, `recovery_custody/after_owner_commit_before_source_promotion/authenticated_owner_type`, `recovery_custody/after_source_before_append/authenticated_owner`, `recovery_custody/after_source_before_append/authenticated_owner_type`, `recovery_custody/lost_ack_returns_original/authenticated_owner`, `recovery_custody/lost_ack_returns_original/authenticated_owner_type` | All other named negatives; 21025 retained refusals across covered families. |
| `recovery: canonical(event) != canonical(original['event'])` | `recovery_custody/after_owner_commit_before_source_promotion/authenticated_storage_type`, `recovery_custody/after_owner_commit_before_source_promotion/storage_observed_at_utc`, `recovery_custody/after_owner_commit_before_source_promotion/storage_persisted_at_utc`, `recovery_custody/after_owner_commit_before_source_promotion/storage_sequence_id`, `recovery_custody/after_source_before_append/authenticated_storage_type`, `recovery_custody/after_source_before_append/storage_observed_at_utc`, `recovery_custody/after_source_before_append/storage_persisted_at_utc`, `recovery_custody/after_source_before_append/storage_sequence_id`, `recovery_custody/lost_ack_returns_original/authenticated_storage_type`, `recovery_custody/lost_ack_returns_original/storage_observed_at_utc`, `recovery_custody/lost_ack_returns_original/storage_persisted_at_utc`, `recovery_custody/lost_ack_returns_original/storage_sequence_id` | All other named negatives; 20923 retained refusals across covered families. |
| `recovery: not case['receipt_custody'] or not case['full_flush']` | `recovery/missing_receipt_custody`, `recovery/no_barrier_flush` | All other named negatives; 21093 retained refusals across covered families. |
| `recovery: canonical([receipt['event_id'], receipt['sequence_id']]) != canonical([event['event_id'], event['sequence_id']])` | `recovery_custody/lost_ack_returns_original/receipt_event_id`, `recovery_custody/lost_ack_returns_original/receipt_sequence_id`, `recovery_custody/lost_ack_returns_original/receipt_sequence_id_boolean` | All other named negatives; 21076 retained refusals across covered families. |
| `recovery: canonical(receipt) != canonical(original['receipt'])` | `recovery_custody/lost_ack_returns_original/first_receipt_boolean_generation`, `recovery_custody/lost_ack_returns_original/first_receipt_byte_offset`, `recovery_custody/lost_ack_returns_original/first_receipt_durable_end_offset`, `recovery_custody/lost_ack_returns_original/first_receipt_manifest_generation` | All other named negatives; 21059 retained refusals across covered families. |
| `source_valid: not historical and event['replay_policy'] != 'dedupe_by_idempotency_key'` | `replay/current_writer` | All other named negatives; 21110 retained refusals across covered families. |
| `source_valid: len(application_bytes(event['payload'])) > 16384` | `size/oversized_inline` | All other named negatives; 21110 retained refusals across covered families. |
| `source_valid: source_definition not in schemas` | `config/missing_definition` | All other named negatives; 21127 retained refusals across covered families. |
| `source_valid: list(validator.iter_errors(prepared)) or list(validator.iter_errors(completed))` | `source_schema/unexpected` | All other named negatives; 21110 retained refusals across covered families. |
| `source_valid: len(source_bytes(prepared)) > 1048576` | `source_size/application/prepared`, `source_size/project/prepared` | All other named negatives; 21103 retained refusals across covered families. |
| `source_valid: len(source_bytes(completed)) > 1048576` | `source_size/application/completed`, `source_size/project/completed` | All other named negatives; 21103 retained refusals across covered families. |
| `source_valid: prepared['stage'] != 'prepared' or completed['stage'] != 'completed' or completed['prepared_sha256'] != hashlib.sha256(source_bytes(prepared)).hexdigest()` | `prepare/commitment`, `recovery_custody/after_owner_commit_before_source_promotion/prepare_commitment`, `recovery_custody/after_source_before_append/prepare_commitment`, `recovery_custody/lost_ack_returns_original/prepare_commitment` | All other named negatives; 21059 retained refusals across covered families. |
| `source_valid: any((prepared[k] != completed[k] for k in immutable))` | `source/immutable_owner` | All other named negatives; 21110 retained refusals across covered families. |
| `source_valid: any((a[k] != b[k] for k in a if k != 'occurred_at_utc'))` | `source/immutable_envelope` | All other named negatives; 21110 retained refusals across covered families. |
| `source_valid: event['scope_kind'] != completed['envelope_context']['scope_kind']` | `scope/envelope_kind` | All other named negatives; 16862 retained refusals across covered families. |
| `source_valid: partition != completed['scope_partition'] or (c['scope_policy'] == 'project_only' and event['scope_kind'] != 'project')` | `partition/raw_project_id` | All other named negatives; 21110 retained refusals across covered families. |
| `source_valid: not payload_ref_verified or canonical(resolved_payload) != canonical(p)` | `payload_ref/changed`, `payload_ref/unverified`, `payload_type/application/ref`, `payload_type/project/ref` | All other named negatives; 21082 retained refusals across covered families. |
| `source_valid: canonical(event['payload']) != canonical(p)` | `history/source_contract`, `payload/unjoined`, `payload_type/application/inline`, `payload_type/project/inline` | All other named negatives; 21082 retained refusals across covered families. |
| `source_valid: any((event[k] != b[k] for k in b if k != 'scope_kind'))` | `envelope/actor_ref`, `envelope/project_id`, `envelope/run_id` | All other named negatives; 21076 retained refusals across covered families. |
| `source_valid: event['event_type'] != c['event_type'] or event['payload_schema_id'] != c['payload_schema_id']` | `envelope/event_type`, `envelope/payload_schema_id`, `recovery_custody/after_owner_commit_before_source_promotion/event_type`, `recovery_custody/after_source_before_append/event_type`, `recovery_custody/lost_ack_returns_original/event_type` | All other named negatives; 21042 retained refusals across covered families. |
| `source_valid: any((p[k] != completed['subject'][k] for k in c['identity_fields']))` | `subject/approval_scope_key`, `subject/attempt_id`, `subject/blocked_sequence`, `subject/dedupe_key`, `subject/enqueue_id`, `subject/evaluation_id`, `subject/gate_id`, `subject/node_id`, `subject/observed_at_utc`, `subject/project_id`, `subject/report_ref`, `subject/run_id`, `subject/source_ref`, `subject/thread_id`, `subject/tool_use_id`, `subject/usage_record_id`, `subject/wizard_id`, `subject/worktree_id` | All other named negatives; 21079 retained refusals across covered families. |
| `source_valid: key != event['idempotency_key'] or eid != event['event_id'] or key != completed['idempotency_key'] or (eid != completed['event_id'])` | `app_key/application_absent_provider_account/literal_ids`, `app_key/application_absent_provider_account/wrong_prefix`, `app_key/application_absent_provider_account/wrong_server`, `app_key/authenticated_application_source/literal_ids`, `app_key/authenticated_application_source/wrong_prefix`, `app_key/authenticated_application_source/wrong_server`, `application_identity/changed_server`, `recovery_custody/after_owner_commit_before_source_promotion/event_id`, `recovery_custody/after_source_before_append/event_id`, `recovery_custody/lost_ack_returns_original/event_id` | All other named negatives; 21045 retained refusals across covered families. |
| `source_valid: k in p and p[k] != event[k]` | `payload_envelope/attempt_id`, `payload_envelope/node_id`, `payload_envelope/project_id`, `payload_envelope/run_id`, `payload_envelope/thread_id` | All other named negatives; 20638 retained refusals across covered families. |
| `source_valid: event['occurred_at_utc'] != p.get('ts', p.get('observed_at_utc'))` | `envelope/occurrence_time` | All other named negatives; 21110 retained refusals across covered families. |
| `source_valid: any((p.get(k) != v for k, v in completed['runtime_context'].items()))` | `runtime/lane_id`, `runtime/package_id`, `runtime/provider_attempt_ref` | All other named negatives; 13338 retained refusals across covered families. |
| `source_valid: c['event_type'] == 'usage.event' and p['usage_event_ref'] != event['event_id']` | `usage/event_ref` | All other named negatives; 12769 retained refusals across covered families. |
| `source_valid: c['event_type'] == 'tool.invoked' and completed['before']['web_request'] is not None and (event['parent_event_id'] != completed['before']['web_request'].get('parent_event_id'))` | `source_join/batch_child_wrong_parent` | All other named negatives; 2211 retained refusals across covered families. |
| `source_valid: not transition(c['event_type'], p, completed['before'], completed['owner_result'])` | `semantic/actor_not_human`, `semantic/already_dispatched`, `semantic/already_resolved`, `semantic/already_started`, `semantic/blocked_not_failed`, `semantic/blocked_not_passed`, `semantic/clarification_pending`, `semantic/editor_open`, `semantic/empty_actions`, `semantic/failed_predicate`, `semantic/file_lock_unchecked`, `semantic/grace_not_elapsed`, `semantic/hook_blocked`, `semantic/incomplete_questions`, `semantic/invalid_settlement`, `semantic/lock_held`, `semantic/no_request`, `semantic/no_start`, `semantic/not_blocked`, `semantic/not_created`, `semantic/not_deleted`, `semantic/not_denied`, `semantic/not_expired`, `semantic/not_first_load`, `semantic/paused`, `semantic/policy_denied`, `semantic/recovery_held`, `semantic/refused_not_executed`, `semantic/resolved_episode`, `semantic/reused_evaluation`, `semantic/revoked`, `semantic/safe_point_held`, `semantic/schema_refused`, `semantic/terminal_open`, `semantic/uncommitted_queue`, `semantic/unlisted_action`, `semantic/unproven_parent_run`, `semantic/wrong_account`, `semantic/wrong_duration`, `semantic/wrong_evaluation`, `semantic/wrong_host`, `semantic/wrong_input_hash`, `semantic/wrong_lane`, `semantic/wrong_latency`, `semantic/wrong_observation`, `semantic/wrong_path`, `semantic/wrong_provider_attempt`, `semantic/wrong_result`, `semantic/wrong_root`, `semantic/wrong_success`, `semantic/wrong_thread`, `source_join/absent_provider_account_fabricated_account`, `source_join/allow_is_not_denial`, `source_join/already_dispatched_cannot_deny`, `source_join/altered_original_allowed_action_ids`, `source_join/altered_original_approval_scope_key`, `source_join/altered_original_blocked_reason_code`, `source_join/altered_original_blocked_sequence`, `source_join/altered_original_headless_denied`, `source_join/altered_original_permission_snapshot_id`, `source_join/altered_score`, `source_join/altered_score_threshold`, `source_join/application_absent_provider_account_fabricated_account`, `source_join/batch_child_wrong_source_url`, `source_join/changed_known_account_id`, `source_join/changed_known_billing_entity_id`, `source_join/changed_known_provider_account_ref`, `source_join/cli_without_account_fabricated_account`, `source_join/filesafe_owner_conflict_fences_only_this_facet`, `source_join/invalid_canonical_allowed_action_ids`, `source_join/local_without_account_fabricated_account`, `source_join/schema_refusal_is_not_policy_denial`, `source_join/transplanted_blocked_episode`, `source_join/unjoined_original_map_ref`, `source_join/unknown_without_account_fabricated_account`, `source_join/wrong_original_dispatch_ref`, `source_join/wrong_original_dispatch_tuple` | All other named negatives; 21037 retained refusals across covered families. |
| `tool_request_join: payload.get('tool_use_id') is not None` | `boundary/tool_request_join controls`, `boundary/transition controls` | All other named negatives; 952 retained refusals across covered families. |
| `tool_request_join: payload['tool_use_id'] == before['tool_use_id']` | `boundary/tool_request_join controls`, `boundary/transition controls` | All other named negatives; 788 retained refusals across covered families. |
| `tool_request_join: 'tool_use_id' not in payload` | `boundary/tool_request_join controls` | All other named negatives; 960 retained refusals across covered families. |
| `tool_request_join: before['tool_use_id'] is None` | `boundary/tool_request_join controls`, `boundary/transition controls` | All other named negatives; 952 retained refusals across covered families. |
| `transition: name in ['gate.evaluation_started', 'gate.failed', 'gate.passed'] and (not gate_score_join(payload, before, outcome))` | `boundary/transition controls`, `source_join/altered_score`, `source_join/altered_score_threshold`, `source_join/wrong_original_dispatch_ref`, `source_join/wrong_original_dispatch_tuple` | All other named negatives; 1722 retained refusals across covered families. |
| `transition: before['episode_state'] == 'blocked'` | `boundary/transition controls`, `semantic/resolved_episode` | All other named negatives; 217 retained refusals across covered families. |
| `transition: bool(payload['allowed_action_ids'])` | `boundary/transition controls` | All other named negatives; 234 retained refusals across covered families. |
| `transition: payload['allowed_action_ids'] == before['allowed_action_ids']` | `boundary/transition controls`, `semantic/empty_actions` | All other named negatives; 231 retained refusals across covered families. |
| `transition: tool_request_join(payload, before)` | `boundary/transition controls` | All other named negatives; 203 retained refusals across covered families. |
| `transition: before['episode_state'] == 'requested'` | `boundary/transition controls`, `semantic/no_request` | All other named negatives; 242 retained refusals across covered families. |
| `transition: before['human_authenticated']` | `boundary/transition controls`, `semantic/actor_not_human` | All other named negatives; 262 retained refusals across covered families. |
| `transition: not before['paused']` | `boundary/transition controls`, `semantic/paused` | All other named negatives; 262 retained refusals across covered families. |
| `transition: not before['revoked']` | `boundary/transition controls`, `semantic/revoked` | All other named negatives; 262 retained refusals across covered families. |
| `transition: payload['allowed_action_id'] in before['allowed_action_ids']` | `boundary/transition controls`, `semantic/unlisted_action` | All other named negatives; 238 retained refusals across covered families. |
| `transition: tool_request_join(payload, before)` | `boundary/transition controls` | All other named negatives; 230 retained refusals across covered families. |
| `transition: before['episode_state'] == 'requested'` | `boundary/transition controls`, `semantic/already_resolved` | All other named negatives; 206 retained refusals across covered families. |
| `transition: tool_request_join(payload, before)` | `boundary/transition controls` | All other named negatives; 194 retained refusals across covered families. |
| `transition: before['episode_state'] == 'requested'` | `boundary/transition controls`, `semantic/already_resolved` | All other named negatives; 209 retained refusals across covered families. |
| `transition: time_value(payload['ts']) >= time_value(before['deadline_at_utc'])` | `boundary/transition controls`, `semantic/not_expired` | All other named negatives; 229 retained refusals across covered families. |
| `transition: tool_request_join(payload, before)` | `boundary/transition controls` | All other named negatives; 197 retained refusals across covered families. |
| `transition: before['first_load']` | `boundary/transition controls`, `semantic/not_first_load` | All other named negatives; 460 retained refusals across covered families. |
| `transition: payload['legacy_value'] == before['legacy_value']` | `boundary/transition controls` | All other named negatives; 431 retained refusals across covered families. |
| `transition: payload['result_ref'] == outcome['committed_settings_ref']` | `boundary/transition controls`, `semantic/wrong_result` | All other named negatives; 397 retained refusals across covered families. |
| `transition: payload['source_ref'] == before['source_ref']` | `boundary/transition controls` | All other named negatives; 398 retained refusals across covered families. |
| `transition: payload['source_sha256'] == before['source_sha256']` | `boundary/transition controls`, `semantic/wrong_input_hash` | All other named negatives; 397 retained refusals across covered families. |
| `transition: {'single': 'None', 'per_phase': 'Phase', 'per_task': 'Task'}.get(payload['legacy_value']) == payload['enum_value']` | `boundary/transition controls` | All other named negatives; 383 retained refusals across covered families. |
| `transition: before['evaluation_state'] == 'allocated'` | `boundary/transition controls`, `semantic/reused_evaluation` | All other named negatives; 698 retained refusals across covered families. |
| `transition: payload['evaluation_id'] == before['evaluation_id']` | `boundary/transition controls`, `semantic/wrong_evaluation` | All other named negatives; 665 retained refusals across covered families. |
| `transition: before['evaluation_state'] == 'started'` | `boundary/transition controls`, `semantic/no_start` | All other named negatives; 882 retained refusals across covered families. |
| `transition: bool(payload['evidence_refs'])` | `boundary/transition controls` | All other named negatives; 907 retained refusals across covered families. |
| `transition: not outcome['question_ids']` | `boundary/transition controls` | All other named negatives; 910 retained refusals across covered families. |
| `transition: outcome['report_status'] == 'FAIL'` | `boundary/transition controls`, `semantic/blocked_not_failed` | All other named negatives; 879 retained refusals across covered families. |
| `transition: payload['evaluation_id'] == before['evaluation_id']` | `boundary/transition controls`, `semantic/wrong_evaluation` | All other named negatives; 846 retained refusals across covered families. |
| `transition: payload['evidence_refs'] == outcome['evidence_refs']` | `boundary/transition controls` | All other named negatives; 904 retained refusals across covered families. |
| `transition: payload['failure_reason_code'] == outcome['failure_reason_code']` | `boundary/transition controls` | All other named negatives; 847 retained refusals across covered families. |
| `transition: payload['gate_id'] == before['gate_id']` | `boundary/transition controls` | All other named negatives; 847 retained refusals across covered families. |
| `transition: before['evaluation_state'] == 'started'` | `boundary/transition controls`, `semantic/no_start` | All other named negatives; 820 retained refusals across covered families. |
| `transition: bool(payload['evidence_refs'])` | `boundary/transition controls` | All other named negatives; 845 retained refusals across covered families. |
| `transition: not outcome['question_ids']` | `boundary/transition controls`, `semantic/clarification_pending` | All other named negatives; 847 retained refusals across covered families. |
| `transition: outcome['all_predicates_pass']` | `boundary/transition controls`, `semantic/failed_predicate` | All other named negatives; 847 retained refusals across covered families. |
| `transition: outcome['report_status'] == 'PASS'` | `boundary/transition controls`, `semantic/blocked_not_passed` | All other named negatives; 817 retained refusals across covered families. |
| `transition: payload['evaluation_id'] == before['evaluation_id']` | `boundary/transition controls` | All other named negatives; 785 retained refusals across covered families. |
| `transition: payload['evidence_refs'] == outcome['evidence_refs']` | `boundary/transition controls` | All other named negatives; 842 retained refusals across covered families. |
| `transition: payload['gate_id'] == before['gate_id']` | `boundary/transition controls` | All other named negatives; 785 retained refusals across covered families. |
| `transition: all((payload[k] == before[k] for k in ['question_ids', 'report_ref', 'wizard_id', 'thread_id']))` | `boundary/transition controls`, `semantic/incomplete_questions`, `semantic/wrong_thread` | All other named negatives; 154 retained refusals across covered families. |
| `transition: before['report_status'] == 'BLOCKED'` | `boundary/transition controls`, `semantic/not_blocked` | All other named negatives; 213 retained refusals across covered families. |
| `transition: bool(before['question_ids'])` | `boundary/transition controls` | All other named negatives; 223 retained refusals across covered families. |
| `transition: all((payload[k] == before[k] for k in ['enqueue_id', 'queue_record_ref', 'scope_ref', 'host_ref', 'root_ref']))` | `boundary/transition controls`, `semantic/wrong_host`, `semantic/wrong_root` | All other named negatives; 159 retained refusals across covered families. |
| `transition: before['queue_state'] == 'committed'` | `boundary/transition controls`, `semantic/uncommitted_queue` | All other named negatives; 259 retained refusals across covered families. |
| `transition: all((payload[k] == before[k] for k in fields))` | `boundary/transition controls`, `source_join/altered_original_allowed_action_ids`, `source_join/altered_original_approval_scope_key`, `source_join/altered_original_blocked_reason_code`, `source_join/altered_original_blocked_sequence`, `source_join/altered_original_permission_snapshot_id`, `source_join/invalid_canonical_allowed_action_ids`, `source_join/transplanted_blocked_episode` | All other named negatives; 288 retained refusals across covered families. |
| `transition: denial_emission(before) == 'emit'` | `boundary/transition controls`, `semantic/already_dispatched`, `semantic/not_denied`, `source_join/allow_is_not_denial`, `source_join/already_dispatched_cannot_deny`, `source_join/filesafe_owner_conflict_fences_only_this_facet`, `source_join/schema_refusal_is_not_policy_denial` | All other named negatives; 482 retained refusals across covered families. |
| `transition: not payload['executed_at_all']` | `boundary/transition controls` | All other named negatives; 583 retained refusals across covered families. |
| `transition: payload['failure_class'] is None` | `boundary/transition controls` | All other named negatives; 583 retained refusals across covered families. |
| `transition: payload['headless_denied'] == (payload['blocked_reason_code'] == 'headless_ask_denied')` | `boundary/transition controls` | All other named negatives; 567 retained refusals across covered families. |
| `transition: all((payload.get(k) == outcome[k] for k in ['result_ref', 'outcome', 'duration_ms']))` | `boundary/transition controls`, `semantic/wrong_duration`, `semantic/wrong_result` | All other named negatives; 188 retained refusals across covered families. |
| `transition: before['execution_state'] == 'started'` | `boundary/transition controls`, `semantic/no_start` | All other named negatives; 349 retained refusals across covered families. |
| `transition: before['execution_state'] == 'admitted'` | `boundary/transition controls`, `semantic/already_started` | All other named negatives; 163 retained refusals across covered families. |
| `transition: before['hooks_pass']` | `boundary/transition controls`, `semantic/hook_blocked` | All other named negatives; 173 retained refusals across covered families. |
| `transition: before['policy_decision'] == 'allow'` | `boundary/transition controls`, `semantic/policy_denied` | All other named negatives; 163 retained refusals across covered families. |
| `transition: before['schema_valid']` | `boundary/transition controls`, `semantic/schema_refused` | All other named negatives; 173 retained refusals across covered families. |
| `transition: all((payload.get(k) == outcome[k] for k in ['success', 'latency_ms', 'index_used', 'meta']))` | `boundary/transition controls`, `semantic/wrong_latency`, `semantic/wrong_success`, `source_join/unjoined_original_map_ref` | All other named negatives; 895 retained refusals across covered families. |
| `transition: before['dispatch_state'] == 'started'` | `boundary/transition controls` | All other named negatives; 2122 retained refusals across covered families. |
| `transition: outcome['dispatch_state'] == 'attempted_completed'` | `boundary/transition controls`, `semantic/refused_not_executed` | All other named negatives; 2112 retained refusals across covered families. |
| `transition: web_join` | `boundary/transition controls` | All other named negatives; 1684 retained refusals across covered families. |
| `transition: previous in ['settled', 'adjusted', 'failed'] and state in ['observed', 'streaming_partial', 'unknown']` | `boundary/transition controls`, `semantic/invalid_settlement` | All other named negatives; 12764 retained refusals across covered families. |
| `transition: state == 'adjusted' and previous not in ['settled', 'adjusted']` | `boundary/transition controls` | All other named negatives; 12761 retained refusals across covered families. |
| `transition: previous is not None and (not before['prior_usage_event_ref'])` | `boundary/transition controls` | All other named negatives; 12741 retained refusals across covered families. |
| `transition: state == 'settled' and (not payload.get('settled_at_utc'))` | `boundary/transition controls` | All other named negatives; 12741 retained refusals across covered families. |
| `transition: state == 'adjusted' and (not payload.get('adjusted_at_utc'))` | `boundary/transition controls` | All other named negatives; 12769 retained refusals across covered families. |
| `transition: all((payload.get(k) == before[k] for k in ['usage_record_id', 'dedupe_key', 'provider_attempt_ref', 'parent_usage_record_id', 'account_id', 'billing_entity_id', 'provider_account_ref']))` | `boundary/transition controls`, `semantic/wrong_account`, `semantic/wrong_provider_attempt`, `source_join/absent_provider_account_fabricated_account`, `source_join/application_absent_provider_account_fabricated_account`, `source_join/changed_known_account_id`, `source_join/changed_known_billing_entity_id`, `source_join/changed_known_provider_account_ref`, `source_join/cli_without_account_fabricated_account`, `source_join/local_without_account_fabricated_account`, `source_join/unknown_without_account_fabricated_account` | All other named negatives; 9216 retained refusals across covered families. |
| `transition: payload.get('parent_run_id') == before['parent_run_id']` | `boundary/transition controls`, `semantic/unproven_parent_run` | All other named negatives; 12719 retained refusals across covered families. |
| `transition: payload['provider_payload_hash'] == before['observation_sha256']` | `boundary/transition controls`, `semantic/wrong_observation` | All other named negatives; 12171 retained refusals across covered families. |
| `transition: payload['raw_payload_ref'] == before['observation_ref']` | `boundary/transition controls` | All other named negatives; 12172 retained refusals across covered families. |
| `transition: usage_values_valid(payload)` | `boundary/transition controls` | All other named negatives; 8906 retained refusals across covered families. |
| `transition: all((payload.get(k) == before[k] for k in ['branch_name', 'worktree_path', 'repo_id', 'run_id', 'lane_id', 'package_id']))` | `boundary/transition controls`, `semantic/wrong_lane`, `semantic/wrong_path` | All other named negatives; 165 retained refusals across covered families. |
| `transition: before['allocation_state'] == 'allocated'` | `boundary/transition controls` | All other named negatives; 288 retained refusals across covered families. |
| `transition: outcome['allocation_state'] == 'created'` | `boundary/transition controls`, `semantic/not_created` | All other named negatives; 287 retained refusals across covered families. |
| `transition: all((payload.get(k) == before[k] for k in ['repo_id', 'run_id', 'lane_id', 'package_id']))` | `boundary/transition controls` | All other named negatives; 186 retained refusals across covered families. |
| `transition: before['allocation_state'] == 'cleanup_eligible'` | `boundary/transition controls`, `semantic/not_deleted` | All other named negatives; 262 retained refusals across covered families. |
| `transition: before['elapsed_grace_ms'] >= payload['grace_period_ms']` | `boundary/transition controls`, `semantic/grace_not_elapsed` | All other named negatives; 270 retained refusals across covered families. |
| `transition: before['file_lock_checked']` | `boundary/transition controls`, `semantic/file_lock_unchecked` | All other named negatives; 272 retained refusals across covered families. |
| `transition: not any((before[k] for k in ['active_lock_refs', 'safe_point_refs', 'terminal_session_refs', 'editor_session_refs', 'blocked_recovery_refs']))` | `boundary/transition controls`, `semantic/editor_open`, `semantic/lock_held`, `semantic/recovery_held`, `semantic/safe_point_held`, `semantic/terminal_open` | All other named negatives; 264 retained refusals across covered families. |
| `transition: not payload.get('active_lock_refs')` | `boundary/transition controls` | All other named negatives; 273 retained refusals across covered families. |
| `transition: not payload.get('safe_point_refs')` | `boundary/transition controls` | All other named negatives; 273 retained refusals across covered families. |
| `transition: outcome['allocation_state'] == 'deleted'` | `boundary/transition controls` | All other named negatives; 263 retained refusals across covered families. |
| `transition: payload['file_lock_checked']` | `boundary/transition controls` | All other named negatives; 273 retained refusals across covered families. |
| `usage_values_valid: p['cost_microdollars'] != cost['cost_microdollars']` | `boundary/transition controls`, `boundary/usage_values_valid controls`, `usage_value/flat_cost_disagrees` | All other named negatives; 12441 retained refusals across covered families. |
| `usage_values_valid: any((p[k] != cost[k] for k in ['currency', 'cost_status', 'pricing_snapshot_id', 'pricing_source', 'pricing_effective_at', 'pricing_version']))` | `boundary/transition controls`, `boundary/usage_values_valid controls` | All other named negatives; 5580 retained refusals across covered families. |
| `usage_values_valid: cost['cost_status'] == 'unknown' and (cost['cost_microdollars'] is not None or cost['cost_minor_units'] is not None)` | `boundary/transition controls`, `boundary/usage_values_valid controls`, `usage_value/unknown_cost_fabricates_zero` | All other named negatives; 12736 retained refusals across covered families. |
| `usage_values_valid: cost['cost_status'] in ['hidden_subscription', 'hidden_byok'] and p['display_cost_policy'] == 'show'` | `usage_value/hidden_byok_cost_shown` | All other named negatives; 12769 retained refusals across covered families. |
| `usage_values_valid: cost['cost_status'] in ['priced', 'estimated'] and any((cost[k] is None for k in ['pricing_snapshot_id', 'pricing_source', 'pricing_effective_at', 'pricing_version']))` | `boundary/usage_values_valid controls` | All other named negatives; 12767 retained refusals across covered families. |
| `usage_values_valid: any((quota[k] is not None for k in ['quota_remaining', 'quota_used', 'quota_limit', 'reset_at', 'cooldown_until']))` | `boundary/transition controls`, `boundary/usage_values_valid controls`, `usage_value/disabled_quota_has_countdown`, `usage_value/guessed_unknown_quota`, `usage_value/unexposed_quota_has_quantity` | All other named negatives; 12685 retained refusals across covered families. |
| `usage_values_valid: quota.get('credits_status', 'unknown') in ['unknown', 'disabled', 'not_exposed'] and quota.get('credits_remaining') is not None` | `boundary/transition controls`, `boundary/usage_values_valid controls` | All other named negatives; 12712 retained refusals across covered families. |
| `usage_values_valid: quota['window_kind'] == 'unknown' and (quota['reset_at'] is not None or quota['cooldown_until'] is not None)` | `boundary/transition controls`, `boundary/usage_values_valid controls` | All other named negatives; 12766 retained refusals across covered families. |

Schema F10 witnesses are separate: `invalid_web_web_operation/completed` removes only the two global-domain copies; `map_counter_on_read/completed` removes only the two copies of the exact map-field applicability rule. Schema equivalence is established for 81 factored implications and 165 old/new acceptance comparisons. Per-family schema rows, exact rule values, duplicate names and flipping names are in the JSON report.

| Family | Model negatives | Schema negatives | Model rows | Schema rows |
|---|---:|---:|---:|---:|
| `approval.requested` | 238 | 84 | 59 | 62 |
| `approval.granted` | 265 | 86 | 61 | 64 |
| `approval.denied` | 229 | 84 | 57 | 62 |
| `approval.timeout` | 232 | 83 | 58 | 61 |
| `config.migrated` | 464 | 106 | 58 | 69 |
| `gate.evaluation_started` | 732 | 86 | 59 | 63 |
| `gate.failed` | 913 | 88 | 65 | 65 |
| `gate.passed` | 851 | 87 | 65 | 64 |
| `requirements.clarification_requested` | 225 | 82 | 54 | 61 |
| `run.background_enqueued` | 271 | 84 | 55 | 63 |
| `tool.denied` | 587 | 96 | 59 | 73 |
| `tool.execution_completed` | 390 | 85 | 55 | 61 |
| `tool.execution_started` | 175 | 81 | 57 | 60 |
| `tool.invoked` | 2212 | 105 | 63 | 76 |
| `usage.event` | 12770 | 224 | 73 | 99 |
| `worktree.created` | 299 | 82 | 55 | 61 |
| `worktree.deleted` | 274 | 83 | 61 | 62 |

## What Astra keeps finding — all nine classes

| Class | How ruled out in every drafted family |
|---|---|
| 1. Forged/contradictory inputs | Recompute source commitment, identity and joins. 85 direct source forgeries plus source/transition guard witnesses refuse; recovery also validates the closure. |
| 2. Storage-assigned metadata | 102 direct metadata controls preserve original retries and refuse forged history; recovery compares independent Storage event and first-receipt observations. |
| 3. Historical readers | 792 controls cover both policies and both supported scopes, missing live state and each disclosure/authentication guard. Replay-only writer refusal remains. |
| 4. One field read two ways | 243 representation/inventory controls cover hashes and every identity-field type. The four integer populations share exact spelling for 1/1.0 and retain exact u64 round trips; four full-main old-reader faults and one old-codec fault fail. |
| 5. Unvisited refs | 68 direct alternate/optional/unused/mirror mutations fail eagerly; 17 preflight-only removals allow every remaining complete-checker oracle to run and pass. |
| 6. Every stored part | 96 exact source-stage controls measure real selected-codec bytes independently of inline/ref routing. Limits are 1048576/1048577 bytes in both stages/scopes; Project decoding also refuses overflow. Existing owner text already permits SP-337; no null-only contradiction remains. |
| 7. Custody on every path | 1128 direct controls cover three recovery phases, valid originals, frozen owner/Storage facts, all 119 literal review corruptions and coherent one-defect joins in both supported scopes. Existing checkpoint, history, retry and pack controls remain. |
| 8. Masked negatives | Full guard table covers 159 AST predicates; exact conditional rule groups and 51 independently checked duplicate sets replace the broad mixed enum row. |
| 9. Grades exceed evidence | All 216 cells use the cycle-5 independent grades as before. Every current quote and source hash is checked. Only the 25 cells repaired by measured oracles/identity controls improve; existing PARTIAL/ABSENT/CONFLICT cells remain. |

Native owner, pack-reader and SP-278 authentication are assumed adapters throughout. These probes verify consistency and contract oracles, not native authentication, filesystem durability or admitted writers.

## Family grades before and after

Before: cycle-5 independent review. After: implementation `7b62f6ac834edab6875e09e413bb335f30fbe9ec`. **157 PASS / 32 PARTIAL / 25 ABSENT / 2 CONFLICT → 182 PASS / 7 PARTIAL / 25 ABSENT / 2 CONFLICT**, 216 cells. All seventeen oracle cells improve PARTIAL → PASS; four approval scope/identity and replay cells improve PARTIAL → PASS. Current exact quotes: **352**.

| Family | Before PASS/12 | After PASS/12 | Remaining non-PASS cells |
|---|---:|---:|---|
| `approval.requested` | 8 | 11 | membership_version ABSENT |
| `approval.granted` | 8 | 11 | membership_version ABSENT |
| `approval.denied` | 8 | 11 | membership_version ABSENT |
| `approval.timeout` | 8 | 11 | membership_version ABSENT |
| `config.migrated` | 10 | 11 | membership_version ABSENT |
| `gate.evaluation_started` | 10 | 11 | membership_version ABSENT |
| `gate.failed` | 10 | 11 | membership_version ABSENT |
| `gate.passed` | 10 | 11 | membership_version ABSENT |
| `requirements.clarification_requested` | 9 | 10 | membership_version ABSENT; retention PARTIAL |
| `run.background_enqueued` | 10 | 11 | membership_version ABSENT |
| `tool.denied` | 8 | 9 | membership_version ABSENT; producer CONFLICT; transitions CONFLICT |
| `tool.execution_completed` | 10 | 11 | membership_version ABSENT |
| `tool.execution_started` | 10 | 11 | membership_version ABSENT |
| `tool.invoked` | 10 | 11 | membership_version ABSENT |
| `usage.event` | 9 | 10 | membership_version ABSENT; retention PARTIAL |
| `worktree.created` | 9 | 10 | membership_version ABSENT; retention PARTIAL |
| `worktree.deleted` | 9 | 10 | membership_version ABSENT; retention PARTIAL |
| `tool.custom_headless.skipped` | 1 | 1 | membership_version ABSENT; producer PARTIAL; closed_payload_schema ABSENT; scope_identity ABSENT; replay_idempotency PARTIAL; retention ABSENT; redaction_custody ABSENT; transitions PARTIAL; consumers_checkpoints ABSENT; compatibility_withdrawal ABSENT; positive_negative_oracles ABSENT |

## Retention adjudication — exact populations



| Family | Existing binding / remaining work |
|---|---|
| `config.migrated` | RP-OPERATIONAL-2555D: 2,555 days / 2,000,000 per Project, original terminal migration anchor. SP-349 already supplies the one Server-wide app counterpart bucket with identical limits/TTL/holds. Event and both source rows bind it. No app-counting question remains. |
| `tool.denied` | RP-RUNTIME-365D for the drafted runtime-attributed actual-run/attempt policy/user-denial path, with existing holds and SP-349 app counterpart. FileSafe emission still requires the F1 owner answer. No independently permitted non-authority diagnostic population is invented. |
| `tool.invoked` | RP-RUNTIME-365D for actual runtime-attributed invocation history, original run completion and existing holds; SP-349 app counterpart. No copied class menu remains. |
| `usage.event` | SP-341/UF-108: ai.usage.usage-retention detail window (90-day default) in seglog and Parquet; permanent canonical daily account/provider/model totals committed before detail retirement and backed up. Structured `retention_binding` pins those decided terms. `PENDING_RETENTION_BINDING` is only the RT setting-driven policy-object/expiry-anchor adapter dependency; unknown binding remains materially incomplete and permits no deletion/admission. |
| `requirements.clarification_requested` | Review residual: “Ask which class and expiry anchor govern this report request where a run-completion anchor is inapplicable; do not assume that a ref-only report request is chat content. Runtime-linked cases should reuse existing runtime minima.” Exact question: **Which class and expiry anchor govern this report request where a run-completion anchor is inapplicable?** GATE-012 is pre-execution and has no required run. |
| `worktree.created` | Review residual: “Resolve the runless event's class/anchor and required lineage dependencies; the projection policy does not automatically register this event's retention.” Exact question: **What are the runless event's class/anchor and required lineage dependencies?** Runtime allocation history retains existing runtime minima; Project/thread operations outside an executor are distinct. |
| `worktree.deleted` | Review residual: “Neither name alone decides whether this exact event is that authority. Ask only that event/authority distinction and applicable anchor.” Exact question: **Is this exact event deletion-tombstone authority, or runless lifecycle history, and what is its applicable anchor?** Runtime history is distinct from runless lifecycle and `worktree_lane_thread_families`; RP-WORKTREE-TOMBSTONE-365D already protects that projection's tombstones while historical links exist. |

All pending facets preserve source/receipt/reference closure and existing holds. Retention bindings grant no family admission.



## Doctor question

**Exact question:** Is skipped eligible only on a Project's first-ever Doctor invocation, or on the first invocation that observes `tools.custom_headless` absent? If the first invocation has the key, may a later absence emit? What resets eligibility across a configuration revision, key removal/re-addition, Project import/clone or older restore?

**Disposition: STOPPED.** No DT writer, schema, reset rule or duplicate Doctor contract is authored. The prior recommendation remains unadopted; this fix round makes no recommendation or decision.








## Scope, IDs and verification

**New IDs: none. Existing IDs: CV-600..616, SP-580..596, ATS-290..298.** No newly authored technical binding or historical premise in this round. Current owner prose, contract map, registry/admission, both product stops, `.gitignore`, Decision Log and protected governance remain unchanged. Only the three tool invocation schema definitions and two exact Storage mirrors change. Shards/index were regenerated, not hand-edited; only the edited Storage registry has changed document shards.

| Verification | Actual exit | Result |
|---|---:|---|
| DT checker | 0 | 17 families / 6345 assertions. |
| Full guard proof, schema duplicate and equivalence probes | 0 each | Complete guard inventory, precise logical copies, unchanged accepted population. |
| Standing companion, six disjoint groups | 0 each | All 17 families; 295 main invocations; 227 full runs and 68 preflight refusals; checks 1–11 pass. |
| Reference-only removal controls / numeric-reader faults | 0 each | 17 complete downstream passes; five expected complete-main failures at the old numeric reader/codec. |
| Astra probes / scope / quote audit | 0 each | All nine classes, unchanged product stops, current 216-cell grading. |
| Implementation generation / validation | 0 each | Fifteen copied currentness files hash-match; regenerated shards and index committed. These passes preceded the origin/main advance. |
| Published-head shard check | 0 | Pass at e389beaf4d9bfa975829d4fd0fa0bee763803e96. |
| Published-head index validation | 1 | 22 failures on unchanged Decision Log/ledger paths after origin/main advanced; zero stale derived artifacts. |
| Storage recovery self-test | 0 | 22 checks pass. |
| Storage profile check | 1 | Same 41 errors as the cycle-5 main control; zero added/removed. |

Commands, exact outputs and SHA-256 are in `DT-checks.json`; retained proof manifest: `DT-evidence-sha256.json`. Reports/self-grade and check artifacts are copied to `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DT`. Assigned worktree is removed after publication. No main push, landing lock, admission, governance reseal or subagent.

**Method deviation:** Before reading the fix brief’s no-mail rule, one read-only mailbox inbox/who lookup ran. No registration, messages or further mailbox actions followed.

## Published-head integration item

At `e389beaf4d9bfa975829d4fd0fa0bee763803e96`, `pm-shard-plans.py --check` passes. `pm-plan-index.py validate` has top-level `status=fail`, exit 1: its removal guard compares with the moving `origin/main`, now `bc399e19742ddc6afd1a1cb1d77a33845341d565`, rather than this branch’s merge base. That newer main contains DL-302; neither reviewed `34fa8b601872791c8fa292b8e862bc78fb923ca9` nor this branch contains it. This branch did not remove it. The apparent removal also activates 21 existing ledger-format diagnostics. All 22 failing paths and the validator itself are byte-identical to the reviewed head. No failure reports a stale shard/index body.

This is an integration item for the lead when reconciling with current main. No removal guard, Decision Log, ledger, baseline reference or governance artifact was changed to suppress it. Reproduction: run the unmodified index validator against this head with the recorded origin/main. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix5/published-index-baseline-drift.json`, SHA-256 `88f9db37a3f1f4c4c152c2ef4cd54959110c2630ea1e2b2218ed750735e7ca8a`. The published-head command outputs are pinned separately in `published-index-e389beaf.json` and `published-shard-e389beaf.json`.
