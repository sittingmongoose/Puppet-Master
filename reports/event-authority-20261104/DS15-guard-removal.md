# DS15 exact guard-removal table — fix round 5

Implementation: `8649acac85d19cf6c327d8d3d92f788e1e35b4ac`. Reviewed base: `90e76fc7cfc127ab004525e7f3f1860031c16004`. Raw export: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix5/whole-lane-guard-audit.json`, SHA-256 `c0300146767b12cd8663e1d450a1c027ee2f9234ac8d2bb899ea8dba1389b26d`.

Overall **PARTIAL**. 2120 negatives; 161/177 predicates exposed alone; 16 predicates proved through 20 named duplicate sets; zero unproved guards; zero positive-control regressions. 345 negatives do not flip singly; 58 remain after named sets; the separate exact-pattern audit exposes 14 of those. The final 44 are 14 legal PENDING dispatches and 30 end-to-end prerequisite cases. Exceptions never count as acceptance.

U is the complete `negatives` array in the raw export, keyed by `(family,id,target,operation)`. Fnnn is `mutants[nnn].negative_successes`; Ennn is the set of negative rows whose `errors_after_weakening` contains nnn. Every other row is tested and remains REFUSE/UNAVAILABLE/PENDING: Rnnn = U − Fnnn − Ennn. Counts below explicitly exclude exceptions from R. Case IDs are grouped by suffix with multiplicity; raw rows retain exact families and complete IDs. All 644 successful controls are tested for every single guard and complete duplicate set.

The four presence helpers are the actual predicates used by the original model. Their call sites are delegation, not extra guards. Inlining them restores the ten pre-existing validation helpers/branches exactly. G016/G026/G105/G154 therefore retain their review identifiers while targeting the single returned predicate in the corresponding helper.

| Guard | Exact predicate / location | Negatives that flip (F) | Other negatives still rejected (R) | Mutation exceptions (E) | Proof |
|---|---|---|---:|---:|---|
| G000 | `envelope_ok:146`: `list(validator(read('Plans/event_record.schema.json')).iter_errors(e))` | 28: `event-envelope-unknown-field` × 14; `isolated-checkpoint-envelope-schema` × 14 | 2078: R000 | 14: E000 | SINGLE |
| G001 | `envelope_ok:147`: `list(validator(read('Plans/event_record.schema.json')).iter_errors(original))` | 14: `isolated-original-envelope-schema` × 14 | 2106: R001 | 0: E001 | SINGLE |
| G002 | `envelope_ok:148`: `e['event_type'] != c['event_type']` | 1: `isolated-envelope_ok-132-15` × 1 | 2119: R002 | 0: E002 | SINGLE |
| G003 | `envelope_ok:148`: `not re.fullmatch('[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+', e['event_type'])` | 0: NONE | 2120: R003 | 0: E003 | DUPLICATE: G000+G002+G003 |
| G004 | `envelope_ok:149`: `e['replay_policy'] != 'dedupe_by_idempotency_key'` | 14: `isolated-non-dedupe-policy-envelope` × 14 | 2106: R004 | 0: E004 | SINGLE |
| G005 | `envelope_ok:150`: `original['replay_policy'] != 'dedupe_by_idempotency_key'` | 14: `isolated-non-dedupe-policy-original-event` × 14 | 2106: R005 | 0: E005 | SINGLE |
| G006 | `envelope_ok:151`: `e['scope_kind'] != ('application' if scope['kind'] == 'app' else 'project')` | 1: `isolated-envelope_ok-135-15` × 1 | 2119: R006 | 0: E006 | SINGLE |
| G007 | `envelope_ok:152`: `e['project_id'] != scope['project_id']` | 1: `isolated-envelope_ok-136-15` × 1 | 2119: R007 | 0: E007 | SINGLE |
| G008 | `envelope_ok:152`: `e['payload'] != d['payload']` | 1: `isolated-envelope_ok-136-57` × 1 | 2119: R008 | 0: E008 | SINGLE |
| G009 | `envelope_ok:153`: `e['run_id'] != d['payload'].get('run_id')` | 1: `isolated-envelope_ok-137-15` × 1 | 2119: R009 | 0: E009 | SINGLE |
| G010 | `envelope_ok:153`: `e['thread_id'] != d['payload'].get('thread_id')` | 1: `isolated-envelope_ok-137-60` × 1 | 2119: R010 | 0: E010 | SINGLE |
| G011 | `envelope_ok:154`: `e['payload_schema_id'] != read(c['payload_schema_ref'])['$id']` | 1: `isolated-envelope_ok-138-15` × 1 | 2119: R011 | 0: E011 | SINGLE |
| G012 | `envelope_ok:155`: `d['scope_partition'] != _codec.scope_partition(e['scope_kind'], e['project_id'])` | 1: `isolated-envelope_ok-139-15` × 1 | 2119: R012 | 0: E012 | SINGLE |
| G013 | `envelope_ok:156`: `len(_codec.canonical_messagepack_bytes(e['payload'])) > 16384` | 28: `isolated-exact-16385-inline-boundary` × 14; `oversize-inline-body-refused` × 14 | 2092: R013 | 0: E013 | SINGLE |
| G014 | `envelope_ok:160`: `retry and (e['event_id'] != original['event_id'] or _codec.event_producer_semantic_digest(e) != _codec.event_producer_semantic_digest(original))` | 14: `retry-compares-semantic-actor` × 14 | 2106: R014 | 0: E014 | SINGLE |
| G015 | `envelope_ok:181`: `e['idempotency_key'] == identity(c, e['payload'], source)` | 1: `isolated-envelope_ok-165-11` × 1 | 2119: R015 | 0: E015 | SINGLE |
| G016 | `application_source_present:128 (from envelope_ok:165)`: `bool(value)` | 1: `missing-application-source-at-presence-boundary` × 1 | 2119: R016 | 0: E016 | SINGLE |
| G017 | `envelope_ok:165`: `source != d['original']['application_source']` | 1: `isolated-envelope_ok-149-26` × 1 | 2119: R017 | 0: E017 | SINGLE |
| G018 | `envelope_ok:166`: `list(application_source_validator().iter_errors(source))` | 3: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1 | 2117: R018 | 0: E018 | SINGLE |
| G019 | `envelope_ok:167`: `source['schema_id'] != 'pm.application_source.browser_transition.v1'` | 0: NONE | 2120: R019 | 0: E019 | DUPLICATE: G018+G019 |
| G020 | `envelope_ok:168`: `source['interface_id'] != 'owner.browser.transition.application@1.0.0'` | 0: NONE | 2120: R020 | 0: E020 | DUPLICATE: G018+G020 |
| G021 | `envelope_ok:169`: `source['storage_instance_id'] != d['storage_instance_id']` | 1: `isolated-envelope_ok-153-19` × 1 | 2119: R021 | 0: E021 | SINGLE |
| G022 | `envelope_ok:170`: `source['thread_id'] != e['thread_id']` | 1: `isolated-app-source-thread_id` × 1 | 2119: R022 | 0: E022 | SINGLE |
| G023 | `envelope_ok:171`: `source['scope']['scope_kind'] != 'application'` | 0: NONE | 2120: R023 | 0: E023 | DUPLICATE: G018+G023 |
| G024 | `envelope_ok:171`: `source['scope']['project_id'] is not None` | 0: NONE | 2120: R024 | 0: E024 | DUPLICATE: G018+G024 |
| G025 | `envelope_ok:172`: `source['scope']['server_id'] != source['server_id']` | 1: `isolated-app-source-scope-server_id` × 1 | 2119: R025 | 0: E025 | SINGLE |
| G026 | `original_output_present:132 (from envelope_ok:173)`: `value is not None` | 1: `null-original-output-at-presence-boundary` × 1 | 2118: R026 | 1: E026 | SINGLE |
| G027 | `envelope_ok:174`: `source['original_output']['profile_id'] != scope['profile_id']` | 2: `isolated-envelope_ok-149-12` × 1; `isolated-envelope_ok-158-19` × 1 | 2118: R027 | 0: E027 | SINGLE |
| G028 | `envelope_ok:175`: `d['payload']['browser_session_id'] not in source['original_output']['session_refs']` | 1: `isolated-app-source-original_output-session_refs` × 1 | 2119: R028 | 0: E028 | SINGLE |
| G029 | `envelope_ok:176`: `any((stage['original_operation_id'] != source['original_operation_id'] for stage in source['stage_custody'].values()))` | 1: `isolated-app-source-stage_custody-owner_commit-original_operation_id` × 1 | 2119: R029 | 0: E029 | SINGLE |
| G030 | `envelope_ok:178`: `not all((isinstance(source.get(k), str) and 0 < len(source[k]) <= 256 and ('\n' not in source[k]) for k in ('server_id', 'original_operation_id')))` | 2: `application-trailing-LF-original_operation_id` × 1; `application-trailing-LF-server_id` × 1 | 2118: R030 | 0: E030 | SINGLE |
| G031 | `receipt_ok:185`: `not (shared_valid('AppendReceipt', r) and shared_valid('custody_v2', custody) and shared_valid('full_value_result', result))` | 84: `receipt-field-durability_state` × 14; `receipt-field-durability_state-full-recovery` × 14; `receipt-missing-field` × 14; `receipt-missing-field-full-recovery` × 14; `receipt-unknown-field` × 14; `receipt-unknown-field-full-recovery` × 14 | 2036: R031 | 0: E031 | SINGLE |
| G032 | `receipt_ok:188`: `r == custody['first_append_receipt'] == result['first_append_receipt']` | 113: `isolated-receipt_ok-172-12` × 1; `receipt-field-acknowledged_at_utc` × 14; `receipt-field-byte_offset` × 14; `receipt-field-commit_group_id` × 14; `receipt-field-durability_class` × 14; `receipt-field-durable_end_offset` × 14; `receipt-field-manifest_generation` × 14; `receipt-field-segment_generation` × 14; `receipt-field-segment_name` × 14 | 2007: R032 | 0: E032 | SINGLE |
| G033 | `receipt_ok:189`: `r['event_id'] == event['event_id']` | 14: `isolated-receipt-original-event_id` × 14 | 2106: R033 | 0: E033 | SINGLE |
| G034 | `receipt_ok:189`: `r['sequence_id'] == event['sequence_id']` | 14: `isolated-receipt-original-sequence_id` × 14 | 2106: R034 | 0: E034 | SINGLE |
| G035 | `receipt_ok:190`: `r['byte_offset'] < r['durable_end_offset']` | 14: `isolated-receipt-end-offset-order` × 14 | 2106: R035 | 0: E035 | SINGLE |
| G036 | `receipt_ok:191`: `custody['original_event_value_commitment'] == result['original_event_value_commitment'] == commitment(event)` | 42: `full-value-commitment-corrupt` × 14; `history-after-live-state-advances-forged-original` × 14; `original-storage-metadata-commitment` × 14 | 2078: R036 | 0: E036 | SINGLE |
| G037 | `receipt_ok:192`: `custody['original_segment_ref'] == result['original_segment_ref']` | 1: `isolated-receipt_ok-176-16` × 1 | 2119: R037 | 0: E037 | SINGLE |
| G038 | `receipt_ok:193`: `custody['storage_instance_id'] == d['storage_instance_id']` | 1: `isolated-receipt_ok-177-16` × 1 | 2119: R038 | 0: E038 | SINGLE |
| G039 | `receipt_ok:194`: `custody['scope_partition'] == d['scope_partition']` | 1: `isolated-receipt_ok-178-16` × 1 | 2119: R039 | 0: E039 | SINGLE |
| G040 | `receipt_ok:195`: `custody['event_id'] == event['event_id']` | 1: `isolated-receipt_ok-179-16` × 1 | 2119: R040 | 0: E040 | SINGLE |
| G041 | `receipt_ok:195`: `custody['event_type'] == event['event_type']` | 1: `isolated-receipt_ok-179-61` × 1 | 2119: R041 | 0: E041 | SINGLE |
| G042 | `receipt_ok:196`: `custody['idempotency_key'] == event['idempotency_key']` | 1: `isolated-receipt_ok-180-16` × 1 | 2119: R042 | 0: E042 | SINGLE |
| G043 | `receipt_ok:197`: `custody['producer_semantic_digest'] == _codec.event_producer_semantic_digest(event)` | 28: `corrupt-receipt` × 14; `isolated-checkpoint-receipt-custody` × 14 | 2092: R043 | 0: E043 | SINGLE |
| G044 | `token_matches_storage:201`: `token['storage_instance_id'] == storage_instance_id` | 1: `isolated-token_matches_storage-185-12` × 1 | 2119: R044 | 0: E044 | SINGLE |
| G045 | `token_matches_storage:202`: `token['source_selection']['storage_instance_id'] == storage_instance_id` | 15: `isolated-token_matches_storage-186-16` × 1; `source-instance-mismatch` × 14 | 2105: R045 | 0: E045 | SINGLE |
| G046 | `token_matches_storage:203`: `token['checkpoint_key'] == key` | 15: `checkpoint-foreign-root-key` × 14; `isolated-token_matches_storage-187-16` × 1 | 2105: R046 | 0: E046 | SINGLE |
| G047 | `token_matches_storage:204`: `token['checkpoint_ref'] == key + '#/generations/' + token['generation_id']` | 29: `checkpoint-foreign-root-ref` × 14; `checkpoint-ref-generation-mismatch` × 14; `isolated-token_matches_storage-188-16` × 1 | 2091: R047 | 0: E047 | SINGLE |
| G048 | `token_matches_storage:205`: `token['index_dataset_name'] == 'event_record_index.v2@' + token['generation_id']` | 15: `checkpoint-dataset-generation-mismatch` × 14; `isolated-token_matches_storage-189-16` × 1 | 2105: R048 | 0: E048 | SINGLE |
| G049 | `payload_ok:216`: `list(validator(read(c['payload_schema_ref'])).iter_errors(p))` | 12: `auto-missing-dependency-visible-forbidden` × 1; `forced-visible-headless-forbidden` × 1; `invalid-transition` × 1; `trailing-LF-payload-outcome_ref` × 7; `trailing-LF-payload-provenance_ref` × 1; `trailing-LF-payload-source_ref` × 1 | 2108: R049 | 0: E049 | SINGLE |
| G050 | `payload_ok:218`: `not x['owner_command_authorized']` | 15: `isolated-payload_ok-202-7` × 1; `owner-command-refusal-not-overridden` × 14 | 2105: R050 | 0: E050 | SINGLE |
| G051 | `payload_ok:227`: `not safe_refs(p)` | 42: `credential-shaped-reference` × 14; `forbidden-reference` × 14; `unsafe-content-reference` × 14 | 2078: R051 | 0: E051 | SINGLE |
| G052 | `payload_ok:230`: `x['scope'] != scope` | 1: `isolated-payload_ok-214-7` × 1 | 2119: R052 | 0: E052 | SINGLE |
| G053 | `payload_ok:230`: `x['envelope_project_id'] != scope.get('project_id')` | 15: `envelope-mismatch` × 14; `isolated-payload_ok-214-30` × 1 | 2105: R053 | 0: E053 | SINGLE |
| G054 | `payload_ok:232`: `p.get('run_id') != x['envelope_run_id']` | 1: `isolated-payload_ok-216-7` × 1 | 2119: R054 | 0: E054 | SINGLE |
| G055 | `payload_ok:234`: `p.get('browser_session_id') and x['session_security_class'] != 'ordinary'` | 2: `isolated-payload_ok-218-7` × 1; `protected-capture` × 1 | 2118: R055 | 0: E055 | SINGLE |
| G056 | `payload_ok:238`: `x['config_inspected']` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-222-15` × 1; `publish-current-source-join-refused` × 1 | 2115: R056 | 0: E056 | SINGLE |
| G057 | `payload_ok:238`: `x['doctor_invocation_id'] == p['doctor_invocation_id']` | 1: `isolated-payload_ok-222-41` × 1 | 2119: R057 | 0: E057 | SINGLE |
| G058 | `payload_ok:240`: `x['launch_outcome'] == 'launched'` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-224-15` × 1; `publish-current-source-join-refused` × 1 | 2115: R058 | 0: E058 | SINGLE |
| G059 | `payload_ok:240`: `x['driver_session_id'] == p['session_id']` | 1: `isolated-payload_ok-224-53` × 1 | 2119: R059 | 0: E059 | SINGLE |
| G060 | `payload_ok:242`: `x['session_state'] == 'running'` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-226-15` × 1; `publish-current-source-join-refused` × 1 | 2115: R060 | 0: E060 | SINGLE |
| G061 | `payload_ok:242`: `p['step_revision'] > x['previous_revision']` | 1: `isolated-payload_ok-226-51` × 1 | 2119: R061 | 0: E061 | SINGLE |
| G062 | `payload_ok:244`: `x['artifact']['id'] == p['artifact_id']` | 1: `isolated-payload_ok-228-16` × 1 | 2119: R062 | 0: E062 | SINGLE |
| G063 | `payload_ok:244`: `x['artifact']['ref'] == p['artifact_ref']` | 1: `isolated-payload_ok-228-60` × 1 | 2119: R063 | 0: E063 | SINGLE |
| G064 | `payload_ok:245`: `x['artifact']['receipt_ref'] == p['artifact_receipt_ref']` | 1: `isolated-payload_ok-229-20` × 1 | 2119: R064 | 0: E064 | SINGLE |
| G065 | `payload_ok:245`: `x['artifact']['committed']` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-229-82` × 1; `publish-current-source-join-refused` × 1 | 2115: R065 | 0: E065 | SINGLE |
| G066 | `payload_ok:247`: `x['session_state'] == 'running'` | 1: `isolated-payload_ok-231-16` × 1 | 2119: R066 | 0: E066 | SINGLE |
| G067 | `payload_ok:247`: `x['finalization']['committed']` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-231-52` × 1; `publish-current-source-join-refused` × 1 | 2115: R067 | 0: E067 | SINGLE |
| G068 | `payload_ok:248`: `all((x['finalization'][k] == p[k] for k in ('manifest_ref', 'summary_ref', 'checks_ref')))` | 1: `isolated-payload_ok-232-20` × 1 | 2119: R068 | 0: E068 | SINGLE |
| G069 | `payload_ok:250`: `p['degradation_revision'] > x['previous_revision']` | 1: `isolated-payload_ok-234-16` × 1 | 2119: R069 | 0: E069 | SINGLE |
| G070 | `payload_ok:250`: `not x['visible_dependency_available']` | 3: `append-recovery-current-source-join-refused` × 1; `isolated-payload_ok-234-71` × 1; `publish-current-source-join-refused` × 1 | 2117: R070 | 0: E070 | SINGLE |
| G071 | `payload_ok:251`: `x['launch_outcome'] == ('refused' if p['requested_visual_mode'] == 'forced_visible' else 'headless')` | 2: `history-after-live-state-advances-invalid-original-transition` × 1; `isolated-payload_ok-235-20` × 1 | 2118: R071 | 0: E071 | SINGLE |
| G072 | `payload_ok:253`: `x['target_resolution'] in ('explicit', 'owning_surface', 'explicit_new_thread')` | 0: NONE | 2120: R072 | 0: E072 | DUPLICATE: G072+G073 |
| G073 | `payload_ok:254`: `p['target_resolution'] == x['target_resolution']` | 3: `isolated-payload_ok-237-16` × 1; `isolated-payload_ok-238-20` × 1; `wrong-capture-resolution-provenance` × 1 | 2117: R073 | 0: E073 | SINGLE |
| G074 | `payload_ok:255`: `x['resolved_thread_id'] == p['thread_id']` | 2: `isolated-payload_ok-239-20` × 1; `unresolved-target` × 1 | 2118: R074 | 0: E074 | SINGLE |
| G075 | `payload_ok:255`: `x['thread_writable']` | 1: `isolated-payload_ok-239-66` × 1 | 2119: R075 | 0: E075 | SINGLE |
| G076 | `payload_ok:256`: `x['chip']['chip_id'] == p['chip_id']` | 1: `isolated-payload_ok-240-20` × 1 | 2119: R076 | 0: E076 | SINGLE |
| G077 | `payload_ok:256`: `x['chip']['thread_id'] == p['thread_id']` | 1: `isolated-payload_ok-240-61` × 1 | 2119: R077 | 0: E077 | SINGLE |
| G078 | `payload_ok:257`: `x['chip']['attachment_type'] == p['attachment_type']` | 1: `isolated-payload_ok-241-20` × 1 | 2119: R078 | 0: E078 | SINGLE |
| G079 | `payload_ok:258`: `x['chip']['source_ref'] == p['source_ref']` | 1: `isolated-payload_ok-242-20` × 1 | 2119: R079 | 0: E079 | SINGLE |
| G080 | `payload_ok:258`: `x['chip']['committed']` | 1: `isolated-payload_ok-242-67` × 1 | 2119: R080 | 0: E080 | SINGLE |
| G081 | `payload_ok:259`: `x['chip']['status'] == p['capture_status']` | 1: `isolated-payload_ok-243-20` × 1 | 2119: R081 | 0: E081 | SINGLE |
| G082 | `payload_ok:259`: `x['thread_scope'] == scope` | 2: `cross-namespace-thread-refused` × 1; `isolated-payload_ok-243-67` × 1 | 2118: R082 | 0: E082 | SINGLE |
| G083 | `payload_ok:259`: `not x['auto_send']` | 2: `isolated-payload_ok-243-98` × 1; `no-auto-send` × 1 | 2118: R083 | 0: E083 | SINGLE |
| G084 | `payload_ok:266`: `p['previous_state'] in before` | 0: NONE | 2120: R084 | 0: E084 | DUPLICATE: G049+G084 |
| G085 | `payload_ok:266`: `p['workflow_state'] == after` | 0: NONE | 2120: R085 | 0: E085 | DUPLICATE: G049+G085 |
| G086 | `payload_ok:267`: `x['workflow_state'] == p['previous_state']` | 18: `append-recovery-current-source-join-refused` × 4; `history-after-live-state-advances-invalid-original-transition` × 4; `invalid-transition` × 4; `isolated-payload_ok-250-16` × 1; `isolated-payload_ok-251-20` × 1; `publish-current-source-join-refused` × 4 | 2102: R086 | 0: E086 | SINGLE |
| G087 | `payload_ok:267`: `p['workflow_revision'] == x['previous_revision'] + 1` | 1: `isolated-payload_ok-251-67` × 1 | 2119: R087 | 0: E087 | SINGLE |
| G088 | `payload_ok:268`: `x['dev_session_id'] == p['dev_session_id']` | 1: `isolated-payload_ok-252-20` × 1 | 2119: R088 | 0: E088 | SINGLE |
| G089 | `payload_ok:268`: `x['managed_outcome_committed']` | 1: `isolated-payload_ok-252-67` × 1 | 2119: R089 | 0: E089 | SINGLE |
| G090 | `payload_ok:269`: `x['operation_id'] == p['operation_id']` | 5: `isolated-payload_ok-253-20` × 1; `wrong-owner-operation` × 4 | 2115: R090 | 0: E090 | SINGLE |
| G091 | `payload_ok:270`: `n != 'dev.session.started' or x['launch_outcome'] == 'launched'` | 1: `isolated-payload_ok-254-21` × 1 | 2119: R091 | 0: E091 | SINGLE |
| G092 | `payload_ok:271`: `n != 'dev.session.stopped' or x['managed_resources_settled']` | 1: `isolated-payload_ok-255-21` × 1 | 2119: R092 | 0: E092 | SINGLE |
| G093 | `payload_ok:272`: `x['dap_state_after'] == x['dap_state_before'] or (x['dap_transition_ref'] is not None and x['dap_owner_verified'])` | 5: `isolated-payload_ok-256-21` × 1; `no-dap-flattening` × 4 | 2115: R093 | 0: E093 | SINGLE |
| G094 | `payload_ok:273`: `all((p.get(k) == x['links'].get(k) for k in ('run_id', 'thread_id', 'workspace_tab_id', 'terminal_session_id', 'dap_session_id')))` | 5: `fabricated-dap-link` × 4; `isolated-payload_ok-257-20` × 1 | 2115: R094 | 0: E094 | SINGLE |
| G095 | `payload_ok:274`: `not x['rewrite_terminal_history']` | 5: `isolated-payload_ok-258-20` × 1; `no-terminal-rewrite` × 4 | 2115: R095 | 0: E095 | SINGLE |
| G096 | `payload_ok:276`: `x['preview_subject_id'] == p['preview_subject_id']` | 4: `isolated-payload_ok-260-16` × 1; `subject-mismatch` × 3 | 2116: R096 | 0: E096 | SINGLE |
| G097 | `payload_ok:277`: `x['preview_session_id'] == p['preview_session_id']` | 4: `isolated-payload_ok-261-20` × 1; `runtime-mismatch` × 3 | 2116: R097 | 0: E097 | SINGLE |
| G098 | `payload_ok:278`: `x['source_revision'] == p['source_revision']` | 1: `isolated-payload_ok-262-20` × 1 | 2119: R098 | 0: E098 | SINGLE |
| G099 | `payload_ok:278`: `x['runtime_verified']` | 1: `isolated-payload_ok-262-69` × 1 | 2119: R099 | 0: E099 | SINGLE |
| G100 | `payload_ok:279`: `not x['restored_live_claim']` | 13: `append-recovery-current-source-join-refused` × 3; `history-after-live-state-advances-invalid-original-transition` × 3; `invalid-transition` × 3; `isolated-payload_ok-263-20` × 1; `publish-current-source-join-refused` × 3 | 2107: R100 | 0: E100 | SINGLE |
| G101 | `payload_ok:280`: `n != 'preview.session.started' or (x['session_state'] == 'created' and p['runtime_state'] == 'loading')` | 1: `isolated-payload_ok-264-21` × 1 | 2119: R101 | 0: E101 | SINGLE |
| G102 | `payload_ok:281`: `n != 'preview.session.stopped' or (x['session_state'] != 'closed' and p['runtime_state'] == 'closed' and x['managed_resources_settled'])` | 1: `isolated-payload_ok-265-21` × 1 | 2119: R102 | 0: E102 | SINGLE |
| G103 | `payload_ok:282`: `n != 'preview.session.refreshed' or (x['session_state'] in ('ready', 'stale', 'degraded', 'error') and x['refreshable'] and x['refresh_committed'] and (p['preview_revision'] > x['previous_revision']) and (p['refresh_origin'] == 'cmd.browser.reload' and bool(p.get('browser_session_id')) and (p['browser_session_id'] == x['browser_session_id']) or (p['refresh_origin'] == 'filemanager.preview_refresh' and (not p.get('browser_session_id')))))` | 2: `isolated-payload_ok-266-21` × 1; `non-browser-cannot-use-browser-command` × 1 | 2118: R103 | 0: E103 | SINGLE |
| G104 | `evaluate:304`: `'projector_replay_only' in policies` | 14: `replay-only-context-recovery` × 14 | 2106: R104 | 0: E104 | SINGLE |
| G105 | `outcome_present:136 (from evaluate:310)`: `value is not None` | 14: `missing-outcome-at-presence-boundary` × 14 | 2092: R105 | 14: E105 | SINGLE |
| G106 | `evaluate:310`: `not out['committed']` | 14: `publish-before-body-commit` × 14 | 2106: R106 | 0: E106 | SINGLE |
| G107 | `evaluate:310`: `not d['backup_closure_verified']` | 14: `backup-loss` × 14 | 2106: R107 | 0: E107 | SINGLE |
| G108 | `evaluate:312`: `not payload_ok(c, o['payload'], d['original_context'])` | 14: `history-after-live-state-advances-invalid-original-transition` × 14 | 2106: R108 | 0: E108 | SINGLE |
| G109 | `evaluate:312`: `not envelope_ok(c, d)` | 52: `application-missing-original_operation_id` × 1; `application-missing-server_id` × 1; `application-raw-hash-key` × 1; `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_operation_id` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-server_id` × 1; `application-trailing-LF-source_sha256` × 1; `application-wrong-original_operation_id` × 1; `application-wrong-server_id` × 1; `event-envelope-missing-field` × 14; `event-envelope-unknown-field` × 14; `retry-compares-semantic-actor` × 14 | 2068: R109 | 0: E109 | SINGLE |
| G110 | `evaluate:313`: `p != o['payload']` | 0: NONE | 2120: R110 | 0: E110 | DUPLICATE: G008+G110, G110+G113 |
| G111 | `evaluate:313`: `out['payload'] != o['payload']` | 14: `isolated-outcome-original-payload-copy` × 14 | 2106: R111 | 0: E111 | SINGLE |
| G112 | `evaluate:314`: `out['event_id'] != o['event_id']` | 14: `corrupt-outcome` × 14 | 2106: R112 | 0: E112 | SINGLE |
| G113 | `evaluate:314`: `o['event']['payload'] != o['payload']` | 0: NONE | 2120: R113 | 0: E113 | DUPLICATE: G110+G113 |
| G114 | `evaluate:315`: `o['event']['event_id'] != o['event_id']` | 14: `isolated-original-event-id-copy` × 14 | 2106: R114 | 0: E114 | SINGLE |
| G115 | `evaluate:315`: `o['idempotency_key'] != o['event']['idempotency_key']` | 14: `isolated-original-key-copy` × 14 | 2106: R115 | 0: E115 | SINGLE |
| G116 | `evaluate:317`: `p.get('outcome_ref', out['source_ref']) != out['source_ref']` | 7: `outcome-source-ref-mismatch` × 7 | 2113: R116 | 0: E116 | SINGLE |
| G117 | `evaluate:322`: `(op == 'publish' or (op == 'recover' and r is None)) and (not payload_ok(c, o['payload'], x))` | 28: `append-recovery-current-source-join-refused` × 14; `publish-current-source-join-refused` × 14 | 2092: R117 | 0: E117 | SINGLE |
| G118 | `evaluate:324`: `op == 'read' and (d['reader_withdrawn'] or d['reader_installed'] != c['consumer'])` | 28: `history-after-live-state-advances-reader-version-mismatch` × 14; `history-after-live-state-advances-reader-withdrawn` × 14 | 2092: R118 | 0: E118 | SINGLE |
| G119 | `evaluate:326`: `op in ('publish', 'read') and (not d['permission_now'] or d['source_deleted_now'] or (not d['share_current']) or (not x['owner_command_authorized']))` | 127: `history-after-live-state-advances-deleted` × 14; `history-after-live-state-advances-denied` × 14; `history-after-live-state-advances-owner-denied` × 14; `history-after-live-state-advances-share-withdrawn` × 14; `publish-guard-permission_now` × 14; `publish-guard-share_current` × 14; `publish-guard-source_deleted_now` × 14; `read-deleted` × 14; `read-denied` × 14; `revoked-at-serialization` × 1 | 1993: R119 | 0: E119 | SINGLE |
| G120 | `evaluate:333`: `not receipt_ok(d)` | 238: `corrupt-receipt` × 14; `full-value-commitment-corrupt` × 14; `history-after-live-state-advances-forged-original` × 14; `original-storage-metadata-commitment` × 14; `receipt-field-acknowledged_at_utc` × 14; `receipt-field-byte_offset` × 14; `receipt-field-commit_group_id` × 14; `receipt-field-durability_class` × 14; `receipt-field-durability_state-full-recovery` × 14; `receipt-field-durable_end_offset` × 14; `receipt-field-event_id` × 14; `receipt-field-manifest_generation` × 14; `receipt-field-segment_generation` × 14; `receipt-field-segment_name` × 14; `receipt-field-sequence_id` × 14; `receipt-missing-field-full-recovery` × 14; `receipt-unknown-field-full-recovery` × 14 | 1882: R120 | 0: E120 | SINGLE |
| G121 | `evaluate:335`: `op == 'publish' and (not d['receipt_retained'])` | 14: `terminal-before-receipt` × 14 | 2106: R121 | 0: E121 | SINGLE |
| G122 | `evaluate:340`: `list(validator(read(c['checkpoint_schema_ref'])).iter_errors(cp))` | 168: `persisted-snapshot` × 14; `trailing-LF-checkpoint-index_read_token-frontier_sha256` × 14; `trailing-LF-checkpoint-index_read_token-generation_anchor_sha256` × 14; `trailing-LF-checkpoint-index_read_token-generation_id` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-current_bytes_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-durable_watermarks_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-excluded_ranges_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-manifest_bytes_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-manifest_survivor_prefix_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-retained_inventory_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-retired_inputs_sha256` × 14; `unknown-checkpoint-field` × 14 | 1952: R122 | 0: E122 | SINGLE |
| G123 | `evaluate:341`: `len(_codec.canonical_messagepack_bytes(cp)) > 16384` | 0: NONE | 2120: R123 | 0: E123 | DUPLICATE: G122+G123 |
| G124 | `evaluate:343`: `op == 'rebuild' and (not d['retained_prefix_complete'])` | 14: `rebuild-missing-prefix` × 14 | 2106: R124 | 0: E124 | SINGLE |
| G125 | `evaluate:346`: `d['expected_previous'] != d['stored_previous']` | 28: `cas-race` × 14; `cas-state-only-race` × 14 | 2092: R125 | 0: E125 | SINGLE |
| G126 | `evaluate:346`: `d['reader_installed'] != c['consumer']` | 14: `stale-reader-version` × 14 | 2106: R126 | 0: E126 | SINGLE |
| G127 | `evaluate:347`: `d['reader_withdrawn']` | 14: `withdrawn-reader` × 14 | 2106: R127 | 0: E127 | SINGLE |
| G128 | `evaluate:347`: `not d['permission_now']` | 14: `checkpoint-read-denied` × 14 | 2106: R128 | 0: E128 | SINGLE |
| G129 | `evaluate:347`: `d['source_deleted_now']` | 14: `checkpoint-source-deleted` × 14 | 2106: R129 | 0: E129 | SINGLE |
| G130 | `evaluate:348`: `cp['state'] != 'current'` | 14: `withdrawn-checkpoint` × 14 | 2106: R130 | 0: E130 | SINGLE |
| G131 | `evaluate:348`: `token != d['selected_token']` | 28: `reinstall-old-source-refused` × 14; `token-change` × 14 | 2092: R131 | 0: E131 | SINGLE |
| G132 | `evaluate:349`: `d['live_snapshot_id'] != d['current_live_snapshot_id']` | 14: `snapshot-change` × 14 | 2106: R132 | 0: E132 | SINGLE |
| G133 | `evaluate:350`: `not token_matches_storage(token, d['storage_instance_id'])` | 112: `checkpoint-dataset-generation-mismatch` × 14; `checkpoint-foreign-root-key` × 14; `checkpoint-foreign-root-key-and-ref` × 14; `checkpoint-foreign-root-ref` × 14; `checkpoint-ref-generation-mismatch` × 14; `rebuild-foreign-root-key-and-ref` × 14; `source-instance-mismatch` × 14; `token-storage-disagrees-with-event` × 14 | 2008: R133 | 0: E133 | SINGLE |
| G134 | `evaluate:351`: `not d['share_current']` | 14: `isolated-checkpoint-share` × 14 | 2106: R134 | 0: E134 | SINGLE |
| G135 | `evaluate:351`: `not envelope_ok(c, d)` | 14: `isolated-checkpoint-envelope-schema` × 14 | 2106: R135 | 0: E135 | SINGLE |
| G136 | `evaluate:351`: `not receipt_ok(d)` | 14: `isolated-checkpoint-receipt-custody` × 14 | 2106: R136 | 0: E136 | SINGLE |
| G137 | `evaluate:352`: `cp.get('project_id') != p.get('project_id')` | 13: `isolated-checkpoint-owner-scope` × 13 | 2107: R137 | 0: E137 | SINGLE |
| G138 | `evaluate:352`: `cp.get('scope') != p.get('scope')` | 1: `isolated-checkpoint-owner-scope` × 1 | 2119: R138 | 0: E138 | SINGLE |
| G139 | `evaluate:360`: `source['storage_instance_id'] != d['storage_instance_id']` | 14: `wrong-source-storage-instance` × 14 | 2106: R139 | 0: E139 | SINGLE |
| G140 | `evaluate:361`: `source['index_read_token'] != token` | 14: `isolated-selected-source-token-copy` × 14 | 2106: R140 | 0: E140 | SINGLE |
| G141 | `evaluate:361`: `source['last_sequence'] != d['selected_high']` | 14: `isolated-source-high-bound` × 14 | 2106: R141 | 0: E141 | SINGLE |
| G142 | `evaluate:362`: `[r['sequence'] for r in source_rows] != list(range(source['first_sequence'], source['last_sequence'] + 1))` | 14: `isolated-complete-source-prefix` × 14 | 2106: R142 | 0: E142 | SINGLE |
| G143 | `evaluate:363`: `any((r['scope_partition'] != _codec.scope_partition('application' if r['scope']['kind'] == 'app' else 'project', r['scope']['project_id']) for r in source_rows))` | 14: `isolated-source-row-partition` × 14 | 2106: R143 | 0: E143 | SINGLE |
| G144 | `evaluate:364`: `low != start` | 14: `initial-global-row-drop-and-low-change` × 14 | 2106: R144 | 0: E144 | SINGLE |
| G145 | `evaluate:364`: `rows != [r for r in source_rows if low <= r['sequence'] <= high]` | 14: `isolated-scanned-row-source-copy` × 14 | 2106: R145 | 0: E145 | SINGLE |
| G146 | `evaluate:365`: `[r['sequence'] for r in rows] != list(range(low, high + 1))` | 0: NONE | 2120: R146 | 0: E146 | DUPLICATE: G145+G146 |
| G147 | `evaluate:366`: `cp['through_sequence_id'] != high` | 14: `global-scan-end-required` × 14 | 2106: R147 | 0: E147 | SINGLE |
| G148 | `evaluate:366`: `high != d['selected_high']` | 14: `isolated-scan-selected-high` × 14 | 2106: R148 | 0: E148 | SINGLE |
| G149 | `evaluate:367`: `prior is not None and (list(validator(read(c['checkpoint_schema_ref'])).iter_errors(prior)) or not token_matches_storage(prior['index_read_token'], d['storage_instance_id']) or any((prior['index_read_token'][key] != token[key] for key in ('storage_instance_id', 'generation_id', 'generation_anchor_sha256'))) or (prior.get('project_id') != cp.get('project_id')) or (prior.get('scope') != cp.get('scope')) or (prior['state'] != 'current'))` | 14: `prior-checkpoint-foreign-root` × 14 | 2106: R149 | 0: E149 | SINGLE |
| G150 | `evaluate:376`: `prior is not None and (not earlier or prior['last_event_id'] != earlier[-1])` | 14: `isolated-prior-last-matching-event` × 14 | 2106: R150 | 0: E150 | SINGLE |
| G151 | `evaluate:379`: `last is None` | 0: NONE | 2120: R151 | 0: E151 | DUPLICATE: G151+G153 |
| G152 | `evaluate:379`: `matches != d['selected_matches']` | 14: `filtered-omission` × 14 | 2106: R152 | 0: E152 | SINGLE |
| G153 | `evaluate:379`: `cp['last_event_id'] != last` | 28: `last-event-is-not-global-frontier` × 14; `zero-match-suffix-cannot-invent-match` × 14 | 2092: R153 | 0: E153 | SINGLE |
| G154 | `admission_present:140 (from evaluate:384)`: `value is not None` | 14: `missing-admission-at-presence-boundary` × 14 | 2092: R154 | 14: E154 | SINGLE |
| G155 | `evaluate:384`: `admitted > d['withdrawal_frontier']` | 14: `writer-past-cutoff-refused` × 14 | 2106: R155 | 0: E155 | SINGLE |
| G156 | `evaluate:330`: `op == 'recover' and (not d['permission_now'] or d['source_deleted_now'] or (not d['share_current']))` | 42: `append-recovery-guard-permission_now` × 14; `append-recovery-guard-share_current` × 14; `append-recovery-guard-source_deleted_now` × 14 | 2078: R156 | 0: E156 | SINGLE |
| G157 | `value_valid:495`: `list(validator(read(schema_ref)).iter_errors(value))` | 25: `isolated-capture-result-closed-schema` × 1; `isolated-preview-result-closed-schema` × 1; `legacy-DAP-trailing-LF-source-adapter_capability_snapshot_ref` × 1; `legacy-DAP-trailing-LF-source-lease_ref` × 1; `legacy-DAP-trailing-LF-source-owner_ref` × 1; `legacy-DAP-trailing-LF-source-permission_grant_ref` × 1; `legacy-DAP-trailing-LF-source-policy_ref` × 1; `legacy-DAP-trailing-LF-source-waiter_arm_ref` × 1; `missing-outcome` × 1; `no-fake-project-in-app` × 1; `no-flat-dap-id` × 1; `no-live-restore` × 1; `no-ownerless-chip` × 1; `no-raw-page` × 1; `no-session-as-subject` × 1; `no-source-body` × 1; `no-workflow-debug-state-alias` × 1; `no-workflow-or-dap` × 1; `trailing-LF-provenance_ref` × 1; `trailing-LF-source_ref` × 2; `trailing-LF-summary_ref` × 1; `trailing-LF-workflow-outcome_ref` × 1; `unknown-version` × 2 | 2095: R157 | 0: E157 | SINGLE |
| G158 | `value_valid:497`: `len(_codec.canonical_messagepack_bytes(value)) > 16384` | 1: `oversize-valid-DAP-value` × 1 | 2119: R158 | 0: E158 | SINGLE |
| G159 | `value_valid:501`: `value['project_id'] != dap['project_id']` | 0: NONE | 2120: R159 | 0: E159 | DUPLICATE: G159+G161 |
| G160 | `value_valid:501`: `value['dev_session_id'] != dap['dev_session_id']` | 1: `dap-root-mismatch` × 1 | 2119: R160 | 0: E160 | SINGLE |
| G161 | `value_valid:502`: `value['project_id'] != dap['topology']['project_id']` | 1: `dap-topology-mismatch` × 1 | 2119: R161 | 0: E161 | SINGLE |
| G162 | `value_valid:503`: `_debug.validate(dap, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json'))` | 3: `dap-terminal-truth` × 1; `dap-trigger-after-waiter` × 1; `dap-waiter-required` × 1 | 2117: R162 | 0: E162 | SINGLE |
| G163 | `migrate:510`: `not evidence.get('verified')` | 1: `no-unverified-source-map` × 1 | 2119: R163 | 0: E163 | SINGLE |
| G164 | `migrate:510`: `not evidence.get('backup_verified')` | 1: `reject-unbacked-migration` × 1 | 2119: R164 | 0: E164 | SINGLE |
| G165 | `migrate:513`: `_debug.validate(source, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json'))` | 0: NONE | 2120: R165 | 0: E165 | DUPLICATE: G162+G165 |
| G166 | `migrate:515`: `source['project_id'] != evidence['project_id']` | 1: `migration-evidence-wrong-project-only` × 1 | 2119: R166 | 0: E166 | SINGLE |
| G167 | `migrate:515`: `source['dev_session_id'] != evidence['dev_session_id']` | 1: `reject-ambiguous-root` × 1 | 2119: R167 | 0: E167 | SINGLE |
| G168 | `migrate:520`: `value_valid('Plans/ds15_dev_session_record_v2.schema.json', result)` | 6: `legacy-DAP-trailing-LF-source-adapter_capability_snapshot_ref` × 1; `legacy-DAP-trailing-LF-source-lease_ref` × 1; `legacy-DAP-trailing-LF-source-owner_ref` × 1; `legacy-DAP-trailing-LF-source-permission_grant_ref` × 1; `legacy-DAP-trailing-LF-source-policy_ref` × 1; `legacy-DAP-trailing-LF-source-waiter_arm_ref` × 1 | 2114: R168 | 0: E168 | SINGLE |
| G169 | `migrate:523`: `len(mappings) != 1` | 1: `no-ambiguous-subject` × 1 | 2118: R169 | 1: E169 | SINGLE |
| G170 | `migrate:523`: `mappings[0]['preview_id'] != source['preview_id']` | 1: `isolated-preview-map-source-id` × 1 | 2119: R170 | 0: E170 | SINGLE |
| G171 | `migrate:524`: `mappings[0]['source_file'] != source['source_file']` | 1: `no-source-path-guess` × 1 | 2119: R171 | 0: E171 | SINGLE |
| G172 | `migrate:524`: `source['status'] not in ('starting', 'running', 'stopped', 'error')` | 0: NONE | 2120: R172 | 0: E172 | DUPLICATE: G172+G173 |
| G173 | `migrate:528`: `value_valid('Plans/ds15_preview_state_v2.schema.json', result)` | 1: `isolated-preview-result-closed-schema` × 1 | 2119: R173 | 0: E173 | SINGLE |
| G174 | `migrate:530`: `source.get('thread_id') != evidence.get('thread_id')` | 1: `no-cross-thread-migration` × 1 | 2119: R174 | 0: E174 | SINGLE |
| G175 | `migrate:530`: `source.get('scope') != evidence.get('scope')` | 1: `isolated-capture-original-scope` × 1 | 2119: R175 | 0: E175 | SINGLE |
| G176 | `migrate:534`: `value_valid('Plans/ds15_browser_capture_chip_v2.schema.json', result)` | 1: `isolated-capture-result-closed-schema` × 1 | 2119: R176 | 0: E176 | SINGLE |

## Named duplicate sets

Each named witness has a validated positive parent and exactly one source change, with derived observations explicitly maintained. Every proper nonempty subset still rejects without an exception; removing the whole named set accepts. The complete set then runs over U and every successful control. Each row’s retained set is U minus its exported successes and exceptions.

| Set | Witnesses | Exact flipping case IDs | Other negatives still rejected | Exceptions | Positive regressions |
|---|---:|---|---:|---:|---:|
| G000+G002+G003 | 14 | 43: `event-envelope-unknown-field` × 14; `isolated-checkpoint-envelope-schema` × 14; `isolated-envelope_ok-132-15` × 1; `triple-invalid-family-spelling` × 14 | 2063 | 14 | 0 |
| G004+G104 | 42 | 112: `duplicate-replay-only-payload` × 14; `duplicate-replay-only-publish` × 14; `duplicate-replay-only-recover` × 14; `isolated-non-dedupe-policy-envelope` × 14; `replay-only-context-recovery` × 14; `replay-only-payload` × 14; `replay-only-publish` × 14; `replay-only-recover` × 14 | 2008 | 0 | 0 |
| G008+G110 | 14 | 29: `changed-bytes` × 14; `duplicate-changed-bytes` × 14; `isolated-envelope_ok-136-57` × 1 | 2091 | 0 | 0 |
| G012+G039 | 14 | 31: `duplicate-wrong-partition-envelope` × 14; `isolated-envelope_ok-139-15` × 1; `isolated-receipt_ok-178-16` × 1; `project-capture-raw-partition-refused` × 1; `wrong-partition-envelope` × 14 | 2089 | 0 | 0 |
| G018+G019 | 1 | 4: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1; `paired-app-schema_id` × 1 | 2116 | 0 | 0 |
| G018+G020 | 1 | 4: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1; `paired-app-interface_id` × 1 | 2116 | 0 | 0 |
| G018+G023 | 1 | 4: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1; `paired-app-scope-scope_kind` × 1 | 2116 | 0 | 0 |
| G018+G024 | 1 | 4: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1; `paired-app-scope-project_id` × 1 | 2116 | 0 | 0 |
| G049+G084 | 4 | 16: `auto-missing-dependency-visible-forbidden` × 1; `forced-visible-headless-forbidden` × 1; `invalid-transition` × 1; `paired-invalid-previous-state` × 4; `trailing-LF-payload-outcome_ref` × 7; `trailing-LF-payload-provenance_ref` × 1; `trailing-LF-payload-source_ref` × 1 | 2104 | 0 | 0 |
| G049+G085 | 4 | 16: `auto-missing-dependency-visible-forbidden` × 1; `forced-visible-headless-forbidden` × 1; `invalid-transition` × 1; `paired-invalid-result-state` × 4; `trailing-LF-payload-outcome_ref` × 7; `trailing-LF-payload-provenance_ref` × 1; `trailing-LF-payload-source_ref` × 1 | 2104 | 0 | 0 |
| G072+G073 | 1 | 8: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-237-16` × 1; `isolated-payload_ok-238-20` × 1; `paired-invalid-capture-resolution` × 1; `publish-current-source-join-refused` × 1; `wrong-capture-resolution-provenance` × 1 | 2112 | 0 | 0 |
| G110+G113 | 14 | 14: `paired-retained-body-disagreement` × 14 | 2106 | 0 | 0 |
| G117+G119 | 14 | 183: `append-recovery-current-source-join-refused` × 14; `duplicate-publish-guard-context-owner_command_authorized` × 14; `history-after-live-state-advances-deleted` × 14; `history-after-live-state-advances-denied` × 14; `history-after-live-state-advances-owner-denied` × 14; `history-after-live-state-advances-share-withdrawn` × 14; `publish-current-source-join-refused` × 14; `publish-guard-context-owner_command_authorized` × 14; `publish-guard-permission_now` × 14; `publish-guard-share_current` × 14; `publish-guard-source_deleted_now` × 14; `read-deleted` × 14; `read-denied` × 14; `revoked-at-serialization` × 1 | 1937 | 0 | 0 |
| G122+G123 | 14 | 182: `paired-oversize-checkpoint-last-id` × 14; `persisted-snapshot` × 14; `trailing-LF-checkpoint-index_read_token-frontier_sha256` × 14; `trailing-LF-checkpoint-index_read_token-generation_anchor_sha256` × 14; `trailing-LF-checkpoint-index_read_token-generation_id` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-current_bytes_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-durable_watermarks_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-excluded_ranges_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-manifest_bytes_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-manifest_survivor_prefix_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-retained_inventory_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-retired_inputs_sha256` × 14; `unknown-checkpoint-field` × 14 | 1938 | 0 | 0 |
| G145+G146 | 14 | 42: `coverage-gap` × 14; `isolated-scanned-row-source-copy` × 14; `paired-missing-global-row` × 14 | 2078 | 0 | 0 |
| G151+G153 | 14 | 56: `last-event-is-not-global-frontier` × 14; `no-checkpoint-before-first-match` × 14; `paired-no-first-match` × 14; `zero-match-suffix-cannot-invent-match` × 14 | 2064 | 0 | 0 |
| G159+G161 | 1 | 2: `dap-topology-mismatch` × 1; `paired-value-root-project` × 1 | 2118 | 0 | 0 |
| G162+G165 | 1 | 5: `dap-terminal-truth` × 1; `dap-trigger-after-waiter` × 1; `dap-waiter-required` × 1; `paired-invalid-legacy-waiter` × 1; `reject-bad-legacy-waiter` × 1 | 2115 | 0 | 0 |
| G172+G173 | 1 | 2: `isolated-preview-result-closed-schema` × 1; `paired-invalid-legacy-preview-status` × 1 | 2118 | 0 | 0 |
| G174+G176 | 1 | 4: `isolated-capture-result-closed-schema` × 1; `no-cross-thread-migration` × 1; `ownerless-legacy-chip-unavailable` × 1; `paired-ownerless-legacy-chip` × 1 | 2116 | 0 | 0 |

## Supplemental schema controls

`pattern-proofs.json` contains 166 identifier LF cases: 157 flip when only the fullmatch engine is downgraded to the ordinary Draft202012 pattern predicate; the other nine require their named absolute-end/fullmatch duplicate pair. This exposes all fourteen direct `event_schema` LF cases outside the structural function census. `other-negative-audit.json` proves 42 direct payload required/closed/version cases and 84 eager-reference-closure cases. The 42 value/migration negatives still have actually validated one-leaf-away parents; that distance alone is not called a mutation proof.

## Residual cases

| Class | Count | Disposition |
|---|---:|---|
| `missing-outcome` | 14 | G105 has fourteen accepting presence-boundary mutations. Whole-operation weakening still reaches a dependent `out` access. |
| `withdrawn-writer` | 14 | G154 has fourteen accepting presence-boundary mutations. Whole-operation weakening still reaches the admission comparison. |
| `isolated-app-source-original_output` | 1 | G026 has an accepting actual-helper boundary mutation; whole-envelope weakening reaches dependent output access. |
| `no-guessed-subject` | 1 | Empty mappings have one cardinality defect. G169 is exposed by the existing ambiguous nonempty-mapping control; the empty-list mutant reaches a dependent index. |
| `publish-before-receipt` | 14 | Valid missing-receipt PENDING dispatch. No rejecting predicate is claimed for that mixed success/PENDING dispatch. |
| `trailing-LF-envelope-event-type` | 14 | Exposed by the separate pattern-engine proof above, outside the structural function census. |

No negative is deleted or relabeled successful to improve these counts. Complete per-case check 11 remains PARTIAL.
