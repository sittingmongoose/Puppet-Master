# DT-FIX4 — Event Authority targeted review round 4

Branch: `plans/ea-w2-tools-gates-approvals-20261104`. Reviewed head: `e767d85c73148d2aa398a88898746d26eaf0f1d4`. Assessed implementation head: `ba59027ddedf9835fdd05f4a06a68b24e444685f`. Reports-only publication follows.

**F10 is fixed for all seventeen drafted populations. All eleven standing checks pass.** The complete checker passes **5349 assertions**. Whole-family preparation is **0/18 → 16/18** under the existing retention exception; FileSafe and Doctor remain stopped. Membership stays ABSENT and native execution NOT_RUN. Original-owner, payload-pack and SP-278 authentication remain assumed adapters.

## Review round 4: findings and responses

- **F10 — fixed (`ba59027ddedf9835fdd05f4a06a68b24e444685f`).** Where: `oversized_inline`, `semantic_case` and the snapshot/transplant fixtures. Why: invented oversized payloads and stale observational copies masked the intended guard; Usage also lacked a retained prior reference. Fix: derive schema-valid coherent closures, recompute identities/prepare commitments, align every token/source witness, and test one actual predicate/schema rule at a time. `pm-dt-guard-isolation.py` publishes both flipping and still-refused names and fails a complete lane run on an uncovered predicate.

- **F10 whole-lane follow-ups — fixed in the same commit.** Generated source-subject, envelope and missing-stage negatives now start from coherent valid bases. The three gate bare-score cases retain matching score/threshold witnesses. Tool schema discriminator conditionals run only when the already-required discriminator is present, preventing unrelated cascading branches; both exact source mirrors match. No accepted schema population expands. Retry, scope, replay and Usage reference checks are factored so the same logical fact is enforced once at its boundary; all equivalent rejection rules remain. Numeric-context node extraction preserves its missing-context refusal while permitting an isolated predicate control.

Current implementation anchors: `scripts/pm-dt-event-contracts.py:612`, `scripts/pm-dt-event-contracts.py:641`, `scripts/pm-dt-standing-checks.py:50`, `scripts/pm-dt-guard-isolation.py:574`, `Plans/dt_event_contract_fixtures.json:6682`, `Plans/dt_event_contract_fixtures.json:7709`.

- **F2 — holds:** denied reason/class/action/episode joins remain bound; policy/user denial only.

- **F3 — holds:** all three gate dispatch/score joins still refuse unbound numeric results.

- **F4 — holds:** Usage accepts proven absent identities and refuses fabrication in both scopes.

- **F5 — holds:** web variants and parent/URL-child lineage remain bound.

- **F6 — holds:** decided retention bindings and all existing residual stops remain unchanged.

- **F7 — holds:** all patterned identifiers still refuse a trailing LF.

- **F8 — holds:** retry hashing uses only the exact 21 caller fields; Storage metadata preserves the original result.

- **F9 — holds:** unresolved references fail preflight. Seventeen additional controls disable only the actual preflight predicate; every remaining full-main oracle passes.

- **Check 10 — holds:** retained originals survive later invalid/unavailable live state; precise withdrawal/authentication predicate removals retain every other downstream check.

- **Stopped for Jared, unchanged:** the `tool.denied` FileSafe facet and `tool.custom_headless.skipped`. Their owner prose, family map, denial non-emission fixtures and stop grades are unchanged. No product answer, recommendation, writer, reset rule or admission is added.

Exact FileSafe question, unchanged: **Should FileSafe blocks emit tool.denied, reconciling Tools.md:1496 (do not emit tool.denied for FileSafe blocks) with FileSafe.md:2839-2846 (Align tool.denied emission with filesafe_blocked)?**

## Guard-removal table

Every model row below identifies an actual AST predicate (one clause at a time), not an early acceptance stub. The JSON companion contains exact per-family flipping names and schema-rule paths. The raw table lists every still-refused name. Repeated identical schema rules for the same field are one logical grammar guard and are changed coherently in their observational copies. A conditional dispatch-context required list is one rule; ordinary required fields remain enforced.

The missing-source-schema row is explicitly a **configuration-boundary** proof: removing one schema from an otherwise valid bundle activates the availability predicate; removing that predicate clears that boundary and reaches the expected missing-schema lookup. It is not described as accepting an event without a schema. All ordinary invalid-event cases retain their own rejection. Runtime, schema and configuration boundaries are not conflated.

Inventory: **150/150 predicates covered; zero uncovered**. Additional exact snapshot/version schema controls run unchanged checkpoint code with only the named property rule altered. Full preflight controls: **17/17**. Precise historical full-main faults: **34/34**.

| Guard / owner predicate | Negatives that flip | Negatives that stay rejected |
|---|---|---|
| `append_model: old_digest == digest` | `retry/actor_ref`, `retry/attempt_id`, `retry/causation_event_id`, `retry/correlation_id`, `retry/effective_account_ref`, `retry/event_type`, `retry/idempotency_key`, `retry/migration`, `retry/node_id`, `retry/occurred_at_utc`, `retry/parent_event_id`, `retry/payload`, `retry/payload_ref`, `retry/payload_schema_id`, `retry/producer_sequence_id`, `retry/project_id`, `retry/redaction_profile`, `retry/requested_account_ref`, `retry/run_id`, `retry/scope_kind`, `retry/thread_id` | All other named negatives; 20003 retained refusals across covered families. |
| `batch_join: pm.get('batch_role') != 'parent' or not children` | `batch/parent_role` | All other named negatives; 2162 retained refusals across covered families. |
| `batch_join: pm['child_tool_use_ids'] != [v['event']['payload']['tool_use_id'] for v in children] or len(set(pm['child_tool_use_ids'])) != len(children)` | `batch/duplicate_url_child_identity`, `batch/missing_url_child` | All other named negatives; 2161 retained refusals across covered families. |
| `batch_join: cm.get('batch_role') != 'child' or cm['batch_id'] != pm['batch_id'] or cm['parent_tool_use_id'] != p['tool_use_id'] or (e['parent_event_id'] != parent['event']['event_id']) or (not q.get('provider_attempt_ref')) or (q['tool_use_id'] == p['tool_use_id'])` | `batch/provider_attempt_missing`, `batch/wrong_batch`, `batch/wrong_parent_event`, `batch/wrong_parent_tool` | All other named negatives; 2159 retained refusals across covered families. |
| `batch_join: any((e[k] != parent['event'][k] for k in ['run_id', 'attempt_id', 'project_id', 'scope_kind']))` | `batch/cross_run` | All other named negatives; 2162 retained refusals across covered families. |
| `batch_join: p['success'] == all((v['event']['payload']['success'] for v in children))` | `batch/wrong_aggregate` | All other named negatives; 2162 retained refusals across covered families. |
| `checkpoint_result: list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(proposed))` | `checkpoint/future_checkpoint_version`, `checkpoint/persisted_snapshot_forbidden` | All other named negatives; 20326 retained refusals across covered families. |
| `checkpoint_result: not context['admitted'] or not context['reader_installed'] or context['withdrawn'] or (not context['permission']) or context['deleted']` | `checkpoint/append_withdrawn`, `checkpoint/read_permission_revoked`, `checkpoint/reader_uninstalled`, `checkpoint/reader_withdrawn`, `checkpoint/source_deleted` | All other named negatives; 20275 retained refusals across covered families. |
| `checkpoint_result: context['expected_previous'] != old or not context['lease_current']` | `checkpoint/cas_loss`, `checkpoint/lease_lost` | All other named negatives; 20326 retained refusals across covered families. |
| `checkpoint_result: proposed['index_read_token'] != context['current_token']` | `checkpoint/current_token_changed_frontier_revision`, `checkpoint/current_token_changed_frontier_sha256`, `checkpoint/current_token_changed_generation_anchor_sha256`, `checkpoint/current_token_changed_generation_id`, `checkpoint/current_token_changed_index_dataset_name`, `checkpoint/current_token_changed_source_selection` | All other named negatives; 20258 retained refusals across covered families. |
| `checkpoint_result: t['storage_instance_id'] != context['source_storage_instance_id']` | `storage/coherent_foreign` | All other named negatives; 20343 retained refusals across covered families. |
| `checkpoint_result: proposed['storage_instance_id'] != t['storage_instance_id'] or t['source_selection']['storage_instance_id'] != t['storage_instance_id']` | `storage/index_read_token/source_selection/storage_instance_id`, `storage/storage_instance_id` | All other named negatives; 20326 retained refusals across covered families. |
| `checkpoint_result: t['checkpoint_key'] != 'event_record_index_checkpoint.v1:' + t['storage_instance_id'] or t['checkpoint_ref'] != t['checkpoint_key'] + '#/generations/' + t['generation_id'] or t['index_dataset_name'] != 'event_record_index.v2@' + t['generation_id']` | `checkpoint/token_binding/checkpoint_key`, `checkpoint/token_binding/checkpoint_ref`, `checkpoint/token_binding/index_dataset_name` | All other named negatives; 20309 retained refusals across covered families. |
| `checkpoint_result: proposed['scope_partition'] != context['scope_partition'] or not context['source_verified'] or (not context['coverage_complete']) or (not context['versions_supported'])` | `checkpoint/future_source_version`, `checkpoint/source_gap`, `checkpoint/unverified_source`, `checkpoint/wrong_partition` | All other named negatives; 20292 retained refusals across covered families. |
| `checkpoint_result: prefix != expected_prefix` | `checkpoint/row_transplant_without_source_proof` | All other named negatives; 20343 retained refusals across covered families. |
| `checkpoint_result: proposed['examined_through_sequence_id'] != through or proposed['last_applied_event_id'] != last or (not proposed['filter_complete'])` | `checkpoint/filtered_row_max_is_not_global_cursor`, `checkpoint/incomplete_filter`, `checkpoint/wrong_matching_event` | All other named negatives; 20309 retained refusals across covered families. |
| `checkpoint_result: proposed['state'] != 'current' or proposed['health'] != 'healthy' or proposed['withdrawn_at_utc'] is not None` | `checkpoint/state/health`, `checkpoint/state/state`, `checkpoint/state/withdrawn_at_utc` | All other named negatives; 20309 retained refusals across covered families. |
| `checkpoint_result: old and old['state'] == 'withdrawn' and (not context['governed_rebuild'])` | `checkpoint/withdrawn_cursor_does_not_resume` | All other named negatives; 20343 retained refusals across covered families. |
| `checkpoint_result: old and old['examined_through_sequence_id'] is not None and (through is None or through < old['examined_through_sequence_id']) and (not context['governed_rebuild'])` | `checkpoint/rollback` | All other named negatives; 20343 retained refusals across covered families. |
| `checkpoint_schema: checkpoint_schema/future_checkpoint_version` | `checkpoint/future_checkpoint_version` | All other named negatives; 20343 retained refusals across covered families. |
| `checkpoint_schema: checkpoint_schema/persisted_snapshot_forbidden` | `checkpoint/persisted_snapshot_forbidden` | All other named negatives; 20343 retained refusals across covered families. |
| `denial_emission: before['denial_origin'] not in ['policy', 'user'] or before['policy_decision'] != 'deny' or before['dispatch_state'] != 'not_dispatched'` | `boundary/transition controls`, `semantic/already_dispatched`, `semantic/not_denied`, `source_join/allow_is_not_denial`, `source_join/already_dispatched_cannot_deny`, `source_join/schema_refusal_is_not_policy_denial` | All other named negatives; 434 retained refusals across covered families. |
| `gate_score_join: payload.get('score') != outcome['score'] or payload.get('score_threshold') != before['score_threshold']` | `boundary/gate_score_join controls`, `boundary/transition controls`, `source_join/altered_score`, `source_join/altered_score_threshold` | All other named negatives; 2217 retained refusals across covered families. |
| `gate_score_join: any((payload.get(k) != before[k] for k in ['dispatch_score_ref', 'dispatch_score_tuple']))` | `boundary/gate_score_join controls`, `boundary/transition controls`, `source_join/wrong_original_dispatch_ref`, `source_join/wrong_original_dispatch_tuple` | All other named negatives; 1293 retained refusals across covered families. |
| `gate_score_join: bool(payload.get('dispatch_score_ref'))` | `boundary/gate_score_join controls`, `boundary/transition controls` | All other named negatives; 2340 retained refusals across covered families. |
| `gate_score_join: context is not None` | `boundary/gate_score_join controls` | All other named negatives; 2364 retained refusals across covered families. |
| `gate_score_join: payload.get('node_id') == node_id` | `boundary/gate_score_join controls`, `boundary/transition controls` | All other named negatives; 2235 retained refusals across covered families. |
| `historical_read: not context['reader_installed'] or context['withdrawn'] or (not context['permission']) or context['deleted'] or (not context['source_present']) or (not context['owner_proven']) or (not context['versions_supported'])` | `history/deleted`, `history/owner_proven`, `history/permission`, `history/reader_installed`, `history/source_present`, `history/versions_supported`, `history/withdrawn` | All other named negatives; 20241 retained refusals across covered families. |
| `historical_read: original != context['authenticated_original']` | `history/forged_event`, `history/forged_source`, `history/forged_storage_metadata` | All other named negatives; 20309 retained refusals across covered families. |
| `historical_read: not Draft202012Validator(load('Plans/event_record.schema.json'), format_checker=FormatChecker()).is_valid(event)` | `history/envelope_schema` | All other named negatives; 20343 retained refusals across covered families. |
| `historical_read: source_valid(c, prepared, completed, event, schemas, context.get('resolved_payload'), context.get('payload_ref_verified', False)) != 'accepted'` | `history/source_contract` | All other named negatives; 20343 retained refusals across covered families. |
| `identity: operation != application['owner_operation_id']` | `application_identity/changed_operation` | All other named negatives; 16535 retained refusals across covered families. |
| `recovery: case.get('replay_policy', f['event_record']['replay_policy']) == 'projector_replay_only'` | `recovery/replay_only` | All other named negatives; 20343 retained refusals across covered families. |
| `recovery: not case['admitted']` | `recovery/no_admission` | All other named negatives; 20343 retained refusals across covered families. |
| `recovery: not case['source_present'] or not case['owner_proven'] or (not case['backup_coherent']) or (not case['permission']) or case['deleted']` | `recovery/deleted_before_publication`, `recovery/missing_original_source`, `recovery/older_incoherent_restore`, `recovery/revoked_before_publication`, `recovery/unprovable_owner_outcome` | All other named negatives; 20275 retained refusals across covered families. |
| `recovery: not case['outcome_committed']` | `recovery/before_owner_commit` | All other named negatives; 20343 retained refusals across covered families. |
| `recovery: not case['receipt_custody'] or not case['full_flush']` | `recovery/missing_receipt_custody`, `recovery/no_barrier_flush` | All other named negatives; 20326 retained refusals across covered families. |
| `source_valid: event['replay_policy'] != 'dedupe_by_idempotency_key'` | `replay/current_writer` | All other named negatives; 20343 retained refusals across covered families. |
| `source_valid: len(application_bytes(event['payload'])) > 16384` | `size/oversized_inline` | All other named negatives; 20343 retained refusals across covered families. |
| `source_valid: source_definition not in schemas` | `config/missing_definition` | All other named negatives; 20360 retained refusals across covered families. |
| `source_valid: list(validator.iter_errors(prepared)) or list(validator.iter_errors(completed))` | `source_schema/unexpected` | All other named negatives; 20343 retained refusals across covered families. |
| `source_valid: prepared['stage'] != 'prepared' or completed['stage'] != 'completed' or completed['prepared_sha256'] != hashlib.sha256(source_bytes(prepared)).hexdigest()` | `prepare/commitment` | All other named negatives; 20343 retained refusals across covered families. |
| `source_valid: any((prepared[k] != completed[k] for k in immutable))` | `source/immutable_owner` | All other named negatives; 20343 retained refusals across covered families. |
| `source_valid: any((a[k] != b[k] for k in a if k != 'occurred_at_utc'))` | `source/immutable_envelope` | All other named negatives; 20343 retained refusals across covered families. |
| `source_valid: event['scope_kind'] != completed['envelope_context']['scope_kind']` | `scope/envelope_kind` | All other named negatives; 16535 retained refusals across covered families. |
| `source_valid: partition != completed['scope_partition'] or (c['scope_policy'] == 'project_only' and event['scope_kind'] != 'project')` | `partition/raw_project_id` | All other named negatives; 20343 retained refusals across covered families. |
| `source_valid: not payload_ref_verified or resolved_payload != p` | `payload_ref/changed`, `payload_ref/unverified` | All other named negatives; 20326 retained refusals across covered families. |
| `source_valid: event['payload'] != p` | `history/source_contract`, `payload/unjoined` | All other named negatives; 20326 retained refusals across covered families. |
| `source_valid: any((event[k] != b[k] for k in b if k != 'scope_kind'))` | `envelope/actor_ref`, `envelope/project_id`, `envelope/run_id` | All other named negatives; 20309 retained refusals across covered families. |
| `source_valid: event['event_type'] != c['event_type'] or event['payload_schema_id'] != c['payload_schema_id']` | `envelope/event_type`, `envelope/payload_schema_id` | All other named negatives; 20326 retained refusals across covered families. |
| `source_valid: any((p[k] != completed['subject'][k] for k in c['identity_fields']))` | `subject/approval_scope_key`, `subject/attempt_id`, `subject/blocked_sequence`, `subject/dedupe_key`, `subject/enqueue_id`, `subject/evaluation_id`, `subject/gate_id`, `subject/node_id`, `subject/observed_at_utc`, `subject/project_id`, `subject/report_ref`, `subject/run_id`, `subject/source_ref`, `subject/thread_id`, `subject/tool_use_id`, `subject/usage_record_id`, `subject/wizard_id`, `subject/worktree_id` | All other named negatives; 20312 retained refusals across covered families. |
| `source_valid: key != event['idempotency_key'] or eid != event['event_id'] or key != completed['idempotency_key'] or (eid != completed['event_id'])` | `app_key/application_absent_provider_account/literal_ids`, `app_key/application_absent_provider_account/wrong_prefix`, `app_key/application_absent_provider_account/wrong_server`, `app_key/authenticated_application_source/literal_ids`, `app_key/authenticated_application_source/wrong_prefix`, `app_key/authenticated_application_source/wrong_server`, `application_identity/changed_server` | All other named negatives; 16511 retained refusals across covered families. |
| `source_valid: k in p and p[k] != event[k]` | `payload_envelope/attempt_id`, `payload_envelope/node_id`, `payload_envelope/project_id`, `payload_envelope/run_id`, `payload_envelope/thread_id` | All other named negatives; 19916 retained refusals across covered families. |
| `source_valid: event['occurred_at_utc'] != p.get('ts', p.get('observed_at_utc'))` | `envelope/occurrence_time` | All other named negatives; 20343 retained refusals across covered families. |
| `source_valid: any((p.get(k) != v for k, v in completed['runtime_context'].items()))` | `runtime/lane_id`, `runtime/package_id`, `runtime/provider_attempt_ref` | All other named negatives; 13201 retained refusals across covered families. |
| `source_valid: c['event_type'] == 'usage.event' and p['usage_event_ref'] != event['event_id']` | `usage/event_ref` | All other named negatives; 12720 retained refusals across covered families. |
| `source_valid: c['event_type'] == 'tool.invoked' and completed['before']['web_request'] is not None and (event['parent_event_id'] != completed['before']['web_request'].get('parent_event_id'))` | `source_join/batch_child_wrong_parent` | All other named negatives; 2162 retained refusals across covered families. |
| `source_valid: not transition(c['event_type'], p, completed['before'], completed['owner_result'])` | `semantic/actor_not_human`, `semantic/already_dispatched`, `semantic/already_resolved`, `semantic/already_started`, `semantic/blocked_not_failed`, `semantic/blocked_not_passed`, `semantic/clarification_pending`, `semantic/editor_open`, `semantic/empty_actions`, `semantic/failed_predicate`, `semantic/file_lock_unchecked`, `semantic/grace_not_elapsed`, `semantic/hook_blocked`, `semantic/incomplete_questions`, `semantic/invalid_settlement`, `semantic/lock_held`, `semantic/no_request`, `semantic/no_start`, `semantic/not_blocked`, `semantic/not_created`, `semantic/not_deleted`, `semantic/not_denied`, `semantic/not_expired`, `semantic/not_first_load`, `semantic/paused`, `semantic/policy_denied`, `semantic/recovery_held`, `semantic/refused_not_executed`, `semantic/resolved_episode`, `semantic/reused_evaluation`, `semantic/revoked`, `semantic/safe_point_held`, `semantic/schema_refused`, `semantic/terminal_open`, `semantic/uncommitted_queue`, `semantic/unlisted_action`, `semantic/unproven_parent_run`, `semantic/wrong_account`, `semantic/wrong_duration`, `semantic/wrong_evaluation`, `semantic/wrong_host`, `semantic/wrong_input_hash`, `semantic/wrong_lane`, `semantic/wrong_latency`, `semantic/wrong_observation`, `semantic/wrong_path`, `semantic/wrong_provider_attempt`, `semantic/wrong_result`, `semantic/wrong_root`, `semantic/wrong_success`, `semantic/wrong_thread`, `source_join/absent_provider_account_fabricated_account`, `source_join/allow_is_not_denial`, `source_join/already_dispatched_cannot_deny`, `source_join/altered_original_allowed_action_ids`, `source_join/altered_original_approval_scope_key`, `source_join/altered_original_blocked_reason_code`, `source_join/altered_original_blocked_sequence`, `source_join/altered_original_headless_denied`, `source_join/altered_original_permission_snapshot_id`, `source_join/altered_score`, `source_join/altered_score_threshold`, `source_join/application_absent_provider_account_fabricated_account`, `source_join/batch_child_wrong_source_url`, `source_join/changed_known_account_id`, `source_join/changed_known_billing_entity_id`, `source_join/changed_known_provider_account_ref`, `source_join/cli_without_account_fabricated_account`, `source_join/filesafe_owner_conflict_fences_only_this_facet`, `source_join/invalid_canonical_allowed_action_ids`, `source_join/local_without_account_fabricated_account`, `source_join/schema_refusal_is_not_policy_denial`, `source_join/transplanted_blocked_episode`, `source_join/unjoined_original_map_ref`, `source_join/unknown_without_account_fabricated_account`, `source_join/wrong_original_dispatch_ref`, `source_join/wrong_original_dispatch_tuple` | All other named negatives; 20270 retained refusals across covered families. |
| `tool_request_join: payload.get('tool_use_id') is not None` | `boundary/tool_request_join controls`, `boundary/transition controls` | All other named negatives; 772 retained refusals across covered families. |
| `tool_request_join: payload['tool_use_id'] == before['tool_use_id']` | `boundary/tool_request_join controls`, `boundary/transition controls` | All other named negatives; 608 retained refusals across covered families. |
| `tool_request_join: 'tool_use_id' not in payload` | `boundary/tool_request_join controls` | All other named negatives; 780 retained refusals across covered families. |
| `tool_request_join: before['tool_use_id'] is None` | `boundary/tool_request_join controls`, `boundary/transition controls` | All other named negatives; 772 retained refusals across covered families. |
| `transition: name in ['gate.evaluation_started', 'gate.failed', 'gate.passed'] and (not gate_score_join(payload, before, outcome))` | `boundary/transition controls`, `source_join/altered_score`, `source_join/altered_score_threshold`, `source_join/wrong_original_dispatch_ref`, `source_join/wrong_original_dispatch_tuple` | All other named negatives; 1593 retained refusals across covered families. |
| `transition: before['episode_state'] == 'blocked'` | `boundary/transition controls`, `semantic/resolved_episode` | All other named negatives; 172 retained refusals across covered families. |
| `transition: bool(payload['allowed_action_ids'])` | `boundary/transition controls` | All other named negatives; 189 retained refusals across covered families. |
| `transition: payload['allowed_action_ids'] == before['allowed_action_ids']` | `boundary/transition controls`, `semantic/empty_actions` | All other named negatives; 186 retained refusals across covered families. |
| `transition: tool_request_join(payload, before)` | `boundary/transition controls` | All other named negatives; 158 retained refusals across covered families. |
| `transition: before['episode_state'] == 'requested'` | `boundary/transition controls`, `semantic/no_request` | All other named negatives; 197 retained refusals across covered families. |
| `transition: before['human_authenticated']` | `boundary/transition controls`, `semantic/actor_not_human` | All other named negatives; 217 retained refusals across covered families. |
| `transition: not before['paused']` | `boundary/transition controls`, `semantic/paused` | All other named negatives; 217 retained refusals across covered families. |
| `transition: not before['revoked']` | `boundary/transition controls`, `semantic/revoked` | All other named negatives; 217 retained refusals across covered families. |
| `transition: payload['allowed_action_id'] in before['allowed_action_ids']` | `boundary/transition controls`, `semantic/unlisted_action` | All other named negatives; 193 retained refusals across covered families. |
| `transition: tool_request_join(payload, before)` | `boundary/transition controls` | All other named negatives; 185 retained refusals across covered families. |
| `transition: before['episode_state'] == 'requested'` | `boundary/transition controls`, `semantic/already_resolved` | All other named negatives; 161 retained refusals across covered families. |
| `transition: tool_request_join(payload, before)` | `boundary/transition controls` | All other named negatives; 149 retained refusals across covered families. |
| `transition: before['episode_state'] == 'requested'` | `boundary/transition controls`, `semantic/already_resolved` | All other named negatives; 164 retained refusals across covered families. |
| `transition: time_value(payload['ts']) >= time_value(before['deadline_at_utc'])` | `boundary/transition controls`, `semantic/not_expired` | All other named negatives; 184 retained refusals across covered families. |
| `transition: tool_request_join(payload, before)` | `boundary/transition controls` | All other named negatives; 152 retained refusals across covered families. |
| `transition: before['first_load']` | `boundary/transition controls`, `semantic/not_first_load` | All other named negatives; 415 retained refusals across covered families. |
| `transition: payload['legacy_value'] == before['legacy_value']` | `boundary/transition controls` | All other named negatives; 386 retained refusals across covered families. |
| `transition: payload['result_ref'] == outcome['committed_settings_ref']` | `boundary/transition controls`, `semantic/wrong_result` | All other named negatives; 352 retained refusals across covered families. |
| `transition: payload['source_ref'] == before['source_ref']` | `boundary/transition controls` | All other named negatives; 353 retained refusals across covered families. |
| `transition: payload['source_sha256'] == before['source_sha256']` | `boundary/transition controls`, `semantic/wrong_input_hash` | All other named negatives; 352 retained refusals across covered families. |
| `transition: {'single': 'None', 'per_phase': 'Phase', 'per_task': 'Task'}.get(payload['legacy_value']) == payload['enum_value']` | `boundary/transition controls` | All other named negatives; 338 retained refusals across covered families. |
| `transition: before['evaluation_state'] == 'allocated'` | `boundary/transition controls`, `semantic/reused_evaluation` | All other named negatives; 655 retained refusals across covered families. |
| `transition: payload['evaluation_id'] == before['evaluation_id']` | `boundary/transition controls`, `semantic/wrong_evaluation` | All other named negatives; 622 retained refusals across covered families. |
| `transition: before['evaluation_state'] == 'started'` | `boundary/transition controls`, `semantic/no_start` | All other named negatives; 839 retained refusals across covered families. |
| `transition: bool(payload['evidence_refs'])` | `boundary/transition controls` | All other named negatives; 864 retained refusals across covered families. |
| `transition: not outcome['question_ids']` | `boundary/transition controls` | All other named negatives; 867 retained refusals across covered families. |
| `transition: outcome['report_status'] == 'FAIL'` | `boundary/transition controls`, `semantic/blocked_not_failed` | All other named negatives; 836 retained refusals across covered families. |
| `transition: payload['evaluation_id'] == before['evaluation_id']` | `boundary/transition controls`, `semantic/wrong_evaluation` | All other named negatives; 803 retained refusals across covered families. |
| `transition: payload['evidence_refs'] == outcome['evidence_refs']` | `boundary/transition controls` | All other named negatives; 861 retained refusals across covered families. |
| `transition: payload['failure_reason_code'] == outcome['failure_reason_code']` | `boundary/transition controls` | All other named negatives; 804 retained refusals across covered families. |
| `transition: payload['gate_id'] == before['gate_id']` | `boundary/transition controls` | All other named negatives; 804 retained refusals across covered families. |
| `transition: before['evaluation_state'] == 'started'` | `boundary/transition controls`, `semantic/no_start` | All other named negatives; 777 retained refusals across covered families. |
| `transition: bool(payload['evidence_refs'])` | `boundary/transition controls` | All other named negatives; 802 retained refusals across covered families. |
| `transition: not outcome['question_ids']` | `boundary/transition controls`, `semantic/clarification_pending` | All other named negatives; 804 retained refusals across covered families. |
| `transition: outcome['all_predicates_pass']` | `boundary/transition controls`, `semantic/failed_predicate` | All other named negatives; 804 retained refusals across covered families. |
| `transition: outcome['report_status'] == 'PASS'` | `boundary/transition controls`, `semantic/blocked_not_passed` | All other named negatives; 774 retained refusals across covered families. |
| `transition: payload['evaluation_id'] == before['evaluation_id']` | `boundary/transition controls` | All other named negatives; 742 retained refusals across covered families. |
| `transition: payload['evidence_refs'] == outcome['evidence_refs']` | `boundary/transition controls` | All other named negatives; 799 retained refusals across covered families. |
| `transition: payload['gate_id'] == before['gate_id']` | `boundary/transition controls` | All other named negatives; 742 retained refusals across covered families. |
| `transition: all((payload[k] == before[k] for k in ['question_ids', 'report_ref', 'wizard_id', 'thread_id']))` | `boundary/transition controls`, `semantic/incomplete_questions`, `semantic/wrong_thread` | All other named negatives; 111 retained refusals across covered families. |
| `transition: before['report_status'] == 'BLOCKED'` | `boundary/transition controls`, `semantic/not_blocked` | All other named negatives; 170 retained refusals across covered families. |
| `transition: bool(before['question_ids'])` | `boundary/transition controls` | All other named negatives; 180 retained refusals across covered families. |
| `transition: all((payload[k] == before[k] for k in ['enqueue_id', 'queue_record_ref', 'scope_ref', 'host_ref', 'root_ref']))` | `boundary/transition controls`, `semantic/wrong_host`, `semantic/wrong_root` | All other named negatives; 114 retained refusals across covered families. |
| `transition: before['queue_state'] == 'committed'` | `boundary/transition controls`, `semantic/uncommitted_queue` | All other named negatives; 214 retained refusals across covered families. |
| `transition: all((payload[k] == before[k] for k in fields))` | `boundary/transition controls`, `source_join/altered_original_allowed_action_ids`, `source_join/altered_original_approval_scope_key`, `source_join/altered_original_blocked_reason_code`, `source_join/altered_original_blocked_sequence`, `source_join/altered_original_permission_snapshot_id`, `source_join/invalid_canonical_allowed_action_ids`, `source_join/transplanted_blocked_episode` | All other named negatives; 239 retained refusals across covered families. |
| `transition: denial_emission(before) == 'emit'` | `boundary/transition controls`, `semantic/already_dispatched`, `semantic/not_denied`, `source_join/allow_is_not_denial`, `source_join/already_dispatched_cannot_deny`, `source_join/filesafe_owner_conflict_fences_only_this_facet`, `source_join/schema_refusal_is_not_policy_denial` | All other named negatives; 433 retained refusals across covered families. |
| `transition: not payload['executed_at_all']` | `boundary/transition controls` | All other named negatives; 534 retained refusals across covered families. |
| `transition: payload['failure_class'] is None` | `boundary/transition controls` | All other named negatives; 534 retained refusals across covered families. |
| `transition: payload['headless_denied'] == (payload['blocked_reason_code'] == 'headless_ask_denied')` | `boundary/transition controls` | All other named negatives; 518 retained refusals across covered families. |
| `transition: all((payload.get(k) == outcome[k] for k in ['result_ref', 'outcome', 'duration_ms']))` | `boundary/transition controls`, `semantic/wrong_duration`, `semantic/wrong_result` | All other named negatives; 143 retained refusals across covered families. |
| `transition: before['execution_state'] == 'started'` | `boundary/transition controls`, `semantic/no_start` | All other named negatives; 304 retained refusals across covered families. |
| `transition: before['execution_state'] == 'admitted'` | `boundary/transition controls`, `semantic/already_started` | All other named negatives; 118 retained refusals across covered families. |
| `transition: before['hooks_pass']` | `boundary/transition controls`, `semantic/hook_blocked` | All other named negatives; 128 retained refusals across covered families. |
| `transition: before['policy_decision'] == 'allow'` | `boundary/transition controls`, `semantic/policy_denied` | All other named negatives; 118 retained refusals across covered families. |
| `transition: before['schema_valid']` | `boundary/transition controls`, `semantic/schema_refused` | All other named negatives; 128 retained refusals across covered families. |
| `transition: all((payload.get(k) == outcome[k] for k in ['success', 'latency_ms', 'index_used', 'meta']))` | `boundary/transition controls`, `semantic/wrong_latency`, `semantic/wrong_success`, `source_join/unjoined_original_map_ref` | All other named negatives; 846 retained refusals across covered families. |
| `transition: before['dispatch_state'] == 'started'` | `boundary/transition controls` | All other named negatives; 2073 retained refusals across covered families. |
| `transition: outcome['dispatch_state'] == 'attempted_completed'` | `boundary/transition controls`, `semantic/refused_not_executed` | All other named negatives; 2063 retained refusals across covered families. |
| `transition: web_join` | `boundary/transition controls` | All other named negatives; 1635 retained refusals across covered families. |
| `transition: previous in ['settled', 'adjusted', 'failed'] and state in ['observed', 'streaming_partial', 'unknown']` | `boundary/transition controls`, `semantic/invalid_settlement` | All other named negatives; 12715 retained refusals across covered families. |
| `transition: state == 'adjusted' and previous not in ['settled', 'adjusted']` | `boundary/transition controls` | All other named negatives; 12712 retained refusals across covered families. |
| `transition: previous is not None and (not before['prior_usage_event_ref'])` | `boundary/transition controls` | All other named negatives; 12692 retained refusals across covered families. |
| `transition: state == 'settled' and (not payload.get('settled_at_utc'))` | `boundary/transition controls` | All other named negatives; 12692 retained refusals across covered families. |
| `transition: state == 'adjusted' and (not payload.get('adjusted_at_utc'))` | `boundary/transition controls` | All other named negatives; 12720 retained refusals across covered families. |
| `transition: all((payload.get(k) == before[k] for k in ['usage_record_id', 'dedupe_key', 'provider_attempt_ref', 'parent_usage_record_id', 'account_id', 'billing_entity_id', 'provider_account_ref']))` | `boundary/transition controls`, `semantic/wrong_account`, `semantic/wrong_provider_attempt`, `source_join/absent_provider_account_fabricated_account`, `source_join/application_absent_provider_account_fabricated_account`, `source_join/changed_known_account_id`, `source_join/changed_known_billing_entity_id`, `source_join/changed_known_provider_account_ref`, `source_join/cli_without_account_fabricated_account`, `source_join/local_without_account_fabricated_account`, `source_join/unknown_without_account_fabricated_account` | All other named negatives; 9167 retained refusals across covered families. |
| `transition: payload.get('parent_run_id') == before['parent_run_id']` | `boundary/transition controls`, `semantic/unproven_parent_run` | All other named negatives; 12670 retained refusals across covered families. |
| `transition: payload['provider_payload_hash'] == before['observation_sha256']` | `boundary/transition controls`, `semantic/wrong_observation` | All other named negatives; 12122 retained refusals across covered families. |
| `transition: payload['raw_payload_ref'] == before['observation_ref']` | `boundary/transition controls` | All other named negatives; 12123 retained refusals across covered families. |
| `transition: usage_values_valid(payload)` | `boundary/transition controls` | All other named negatives; 8857 retained refusals across covered families. |
| `transition: all((payload.get(k) == before[k] for k in ['branch_name', 'worktree_path', 'repo_id', 'run_id', 'lane_id', 'package_id']))` | `boundary/transition controls`, `semantic/wrong_lane`, `semantic/wrong_path` | All other named negatives; 122 retained refusals across covered families. |
| `transition: before['allocation_state'] == 'allocated'` | `boundary/transition controls` | All other named negatives; 245 retained refusals across covered families. |
| `transition: outcome['allocation_state'] == 'created'` | `boundary/transition controls`, `semantic/not_created` | All other named negatives; 244 retained refusals across covered families. |
| `transition: all((payload.get(k) == before[k] for k in ['repo_id', 'run_id', 'lane_id', 'package_id']))` | `boundary/transition controls` | All other named negatives; 141 retained refusals across covered families. |
| `transition: before['allocation_state'] == 'cleanup_eligible'` | `boundary/transition controls`, `semantic/not_deleted` | All other named negatives; 217 retained refusals across covered families. |
| `transition: before['elapsed_grace_ms'] >= payload['grace_period_ms']` | `boundary/transition controls`, `semantic/grace_not_elapsed` | All other named negatives; 225 retained refusals across covered families. |
| `transition: before['file_lock_checked']` | `boundary/transition controls`, `semantic/file_lock_unchecked` | All other named negatives; 227 retained refusals across covered families. |
| `transition: not any((before[k] for k in ['active_lock_refs', 'safe_point_refs', 'terminal_session_refs', 'editor_session_refs', 'blocked_recovery_refs']))` | `boundary/transition controls`, `semantic/editor_open`, `semantic/lock_held`, `semantic/recovery_held`, `semantic/safe_point_held`, `semantic/terminal_open` | All other named negatives; 219 retained refusals across covered families. |
| `transition: not payload.get('active_lock_refs')` | `boundary/transition controls` | All other named negatives; 228 retained refusals across covered families. |
| `transition: not payload.get('safe_point_refs')` | `boundary/transition controls` | All other named negatives; 228 retained refusals across covered families. |
| `transition: outcome['allocation_state'] == 'deleted'` | `boundary/transition controls` | All other named negatives; 218 retained refusals across covered families. |
| `transition: payload['file_lock_checked']` | `boundary/transition controls` | All other named negatives; 228 retained refusals across covered families. |
| `usage_values_valid: p['cost_microdollars'] != cost['cost_microdollars']` | `boundary/transition controls`, `boundary/usage_values_valid controls`, `usage_value/flat_cost_disagrees` | All other named negatives; 12392 retained refusals across covered families. |
| `usage_values_valid: any((p[k] != cost[k] for k in ['currency', 'cost_status', 'pricing_snapshot_id', 'pricing_source', 'pricing_effective_at', 'pricing_version']))` | `boundary/transition controls`, `boundary/usage_values_valid controls` | All other named negatives; 5531 retained refusals across covered families. |
| `usage_values_valid: cost['cost_status'] == 'unknown' and (cost['cost_microdollars'] is not None or cost['cost_minor_units'] is not None)` | `boundary/transition controls`, `boundary/usage_values_valid controls`, `usage_value/unknown_cost_fabricates_zero` | All other named negatives; 12687 retained refusals across covered families. |
| `usage_values_valid: cost['cost_status'] in ['hidden_subscription', 'hidden_byok'] and p['display_cost_policy'] == 'show'` | `usage_value/hidden_byok_cost_shown` | All other named negatives; 12720 retained refusals across covered families. |
| `usage_values_valid: cost['cost_status'] in ['priced', 'estimated'] and any((cost[k] is None for k in ['pricing_snapshot_id', 'pricing_source', 'pricing_effective_at', 'pricing_version']))` | `boundary/usage_values_valid controls` | All other named negatives; 12718 retained refusals across covered families. |
| `usage_values_valid: any((quota[k] is not None for k in ['quota_remaining', 'quota_used', 'quota_limit', 'reset_at', 'cooldown_until']))` | `boundary/transition controls`, `boundary/usage_values_valid controls`, `usage_value/disabled_quota_has_countdown`, `usage_value/guessed_unknown_quota`, `usage_value/unexposed_quota_has_quantity` | All other named negatives; 12636 retained refusals across covered families. |
| `usage_values_valid: quota.get('credits_status', 'unknown') in ['unknown', 'disabled', 'not_exposed'] and quota.get('credits_remaining') is not None` | `boundary/transition controls`, `boundary/usage_values_valid controls` | All other named negatives; 12663 retained refusals across covered families. |
| `usage_values_valid: quota['window_kind'] == 'unknown' and (quota['reset_at'] is not None or quota['cooldown_until'] is not None)` | `boundary/transition controls`, `boundary/usage_values_valid controls` | All other named negatives; 12717 retained refusals across covered families. |


Exact table/index: `reports/event-authority-20261104/DT-guard-removal.json`. Raw table: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/fix4/guard-removal-final.json`, SHA-256 `8cade194025a1709328a9feab46838533b150d435c1609794f6f9b249cf97453`.

### Schema boundaries and family totals

| Family | Model negatives | Schema negatives | Model/predicate rows | Schema-rule rows | Checks 1–11 |
|---|---:|---:|---:|---:|---|
| `approval.requested` | 193 | 84 | 49 | 62 | PASS |
| `approval.granted` | 220 | 86 | 51 | 64 | PASS |
| `approval.denied` | 184 | 84 | 47 | 62 | PASS |
| `approval.timeout` | 187 | 83 | 48 | 61 | PASS |
| `config.migrated` | 419 | 106 | 49 | 69 | PASS |
| `gate.evaluation_started` | 689 | 86 | 49 | 63 | PASS |
| `gate.failed` | 870 | 88 | 55 | 65 | PASS |
| `gate.passed` | 808 | 87 | 55 | 64 | PASS |
| `requirements.clarification_requested` | 182 | 82 | 44 | 61 | PASS |
| `run.background_enqueued` | 226 | 84 | 46 | 63 | PASS |
| `tool.denied` | 538 | 96 | 50 | 73 | PASS |
| `tool.execution_completed` | 345 | 85 | 46 | 61 | PASS |
| `tool.execution_started` | 130 | 81 | 48 | 60 | PASS |
| `tool.invoked` | 2163 | 105 | 54 | 75 | PASS |
| `usage.event` | 12721 | 224 | 64 | 99 | PASS |
| `worktree.created` | 256 | 82 | 45 | 61 | PASS |
| `worktree.deleted` | 229 | 83 | 51 | 62 | PASS |


## Family grades before and after

Before: cycle-4 independent grade. Only seventeen oracle cells change PARTIAL → PASS. **165 PASS / 24 PARTIAL / 25 ABSENT / 2 CONFLICT → 182 PASS / 7 PARTIAL / 25 ABSENT / 2 CONFLICT**, 216 cells. Current exact quote count: **327** (the previous report’s 328 tally was stale; its actual count was 310).

| Family | Before PASS/12 | After PASS/12 | Remaining non-PASS cells |
|---|---:|---:|---|
| `approval.requested` | 10 | 11 | membership_version ABSENT |
| `approval.granted` | 10 | 11 | membership_version ABSENT |
| `approval.denied` | 10 | 11 | membership_version ABSENT |
| `approval.timeout` | 10 | 11 | membership_version ABSENT |
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

**New IDs: none. Existing IDs: CV-600..616, SP-580..596, ATS-290..298.** No owner markdown, registry/admission, Decision Log, protected governance, frozen-validator, `.gitignore` or test-file edits. New technical/runtime bindings: none; no new historical premise is adopted. Only Tool invocation’s three schema definitions and two exact Storage source mirrors change, preserving all accepted values. No owner markdown changed, so derived generation is unnecessary; shard/index read-only validation passes.

All final full checker faults run 17 families / 5349 assertions, except intentional schema-preflight failures. Six complete standing groups perform **261 complete-main calls**. Thirty-four supplementary historical faults use the final precise AST mutation implementation, and seventeen positive preflight-removal controls run every downstream oracle.

| Verification | Exit | Result |
|---|---:|---|
| DT checker | 0 | 17 families; 5349 assertions. |
| Whole-lane guard isolation | 0 | Complete predicate inventory; every authored negative covered at its owning model/schema boundary. |
| Standing companion, six groups | 0 each | 17 targets; checks 1–11 pass. |
| Precise historical faults / reference guard pairs | 0 | 34 expected failing mains / 17 full downstream passing controls. |
| Independent cycle-4 probes | 0 | 349 LF, 51 metadata and 357 caller mutations; original source regressions; real failure exits; missing refs refuse. |
| Shard check / parsed index validate / Storage recovery self-test | 0 each | Pass; 15 copied currentness files hash-match. |
| Grade, scope and whitespace audits | 0 | 216 cells, 327 current quotes; protected stops unchanged. |


Commands, exact output paths and SHA-256 are in `DT-checks.json`; `DT-evidence-sha256.json` inventories the retained evidence. Report/self-grade copies overwrite the required `drafts/DT/` files. The assigned sparse worktree is removed after the branch/report commits are pushed. No main push, landing lock, reseal, admission or subagent.


**Method deviation:** Before reading the brief’s mailbox prohibition, the initial read-only `pm-mail inbox` and `who` commands ran. No registration, messages or further mailbox actions followed.
