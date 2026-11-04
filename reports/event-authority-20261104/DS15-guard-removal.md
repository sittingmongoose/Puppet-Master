# DS15 guard-removal table — round 6

Implementation `ae2b4d2bc214c09403745d192dd4623ce78e30e7`. Raw complete table: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix6/whole-lane-guard-audit.json`, SHA-256 `82283b355a6467b4eb07698f425a341e6c4bd37e5de89c50e1d6181e667b014d`.

**179 guards; 163 singleton proofs; 16 guards in 20 named duplicate sets / 171 witnesses; zero unproved guards; zero positive regressions.** Mechanical census remains PARTIAL / exit 1; its 44 adjudicated cases are accepted under cycle 6, unchanged.

Every singleton and complete named duplicate set ran all 4418 negatives and all successful controls. Every proper subset still refuses each named duplicate witness. G000..G176 have identical predicates and identical flipping sets on the entire original case universe. No guard was bypassed or weakened in the restored model.

U is the complete raw `negatives` array keyed by (family,id,target,operation). Fg is the raw mutant’s `negative_successes`. Eg comprises negative rows listing g in `errors_after_weakening`. Rg = U minus Fg minus Eg. Thus every other tested negative and every exception is explicitly accounted for. Exceptions never count as acceptance.

| Guard | Exact predicate | Flips F | Other negatives still refuse R | Exceptions E | Proof |
|---|---|---|---:|---:|---|
| G000 | `envelope_ok:200` `list(validator(read('Plans/event_record.schema.json')).iter_errors(e))` | 28: `event-envelope-unknown-field` × 14; `isolated-checkpoint-envelope-schema` × 14 | 4376: R000 | 14: E000 | SINGLE |
| G001 | `envelope_ok:201` `list(validator(read('Plans/event_record.schema.json')).iter_errors(original))` | 14: `isolated-original-envelope-schema` × 14 | 4404: R001 | 0: E001 | SINGLE |
| G002 | `envelope_ok:202` `e['event_type'] != c['event_type']` | 1: `isolated-envelope_ok-132-15` × 1 | 4417: R002 | 0: E002 | SINGLE |
| G003 | `envelope_ok:202` `not re.fullmatch('[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+', e['event_type'])` | 0: NONE | 4418: R003 | 0: E003 | G000+G002+G003 |
| G004 | `envelope_ok:203` `e['replay_policy'] != 'dedupe_by_idempotency_key'` | 14: `isolated-non-dedupe-policy-envelope` × 14 | 4404: R004 | 0: E004 | SINGLE |
| G005 | `envelope_ok:204` `original['replay_policy'] != 'dedupe_by_idempotency_key'` | 14: `isolated-non-dedupe-policy-original-event` × 14 | 4404: R005 | 0: E005 | SINGLE |
| G006 | `envelope_ok:205` `e['scope_kind'] != ('application' if scope['kind'] == 'app' else 'project')` | 1: `isolated-envelope_ok-135-15` × 1 | 4417: R006 | 0: E006 | SINGLE |
| G007 | `envelope_ok:206` `e['project_id'] != scope['project_id']` | 1: `isolated-envelope_ok-136-15` × 1 | 4417: R007 | 0: E007 | SINGLE |
| G008 | `envelope_ok:206` `e['payload'] != d['payload']` | 1: `isolated-envelope_ok-136-57` × 1 | 4417: R008 | 0: E008 | SINGLE |
| G009 | `envelope_ok:207` `e['run_id'] != d['payload'].get('run_id')` | 1: `isolated-envelope_ok-137-15` × 1 | 4417: R009 | 0: E009 | SINGLE |
| G010 | `envelope_ok:207` `e['thread_id'] != d['payload'].get('thread_id')` | 1: `isolated-envelope_ok-137-60` × 1 | 4417: R010 | 0: E010 | SINGLE |
| G011 | `envelope_ok:208` `e['payload_schema_id'] != read(c['payload_schema_ref'])['$id']` | 1: `isolated-envelope_ok-138-15` × 1 | 4417: R011 | 0: E011 | SINGLE |
| G012 | `envelope_ok:209` `d['scope_partition'] != _codec.scope_partition(e['scope_kind'], e['project_id'])` | 1: `isolated-envelope_ok-139-15` × 1 | 4417: R012 | 0: E012 | SINGLE |
| G013 | `envelope_ok:210` `len(_codec.canonical_messagepack_bytes(e['payload'])) > 16384` | 28: `isolated-exact-16385-inline-boundary` × 14; `oversize-inline-body-refused` × 14 | 4390: R013 | 0: E013 | SINGLE |
| G014 | `envelope_ok:214` `retry and (e['event_id'] != original['event_id'] or _codec.event_producer_semantic_digest(e) != _codec.event_producer_semantic_digest(original))` | 14: `retry-compares-semantic-actor` × 14 | 4404: R014 | 0: E014 | SINGLE |
| G015 | `envelope_ok:235` `e['idempotency_key'] == identity(c, e['payload'], source)` | 1: `isolated-envelope_ok-165-11` × 1 | 4417: R015 | 0: E015 | SINGLE |
| G016 | `application_source_present:181` `bool(value)` | 1: `missing-application-source-at-presence-boundary` × 1 | 4417: R016 | 0: E016 | SINGLE |
| G017 | `envelope_ok:219` `source != d['original']['application_source']` | 1: `isolated-envelope_ok-149-26` × 1 | 4417: R017 | 0: E017 | SINGLE |
| G018 | `envelope_ok:220` `list(application_source_validator().iter_errors(source))` | 3: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1 | 4415: R018 | 0: E018 | SINGLE |
| G019 | `envelope_ok:221` `source['schema_id'] != 'pm.application_source.browser_transition.v1'` | 0: NONE | 4418: R019 | 0: E019 | G018+G019 |
| G020 | `envelope_ok:222` `source['interface_id'] != 'owner.browser.transition.application@1.0.0'` | 0: NONE | 4418: R020 | 0: E020 | G018+G020 |
| G021 | `envelope_ok:223` `source['storage_instance_id'] != d['storage_instance_id']` | 1: `isolated-envelope_ok-153-19` × 1 | 4417: R021 | 0: E021 | SINGLE |
| G022 | `envelope_ok:224` `source['thread_id'] != e['thread_id']` | 1: `isolated-app-source-thread_id` × 1 | 4417: R022 | 0: E022 | SINGLE |
| G023 | `envelope_ok:225` `source['scope']['scope_kind'] != 'application'` | 0: NONE | 4418: R023 | 0: E023 | G018+G023 |
| G024 | `envelope_ok:225` `source['scope']['project_id'] is not None` | 0: NONE | 4418: R024 | 0: E024 | G018+G024 |
| G025 | `envelope_ok:226` `source['scope']['server_id'] != source['server_id']` | 1: `isolated-app-source-scope-server_id` × 1 | 4417: R025 | 0: E025 | SINGLE |
| G026 | `original_output_present:185` `value is not None` | 1: `null-original-output-at-presence-boundary` × 1 | 4416: R026 | 1: E026 | SINGLE |
| G027 | `envelope_ok:228` `source['original_output']['profile_id'] != scope['profile_id']` | 2: `isolated-envelope_ok-149-12` × 1; `isolated-envelope_ok-158-19` × 1 | 4416: R027 | 0: E027 | SINGLE |
| G028 | `envelope_ok:229` `d['payload']['browser_session_id'] not in source['original_output']['session_refs']` | 1: `isolated-app-source-original_output-session_refs` × 1 | 4417: R028 | 0: E028 | SINGLE |
| G029 | `envelope_ok:230` `any((stage['original_operation_id'] != source['original_operation_id'] for stage in source['stage_custody'].values()))` | 1: `isolated-app-source-stage_custody-owner_commit-original_operation_id` × 1 | 4417: R029 | 0: E029 | SINGLE |
| G030 | `envelope_ok:232` `not all((isinstance(source.get(k), str) and 0 < len(source[k]) <= 256 and ('\n' not in source[k]) for k in ('server_id', 'original_operation_id')))` | 2: `application-trailing-LF-original_operation_id` × 1; `application-trailing-LF-server_id` × 1 | 4416: R030 | 0: E030 | SINGLE |
| G031 | `receipt_ok:240` `not (shared_valid('AppendReceipt', r) and shared_valid('custody_v2', custody) and shared_valid('full_value_result', result))` | 84: `receipt-field-durability_state` × 14; `receipt-field-durability_state-full-recovery` × 14; `receipt-missing-field` × 14; `receipt-missing-field-full-recovery` × 14; `receipt-unknown-field` × 14; `receipt-unknown-field-full-recovery` × 14 | 4334: R031 | 0: E031 | SINGLE |
| G032 | `receipt_ok:243` `r == custody['first_append_receipt'] == result['first_append_receipt']` | 113: `isolated-receipt_ok-172-12` × 1; `receipt-field-acknowledged_at_utc` × 14; `receipt-field-byte_offset` × 14; `receipt-field-commit_group_id` × 14; `receipt-field-durability_class` × 14; `receipt-field-durable_end_offset` × 14; `receipt-field-manifest_generation` × 14; `receipt-field-segment_generation` × 14; `receipt-field-segment_name` × 14 | 4305: R032 | 0: E032 | SINGLE |
| G033 | `receipt_ok:244` `r['event_id'] == event['event_id']` | 14: `isolated-receipt-original-event_id` × 14 | 4404: R033 | 0: E033 | SINGLE |
| G034 | `receipt_ok:244` `r['sequence_id'] == event['sequence_id']` | 14: `isolated-receipt-original-sequence_id` × 14 | 4404: R034 | 0: E034 | SINGLE |
| G035 | `receipt_ok:245` `r['byte_offset'] < r['durable_end_offset']` | 14: `isolated-receipt-end-offset-order` × 14 | 4404: R035 | 0: E035 | SINGLE |
| G036 | `receipt_ok:246` `custody['original_event_value_commitment'] == result['original_event_value_commitment'] == commitment(event)` | 42: `full-value-commitment-corrupt` × 14; `history-after-live-state-advances-forged-original` × 14; `original-storage-metadata-commitment` × 14 | 4376: R036 | 0: E036 | SINGLE |
| G037 | `receipt_ok:247` `custody['original_segment_ref'] == result['original_segment_ref']` | 1: `isolated-receipt_ok-176-16` × 1 | 4417: R037 | 0: E037 | SINGLE |
| G038 | `receipt_ok:248` `custody['storage_instance_id'] == d['storage_instance_id']` | 1: `isolated-receipt_ok-177-16` × 1 | 4417: R038 | 0: E038 | SINGLE |
| G039 | `receipt_ok:249` `custody['scope_partition'] == d['scope_partition']` | 1: `isolated-receipt_ok-178-16` × 1 | 4417: R039 | 0: E039 | SINGLE |
| G040 | `receipt_ok:250` `custody['event_id'] == event['event_id']` | 1: `isolated-receipt_ok-179-16` × 1 | 4417: R040 | 0: E040 | SINGLE |
| G041 | `receipt_ok:250` `custody['event_type'] == event['event_type']` | 1: `isolated-receipt_ok-179-61` × 1 | 4417: R041 | 0: E041 | SINGLE |
| G042 | `receipt_ok:251` `custody['idempotency_key'] == event['idempotency_key']` | 1: `isolated-receipt_ok-180-16` × 1 | 4417: R042 | 0: E042 | SINGLE |
| G043 | `receipt_ok:252` `custody['producer_semantic_digest'] == _codec.event_producer_semantic_digest(event)` | 28: `corrupt-receipt` × 14; `isolated-checkpoint-receipt-custody` × 14 | 4390: R043 | 0: E043 | SINGLE |
| G044 | `token_matches_storage:257` `token['storage_instance_id'] == storage_instance_id` | 1: `isolated-token_matches_storage-185-12` × 1 | 4417: R044 | 0: E044 | SINGLE |
| G045 | `token_matches_storage:258` `token['source_selection']['storage_instance_id'] == storage_instance_id` | 15: `isolated-token_matches_storage-186-16` × 1; `source-instance-mismatch` × 14 | 4403: R045 | 0: E045 | SINGLE |
| G046 | `token_matches_storage:259` `token['checkpoint_key'] == key` | 15: `checkpoint-foreign-root-key` × 14; `isolated-token_matches_storage-187-16` × 1 | 4403: R046 | 0: E046 | SINGLE |
| G047 | `token_matches_storage:260` `token['checkpoint_ref'] == key + '#/generations/' + token['generation_id']` | 29: `checkpoint-foreign-root-ref` × 14; `checkpoint-ref-generation-mismatch` × 14; `isolated-token_matches_storage-188-16` × 1 | 4389: R047 | 0: E047 | SINGLE |
| G048 | `token_matches_storage:261` `token['index_dataset_name'] == 'event_record_index.v2@' + token['generation_id']` | 15: `checkpoint-dataset-generation-mismatch` × 14; `isolated-token_matches_storage-189-16` × 1 | 4403: R048 | 0: E048 | SINGLE |
| G049 | `payload_ok:273` `list(validator(read(c['payload_schema_ref'])).iter_errors(p))` | 12: `auto-missing-dependency-visible-forbidden` × 1; `forced-visible-headless-forbidden` × 1; `invalid-transition` × 1; `trailing-LF-payload-outcome_ref` × 7; `trailing-LF-payload-provenance_ref` × 1; `trailing-LF-payload-source_ref` × 1 | 4406: R049 | 0: E049 | SINGLE |
| G050 | `payload_ok:275` `not x['owner_command_authorized']` | 15: `isolated-payload_ok-202-7` × 1; `owner-command-refusal-not-overridden` × 14 | 4403: R050 | 0: E050 | SINGLE |
| G051 | `payload_ok:284` `not safe_refs(p)` | 42: `credential-shaped-reference` × 14; `forbidden-reference` × 14; `unsafe-content-reference` × 14 | 4376: R051 | 0: E051 | SINGLE |
| G052 | `payload_ok:287` `x['scope'] != scope` | 1: `isolated-payload_ok-214-7` × 1 | 4417: R052 | 0: E052 | SINGLE |
| G053 | `payload_ok:287` `x['envelope_project_id'] != scope.get('project_id')` | 15: `envelope-mismatch` × 14; `isolated-payload_ok-214-30` × 1 | 4403: R053 | 0: E053 | SINGLE |
| G054 | `payload_ok:289` `p.get('run_id') != x['envelope_run_id']` | 1: `isolated-payload_ok-216-7` × 1 | 4417: R054 | 0: E054 | SINGLE |
| G055 | `payload_ok:291` `p.get('browser_session_id') and x['session_security_class'] != 'ordinary'` | 2: `isolated-payload_ok-218-7` × 1; `protected-capture` × 1 | 4416: R055 | 0: E055 | SINGLE |
| G056 | `payload_ok:295` `x['config_inspected']` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-222-15` × 1; `publish-current-source-join-refused` × 1 | 4413: R056 | 0: E056 | SINGLE |
| G057 | `payload_ok:295` `x['doctor_invocation_id'] == p['doctor_invocation_id']` | 1: `isolated-payload_ok-222-41` × 1 | 4417: R057 | 0: E057 | SINGLE |
| G058 | `payload_ok:297` `x['launch_outcome'] == 'launched'` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-224-15` × 1; `publish-current-source-join-refused` × 1 | 4413: R058 | 0: E058 | SINGLE |
| G059 | `payload_ok:297` `x['driver_session_id'] == p['session_id']` | 1: `isolated-payload_ok-224-53` × 1 | 4417: R059 | 0: E059 | SINGLE |
| G060 | `payload_ok:299` `x['session_state'] == 'running'` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-226-15` × 1; `publish-current-source-join-refused` × 1 | 4413: R060 | 0: E060 | SINGLE |
| G061 | `payload_ok:299` `p['step_revision'] > x['previous_revision']` | 1: `isolated-payload_ok-226-51` × 1 | 4417: R061 | 0: E061 | SINGLE |
| G062 | `payload_ok:301` `x['artifact']['id'] == p['artifact_id']` | 1: `isolated-payload_ok-228-16` × 1 | 4417: R062 | 0: E062 | SINGLE |
| G063 | `payload_ok:301` `x['artifact']['ref'] == p['artifact_ref']` | 1: `isolated-payload_ok-228-60` × 1 | 4417: R063 | 0: E063 | SINGLE |
| G064 | `payload_ok:302` `x['artifact']['receipt_ref'] == p['artifact_receipt_ref']` | 1: `isolated-payload_ok-229-20` × 1 | 4417: R064 | 0: E064 | SINGLE |
| G065 | `payload_ok:302` `x['artifact']['committed']` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-229-82` × 1; `publish-current-source-join-refused` × 1 | 4413: R065 | 0: E065 | SINGLE |
| G066 | `payload_ok:304` `x['session_state'] == 'running'` | 1: `isolated-payload_ok-231-16` × 1 | 4417: R066 | 0: E066 | SINGLE |
| G067 | `payload_ok:304` `x['finalization']['committed']` | 5: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-231-52` × 1; `publish-current-source-join-refused` × 1 | 4413: R067 | 0: E067 | SINGLE |
| G068 | `payload_ok:305` `all((x['finalization'][k] == p[k] for k in ('manifest_ref', 'summary_ref', 'checks_ref')))` | 1: `isolated-payload_ok-232-20` × 1 | 4417: R068 | 0: E068 | SINGLE |
| G069 | `payload_ok:307` `p['degradation_revision'] > x['previous_revision']` | 1: `isolated-payload_ok-234-16` × 1 | 4417: R069 | 0: E069 | SINGLE |
| G070 | `payload_ok:307` `not x['visible_dependency_available']` | 3: `append-recovery-current-source-join-refused` × 1; `isolated-payload_ok-234-71` × 1; `publish-current-source-join-refused` × 1 | 4415: R070 | 0: E070 | SINGLE |
| G071 | `payload_ok:308` `x['launch_outcome'] == ('refused' if p['requested_visual_mode'] == 'forced_visible' else 'headless')` | 2: `history-after-live-state-advances-invalid-original-transition` × 1; `isolated-payload_ok-235-20` × 1 | 4416: R071 | 0: E071 | SINGLE |
| G072 | `payload_ok:310` `x['target_resolution'] in ('explicit', 'owning_surface', 'explicit_new_thread')` | 0: NONE | 4418: R072 | 0: E072 | G072+G073 |
| G073 | `payload_ok:311` `p['target_resolution'] == x['target_resolution']` | 3: `isolated-payload_ok-237-16` × 1; `isolated-payload_ok-238-20` × 1; `wrong-capture-resolution-provenance` × 1 | 4415: R073 | 0: E073 | SINGLE |
| G074 | `payload_ok:312` `x['resolved_thread_id'] == p['thread_id']` | 2: `isolated-payload_ok-239-20` × 1; `unresolved-target` × 1 | 4416: R074 | 0: E074 | SINGLE |
| G075 | `payload_ok:312` `x['thread_writable']` | 1: `isolated-payload_ok-239-66` × 1 | 4417: R075 | 0: E075 | SINGLE |
| G076 | `payload_ok:313` `x['chip']['chip_id'] == p['chip_id']` | 1: `isolated-payload_ok-240-20` × 1 | 4417: R076 | 0: E076 | SINGLE |
| G077 | `payload_ok:313` `x['chip']['thread_id'] == p['thread_id']` | 1: `isolated-payload_ok-240-61` × 1 | 4417: R077 | 0: E077 | SINGLE |
| G078 | `payload_ok:314` `x['chip']['attachment_type'] == p['attachment_type']` | 1: `isolated-payload_ok-241-20` × 1 | 4417: R078 | 0: E078 | SINGLE |
| G079 | `payload_ok:315` `x['chip']['source_ref'] == p['source_ref']` | 1: `isolated-payload_ok-242-20` × 1 | 4417: R079 | 0: E079 | SINGLE |
| G080 | `payload_ok:315` `x['chip']['committed']` | 1: `isolated-payload_ok-242-67` × 1 | 4417: R080 | 0: E080 | SINGLE |
| G081 | `payload_ok:316` `x['chip']['status'] == p['capture_status']` | 1: `isolated-payload_ok-243-20` × 1 | 4417: R081 | 0: E081 | SINGLE |
| G082 | `payload_ok:316` `x['thread_scope'] == scope` | 2: `cross-namespace-thread-refused` × 1; `isolated-payload_ok-243-67` × 1 | 4416: R082 | 0: E082 | SINGLE |
| G083 | `payload_ok:316` `not x['auto_send']` | 2: `isolated-payload_ok-243-98` × 1; `no-auto-send` × 1 | 4416: R083 | 0: E083 | SINGLE |
| G084 | `payload_ok:323` `p['previous_state'] in before` | 0: NONE | 4418: R084 | 0: E084 | G049+G084 |
| G085 | `payload_ok:323` `p['workflow_state'] == after` | 0: NONE | 4418: R085 | 0: E085 | G049+G085 |
| G086 | `payload_ok:324` `x['workflow_state'] == p['previous_state']` | 18: `append-recovery-current-source-join-refused` × 4; `history-after-live-state-advances-invalid-original-transition` × 4; `invalid-transition` × 4; `isolated-payload_ok-250-16` × 1; `isolated-payload_ok-251-20` × 1; `publish-current-source-join-refused` × 4 | 4400: R086 | 0: E086 | SINGLE |
| G087 | `payload_ok:324` `p['workflow_revision'] == x['previous_revision'] + 1` | 1: `isolated-payload_ok-251-67` × 1 | 4417: R087 | 0: E087 | SINGLE |
| G088 | `payload_ok:325` `x['dev_session_id'] == p['dev_session_id']` | 1: `isolated-payload_ok-252-20` × 1 | 4417: R088 | 0: E088 | SINGLE |
| G089 | `payload_ok:325` `x['managed_outcome_committed']` | 1: `isolated-payload_ok-252-67` × 1 | 4417: R089 | 0: E089 | SINGLE |
| G090 | `payload_ok:326` `x['operation_id'] == p['operation_id']` | 5: `isolated-payload_ok-253-20` × 1; `wrong-owner-operation` × 4 | 4413: R090 | 0: E090 | SINGLE |
| G091 | `payload_ok:327` `n != 'dev.session.started' or x['launch_outcome'] == 'launched'` | 1: `isolated-payload_ok-254-21` × 1 | 4417: R091 | 0: E091 | SINGLE |
| G092 | `payload_ok:328` `n != 'dev.session.stopped' or x['managed_resources_settled']` | 1: `isolated-payload_ok-255-21` × 1 | 4417: R092 | 0: E092 | SINGLE |
| G093 | `payload_ok:329` `x['dap_state_after'] == x['dap_state_before'] or (x['dap_transition_ref'] is not None and x['dap_owner_verified'])` | 5: `isolated-payload_ok-256-21` × 1; `no-dap-flattening` × 4 | 4413: R093 | 0: E093 | SINGLE |
| G094 | `payload_ok:330` `all((p.get(k) == x['links'].get(k) for k in ('run_id', 'thread_id', 'workspace_tab_id', 'terminal_session_id', 'dap_session_id')))` | 5: `fabricated-dap-link` × 4; `isolated-payload_ok-257-20` × 1 | 4413: R094 | 0: E094 | SINGLE |
| G095 | `payload_ok:331` `not x['rewrite_terminal_history']` | 5: `isolated-payload_ok-258-20` × 1; `no-terminal-rewrite` × 4 | 4413: R095 | 0: E095 | SINGLE |
| G096 | `payload_ok:333` `x['preview_subject_id'] == p['preview_subject_id']` | 4: `isolated-payload_ok-260-16` × 1; `subject-mismatch` × 3 | 4414: R096 | 0: E096 | SINGLE |
| G097 | `payload_ok:334` `x['preview_session_id'] == p['preview_session_id']` | 4: `isolated-payload_ok-261-20` × 1; `runtime-mismatch` × 3 | 4414: R097 | 0: E097 | SINGLE |
| G098 | `payload_ok:335` `x['source_revision'] == p['source_revision']` | 1: `isolated-payload_ok-262-20` × 1 | 4417: R098 | 0: E098 | SINGLE |
| G099 | `payload_ok:335` `x['runtime_verified']` | 1: `isolated-payload_ok-262-69` × 1 | 4417: R099 | 0: E099 | SINGLE |
| G100 | `payload_ok:336` `not x['restored_live_claim']` | 13: `append-recovery-current-source-join-refused` × 3; `history-after-live-state-advances-invalid-original-transition` × 3; `invalid-transition` × 3; `isolated-payload_ok-263-20` × 1; `publish-current-source-join-refused` × 3 | 4405: R100 | 0: E100 | SINGLE |
| G101 | `payload_ok:337` `n != 'preview.session.started' or (x['session_state'] == 'created' and p['runtime_state'] == 'loading')` | 1: `isolated-payload_ok-264-21` × 1 | 4417: R101 | 0: E101 | SINGLE |
| G102 | `payload_ok:338` `n != 'preview.session.stopped' or (x['session_state'] != 'closed' and p['runtime_state'] == 'closed' and x['managed_resources_settled'])` | 1: `isolated-payload_ok-265-21` × 1 | 4417: R102 | 0: E102 | SINGLE |
| G103 | `payload_ok:339` `n != 'preview.session.refreshed' or (x['session_state'] in ('ready', 'stale', 'degraded', 'error') and x['refreshable'] and x['refresh_committed'] and (p['preview_revision'] > x['previous_revision']) and (p['refresh_origin'] == 'cmd.browser.reload' and bool(p.get('browser_session_id')) and (p['browser_session_id'] == x['browser_session_id']) or (p['refresh_origin'] == 'filemanager.preview_refresh' and (not p.get('browser_session_id')))))` | 2: `isolated-payload_ok-266-21` × 1; `non-browser-cannot-use-browser-command` × 1 | 4416: R103 | 0: E103 | SINGLE |
| G104 | `evaluate:362` `'projector_replay_only' in policies` | 14: `replay-only-context-recovery` × 14 | 4404: R104 | 0: E104 | SINGLE |
| G105 | `outcome_present:189` `value is not None` | 14: `missing-outcome-at-presence-boundary` × 14 | 4390: R105 | 14: E105 | SINGLE |
| G106 | `evaluate:368` `not out['committed']` | 14: `publish-before-body-commit` × 14 | 4404: R106 | 0: E106 | SINGLE |
| G107 | `evaluate:368` `not d['backup_closure_verified']` | 14: `backup-loss` × 14 | 4404: R107 | 0: E107 | SINGLE |
| G108 | `evaluate:370` `not payload_ok(c, o['payload'], d['original_context'])` | 14: `history-after-live-state-advances-invalid-original-transition` × 14 | 4404: R108 | 0: E108 | SINGLE |
| G109 | `evaluate:370` `not envelope_ok(c, d)` | 52: `application-missing-original_operation_id` × 1; `application-missing-server_id` × 1; `application-raw-hash-key` × 1; `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_operation_id` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-server_id` × 1; `application-trailing-LF-source_sha256` × 1; `application-wrong-original_operation_id` × 1; `application-wrong-server_id` × 1; `event-envelope-missing-field` × 14; `event-envelope-unknown-field` × 14; `retry-compares-semantic-actor` × 14 | 4366: R109 | 0: E109 | SINGLE |
| G110 | `evaluate:371` `p != o['payload']` | 0: NONE | 4418: R110 | 0: E110 | G008+G110, G110+G113 |
| G111 | `evaluate:371` `out['payload'] != o['payload']` | 14: `isolated-outcome-original-payload-copy` × 14 | 4404: R111 | 0: E111 | SINGLE |
| G112 | `evaluate:372` `out['event_id'] != o['event_id']` | 14: `corrupt-outcome` × 14 | 4404: R112 | 0: E112 | SINGLE |
| G113 | `evaluate:372` `o['event']['payload'] != o['payload']` | 0: NONE | 4418: R113 | 0: E113 | G110+G113 |
| G114 | `evaluate:373` `o['event']['event_id'] != o['event_id']` | 14: `isolated-original-event-id-copy` × 14 | 4404: R114 | 0: E114 | SINGLE |
| G115 | `evaluate:373` `o['idempotency_key'] != o['event']['idempotency_key']` | 14: `isolated-original-key-copy` × 14 | 4404: R115 | 0: E115 | SINGLE |
| G116 | `evaluate:375` `p.get('outcome_ref', out['source_ref']) != out['source_ref']` | 7: `outcome-source-ref-mismatch` × 7 | 4411: R116 | 0: E116 | SINGLE |
| G117 | `evaluate:380` `(op == 'publish' or (op == 'recover' and r is None)) and (not payload_ok(c, o['payload'], x))` | 28: `append-recovery-current-source-join-refused` × 14; `publish-current-source-join-refused` × 14 | 4390: R117 | 0: E117 | SINGLE |
| G118 | `evaluate:382` `op == 'read' and (d['reader_withdrawn'] or d['reader_installed'] != c['consumer'])` | 28: `history-after-live-state-advances-reader-version-mismatch` × 14; `history-after-live-state-advances-reader-withdrawn` × 14 | 4390: R118 | 0: E118 | SINGLE |
| G119 | `evaluate:384` `op in ('publish', 'read') and (not d['permission_now'] or d['source_deleted_now'] or (not d['share_current']) or (not x['owner_command_authorized']))` | 127: `history-after-live-state-advances-deleted` × 14; `history-after-live-state-advances-denied` × 14; `history-after-live-state-advances-owner-denied` × 14; `history-after-live-state-advances-share-withdrawn` × 14; `publish-guard-permission_now` × 14; `publish-guard-share_current` × 14; `publish-guard-source_deleted_now` × 14; `read-deleted` × 14; `read-denied` × 14; `revoked-at-serialization` × 1 | 4291: R119 | 0: E119 | SINGLE |
| G120 | `evaluate:391` `not receipt_ok(d)` | 238: `corrupt-receipt` × 14; `full-value-commitment-corrupt` × 14; `history-after-live-state-advances-forged-original` × 14; `original-storage-metadata-commitment` × 14; `receipt-field-acknowledged_at_utc` × 14; `receipt-field-byte_offset` × 14; `receipt-field-commit_group_id` × 14; `receipt-field-durability_class` × 14; `receipt-field-durability_state-full-recovery` × 14; `receipt-field-durable_end_offset` × 14; `receipt-field-event_id` × 14; `receipt-field-manifest_generation` × 14; `receipt-field-segment_generation` × 14; `receipt-field-segment_name` × 14; `receipt-field-sequence_id` × 14; `receipt-missing-field-full-recovery` × 14; `receipt-unknown-field-full-recovery` × 14 | 4180: R120 | 0: E120 | SINGLE |
| G121 | `evaluate:393` `op == 'publish' and (not d['receipt_retained'])` | 14: `terminal-before-receipt` × 14 | 4404: R121 | 0: E121 | SINGLE |
| G122 | `evaluate:398` `list(validator(read(c['checkpoint_schema_ref'])).iter_errors(cp))` | 168: `persisted-snapshot` × 14; `trailing-LF-checkpoint-index_read_token-frontier_sha256` × 14; `trailing-LF-checkpoint-index_read_token-generation_anchor_sha256` × 14; `trailing-LF-checkpoint-index_read_token-generation_id` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-current_bytes_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-durable_watermarks_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-excluded_ranges_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-manifest_bytes_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-manifest_survivor_prefix_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-retained_inventory_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-retired_inputs_sha256` × 14; `unknown-checkpoint-field` × 14 | 4250: R122 | 0: E122 | SINGLE |
| G123 | `evaluate:399` `len(_codec.canonical_messagepack_bytes(cp)) > 16384` | 0: NONE | 4418: R123 | 0: E123 | G122+G123 |
| G124 | `evaluate:401` `op == 'rebuild' and (not d['retained_prefix_complete'])` | 14: `rebuild-missing-prefix` × 14 | 4404: R124 | 0: E124 | SINGLE |
| G125 | `evaluate:404` `d['expected_previous'] != d['stored_previous']` | 28: `cas-race` × 14; `cas-state-only-race` × 14 | 4390: R125 | 0: E125 | SINGLE |
| G126 | `evaluate:404` `d['reader_installed'] != c['consumer']` | 14: `stale-reader-version` × 14 | 4404: R126 | 0: E126 | SINGLE |
| G127 | `evaluate:405` `d['reader_withdrawn']` | 14: `withdrawn-reader` × 14 | 4404: R127 | 0: E127 | SINGLE |
| G128 | `evaluate:405` `not d['permission_now']` | 14: `checkpoint-read-denied` × 14 | 4404: R128 | 0: E128 | SINGLE |
| G129 | `evaluate:405` `d['source_deleted_now']` | 14: `checkpoint-source-deleted` × 14 | 4404: R129 | 0: E129 | SINGLE |
| G130 | `evaluate:406` `cp['state'] != 'current'` | 14: `withdrawn-checkpoint` × 14 | 4404: R130 | 0: E130 | SINGLE |
| G131 | `evaluate:406` `token != d['selected_token']` | 28: `reinstall-old-source-refused` × 14; `token-change` × 14 | 4390: R131 | 0: E131 | SINGLE |
| G132 | `evaluate:407` `d['live_snapshot_id'] != d['current_live_snapshot_id']` | 14: `snapshot-change` × 14 | 4404: R132 | 0: E132 | SINGLE |
| G133 | `evaluate:408` `not token_matches_storage(token, d['storage_instance_id'])` | 112: `checkpoint-dataset-generation-mismatch` × 14; `checkpoint-foreign-root-key` × 14; `checkpoint-foreign-root-key-and-ref` × 14; `checkpoint-foreign-root-ref` × 14; `checkpoint-ref-generation-mismatch` × 14; `rebuild-foreign-root-key-and-ref` × 14; `source-instance-mismatch` × 14; `token-storage-disagrees-with-event` × 14 | 4306: R133 | 0: E133 | SINGLE |
| G134 | `evaluate:409` `not d['share_current']` | 14: `isolated-checkpoint-share` × 14 | 4404: R134 | 0: E134 | SINGLE |
| G135 | `evaluate:409` `not envelope_ok(c, d)` | 14: `isolated-checkpoint-envelope-schema` × 14 | 4404: R135 | 0: E135 | SINGLE |
| G136 | `evaluate:409` `not receipt_ok(d)` | 14: `isolated-checkpoint-receipt-custody` × 14 | 4404: R136 | 0: E136 | SINGLE |
| G137 | `evaluate:410` `cp.get('project_id') != p.get('project_id')` | 13: `isolated-checkpoint-owner-scope` × 13 | 4405: R137 | 0: E137 | SINGLE |
| G138 | `evaluate:410` `cp.get('scope') != p.get('scope')` | 1: `isolated-checkpoint-owner-scope` × 1 | 4417: R138 | 0: E138 | SINGLE |
| G139 | `evaluate:418` `source['storage_instance_id'] != d['storage_instance_id']` | 14: `wrong-source-storage-instance` × 14 | 4404: R139 | 0: E139 | SINGLE |
| G140 | `evaluate:419` `source['index_read_token'] != token` | 14: `isolated-selected-source-token-copy` × 14 | 4404: R140 | 0: E140 | SINGLE |
| G141 | `evaluate:419` `source['last_sequence'] != d['selected_high']` | 14: `isolated-source-high-bound` × 14 | 4404: R141 | 0: E141 | SINGLE |
| G142 | `evaluate:420` `[r['sequence'] for r in source_rows] != list(range(source['first_sequence'], source['last_sequence'] + 1))` | 14: `isolated-complete-source-prefix` × 14 | 4404: R142 | 0: E142 | SINGLE |
| G143 | `evaluate:421` `any((r['scope_partition'] != _codec.scope_partition('application' if r['scope']['kind'] == 'app' else 'project', r['scope']['project_id']) for r in source_rows))` | 14: `isolated-source-row-partition` × 14 | 4404: R143 | 0: E143 | SINGLE |
| G144 | `evaluate:422` `low != start` | 14: `initial-global-row-drop-and-low-change` × 14 | 4404: R144 | 0: E144 | SINGLE |
| G145 | `evaluate:422` `rows != [r for r in source_rows if low <= r['sequence'] <= high]` | 14: `isolated-scanned-row-source-copy` × 14 | 4404: R145 | 0: E145 | SINGLE |
| G146 | `evaluate:423` `[r['sequence'] for r in rows] != list(range(low, high + 1))` | 0: NONE | 4418: R146 | 0: E146 | G145+G146 |
| G147 | `evaluate:424` `cp['through_sequence_id'] != high` | 14: `global-scan-end-required` × 14 | 4404: R147 | 0: E147 | SINGLE |
| G148 | `evaluate:424` `high != d['selected_high']` | 14: `isolated-scan-selected-high` × 14 | 4404: R148 | 0: E148 | SINGLE |
| G149 | `evaluate:425` `prior is not None and (list(validator(read(c['checkpoint_schema_ref'])).iter_errors(prior)) or not token_matches_storage(prior['index_read_token'], d['storage_instance_id']) or any((prior['index_read_token'][key] != token[key] for key in ('storage_instance_id', 'generation_id', 'generation_anchor_sha256'))) or (prior.get('project_id') != cp.get('project_id')) or (prior.get('scope') != cp.get('scope')) or (prior['state'] != 'current'))` | 14: `prior-checkpoint-foreign-root` × 14 | 4404: R149 | 0: E149 | SINGLE |
| G150 | `evaluate:434` `prior is not None and (not earlier or prior['last_event_id'] != earlier[-1])` | 14: `isolated-prior-last-matching-event` × 14 | 4404: R150 | 0: E150 | SINGLE |
| G151 | `evaluate:437` `last is None` | 0: NONE | 4418: R151 | 0: E151 | G151+G153 |
| G152 | `evaluate:437` `matches != d['selected_matches']` | 14: `filtered-omission` × 14 | 4404: R152 | 0: E152 | SINGLE |
| G153 | `evaluate:437` `cp['last_event_id'] != last` | 28: `last-event-is-not-global-frontier` × 14; `zero-match-suffix-cannot-invent-match` × 14 | 4390: R153 | 0: E153 | SINGLE |
| G154 | `admission_present:193` `value is not None` | 14: `missing-admission-at-presence-boundary` × 14 | 4390: R154 | 14: E154 | SINGLE |
| G155 | `evaluate:442` `admitted > d['withdrawal_frontier']` | 14: `writer-past-cutoff-refused` × 14 | 4404: R155 | 0: E155 | SINGLE |
| G156 | `evaluate:388` `op == 'recover' and (not d['permission_now'] or d['source_deleted_now'] or (not d['share_current']))` | 42: `append-recovery-guard-permission_now` × 14; `append-recovery-guard-share_current` × 14; `append-recovery-guard-source_deleted_now` × 14 | 4376: R156 | 0: E156 | SINGLE |
| G157 | `value_valid:563` `list(validator(read(schema_ref)).iter_errors(value))` | 25: `isolated-capture-result-closed-schema` × 1; `isolated-preview-result-closed-schema` × 1; `legacy-DAP-trailing-LF-source-adapter_capability_snapshot_ref` × 1; `legacy-DAP-trailing-LF-source-lease_ref` × 1; `legacy-DAP-trailing-LF-source-owner_ref` × 1; `legacy-DAP-trailing-LF-source-permission_grant_ref` × 1; `legacy-DAP-trailing-LF-source-policy_ref` × 1; `legacy-DAP-trailing-LF-source-waiter_arm_ref` × 1; `missing-outcome` × 1; `no-fake-project-in-app` × 1; `no-flat-dap-id` × 1; `no-live-restore` × 1; `no-ownerless-chip` × 1; `no-raw-page` × 1; `no-session-as-subject` × 1; `no-source-body` × 1; `no-workflow-debug-state-alias` × 1; `no-workflow-or-dap` × 1; `trailing-LF-provenance_ref` × 1; `trailing-LF-source_ref` × 2; `trailing-LF-summary_ref` × 1; `trailing-LF-workflow-outcome_ref` × 1; `unknown-version` × 2 | 4393: R157 | 0: E157 | SINGLE |
| G158 | `value_valid:565` `len(_codec.canonical_messagepack_bytes(value)) > 16384` | 1: `oversize-valid-DAP-value` × 1 | 4417: R158 | 0: E158 | SINGLE |
| G159 | `value_valid:569` `value['project_id'] != dap['project_id']` | 0: NONE | 4418: R159 | 0: E159 | G159+G161 |
| G160 | `value_valid:569` `value['dev_session_id'] != dap['dev_session_id']` | 1: `dap-root-mismatch` × 1 | 4417: R160 | 0: E160 | SINGLE |
| G161 | `value_valid:570` `value['project_id'] != dap['topology']['project_id']` | 1: `dap-topology-mismatch` × 1 | 4417: R161 | 0: E161 | SINGLE |
| G162 | `value_valid:571` `_debug.validate(dap, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json'))` | 3: `dap-terminal-truth` × 1; `dap-trigger-after-waiter` × 1; `dap-waiter-required` × 1 | 4415: R162 | 0: E162 | SINGLE |
| G163 | `migrate:579` `not evidence.get('verified')` | 1: `no-unverified-source-map` × 1 | 4417: R163 | 0: E163 | SINGLE |
| G164 | `migrate:579` `not evidence.get('backup_verified')` | 1: `reject-unbacked-migration` × 1 | 4417: R164 | 0: E164 | SINGLE |
| G165 | `migrate:582` `_debug.validate(source, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json'))` | 0: NONE | 4418: R165 | 0: E165 | G162+G165 |
| G166 | `migrate:584` `source['project_id'] != evidence['project_id']` | 1: `migration-evidence-wrong-project-only` × 1 | 4417: R166 | 0: E166 | SINGLE |
| G167 | `migrate:584` `source['dev_session_id'] != evidence['dev_session_id']` | 1: `reject-ambiguous-root` × 1 | 4417: R167 | 0: E167 | SINGLE |
| G168 | `migrate:589` `value_valid('Plans/ds15_dev_session_record_v2.schema.json', result)` | 6: `legacy-DAP-trailing-LF-source-adapter_capability_snapshot_ref` × 1; `legacy-DAP-trailing-LF-source-lease_ref` × 1; `legacy-DAP-trailing-LF-source-owner_ref` × 1; `legacy-DAP-trailing-LF-source-permission_grant_ref` × 1; `legacy-DAP-trailing-LF-source-policy_ref` × 1; `legacy-DAP-trailing-LF-source-waiter_arm_ref` × 1 | 4412: R168 | 0: E168 | SINGLE |
| G169 | `migrate:592` `len(mappings) != 1` | 1: `no-ambiguous-subject` × 1 | 4416: R169 | 1: E169 | SINGLE |
| G170 | `migrate:592` `mappings[0]['preview_id'] != source['preview_id']` | 1: `isolated-preview-map-source-id` × 1 | 4417: R170 | 0: E170 | SINGLE |
| G171 | `migrate:593` `mappings[0]['source_file'] != source['source_file']` | 1: `no-source-path-guess` × 1 | 4417: R171 | 0: E171 | SINGLE |
| G172 | `migrate:593` `source['status'] not in ('starting', 'running', 'stopped', 'error')` | 0: NONE | 4418: R172 | 0: E172 | G172+G173 |
| G173 | `migrate:597` `value_valid('Plans/ds15_preview_state_v2.schema.json', result)` | 1: `isolated-preview-result-closed-schema` × 1 | 4417: R173 | 0: E173 | SINGLE |
| G174 | `migrate:599` `source.get('thread_id') != evidence.get('thread_id')` | 1: `no-cross-thread-migration` × 1 | 4417: R174 | 0: E174 | SINGLE |
| G175 | `migrate:599` `source.get('scope') != evidence.get('scope')` | 1: `isolated-capture-original-scope` × 1 | 4417: R175 | 0: E175 | SINGLE |
| G176 | `migrate:603` `value_valid('Plans/ds15_browser_capture_chip_v2.schema.json', result)` | 1: `isolated-capture-result-closed-schema` × 1 | 4417: R176 | 0: E176 | SINGLE |
| G177 | `numeric_atom_ok:22` `not isinstance(value, (int, float)) or isinstance(value, bool) or (type(value) is int and -2 ** 63 <= value <= 2 ** 64 - 1)` | 2270: `-9223372036854775809` × 14; `0.0` × 14; `1.0` × 14; `1.5` × 14; `18446744073709551616` × 14; `1e0` × 14; `1e309` × 14; `2.0` × 14; `Infinity` × 14; `NaN` × 14; `decimal` × 710; `exponent` × 710; `integral-float` × 710 | 2148: R177 | 0: E177 | SINGLE |
| G178 | `parse_integer:47` `token == '-0'` | 28: `-0` × 28 | 4390: R178 | 0: E178 | SINGLE |

## Named duplicate sets

| Set | Witnesses | Flips F | Still refuse R | Exceptions E | Positive regressions |
|---|---:|---|---:|---:|---:|
| G000+G002+G003 | 14 | 43: `event-envelope-unknown-field` × 14; `isolated-checkpoint-envelope-schema` × 14; `isolated-envelope_ok-132-15` × 1; `triple-invalid-family-spelling` × 14 | 4361 | 14 | 0 |
| G004+G104 | 42 | 112: `duplicate-replay-only-payload` × 14; `duplicate-replay-only-publish` × 14; `duplicate-replay-only-recover` × 14; `isolated-non-dedupe-policy-envelope` × 14; `replay-only-context-recovery` × 14; `replay-only-payload` × 14; `replay-only-publish` × 14; `replay-only-recover` × 14 | 4306 | 0 | 0 |
| G008+G110 | 14 | 29: `changed-bytes` × 14; `duplicate-changed-bytes` × 14; `isolated-envelope_ok-136-57` × 1 | 4389 | 0 | 0 |
| G012+G039 | 14 | 31: `duplicate-wrong-partition-envelope` × 14; `isolated-envelope_ok-139-15` × 1; `isolated-receipt_ok-178-16` × 1; `project-capture-raw-partition-refused` × 1; `wrong-partition-envelope` × 14 | 4387 | 0 | 0 |
| G018+G019 | 1 | 4: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1; `paired-app-schema_id` × 1 | 4414 | 0 | 0 |
| G018+G020 | 1 | 4: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1; `paired-app-interface_id` × 1 | 4414 | 0 | 0 |
| G018+G023 | 1 | 4: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1; `paired-app-scope-scope_kind` × 1 | 4414 | 0 | 0 |
| G018+G024 | 1 | 4: `application-trailing-LF-original_input_semantic_sha256` × 1; `application-trailing-LF-original_output_semantic_sha256` × 1; `application-trailing-LF-source_sha256` × 1; `paired-app-scope-project_id` × 1 | 4414 | 0 | 0 |
| G049+G084 | 4 | 16: `auto-missing-dependency-visible-forbidden` × 1; `forced-visible-headless-forbidden` × 1; `invalid-transition` × 1; `paired-invalid-previous-state` × 4; `trailing-LF-payload-outcome_ref` × 7; `trailing-LF-payload-provenance_ref` × 1; `trailing-LF-payload-source_ref` × 1 | 4402 | 0 | 0 |
| G049+G085 | 4 | 16: `auto-missing-dependency-visible-forbidden` × 1; `forced-visible-headless-forbidden` × 1; `invalid-transition` × 1; `paired-invalid-result-state` × 4; `trailing-LF-payload-outcome_ref` × 7; `trailing-LF-payload-provenance_ref` × 1; `trailing-LF-payload-source_ref` × 1 | 4402 | 0 | 0 |
| G072+G073 | 1 | 8: `append-recovery-current-source-join-refused` × 1; `history-after-live-state-advances-invalid-original-transition` × 1; `invalid-transition` × 1; `isolated-payload_ok-237-16` × 1; `isolated-payload_ok-238-20` × 1; `paired-invalid-capture-resolution` × 1; `publish-current-source-join-refused` × 1; `wrong-capture-resolution-provenance` × 1 | 4410 | 0 | 0 |
| G110+G113 | 14 | 14: `paired-retained-body-disagreement` × 14 | 4404 | 0 | 0 |
| G117+G119 | 14 | 183: `append-recovery-current-source-join-refused` × 14; `duplicate-publish-guard-context-owner_command_authorized` × 14; `history-after-live-state-advances-deleted` × 14; `history-after-live-state-advances-denied` × 14; `history-after-live-state-advances-owner-denied` × 14; `history-after-live-state-advances-share-withdrawn` × 14; `publish-current-source-join-refused` × 14; `publish-guard-context-owner_command_authorized` × 14; `publish-guard-permission_now` × 14; `publish-guard-share_current` × 14; `publish-guard-source_deleted_now` × 14; `read-deleted` × 14; `read-denied` × 14; `revoked-at-serialization` × 1 | 4235 | 0 | 0 |
| G122+G123 | 14 | 182: `paired-oversize-checkpoint-last-id` × 14; `persisted-snapshot` × 14; `trailing-LF-checkpoint-index_read_token-frontier_sha256` × 14; `trailing-LF-checkpoint-index_read_token-generation_anchor_sha256` × 14; `trailing-LF-checkpoint-index_read_token-generation_id` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-current_bytes_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-durable_watermarks_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-excluded_ranges_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-manifest_bytes_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-manifest_survivor_prefix_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-retained_inventory_sha256` × 14; `trailing-LF-checkpoint-index_read_token-source_selection-retired_inputs_sha256` × 14; `unknown-checkpoint-field` × 14 | 4236 | 0 | 0 |
| G145+G146 | 14 | 42: `coverage-gap` × 14; `isolated-scanned-row-source-copy` × 14; `paired-missing-global-row` × 14 | 4376 | 0 | 0 |
| G151+G153 | 14 | 56: `last-event-is-not-global-frontier` × 14; `no-checkpoint-before-first-match` × 14; `paired-no-first-match` × 14; `zero-match-suffix-cannot-invent-match` × 14 | 4362 | 0 | 0 |
| G159+G161 | 1 | 2: `dap-topology-mismatch` × 1; `paired-value-root-project` × 1 | 4416 | 0 | 0 |
| G162+G165 | 1 | 5: `dap-terminal-truth` × 1; `dap-trigger-after-waiter` × 1; `dap-waiter-required` × 1; `paired-invalid-legacy-waiter` × 1; `reject-bad-legacy-waiter` × 1 | 4413 | 0 | 0 |
| G172+G173 | 1 | 2: `isolated-preview-result-closed-schema` × 1; `paired-invalid-legacy-preview-status` × 1 | 4416 | 0 | 0 |
| G174+G176 | 1 | 4: `isolated-capture-result-closed-schema` × 1; `no-cross-thread-migration` × 1; `ownerless-legacy-chip-unavailable` × 1; `paired-ownerless-legacy-chip` × 1 | 4414 | 0 | 0 |

## Numeric prerequisites and parser grammar

G177 is the actual numeric atom shared by recursive boundary checks and the asserted schema keyword. G178 refuses raw -0 before Python erases its spelling. All 2298 new non-grammar numeric negatives flip at their own actual prerequisite; parent controls succeed. The table exercises those prerequisites directly, exactly as the accepted presence controls do. The whole checker additionally runs every case at its named operation and its raw JSON ingress; invalid numeric bodies explicitly refuse before dependent codecs. A codec exception after removing its numeric prerequisite is never counted as acceptance. For numeric mutations the whole module is recompiled so schema keyword globals cannot retain an unmutated copy.

The 56 leading-zero cases (`01`, `00`, `-01`) are standard JSON grammar failures, separately listed by ID in the raw export. Both the stock parser and the DS15 ingress reject them. They are not attributed to a fabricated lane guard. Already-parsed integer zero keeps its original canonical bytes.

## Accepted residuals and supplemental proofs

All 44 residual cases are unchanged and accepted: 14 missing outcomes, 14 absent admissions, 14 legal publication-PENDING results, one null original output, one empty legacy mapping. The prerequisite guards retain their independent accepting controls. Fourteen event-schema LF controls flip under the separately tested pattern engine. `pattern-proofs.json` proves 166 LF controls (157 singleton engine flips; nine named exact-end/fullmatch pairs). `other-negative-audit.json` proves 42 payload and 84 closure negatives and validates all 42 value/migration closest parents.
