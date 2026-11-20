# DS cycle-2 guard-removal table

**Result: PARTIAL.** This is an inventory and counterfactual record, not a complete check-11 proof. No oracle cell is promoted to PASS.

Final source revision: `9f83b5ed566206585dcff5a22ac4db94feaf3cee`. Every source digest in the full table matches the working tree. All 194 distinct baseline negatives reject before weakening. The audit refuses to run ablations if an injected negative is already accepted.

Full table: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/fix2-whole-guard-removal.json`, SHA-256 `d9fd863fd6313536906d55e0238a7998cdbfe63f08f6313ee15bf3ac2ed4b546`. Boundary table: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/fix2-round2-oracles.json`, SHA-256 `2a6e39bd41842753ce3a67d9f2f09f5f32f53cc57aac22a7f2e2927bdbd2fdd5`.

Source conditions are actually replaced in memory and restored after each row; returned error lists are never filtered. `witnessed` records observed flips, and does not adjudicate each flip as that guard's own defect. Empty cohorts, nonflipping guards, exceptions and unadjudicated ownership remain open. The inventory includes supporting/helper branches so none is silently treated as complete. Case numbers below map to exact authored fixture ids at the end.

## Boundary cohorts

| Guard | Negatives that flip | Negatives that stay rejected | Result |
|---|---|---|---|
| identifier_end_of_input | 1,10,17,26,45,57–58,68 | 2–9,11–16,18–25,27–32,46,48,50,64,75,162–166 | pass |
| browser_compatibility_projector_validation | 4,20 | 1–3,5–19,21–32,45–46,48,50,57–58,64,68,75,162–166 | pass |
| eager_reference_closure | 2–3,18–19,46 | 1,4–17,20–32,45,48,50,57–58,64,68,75,162–166 | pass |
| browser_writer_replay_policy | 7,15,23,31 | 1–6,8–14,16–22,24–30,32,45–46,48,50,57–58,64,68,75,162–166 | pass |
| inline_encoded_byte_limit | 9,25,165 | 1–8,10–24,26–32,45–46,48,50,57–58,64,68,75,162–164,166 | pass |
| compaction_calendar_validation | 50 | 1–32,45–46,48,57–58,64,68,75,162–166 | pass |
| compaction_writer_replay_policy | 64 | 1–32,45–46,48,50,57–58,68,75,162–166 | pass |
| compaction_historical_authenticity | 48,75 | 1–32,45–46,50,57–58,64,68,162–166 | pass |
| governed_envelope_successor | 16,32,164 | 1–15,17–31,45–46,48,50,57–58,64,68,75,162–163,165–166 | pass |
| layout_writer_replay_policy | 166 | 1–32,45–46,48,50,57–58,64,68,75,162–165 | pass |
| browser_historical_authenticity | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | partial |
| verified_reference_resolution | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | partial |

## Whole-lane source inventory

| Location / function | Condition | Negatives that flip | Negatives that stay rejected | Exceptions | Result |
|---|---|---|---|---|---|
| `scripts/pm_home_layout_v2_slot_receipt.py:503` value_limit_check | `by_reference and size <= limit` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:505` value_limit_check | `not by_reference and size > limit` | 136,153,155 | 129–135,137–152,154,156–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:514` event_checks | `payload is None` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:517` event_checks | `not body_route.validator(schema).is_valid(payload)` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:520` event_checks | `payload['command_id'] != binding['command_id']` | 151 | 129–150,152–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:522` event_checks | `ev['project_id'] != binding['project_id'] or payload['project_id'] != binding['project_id'] or payload['workspace_tab_id'] != binding['workspace_tab_id']` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:525` event_checks | `payload['prior_layout_revision'] != binding['expected_layout_revision'] or payload['new_layout_revision'] != binding['expected_layout_revision'] + 1 or ev['producer_sequence_id'] !` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:529` event_checks | `payload['correlation_id'] != binding['correlation_id'] or ev['correlation_id'] != binding['correlation_id'] or payload['interaction_transaction_id'] != binding['interaction_transac` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:532` event_checks | `ev['event_id'] != 'evt_workspace_layout_' + d or ev['idempotency_key'] != 'workspace.layout_changed:' + d` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:534` event_checks | `ev['actor_ref'] != binding['actor_ref']` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:541` binding_checks | `binding['operation_digest'] != d or binding['operation_ref'] != 'home_layout_operation:' + d` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:549` source_bytes_check | `src is None` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:551` source_bytes_check | `src['form'] == 'inline'` | — | 129–139,142,144–147,156 | 154,149,150,152,151,155,153,148,143,140,141,160,157,158,159,161 | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:563` source_bytes_check | `sha(data) != layout_sha` | 161 | 129–160 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:571` source_bytes_check | `decoded != layout` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:553` source_bytes_check | `len(data) > INLINE_LIMIT` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:557` source_bytes_check | `src['byte_size'] <= INLINE_LIMIT` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:560` source_bytes_check | `resolved is None` | — | 129–156,161 | 160,157,158,159 | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:580` slot_invariants | `prior is not None` | 129–130 | 131–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:598` slot_invariants | `binding is None` | — | 131–161 | 130,129 | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:601` slot_invariants | `binding['storage_instance_id'] != slot['storage_instance_id'] or binding['project_id'] != slot['project_id'] or binding['workspace_tab_id'] != slot['workspace_tab_id']` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:608` slot_invariants | `slot['prior_layout']['revision'] != binding['expected_layout_revision'] or slot['candidate_layout']['revision'] != binding['expected_layout_revision'] + 1` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:614` slot_invariants | `custody is not None and custody['original_source']['normalized_request']['command_id'] != binding['command_id']` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:617` slot_invariants | `rb is not None` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:584` slot_invariants | `data != canonical_msgpack(core) or prior['core_sha256'] != sha(data)` | 129 | 130–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:595` slot_invariants | `not joins` | 130 | 129,131–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:606` slot_invariants | `layout['project_id'] != slot['project_id'] or layout['workspace_tab_id'] != slot['workspace_tab_id']` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:618` slot_invariants | `rb['canonical_key'] != layout_key(binding)` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:620` slot_invariants | `rb['layout_revision'] != slot['candidate_layout']['revision'] or rb['layout_sha256'] != slot['candidate_layout_sha256']` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:639` receipt_invariants | `len(commands) != 1` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:641` receipt_invariants | `not r['prior_layout_revision'] == b['expected_layout_revision'] == o['prior_layout_revision']` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:643` receipt_invariants | `r['state'] in APPLIED` | 133,138 | 129–132,134–137,139–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:651` receipt_invariants | `o['operation_ref'] != b['operation_ref'] or o['result_ref'] != 'home_layout_result:' + d or dr['receipt_ref'] != 'home_layout_dispatch_receipt:' + d or (dr['operation_ref'] != b['o` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:654` receipt_invariants | `dr['command_result_ref'] != o['result_ref'] or dr['correlation_id'] != b['correlation_id'] or dr['dispatch_ref'] != b['dispatch_ref']` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:658` receipt_invariants | `ev is not None` | 131,134 | 129–130,132–133,135–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:679` receipt_invariants | `outcome is not None` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:685` receipt_invariants | `response is not None and response.get('owner_result_schema_ref') not in (None, OWNER_RESULT_REF)` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:645` receipt_invariants | `not (r['new_layout_revision'] == o['new_layout_revision'] == edge and r['readback']['layout_revision'] == edge)` | 138 | 129–137,139–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:647` receipt_invariants | `r['readback']['canonical_key'] != layout_key(b)` | 133 | 129–132,134–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:649` receipt_invariants | `r['readback']['layout_sha256'] != r['settled_layout_sha256'] or r['settled_layout_ref'] != 'home_layout_settlement:' + d` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:660` receipt_invariants | `not payload` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:662` receipt_invariants | `payload['command_result_ref'] != o['result_ref'] or payload['receipt_refs'] != [dr['receipt_ref']] or payload['settled_layout_ref'] != r['settled_layout_ref']` | 134 | 129–133,135–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:665` receipt_invariants | `r['state'] == 'committed' and (o['event_ref'] != ev['event_id'] or dr['event_ref'] != ev['event_id'])` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:671` receipt_invariants | `original is None or captured is None` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:676` receipt_invariants | `data != canonical_msgpack(original) or r['identity_capture_bytes_sha256'][key] != sha(data)` | 137 | 129–136,138–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:680` receipt_invariants | `outcome['owner_result_schema_ref'] != OWNER_RESULT_REF` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:682` receipt_invariants | `not outcome['owner_result_sha256'] == r['original_owner_result_sha256'] == sha(canonical_json(o))` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:672` receipt_invariants | `original is not None or captured is not None or r['identity_capture_bytes_sha256'][key] is not None` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:434` PayloadStore.resolve | `not isinstance(ident, str) or not HEX64.fullmatch(ident)` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:437` PayloadStore.resolve | `ident not in self.objects` | — | 129–145,147–159,161 | 146,160 | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:442` PayloadStore.resolve | `blake3_hex(data) != ident` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:445` PayloadStore.resolve | `len(data) != ref['byte_size']` | 139,157 | 129–138,140–156,158–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:448` PayloadStore.resolve | `media != ref['media_type']` | 142 | 129–141,143–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:730` Checker.reference_invariants | `wrapper > limit` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:733` Checker.reference_invariants | `data is None` | — | 129–138,140–141,143,145,147–161 | 146,144,139,142 | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:735` Checker.reference_invariants | `sha(data) != ref['value_sha256']` | 148 | 129–147,149–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:742` Checker.reference_invariants | `not isinstance(stored, dict)` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:746` Checker.reference_invariants | `stored_bytes(definition, value) != data` | — | 129–161 | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:750` Checker.reference_invariants | `shape` | 145 | 129–144,146–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:753` Checker.reference_invariants | `logical_key(definition, value) != ref['logical_key'] or storage_instance(definition, value) != ref['storage_instance_id']` | 140–141 | 129–139,142–161 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:755` Checker.reference_invariants | `definition == 'transaction_slot'` | — | 129–139,142,144–147,149–156 | 148,143,140,141,160,157,158,159,161 | partial |
| `scripts/pm_browser_workspace_created.py:208` creation_preflight_failures | `not isinstance(witness, dict)` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:212` creation_preflight_failures | `not isinstance(event, dict)` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:215` creation_preflight_failures | `not isinstance(event.get('payload'), dict)` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:217` creation_preflight_failures | `not isinstance(event['payload'].get('context'), dict) or not isinstance(event['payload'].get('facts'), dict)` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:228` creation_preflight_failures | `event.get('event_type') != EVENT_TYPE or payload.get('event_type') != EVENT_TYPE` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:230` creation_preflight_failures | `facts.get('workspace_state') != 'created' or facts.get('prior_workspace_generation') is not None` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:232` creation_preflight_failures | `any((context.get(field) is None for field in SUBJECT))` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:234` creation_preflight_failures | `(context.get('run_id') is None) != (context.get('attempt_id') is None)` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:244` creation_preflight_failures | `result['scope'].get('browser_workspace_id') != context.get('browser_workspace_id')` | 122 | 77–121,123–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:246` creation_preflight_failures | `context.get('node_id') != witness.get('node_id')` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:248` creation_preflight_failures | `any((result['scope'].get(field) != value for field, value in request['scope'].items() if field != 'browser_workspace_id'))` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:250` creation_preflight_failures | `request['scope'].get('browser_workspace_id', context.get('browser_workspace_id')) != context.get('browser_workspace_id')` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:252` creation_preflight_failures | `result['command_instance_id'] != request['command_instance_id'] or result['command_instance_id'] != witness.get('command_instance_id')` | 104 | 77–103,105–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:254` creation_preflight_failures | `request['idempotency_key'] != event.get('idempotency_key') or request['idempotency_key'] != witness.get('idempotency_key')` | 103 | 77–102,104–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:256` creation_preflight_failures | `result['outcome'] != 'succeeded' or result['effect_state'] != 'effects_reconciled'` | 98,107 | 77–97,99–106,108–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:269` creation_preflight_failures | `any((not left or left != right for left, right in refs))` | 96–97,100,109,111,125,127 | 77–95,98–99,101–108,110,112–124,126,128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:271` creation_preflight_failures | `not witness.get('workspace_ref') or witness['workspace_ref'] not in result['result_refs']` | 106 | 77–105,107–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:273` creation_preflight_failures | `witness.get('workspace_id') != context.get('browser_workspace_id') or witness.get('workspace_generation') != facts.get('workspace_generation')` | 101 | 77–100,102–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:275` creation_preflight_failures | `witness.get('producer_component') != 'BrowserRuntimeService.workspace'` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:278` creation_preflight_failures | `require_new_identity` | 119–120,126 | 77–118,121–125,127–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:222` creation_preflight_failures | `list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))` | 117,121 | 77–116,118–120,122–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:238` creation_preflight_failures | `scope['command_id'] != 'cmd.browser.workspace.create'` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:240` creation_preflight_failures | `any((scope['lineage'].get(field) != context.get(field) for field in LINEAGE))` | 102 | 77–101,103–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:242` creation_preflight_failures | `scope['browser_session_id'] != context.get('browser_session_id') or scope['session_security_class'] != 'ordinary'` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:281` creation_preflight_failures | `witness.get(field) is not True` | 95,99,110,113,119–120,124,126 | 77–94,96–98,100–109,111–112,114–118,121–123,125,127–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:128` checkpoint_failures | `list(Draft202012Validator(checkpoint_bundle(root), format_checker=FormatChecker()).iter_errors(value))` | 77–83,85–86,88,90–91,93 | 84,89,92,94–128 | 87 | partial |
| `scripts/pm_browser_workspace_created.py:143` checkpoint_failures | `value['scope_partition'] != scope_partition(value['project_id'])` | 94 | 77–93,95–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:146` checkpoint_failures | `cursor is not None and (value['first_retained_sequence_id'] > value['index_through_sequence_id'] or cursor['last_sequence_id'] != value['index_through_sequence_id'])` | 89,92 | 77–88,90–91,93–128 | — | witnessed |
| `scripts/pm_browser_workspace_created.py:149` checkpoint_failures | `value['withdrawn_at_utc'] is not None and instants['withdrawn_at_utc'] > instants['updated_at_utc']` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_created.py:137` checkpoint_failures | `not re.fullmatch('\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z\|[+-]\\d{2}:\\d{2})', value[field])` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:465` candidate_failures | `not isinstance(event, dict)` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:469` candidate_failures | `row is None` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:472` candidate_failures | `list(body_route.validator(selected_envelope).iter_errors(event))` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:476` candidate_failures | `not isinstance(payload, dict)` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:478` candidate_failures | `list(validators[event['event_type']].iter_errors(payload))` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:480` candidate_failures | `producer_component != row['producer_component']` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:483` candidate_failures | `not isinstance(payload_context, dict)` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:485` candidate_failures | `event.get('scope_kind') != 'project' or any((event.get(field) != payload_context.get(field) for field in IDENTITIES))` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:489` candidate_failures | `event.get('payload_schema_id') != row['payload_schema_ref']['schema_id'] or payload.get('event_type') != event['event_type']` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:491` candidate_failures | `event.get('producer_sequence_id') is None or event.get('replay_policy') != 'dedupe_by_idempotency_key'` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:493` candidate_failures | `event.get('redaction_profile') != 'no_secrets' or any(event.get('migration', {}).values())` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:495` candidate_failures | `len(json.dumps(payload, separators=(',', ':'), ensure_ascii=False).encode()) > MAX_PAYLOAD_BYTES` | — | 77–128 | — | partial |
| `scripts/pm-browser-event-admission.py:497` candidate_failures | `'payload_schema' not in failures` | — | 77–128 | — | partial |
| `scripts/pm_browser_workspace_reset.py:95` reset_preflight_failures | `errors` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:101` reset_preflight_failures | `not isinstance(witness, dict)` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:106` reset_preflight_failures | `event['event_type'] != EVENT_TYPE` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:120` reset_preflight_failures | `request['scope'] != result['scope']` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:122` reset_preflight_failures | `transition['subject'] != {field: context[field] for field in SUBJECT} or transition['node_id'] != context['node_id']` | 190,193–194 | 167–189,191–192 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:124` reset_preflight_failures | `transition['context'] != context` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:126` reset_preflight_failures | `not request['command_instance_id'] == result['command_instance_id'] == transition['command_instance_id']` | 191 | 167–190,192–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:128` reset_preflight_failures | `not request['idempotency_key'] == event['idempotency_key'] == transition['idempotency_key']` | 192 | 167–191,193–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:130` reset_preflight_failures | `result['outcome'] != 'succeeded' or result['effect_state'] != 'effects_reconciled'` | 168,173 | 167,169–172,174–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:132` reset_preflight_failures | `transition['checked_workspace_revision'] != request['scope'].get('expected_workspace_revision')` | 179 | 167–178,180–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:134` reset_preflight_failures | `transition['controller_authority'] != request['scope'].get('controller_authority')` | 170 | 167–169,171–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:136` reset_preflight_failures | `facts.get('workspace_state') != 'reset' or facts.get('prior_workspace_generation') != transition['prior_workspace_generation'] or facts.get('workspace_generation') != transition['w` | 167,175,177 | 168–174,176,178–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:145` reset_preflight_failures | `result.get('dispatch_receipt_ref') != transition['transition_receipt_ref']` | 176 | 167–175,177–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:147` reset_preflight_failures | `request['permission_snapshot_ref'] != transition['permission_snapshot_ref']` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:149` reset_preflight_failures | `request['filesafe_decision_ref'] != transition['filesafe_decision_ref']` | 172 | 167–171,173–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:151` reset_preflight_failures | `transition['workspace_ref'] not in result['result_refs']` | 178 | 167–177,179–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:99` reset_preflight_failures | `not validators(root)[name].is_valid(value)` | 169,171 | 167–168,170,172–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:110` reset_preflight_failures | `scope['command_id'] != 'cmd.browser.workspace.reset'` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:112` reset_preflight_failures | `any((scope['lineage'].get(field) != context.get(field) for field in LINEAGE))` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:114` reset_preflight_failures | `any((scope.get(field) != context[field] for field in ('browser_session_id', 'browser_workspace_id', 'session_security_class')))` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:143` reset_preflight_failures | `transition[name] != payload[name]` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_reset.py:156` reset_preflight_failures | `witness.get(name) is not True` | 180–188 | 167–179,189–194 | — | witnessed |
| `scripts/pm_browser_workspace_reset.py:118` reset_preflight_failures | `scope.get(field) != context.get(context_field)` | — | 167–194 | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:94` core_relation_failures | `value['scope_partition'] != sibling('pm_browser_workspace_created', root).scope_partition(value['project_id'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:96` core_relation_failures | `value['index_read_token']['storage_instance_id'] != value['storage_instance_id']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:99` core_relation_failures | `cursor is not None and (value['first_retained_sequence_id'] > value['index_through_sequence_id'] or cursor['last_sequence_id'] != value['index_through_sequence_id'] or cursor['byte` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:103` core_relation_failures | `any((value[name] is not None and (not TIMESTAMP.fullmatch(value[name])) for name in TIMES))` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:109` core_relation_failures | `'withdrawn_at_utc' in times and times['withdrawn_at_utc'] > times['updated_at_utc']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:111` core_relation_failures | `times['published_at_utc'] > times['updated_at_utc'] or ('withdrawn_at_utc' in times and times['published_at_utc'] > times['withdrawn_at_utc'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:119` index_token_failures | `not validators(root)['generic_read_token'].is_valid(token) or not validators(root)['generic_checkpoint'].is_valid(index)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:121` index_token_failures | `not isinstance(observation, dict) or observation.get('generic_source_verified') is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:125` index_token_failures | `node is None or node['state'] != 'current' or node['generation_id'] != selected or (sum((n['state'] == 'current' for n in index['generations'].values())) != 1)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:137` index_token_failures | `token != expected or node['index_dataset_name'] != expected['index_dataset_name']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:139` index_token_failures | `observation.get('source_selection') != frontier['source_selection']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:141` index_token_failures | `frontier['source_selection']['storage_instance_id'] != index['storage_instance_id']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:147` checkpoint_failures | `not validators(root)['checkpoint'].is_valid(value)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:180` checkpoint_failures | `sum(('legacy_checkpoint' in entry for entry in value['retired_generations'])) > 1` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:156` checkpoint_failures | `'legacy_checkpoint' in entry` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:172` checkpoint_failures | `publication in seen or publication == entry['successor_publication_id']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:175` checkpoint_failures | `any((old[k] != value[k] for k in SCOPE))` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:177` checkpoint_failures | `instant(withdrawal) > instant(value['published_at_utc']) or instant(birth) > instant(value['published_at_utc'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:161` checkpoint_failures | `old['withdrawn_at_utc'] is not None and withdrawal != old['withdrawn_at_utc'] or (old['withdrawn_at_utc'] is None and withdrawal != custody)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:164` checkpoint_failures | `instant(custody) < instant(old['updated_at_utc']) or instant(withdrawal) > instant(custody)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:187` generation_failures | `not isinstance(observation, dict)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:193` generation_failures | `not validators(root)['generation_transaction'].is_valid(tx)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:195` generation_failures | `errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:197` generation_failures | `tx['before'] != before or tx['after'] != after or tx['checkpoint_key'] != key(after) or (tx['selected_publication_id'] != after['publication_id']) or (tx['committed_at_utc'] != aft` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:207` generation_failures | `after['state'] == 'withdrawn' or after['updated_at_utc'] != after['published_at_utc']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:209` generation_failures | `before is None` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:213` generation_failures | `any((before[k] != after[k] for k in SCOPE)) or instant(after['published_at_utc']) < instant(before['updated_at_utc'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:215` generation_failures | `is_v1(before)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:240` generation_failures | `after['retired_generations'] != history` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:203` generation_failures | `observation.get(flag) is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:210` generation_failures | `after['retired_generations'] or tx['v1_custody'] is not None` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:217` generation_failures | `custody is None or any((observation.get(flag) is not True for flag in ('v1_custody_verified', 'v1_codec_supported')))` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:220` generation_failures | `observation.get('resolved_v1_hold_refs') != custody['hold_refs']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:231` generation_failures | `tx['v1_custody'] is not None or before['publication_id'] == after['publication_id']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:233` generation_failures | `len(before['retired_generations']) >= 2` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:247` source_failures | `errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:249` source_failures | `not isinstance(observation, dict)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:258` source_failures | `errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:265` source_failures | `observation.get(fence) is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:270` source_failures | `candidate['state'] == 'withdrawn' or not candidate['filter_complete']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:272` source_failures | `observation.get('project_id') != candidate['project_id']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:262` source_failures | `observation.get(flag) is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:278` source_failures | `candidate[own] != coverage[generic]` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:286` advance_failures | `errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:288` advance_failures | `before is None or replacement` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:290` advance_failures | `is_v1(before)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:293` advance_failures | `errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:295` advance_failures | `observation.get('prior_checkpoint') != before` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:297` advance_failures | `before['state'] == 'withdrawn'` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:302` advance_failures | `instant(after['updated_at_utc']) < instant(before['updated_at_utc'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:304` advance_failures | `before['index_through_sequence_id'] is not None and (after['index_through_sequence_id'] is None or after['index_through_sequence_id'] < before['index_through_sequence_id'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:300` advance_failures | `before[field] != after[field]` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:312` cleanup_failures | `not isinstance(observation, dict)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:315` cleanup_failures | `errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:318` cleanup_failures | `len(selected) != 1` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:328` cleanup_failures | `not eligible or not isinstance(resolved_holds, list) or sorted(resolved_holds) != sorted(holds) or (observation.get('active_hold_refs') != []) or (observation.get('resolved_referen` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:332` cleanup_failures | `observation.get('hold_ref_fence_current') is not True or observation.get('cleanup_transaction_resolved') is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:340` cleanup_failures | `not validators(root)['cleanup_transaction'].is_valid(tx)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:342` cleanup_failures | `observation.get('prior_checkpoint') != before or tx.get('before') != before or tx.get('after') != after or (tx.get('checkpoint_key') != key(before)) or (tx.get('selected_publicatio` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:346` cleanup_failures | `after != expected` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:335` cleanup_failures | `observation.get(flag) is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:327` checkpoint_failures | `not validators(root)['checkpoint'].is_valid(value)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:334` checkpoint_failures | `core['publication_id'] in seen or core['publication_id'] == retired['successor_publication_id'] or any((core[name] != value[name] for name in ('storage_instance_id', 'project_id', ` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:338` checkpoint_failures | `not errors and parse_time(core['withdrawn_at_utc']) > parse_time(value['published_at_utc'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:350` checkpoint_core_failures | `value['scope_partition'] != scope_partition(value['project_id'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:352` checkpoint_core_failures | `value['index_read_token']['storage_instance_id'] != value['storage_instance_id']` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:355` checkpoint_core_failures | `cursor is not None and (value['first_retained_sequence_id'] > value['index_through_sequence_id'] or cursor['last_sequence_id'] != value['index_through_sequence_id'] or cursor['byte` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:360` checkpoint_core_failures | `any((value[name] is not None and (not re.fullmatch('\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z\|[+-]\\d{2}:\\d{2})', value[name])) for name in ('updated_at_utc', 'wi` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:366` checkpoint_core_failures | `any((t.tzinfo is None for t in times.values()))` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:370` checkpoint_core_failures | `times['published_at_utc'] > times['updated_at_utc'] or ('withdrawn_at_utc' in times and times['published_at_utc'] > times['withdrawn_at_utc'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:368` checkpoint_core_failures | `'withdrawn_at_utc' in times and times['withdrawn_at_utc'] > times['updated_at_utc']` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:381` generation_admission_failures | `not validators(root)['generation_transaction'].is_valid(transaction)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:384` generation_admission_failures | `transaction['before'] != before or transaction['after'] != after or transaction['checkpoint_key'] != key or (transaction['selected_publication_id'] != after['publication_id']) or (` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:388` generation_admission_failures | `any((observation.get(name) is not True for name in ('generation_transaction_resolved', 'coordinator_admitted', 'complete_rebuild_verified', 'capacity_reserved', 'hold_ref_fence_cur` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:392` generation_admission_failures | `after['state'] == 'withdrawn' or after['updated_at_utc'] != after['published_at_utc']` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:394` generation_admission_failures | `before is None` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:396` generation_admission_failures | `any((before[name] != after[name] for name in ('storage_instance_id', 'project_id', 'scope_partition'))) or before['publication_id'] == after['publication_id'] or parse_time(after['` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:400` generation_admission_failures | `len(before['retired_generations']) >= 2` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:416` index_token_failures | `not validators(root)['durable_read_token'].is_valid(token) or not validators(root)['generic_checkpoint'].is_valid(index)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:419` index_token_failures | `not isinstance(observation, dict) or observation.get('generic_source_verified') is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:421` index_token_failures | `not validators(root)['generic_read_token'].is_valid({**token, 'redb_snapshot_id': observation.get('redb_snapshot_id')})` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:425` index_token_failures | `node is None or node['state'] != 'current' or node['generation_id'] != selected or (sum((n['state'] == 'current' for n in index['generations'].values())) != 1)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:436` index_token_failures | `token != expected or node['index_dataset_name'] != expected['index_dataset_name']` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:438` index_token_failures | `observation.get('source_selection') != frontier['source_selection']` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:440` index_token_failures | `frontier['source_selection']['storage_instance_id'] != index['storage_instance_id']` | — | — | — | partial |
| `scripts/pm_event_authority_ds_round2.py:69` compaction_payload_errors | `not route.validator(schema).is_valid(payload)` | 43–44,47,51–53,56,59–63,67,69,71–72,74 | 33–42,49,54–55,65–66,70,73,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:71` compaction_payload_errors | `not compaction_timestamp_valid(payload['committed_at_utc'])` | 70 | 33–44,47,49,51–56,59–63,65–67,69,71–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:73` compaction_payload_errors | `payload['output_context_revision'] <= payload['input_context_revision']` | 65–66 | 33–44,47,49,51–56,59–63,67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:75` compaction_payload_errors | `payload['input_tokens'] - payload['output_tokens'] != payload['reclaimed_tokens']` | 49,54 | 33–44,47,51–53,55–56,59–63,65–67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:82` compaction_event_errors | `errors` | — | 33–44,47,49,51–56,59–63,65–67,69–74,76 | — | partial |
| `scripts/pm_event_authority_ds_round2.py:85` compaction_event_errors | `not route.validator(load('Plans/event_record.schema.json')).is_valid(event)` | — | 33–44,47,49,51–56,59–63,65–67,69–74,76 | — | partial |
| `scripts/pm_event_authority_ds_round2.py:87` compaction_event_errors | `event['scope_kind'] != 'project' or event['project_id'] is None` | 42 | 33–41,43–44,47,49,51–56,59–63,65–67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:89` compaction_event_errors | `event['scope_kind'] == 'project' and any((event[k] != payload[k] for k in ('project_id', 'thread_id')))` | 33–34 | 35–44,47,49,51–56,59–63,65–67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:91` compaction_event_errors | `event['event_type'] != 'context.compaction.completed' or event['payload_schema_id'] != payload['schema_id']` | 38,40 | 33–37,39,41–44,47,49,51–56,59–63,65–67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:93` compaction_event_errors | `event['payload_ref'] is not None` | 35 | 33–34,36–44,47,49,51–56,59–63,65–67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:95` compaction_event_errors | `event['replay_policy'] != 'dedupe_by_idempotency_key' and (not historical)` | 41 | 33–40,42–44,47,49,51–56,59–63,65–67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:97` compaction_event_errors | `event['occurred_at_utc'] != payload['committed_at_utc']` | 36 | 33–35,37–44,47,49,51–56,59–63,65–67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:102` compaction_event_errors | `event['event_id'] != 'evt_compaction_' + digest` | 37 | 33–36,38–44,47,49,51–56,59–63,65–67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:104` compaction_event_errors | `event['idempotency_key'] != 'compaction:' + sha(identity)` | 39 | 33–38,40–44,47,49,51–56,59–63,65–67,69–74,76 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:106` compaction_event_errors | `payload['compaction_receipt_ref'] != 'compaction_receipt:' + digest` | — | 33–44,47,49,51–56,59–63,65–67,69–74,76 | — | partial |
| `scripts/pm_event_payload_route.py:75` resolved_body | `version != '3.0.0'` | 16,32,164 | 1–15,17–31,45–46,48,50,57–58,64,68,75,162–163,165–166 | — | witnessed |
| `scripts/pm_event_payload_route.py:87` resolved_body | `ref is None` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_payload_route.py:93` resolved_body | `body is not None or not isinstance(ref, dict)` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_payload_route.py:96` resolved_body | `not StrictValidator(ref_schema).is_valid(ref)` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_payload_route.py:99` resolved_body | `entry is None` | — | 1–7,9–23,25–32,45–46,48,50,57–58,64,68,75,162,164–166 | 8,24,163 | partial |
| `scripts/pm_event_payload_route.py:102` resolved_body | `media != ref['media_type']` | 13,29 | 1–12,14–28,30–32,45–46,48,50,57–58,64,68,75,162–166 | — | witnessed |
| `scripts/pm_event_payload_route.py:104` resolved_body | `len(data) != ref['byte_size']` | 14,30 | 1–13,15–29,31–32,45–46,48,50,57–58,64,68,75,162–166 | — | witnessed |
| `scripts/pm_event_payload_route.py:106` resolved_body | `blake3_hex(data) != ref['blake3_id']` | 12,28,162 | 1–11,13–27,29–32,45–46,48,50,57–58,64,68,75,163–166 | — | witnessed |
| `scripts/pm_event_payload_route.py:112` resolved_body | `not isinstance(body, dict)` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_payload_route.py:76` resolved_body | `not historical and event.get('event_type') in ADOPTED` | 16,32,164 | 1–15,17–31,45–46,48,50,57–58,64,68,75,162–163,165–166 | — | witnessed |
| `scripts/pm_event_payload_route.py:79` resolved_body | `event.get('payload_ref') is not None` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_payload_route.py:81` resolved_body | `not isinstance(body, dict)` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_payload_route.py:83` resolved_body | `not historical and len(canonical_msgpack(body)) > INLINE_LIMIT` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_payload_route.py:88` resolved_body | `not isinstance(body, dict)` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_payload_route.py:90` resolved_body | `len(canonical_msgpack(body)) > INLINE_LIMIT` | 9,25,165 | 1–8,10–24,26–32,45–46,48,50,57–58,64,68,75,162–164,166 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:333` layout_event_errors | `not route.validator(schema).is_valid(event)` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_authority_ds_round2.py:337` layout_event_errors | `body is None` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_authority_ds_round2.py:339` layout_event_errors | `not route.validator(load('Plans/event_payloads/workspace_layout_changed_v2.schema.json')).is_valid(body)` | — | 1–32,45–46,48,50,57–58,64,68,75,162–166 | — | partial |
| `scripts/pm_event_authority_ds_round2.py:341` layout_event_errors | `event['replay_policy'] != 'dedupe_by_idempotency_key' and (not historical)` | 166 | 1–32,45–46,48,50,57–58,64,68,75,162–165 | — | witnessed |
| `scripts/pm_event_authority_ds_round2.py:112` compaction_history | `not verified or withdrawn or compaction_event_errors(event, historical=True)` | 48,75 | 1–32,45–46,50,57–58,64,68,162–166 | — | witnessed |
| `scripts/pm_home_layout_v2_slot_receipt.py:151` canonical_msgpack | `value is None` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:153` canonical_msgpack | `value is False` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:155` canonical_msgpack | `value is True` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:157` canonical_msgpack | `isinstance(value, int)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:170` canonical_msgpack | `isinstance(value, float)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:180` canonical_msgpack | `isinstance(value, str)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:190` canonical_msgpack | `isinstance(value, (bytes, bytearray))` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:197` canonical_msgpack | `isinstance(value, list)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:199` canonical_msgpack | `isinstance(value, dict)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:145` canonical_msgpack | `length <= fix_limit` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:147` canonical_msgpack | `length <= 65535` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:158` canonical_msgpack | `0 <= value <= 127` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:160` canonical_msgpack | `-32 <= value < 0` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:171` canonical_msgpack | `not math.isfinite(value)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:177` canonical_msgpack | `single == value and math.copysign(1.0, single) == math.copysign(1.0, value)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:183` canonical_msgpack | `n <= 31` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:185` canonical_msgpack | `n <= 255` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:187` canonical_msgpack | `n <= 65535` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:192` canonical_msgpack | `n <= 255` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:194` canonical_msgpack | `n <= 65535` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:167` canonical_msgpack | `low <= value <= high` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:264` decode_canonical_msgpack | `pos != len(data)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:266` decode_canonical_msgpack | `canonical_msgpack(value) != data` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:212` decode_canonical_msgpack | `pos + n > len(data)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:220` decode_canonical_msgpack | `b <= 127` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:222` decode_canonical_msgpack | `b >= 224` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:224` decode_canonical_msgpack | `128 <= b <= 143` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:226` decode_canonical_msgpack | `144 <= b <= 159` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:228` decode_canonical_msgpack | `160 <= b <= 191` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:231` decode_canonical_msgpack | `b in simple` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:236` decode_canonical_msgpack | `b in sized` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:248` decode_canonical_msgpack | `b in fixed` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:239` decode_canonical_msgpack | `kind == 'bin'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:241` decode_canonical_msgpack | `kind == 'str'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:243` decode_canonical_msgpack | `kind == 'arr'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:256` decode_canonical_msgpack | `not isinstance(key, str)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:258` decode_canonical_msgpack | `key in out` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:275` bin_paths | `definition == 'transaction_slot'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:281` bin_paths | `isinstance(prior, dict)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:283` bin_paths | `definition == 'operation_receipt'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:278` bin_paths | `isinstance(src, dict) and src.get('form') == 'inline'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:286` bin_paths | `captured.get(key) is not None` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:302` to_projection | `isinstance(value, bytes)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:304` to_projection | `isinstance(value, list)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:306` to_projection | `isinstance(value, dict)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:320` ecma_regex | `escaped` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:323` ecma_regex | `ch == '\\'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:326` ecma_regex | `in_class` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:329` ecma_regex | `ch == '['` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:332` ecma_regex | `ch == '$'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:356` ref_closure | `isinstance(node, list)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:366` ref_closure | `isinstance(node.get('$ref'), str)` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:377` ref_closure | `isinstance(sub, (dict, list))` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:415` PayloadStore.apply | `op['op'] == 'put_derived'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:425` PayloadStore.apply | `blake3_hex(data) != ident` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:491` logical_key | `definition == 'transaction_slot'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:717` Checker.semantic | `definition == 'transaction_slot'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:719` Checker.semantic | `definition == 'operation_receipt'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:721` Checker.semantic | `definition == 'stored_value_ref'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:774` run | `chk.unresolved` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:829` run | `unused` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:777` run | `limit > chk.store_cap` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:796` run | `errors` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:815` run | `case['rejected_by'] == 'schema'` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:821` run | `schema_errors` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:826` run | `not any((e.startswith(case['rejected_by'] + ' ') for e in found))` | — | — | — | partial |
| `scripts/pm_home_layout_v2_slot_receipt.py:817` run | `not schema_errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:91` _localize | `isinstance(node, dict)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:94` _localize | `isinstance(node, list)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:303` CreationOracle.create | `not admitted or creation_preflight_failures(event, request, result, witness, require_new_identity=False, payload_store=payload_store)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:308` CreationOracle.create | `event_id in self.events and self.events[event_id] != semantic` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:310` CreationOracle.create | `key in self.committed` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:312` CreationOracle.create | `key in self.pending` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:314` CreationOracle.create | `creation_preflight_failures(event, request, result, witness, payload_store=payload_store)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:318` CreationOracle.create | `workspace in self.workspace_ids` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:320` CreationOracle.create | `append_outcome == 'failed'` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:322` CreationOracle.create | `append_outcome == 'unknown'` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:325` CreationOracle.create | `append_outcome not in ('committed', 'committed_ack_lost')` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:331` CreationOracle.create | `append_outcome == 'committed_ack_lost'` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:347` CheckpointOracle.advance | `checkpoint_failures(candidate)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:349` CheckpointOracle.advance | `self.checkpoint is not None and checkpoint_failures(self.checkpoint)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:351` CheckpointOracle.advance | `candidate['state'] == 'withdrawn' or (self.checkpoint and self.checkpoint['state'] == 'withdrawn')` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:353` CheckpointOracle.advance | `not candidate['filter_complete']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:364` CheckpointOracle.advance | `candidate['source_cursor'] is None and observation.get('empty_range_verified') is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:366` CheckpointOracle.advance | `observation.get('prior_checkpoint_sha256') != (digest(self.checkpoint) if self.checkpoint is not None else None)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:368` CheckpointOracle.advance | `self.checkpoint is not None` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:357` CheckpointOracle.advance | `observation.get(field) is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:362` CheckpointOracle.advance | `field not in expected or candidate[field] != expected[field]` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:370` CheckpointOracle.advance | `prior_cursor and (not next_cursor or next_cursor['last_sequence_id'] < prior_cursor['last_sequence_id'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:372` CheckpointOracle.advance | `self.checkpoint['storage_instance_id'] != candidate['storage_instance_id'] or self.checkpoint['scope_partition'] != candidate['scope_partition']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:379` CheckpointOracle.disclose | `self.checkpoint is None or checkpoint_failures(self.checkpoint) or self.checkpoint['state'] == 'withdrawn' or (not self.checkpoint['filter_complete']) or (not current_token) or (no` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:388` CheckpointOracle.withdraw | `self.checkpoint is None` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:390` CheckpointOracle.withdraw | `checkpoint_failures(self.checkpoint)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:392` CheckpointOracle.withdraw | `self.checkpoint['state'] == 'withdrawn'` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:396` CheckpointOracle.withdraw | `checkpoint_failures(candidate)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:398` CheckpointOracle.withdraw | `datetime.fromisoformat(at_utc.replace('Z', '+00:00')) < datetime.fromisoformat(self.checkpoint['updated_at_utc'].replace('Z', '+00:00'))` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:408` workspace_history_fact | `not all((value is True for value in (source_verified, access_allowed, deletion_allows_audit, checkpoint_read_token_valid)))` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:410` workspace_history_fact | `not isinstance(subject, dict) or set(subject) != set(SUBJECT) or any((not isinstance(subject[field], str) or not subject[field] for field in SUBJECT))` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:413` workspace_history_fact | `gate.candidate_failures(event, 'BrowserRuntimeService.workspace', context, payload_store=payload_store, historical=True) or event['event_type'] != EVENT_TYPE` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:418` workspace_history_fact | `actual != subject` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:434` binding_failures | `row['event_type'] != EVENT_TYPE` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:439` binding_failures | `binding != expected` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:441` binding_failures | `load(V2_SCHEMA_PATH, root).get('x-pm-definition-status') != expected['definition_status']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:443` binding_failures | `row.get('authority_contract_ref') != V2_SCHEMA_PATH + '#/x-pm-event-authority-binding'` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:445` binding_failures | `row['semantic_owner_ref'] != expected['semantic_owner_ref']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:447` binding_failures | `row['retention_policy_ref'] != {'registry_schema_id': 'pm.storage_value_registry.v2', 'policy_id': 'RP-AUTHORITY-INDEFINITE', 'policy_version': VERSION}` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:449` binding_failures | `not {expected['semantic_owner_ref'], expected['storage_owner_ref']} <= set(row['consumer_contract_refs'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:451` binding_failures | `row['producer_component'] != expected['producer_component'] or row['payload_schema_ref']['schema_id'] != expected['source_payload_schema_id']` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:455` binding_failures | `len(families) != 1` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:458` binding_failures | `family != expected_storage_family(root)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:460` binding_failures | `family['value_schema'] != checkpoint_v2_bundle(root) or family['value_schema_ref'] != V2_SCHEMA_PATH + '#/$defs/checkpoint' or family['value_schema_id'] != expected['checkpoint_sch` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:482` validate_fixture_contracts | `len(base_cases) != 1 or base_cases[0]['event_type'] != EVENT_TYPE` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:487` validate_fixture_contracts | `errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:490` validate_fixture_contracts | `errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:493` validate_fixture_contracts | `len(all_ids) != len(set(all_ids)) or not fixtures['creation_invalid'] or (not fixtures['checkpoint_invalid'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:508` validate_fixture_contracts | `checkpoint.advance(fixtures['checkpoint_fixture'], fixtures['observation_fixture']) != 'checkpoint_committed_no_runtime_effect'` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:499` validate_fixture_contracts | `case['expected_error'] not in errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created.py:505` validate_fixture_contracts | `case['expected_error'] not in errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:80` legacy_failures | `not validators(root)['v1'].is_valid(value)` | — | — | — | partial |
| `scripts/pm_browser_workspace_created_v2.py:86` core_failures | `not validators(root)['checkpoint_core'].is_valid(value)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:179` ResetOracle.reset | `not admitted or reset_preflight_failures(event, request, result, transition, witness, payload_store=payload_store)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:181` ResetOracle.reset | `transition['subject'] != self.subject` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:185` ResetOracle.reset | `event['event_id'] in self.event_ids and self.event_ids[event['event_id']] != semantic` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:188` ResetOracle.reset | `prior` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:194` ResetOracle.reset | `self.pending` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:196` ResetOracle.reset | `self.revision is None` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:198` ResetOracle.reset | `transition['checked_workspace_revision'] != self.revision or transition['prior_workspace_generation'] != self.generation` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:200` ResetOracle.reset | `append_outcome not in ('committed', 'committed_ack_lost', 'failed', 'unknown')` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:212` ResetOracle.reset | `append_outcome in ('failed', 'unknown')` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:189` ResetOracle.reset | `prior['digest'] != semantic or prior['result'] != result or prior['request'] != request` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:191` ResetOracle.reset | `key in self.pending` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:218` ResetOracle.resolve_append | `entry is None or entry['digest'] != semantic` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:220` ResetOracle.resolve_append | `append_outcome in ('failed', 'unknown')` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:222` ResetOracle.resolve_append | `append_outcome not in ('committed', 'committed_ack_lost')` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:226` ResetOracle.resolve_append | `append_outcome == 'committed_ack_lost'` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:302` binding_failures | `row.get('event_type') != EVENT_TYPE` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:306` binding_failures | `load(CONTRACT_PATH, root)['x-pm-event-authority-binding'] != expected` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:308` binding_failures | `load(CONTRACT_PATH, root)['$defs'].get('durable_read_token') != durable_read_token_schema(root)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:310` binding_failures | `row.get('authority_contract_ref') != CONTRACT_PATH + '#/x-pm-event-authority-binding'` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:312` binding_failures | `row.get('semantic_owner_ref') != expected['semantic_owner_ref'] or row.get('producer_component') != expected['producer_component']` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:314` binding_failures | `row.get('payload_schema_ref') != {'path': 'Plans/browser_event_payloads.schema.json', 'json_pointer': '#/$defs/workspace_reset', 'schema_id': expected['source_payload_schema_id']}` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:316` binding_failures | `not {expected['semantic_owner_ref'], expected['storage_owner_ref'], expected['generic_index_owner_ref']} <= set(row.get('consumer_contract_refs', []))` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:318` binding_failures | `row.get('retention_policy_ref') != {'registry_schema_id': 'pm.storage_value_registry.v2', 'policy_id': 'RP-AUTHORITY-INDEFINITE', 'policy_version': VERSION}` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:321` binding_failures | `len(families) != 1 or families[0] != expected_storage_family(root)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:453` CheckpointOracle.advance | `not admitted` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:455` CheckpointOracle.advance | `checkpoint_failures(candidate) or (self.checkpoint is not None and checkpoint_failures(self.checkpoint))` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:457` CheckpointOracle.advance | `candidate['state'] == 'withdrawn' or (self.checkpoint and self.checkpoint['state'] == 'withdrawn' and (not _replacement))` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:459` CheckpointOracle.advance | `index_token_failures(candidate['index_read_token'], index, observation)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:465` CheckpointOracle.advance | `not candidate['filter_complete']` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:473` CheckpointOracle.advance | `observation.get('project_id') != candidate['project_id']` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:477` CheckpointOracle.advance | `observation.get('prior_checkpoint') != self.checkpoint` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:479` CheckpointOracle.advance | `self.checkpoint is None or _replacement` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:482` CheckpointOracle.advance | `self.checkpoint is not None and (not _replacement)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:463` CheckpointOracle.advance | `observation.get(name) is not True` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:471` CheckpointOracle.advance | `candidate[target] != coverage[source]` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:480` CheckpointOracle.advance | `generation_admission_failures(self.checkpoint, candidate, observation)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:483` CheckpointOracle.advance | `any((self.checkpoint[field] != candidate[field] for field in ('storage_instance_id', 'project_id', 'scope_partition')))` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:485` CheckpointOracle.advance | `any((self.checkpoint[field] != candidate[field] for field in ('publication_id', 'published_at_utc', 'hold_refs', 'retired_generations')))` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:488` CheckpointOracle.advance | `parse_time(candidate['updated_at_utc']) < parse_time(self.checkpoint['updated_at_utc'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:491` CheckpointOracle.advance | `old and (not new or new['last_sequence_id'] < old['last_sequence_id'])` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:503` CheckpointOracle.cleanup | `before is None or checkpoint_failures(before) or observation.get('prior_checkpoint') != before` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:505` CheckpointOracle.cleanup | `any((observation.get(name) is not True for name in ('maintenance_authorized', 'all_applicable_holds_resolved', 'no_applicable_hold_or_live_ref', 'hold_ref_fence_current', 'access_a` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:510` CheckpointOracle.cleanup | `len(selected) != 1` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:515` CheckpointOracle.cleanup | `now.tzinfo is None or now < parse_time(core['withdrawn_at_utc']) + timedelta(seconds=604800)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:527` CheckpointOracle.disclose | `not isinstance(observation, dict) or cp is None or checkpoint_failures(cp) or (cp['state'] == 'withdrawn') or (not cp['filter_complete']) or (observation.get('project_id') != cp['p` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:533` CheckpointOracle.disclose | `index_token_failures(cp['index_read_token'], index, observation) or any((observation.get(name) is not True for name in ('access_allowed', 'deletion_allows_audit', 'disclosure_fence` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:540` CheckpointOracle.withdraw | `self.checkpoint is None or checkpoint_failures(self.checkpoint)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:542` CheckpointOracle.withdraw | `self.checkpoint['state'] == 'withdrawn'` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:545` CheckpointOracle.withdraw | `checkpoint_failures(candidate) or datetime.fromisoformat(at_utc.replace('Z', '+00:00')) < datetime.fromisoformat(self.checkpoint['updated_at_utc'].replace('Z', '+00:00'))` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:556` workspace_history_fact | `not all((flag is True for flag in (admitted, source_verified, access_allowed, deletion_allows_audit, checkpoint_read_token_valid)))` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:558` workspace_history_fact | `not validators(root)['subject'].is_valid(subject)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:561` workspace_history_fact | `gate.candidate_failures(event, 'BrowserRuntimeService.workspace', gate.contract_context(), payload_store=payload_store, historical=True) or event['event_type'] != EVENT_TYPE` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:566` workspace_history_fact | `subject != actual` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:579` fixture_values | `len(cases) != 1 or cases[0]['event_type'] != EVENT_TYPE` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:631` validate_fixture_contracts | `not cases or len({case['case_id'] for case in cases}) != len(cases)` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:628` validate_fixture_contracts | `errors` | — | — | — | partial |
| `scripts/pm_browser_workspace_reset.py:637` validate_fixture_contracts | `case['expected_error'] not in errors` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:186` authority_binding_failures | `row['event_type'] == 'browser.workspace.created'` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:188` authority_binding_failures | `row['event_type'] == 'browser.workspace.reset'` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:213` historical_preexisting_rows | `layout_pins is not None` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:223` historical_preexisting_rows | `fingerprint(row) not in pins[:2]` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:237` historical_preexisting_rows | `fingerprint(row) != pins[0]` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:214` historical_preexisting_rows | `fingerprint(row) not in layout_pins[:2]` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:217` historical_preexisting_rows | `fingerprint(row) != layout_pins[0]` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:288` preexisting_preservation | `not preserved39 or not preserved40` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:290` preexisting_preservation | `admission['preexisting_family_rows_sha256'] != CURRENT39_SHA256` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:297` preexisting_preservation | `any((row['family_id'] not in original_ids \| {COMPACTION_FAMILY} and (row['family_id'], row['event_type']) not in browser_pairs and (coordination.get((row['family_id'], row['event_` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:303` preexisting_preservation | `len({row['family_id'] for row in registry_rows}) != len(registry_rows)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:313` preexisting_preservation | `missing_successors and (not allow_historical)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:365` semantic_failures | `(context['run_id'] is None) != (context['attempt_id'] is None)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:367` semantic_failures | `(context['browser_session_id'] is None) != (context['browser_workspace_id'] is None)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:369` semantic_failures | `(context['browser_page_id'] is None) != (context['page_generation'] is None)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:371` semantic_failures | `context['browser_page_id'] is not None and context['browser_workspace_id'] is None` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:373` semantic_failures | `event in {'browser.navigation.generation_changed', 'browser.document.generation_changed'}` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:376` semantic_failures | `event == 'browser.workspace.reset'` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:379` semantic_failures | `event == 'browser.workspace.created' and facts['prior_workspace_generation'] is not None` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:381` semantic_failures | `'prior_page_generation' in facts and facts['prior_page_generation'] is not None` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:384` semantic_failures | `'coverage' in facts` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:399` semantic_failures | `'old_fence' in facts` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:413` semantic_failures | `'result_workspace_revision' in facts and facts['result_workspace_revision'] < facts['expected_workspace_revision']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:415` semantic_failures | `event.endswith('.checkpointed') or event in {'browser.program.paused', 'browser.program.resumed'}` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:418` semantic_failures | `'effect_state' in facts` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:434` semantic_failures | `event == 'browser.screenshot.model_attachment_selected' and (not facts['screenshot_artifact_ref'])` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:436` semantic_failures | `event == 'browser.session.reconstructed_on_host'` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:374` semantic_failures | `facts['prior_page_generation'] is None or facts['prior_page_generation'] >= context['page_generation']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:377` semantic_failures | `facts['prior_workspace_generation'] is None or facts['prior_workspace_generation'] >= facts['workspace_generation']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:382` semantic_failures | `facts['prior_page_generation'] > context['page_generation']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:386` semantic_failures | `facts['base_page_generation'] != context['page_generation']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:388` semantic_failures | `facts['base_representation_id'] == facts['representation_id']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:390` semantic_failures | `coverage['frames_covered'] > coverage['frames_total']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:392` semantic_failures | `coverage['status'] == 'complete' and (coverage['frames_total'] != coverage['frames_covered'] or coverage['omission_codes'] or coverage['budget_exhausted'] or coverage['synthetic_id` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:397` semantic_failures | `facts['invalidated'] != (coverage['status'] == 'stale_rejected')` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:401` semantic_failures | `any((new[field] < old[field] for field in ('lease_generation', 'lease_epoch', 'last_sequence')))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:403` semantic_failures | `new['page_generation'] != context['page_generation'] or old['page_generation'] != context['page_generation']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:405` semantic_failures | `event.endswith('.renewed') and any((old[field] != new[field] for field in ('lease_id', 'holder_id', 'lease_epoch', 'lease_generation')))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:407` semantic_failures | `event.endswith('.takeover_completed') and (new['lease_epoch'] <= old['lease_epoch'] or new['holder_id'] == old['holder_id'])` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:411` semantic_failures | `event.endswith('.takeover_requested') and any((old[field] != new[field] for field in ('lease_id', 'holder_id', 'lease_epoch', 'lease_generation')))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:416` semantic_failures | `not facts.get('checkpoint_ref')` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:422` semantic_failures | `set(unknown) & set(completed)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:424` semantic_failures | `(facts['effect_state'] == 'effect_unknown' or unknown) and facts['retry_allowed']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:426` semantic_failures | `facts['effect_state'] == 'no_effect' and (unknown or completed)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:428` semantic_failures | `terminal == 'failed_no_effect' and facts['effect_state'] != 'no_effect'` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:430` semantic_failures | `terminal == 'timed_out_effect_state_unknown' and facts['effect_state'] != 'effect_unknown'` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:432` semantic_failures | `terminal and terminal != 'timed_out_effect_state_unknown' and (unknown or facts['effect_state'] == 'effect_unknown')` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:437` semantic_failures | `not facts['source_fenced']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:439` semantic_failures | `facts['unknown_effects']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:510` central_binding_failures | `family is None` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:513` central_binding_failures | `list(central_family_validator(ROOT).iter_errors(family))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:518` central_binding_failures | `family.get('scope_policy') != 'project_only' or family.get('payload_schema_id') != row['payload_schema_ref']['schema_id']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:520` central_binding_failures | `family.get('semantic_owner_doc') != row['semantic_owner_ref'] or family.get('payload_owner_doc') != 'Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:526` central_binding_failures | `not required_refs <= set(family.get('source_refs', []))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:529` central_binding_failures | `legacy.get('aliases') != [] or legacy.get('admitted_extensions') != [] or legacy.get('referenced_event_id_pointer') is not None or (legacy.get('redaction') != {'mode': 'reject_unha` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:532` central_binding_failures | `legacy.get('identity_json_pointers') != expected_pointers` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:516` central_binding_failures | `family.get(key) != row[key]` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:540` event_failures | `not isinstance(event, dict)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:543` event_failures | `len(matches) != 1` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:546` event_failures | `row['admission_status'] != 'admitted_static_contract'` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:548` event_failures | `families is None` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:551` event_failures | `len(matching_families) != 1` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:573` ReplayOracle.consume | `self.contract_failures(event, producer, context, payload_store=payload_store, historical=True)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:579` ReplayOracle.consume | `identity in self.event_ids` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:581` ReplayOracle.consume | `transition in self.transition_ids` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:584` ReplayOracle.consume | `event['sequence_id'] <= self.checkpoint` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:613` validate | `admission.get('maximum_payload_utf8_bytes') != MAX_PAYLOAD_BYTES` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:622` validate | `set(authored) != required_events or len(required_events) != 53 or any((count != 1 for count in authored.values()))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:624` validate | `len({row['family_id'] for row in rows}) != len(rows)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:626` validate | `len({row['payload_schema_ref']['schema_id'] for row in rows}) != len(rows)` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:632` validate | `len(families) != len(registry['families'])` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:637` validate | `registered_scope != admitted_events` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:640` validate | `{row['command_id'] for row in command_bindings} != required_commands or len(command_bindings) != 15` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:661` validate | `next((row['event_types'] for row in command_bindings if row['command_id'] == 'cmd.browser.program.inspect'), None) != []` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:684` validate | `set((case['event_type'] for case in fixtures['valid'])) != required_events or len(by_id) != 53` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:687` validate | `len(all_case_ids) != len(set(all_case_ids))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:716` validate | `'browser.workspace.created' in admitted_events` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:721` validate | `'browser.workspace.reset' in admitted_events` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:646` validate | `len(matches) != 1` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:650` validate | `entry['expected_event_types'] != binding['event_types'] or not set(binding['event_types']) <= required_events` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:653` validate | `binding_ref not in entry['effect_contract']['receipt_or_event_refs']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:655` validate | `not entry['state_selector'].endswith('.availability') or not entry['disabled_reason_projection'].endswith('.disabled_reason')` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:657` validate | `not any(('handler_unavailable' in check for check in entry['acceptance_checks']))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:659` validate | `not any((all((token in check for token in ('prepared_not_admitted', 'advance a checkpoint', 'one-family landing'))) for check in entry['acceptance_checks']))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:667` validate | `definition['$id'] != row['payload_schema_ref']['schema_id'] or definition['properties']['owner_record_schema_id']['const'] != record['properties']['schema_id']['const']` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:670` validate | `policy.get('policy_version') != row['retention_policy_ref']['policy_version'] or not policy.get('hold_eligible')` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:672` validate | `policy.get('anchor_kind') == 'run_completion' and (not {'run_id', 'attempt_id'} <= set(row['required_context_fields']))` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:674` validate | `row['admission_status'] == 'prepared_not_admitted'` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:696` validate | `errors` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:699` validate | `event['event_type'] in admitted_events and admission_errors` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:701` validate | `event['event_type'] in prepared_events and 'event_not_admitted' not in admission_errors` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:711` validate | `case['expected_error'] not in errors` | — | — | — | partial |
| `scripts/pm-browser-event-admission.py:675` validate | `row['event_type'] in families` | — | — | — | partial |
| `scripts/pm_event_authority_ds_round2.py:55` padded | `len(route.canonical_msgpack(value)) == target` | — | — | — | partial |
| `scripts/pm_event_authority_ds_round2.py:137` Suite.run | `not positives[name]` | — | — | — | partial |
| `scripts/pm_event_authority_ds_round2.py:146` Suite.run | `baseline[name] is not False` | — | — | — | partial |
| `scripts/pm_event_authority_ds_round2.py:159` Suite.run | `not holds` | — | — | — | partial |
| `scripts/pm_event_authority_ds_round2.py:183` no_pattern_guard | `schema.get('pattern', '').startswith('^thr_')` | — | — | — | partial |
| `scripts/pm_event_authority_ds_round2.py:369` add_layout_cases | `key == 'candidate_layout'` | — | — | — | partial |
| `scripts/pm_event_authority_ds_round2.py:396` main | `args.self_test` | — | — | — | partial |
| `scripts/pm_event_payload_route.py:43` eager | `unresolved` | — | — | — | partial |

## Case-number key

| Case | Authored id |
|---|---|
| 1 | `browser.workspace.created:artifact_ref_LF` |
| 2 | `browser.workspace.created:dormant_ref_0` |
| 3 | `browser.workspace.created:dormant_ref_1` |
| 4 | `browser.workspace.created:generic_projector_unknown_payload_field` |
| 5 | `browser.workspace.created:historical_unverified_source` |
| 6 | `browser.workspace.created:historical_withdrawn_checkpoint` |
| 7 | `browser.workspace.created:known_retry_replay_only` |
| 8 | `browser.workspace.created:missing_reference` |
| 9 | `browser.workspace.created:one_byte_over_inline` |
| 10 | `browser.workspace.created:publication_id_LF` |
| 11 | `browser.workspace.created:reference_encoding` |
| 12 | `browser.workspace.created:reference_hash` |
| 13 | `browser.workspace.created:reference_media` |
| 14 | `browser.workspace.created:reference_size` |
| 15 | `browser.workspace.created:replay_only` |
| 16 | `browser.workspace.created:retained_2_not_a_fresh_writer` |
| 17 | `browser.workspace.reset:artifact_ref_LF` |
| 18 | `browser.workspace.reset:dormant_ref_0` |
| 19 | `browser.workspace.reset:dormant_ref_1` |
| 20 | `browser.workspace.reset:generic_projector_unknown_payload_field` |
| 21 | `browser.workspace.reset:historical_unverified_source` |
| 22 | `browser.workspace.reset:historical_withdrawn_checkpoint` |
| 23 | `browser.workspace.reset:known_retry_replay_only` |
| 24 | `browser.workspace.reset:missing_reference` |
| 25 | `browser.workspace.reset:one_byte_over_inline` |
| 26 | `browser.workspace.reset:publication_id_LF` |
| 27 | `browser.workspace.reset:reference_encoding` |
| 28 | `browser.workspace.reset:reference_hash` |
| 29 | `browser.workspace.reset:reference_media` |
| 30 | `browser.workspace.reset:reference_size` |
| 31 | `browser.workspace.reset:replay_only` |
| 32 | `browser.workspace.reset:retained_2_not_a_fresh_writer` |
| 33 | `compaction-event:cross_project_envelope` |
| 34 | `compaction-event:cross_thread_envelope` |
| 35 | `compaction-event:external_payload_forbidden` |
| 36 | `compaction-event:timestamp_mismatch` |
| 37 | `compaction-event:wrong_event_id` |
| 38 | `compaction-event:wrong_event_type` |
| 39 | `compaction-event:wrong_idempotency` |
| 40 | `compaction-event:wrong_payload_schema` |
| 41 | `compaction-event:wrong_replay_policy` |
| 42 | `compaction-event:wrong_scope` |
| 43 | `compaction:application_null_project` |
| 44 | `compaction:content_hash_field_forbidden` |
| 45 | `compaction:context_epoch_id_LF` |
| 46 | `compaction:dormant_ref` |
| 47 | `compaction:empty_project` |
| 48 | `compaction:forged_source` |
| 49 | `compaction:gain_equation_mismatch` |
| 50 | `compaction:invalid_calendar` |
| 51 | `compaction:invalid_thread` |
| 52 | `compaction:missing_receipt` |
| 53 | `compaction:negative_generation` |
| 54 | `compaction:no_actual_gain` |
| 55 | `compaction:noninteger_size` |
| 56 | `compaction:not_committed` |
| 57 | `compaction:operation_id_LF` |
| 58 | `compaction:project_id_LF` |
| 59 | `compaction:raw_summary_forbidden` |
| 60 | `compaction:raw_transcript_forbidden` |
| 61 | `compaction:receipt_is_local_path` |
| 62 | `compaction:receipt_is_url` |
| 63 | `compaction:receipt_oversized` |
| 64 | `compaction:replay_only` |
| 65 | `compaction:rewound_revision` |
| 66 | `compaction:same_revision` |
| 67 | `compaction:secret_shaped_receipt` |
| 68 | `compaction:thread_id_LF` |
| 69 | `compaction:timestamp_fraction_unbounded` |
| 70 | `compaction:timestamp_invalid_calendar` |
| 71 | `compaction:timestamp_offset_not_canonical_utc` |
| 72 | `compaction:unbounded_operation` |
| 73 | `compaction:unbounded_size` |
| 74 | `compaction:unknown_version` |
| 75 | `compaction:withdrawn_history` |
| 76 | `compaction:zero_gain` |
| 77 | `created-checkpoint:current_degraded` |
| 78 | `created-checkpoint:current_incomplete` |
| 79 | `created-checkpoint:current_with_withdrawal` |
| 80 | `created-checkpoint:extra_checkpoint_content` |
| 81 | `created-checkpoint:future_schema` |
| 82 | `created-checkpoint:invalid_cursor_segment` |
| 83 | `created-checkpoint:invalid_digest` |
| 84 | `created-checkpoint:invalid_observation_time` |
| 85 | `created-checkpoint:negative_cursor` |
| 86 | `created-checkpoint:null_cursor_with_bounds` |
| 87 | `created-checkpoint:null_first_with_cursor` |
| 88 | `created-checkpoint:protected_auth_ref` |
| 89 | `created-checkpoint:reversed_range` |
| 90 | `created-checkpoint:sibling_event` |
| 91 | `created-checkpoint:sibling_projector` |
| 92 | `created-checkpoint:through_cursor_mismatch` |
| 93 | `created-checkpoint:withdrawn_without_anchor` |
| 94 | `created-checkpoint:wrong_partition` |
| 95 | `created:capability_current` |
| 96 | `created:capability_profile` |
| 97 | `created:capability_ref` |
| 98 | `created:failed_result` |
| 99 | `created:filesafe_allowed` |
| 100 | `created:filesafe_ref` |
| 101 | `created:generation_join` |
| 102 | `created:host_join` |
| 103 | `created:idempotency_join` |
| 104 | `created:instance_join` |
| 105 | `created:missing_workspace` |
| 106 | `created:missing_workspace_ref` |
| 107 | `created:no_effect_result` |
| 108 | `created:node_join` |
| 109 | `created:owner_receipt` |
| 110 | `created:permission_current` |
| 111 | `created:permission_ref` |
| 112 | `created:predecessor_on_create` |
| 113 | `created:producer_authenticated` |
| 114 | `created:producer_component` |
| 115 | `created:project_join` |
| 116 | `created:protected_session` |
| 117 | `created:request_schema` |
| 118 | `created:reset_state` |
| 119 | `created:resource_isolated` |
| 120 | `created:resource_unexposed` |
| 121 | `created:result_schema` |
| 122 | `created:result_workspace` |
| 123 | `created:run_without_attempt` |
| 124 | `created:scope_current` |
| 125 | `created:transition_receipt` |
| 126 | `created:unused_workspace_identity` |
| 127 | `created:workspace_policy_ref` |
| 128 | `created:wrong_event` |
| 129 | `home:prior_core_bytes_not_canonical` |
| 130 | `home:prior_core_wrong_successor` |
| 131 | `home:receipt_foreign_event_id` |
| 132 | `home:receipt_foreign_owner_command` |
| 133 | `home:receipt_foreign_readback_key` |
| 134 | `home:receipt_foreign_receipt_ref` |
| 135 | `home:receipt_home3_owner_result_ref` |
| 136 | `home:receipt_inline_over_value_limit` |
| 137 | `home:receipt_json_capture_bytes` |
| 138 | `home:receipt_revision_edge_two` |
| 139 | `home:ref_byte_size_mismatch` |
| 140 | `home:ref_foreign_logical_key` |
| 141 | `home:ref_foreign_storage_instance` |
| 142 | `home:ref_store_media_type_mismatch` |
| 143 | `home:ref_value_candidate_skips_revision` |
| 144 | `home:ref_value_corrupt` |
| 145 | `home:ref_value_home3_version` |
| 146 | `home:ref_value_missing` |
| 147 | `home:ref_value_not_canonical` |
| 148 | `home:ref_value_sha256_mismatch` |
| 149 | `home:slot_bytes_hash_mismatch` |
| 150 | `home:slot_candidate_skips_revision` |
| 151 | `home:slot_event_foreign_command` |
| 152 | `home:slot_foreign_project_layout` |
| 153 | `home:slot_inline_one_byte_over_value_limit` |
| 154 | `home:slot_inline_over_16k` |
| 155 | `home:slot_inline_over_value_limit_25_tabs` |
| 156 | `home:source_ref_blake3_trailing_lf_in_referenced_value` |
| 157 | `home:source_ref_byte_size_mismatch` |
| 158 | `home:source_ref_media_type_mismatch` |
| 159 | `home:source_ref_object_corrupt` |
| 160 | `home:source_ref_object_missing` |
| 161 | `home:source_ref_sha256_mismatch` |
| 162 | `layout:boundary_corrupt_reference` |
| 163 | `layout:boundary_missing_reference` |
| 164 | `layout:old_envelope_not_a_new_writer` |
| 165 | `layout:one_byte_over_inline` |
| 166 | `layout:writer_replay_only` |
| 167 | `reset:reset_after_generation` |
| 168 | `reset:reset_blocked_result` |
| 169 | `reset:reset_commit_unproved` |
| 170 | `reset:reset_controller_epoch` |
| 171 | `reset:reset_fence_missing` |
| 172 | `reset:reset_filesafe_mismatch` |
| 173 | `reset:reset_no_effect_result` |
| 174 | `reset:reset_permission_mismatch` |
| 175 | `reset:reset_prior_generation` |
| 176 | `reset:reset_receipt_mismatch` |
| 177 | `reset:reset_regressing_generation` |
| 178 | `reset:reset_result_ref_missing` |
| 179 | `reset:reset_revision_is_not_generation` |
| 180 | `reset:reset_unproved_capability_valid_at_transition` |
| 181 | `reset:reset_unproved_controller_valid_at_transition` |
| 182 | `reset:reset_unproved_filesafe_allowed_at_transition` |
| 183 | `reset:reset_unproved_original_request_resolved` |
| 184 | `reset:reset_unproved_original_result_resolved` |
| 185 | `reset:reset_unproved_permission_valid_at_transition` |
| 186 | `reset:reset_unproved_producer_authenticated` |
| 187 | `reset:reset_unproved_scope_valid_at_transition` |
| 188 | `reset:reset_unproved_transition_receipt_resolved` |
| 189 | `reset:reset_wrong_command` |
| 190 | `reset:reset_wrong_host` |
| 191 | `reset:reset_wrong_instance` |
| 192 | `reset:reset_wrong_key` |
| 193 | `reset:reset_wrong_node` |
| 194 | `reset:reset_wrong_workspace` |
