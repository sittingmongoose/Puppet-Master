# DS15 round 4: whole-lane guard-removal table

Implementation: `2fc6cfa2e321758048f2e8df3326c898c4e59156`. Result: **PARTIAL**; no complete check-11 PASS.

Raw table: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix4/whole-lane-guard-audit.json`, SHA-256 `276ff2e42c3efe4b763b2a9b8f6df1cd52d7a87960a57fd31d6beaea0e011132`.

The universe U contains 1918 current semantic, predicate and value/migration negative cases, keyed by `(family, id, target)`. Every row runs all of U and every successful control. `F<n>` is the exact `negative_successes` list of raw JSON `mutants[n]`; `E<n>` is the set of cases whose `errors_after_weakening` contains n. The last column lists the precise remaining set U minus F<n> minus E<n>; it is reproducible from that file. Exceptions are separate and never count as a pass or a detected guard.

The test source is mutated in memory, then discarded after each row. Input hashes and end-of-run stability checks are in the raw artifact. Pattern, schema-keyword and eager-closure mutations are listed separately in DS15.md; they are not silently counted as AST predicate mutations.

| Guard | Predicate (function:line) | Negatives that flip, F | Negatives that stay rejected | Exceptions |
|---|---|---|---|---|
| G000 | `envelope_ok:130`: `list(validator(read('Plans/event_record.schema.json')).iter_errors(e))` | 106: `event-envelope-unknown-field`, `oversize-inline-body-refused`, `isolated-checkpoint-envelope-schema`; 12 more exact IDs in F0 | 1798: U − F0 − E0 | 14: E0 |
| G001 | `envelope_ok:131`: `list(validator(read('Plans/event_record.schema.json')).iter_errors(original))` | 14: `isolated-original-envelope-schema` | 1904: U − F1 − E1 | 0: E1 |
| G002 | `envelope_ok:132`: `e['event_type'] != c['event_type']` | 1: `isolated-envelope_ok-132-15` | 1917: U − F2 − E2 | 0: E2 |
| G003 | `envelope_ok:132`: `not re.fullmatch('[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+', e['event_type'])` | 0: **NONE — not proved** | 1918: U − F3 − E3 | 0: E3 |
| G004 | `envelope_ok:133`: `e['replay_policy'] != 'dedupe_by_idempotency_key'` | 14: `isolated-non-dedupe-policy-envelope` | 1904: U − F4 − E4 | 0: E4 |
| G005 | `envelope_ok:134`: `original['replay_policy'] != 'dedupe_by_idempotency_key'` | 14: `isolated-non-dedupe-policy-original-event` | 1904: U − F5 − E5 | 0: E5 |
| G006 | `envelope_ok:135`: `e['scope_kind'] != ('application' if scope['kind'] == 'app' else 'project')` | 1: `isolated-envelope_ok-135-15` | 1917: U − F6 − E6 | 0: E6 |
| G007 | `envelope_ok:136`: `e['project_id'] != scope['project_id']` | 1: `isolated-envelope_ok-136-15` | 1917: U − F7 − E7 | 0: E7 |
| G008 | `envelope_ok:136`: `e['payload'] != d['payload']` | 1: `isolated-envelope_ok-136-57` | 1917: U − F8 − E8 | 0: E8 |
| G009 | `envelope_ok:137`: `e['run_id'] != d['payload'].get('run_id')` | 1: `isolated-envelope_ok-137-15` | 1917: U − F9 − E9 | 0: E9 |
| G010 | `envelope_ok:137`: `e['thread_id'] != d['payload'].get('thread_id')` | 1: `isolated-envelope_ok-137-60` | 1917: U − F10 − E10 | 0: E10 |
| G011 | `envelope_ok:138`: `e['payload_schema_id'] != read(c['payload_schema_ref'])['$id']` | 1: `isolated-envelope_ok-138-15` | 1917: U − F11 − E11 | 0: E11 |
| G012 | `envelope_ok:139`: `d['scope_partition'] != _codec.scope_partition(e['scope_kind'], e['project_id'])` | 1: `isolated-envelope_ok-139-15` | 1917: U − F12 − E12 | 0: E12 |
| G013 | `envelope_ok:140`: `len(_codec.canonical_messagepack_bytes(e['payload'])) > 16384` | 28: `oversize-inline-body-refused`, `isolated-exact-16385-inline-boundary` | 1890: U − F13 − E13 | 0: E13 |
| G014 | `envelope_ok:144`: `retry and (e['event_id'] != original['event_id'] or _codec.event_producer_semantic_digest(e) != _codec.event_producer_semantic_digest(original))` | 14: `retry-compares-semantic-actor` | 1904: U − F14 − E14 | 0: E14 |
| G015 | `envelope_ok:165`: `e['idempotency_key'] == identity(c, e['payload'], source)` | 1: `isolated-envelope_ok-165-11` | 1917: U − F15 − E15 | 0: E15 |
| G016 | `envelope_ok:149`: `not source` | 14: `application-trailing-LF-server_id`, `application-trailing-LF-original_operation_id`, `application-trailing-LF-original_input_semantic_sha256`; 11 more exact IDs in F16 | 1902: U − F16 − E16 | 2: E16 |
| G017 | `envelope_ok:149`: `source != d['original']['application_source']` | 1: `isolated-envelope_ok-149-26` | 1917: U − F17 − E17 | 0: E17 |
| G018 | `envelope_ok:150`: `list(application_source_validator().iter_errors(source))` | 3: `application-trailing-LF-original_input_semantic_sha256`, `application-trailing-LF-original_output_semantic_sha256`, `application-trailing-LF-source_sha256` | 1915: U − F18 − E18 | 0: E18 |
| G019 | `envelope_ok:151`: `source['schema_id'] != 'pm.application_source.browser_transition.v1'` | 0: **NONE — not proved** | 1918: U − F19 − E19 | 0: E19 |
| G020 | `envelope_ok:152`: `source['interface_id'] != 'owner.browser.transition.application@1.0.0'` | 0: **NONE — not proved** | 1918: U − F20 − E20 | 0: E20 |
| G021 | `envelope_ok:153`: `source['storage_instance_id'] != d['storage_instance_id']` | 1: `isolated-envelope_ok-153-19` | 1917: U − F21 − E21 | 0: E21 |
| G022 | `envelope_ok:154`: `source['thread_id'] != e['thread_id']` | 1: `isolated-app-source-thread_id` | 1917: U − F22 − E22 | 0: E22 |
| G023 | `envelope_ok:155`: `source['scope']['scope_kind'] != 'application'` | 0: **NONE — not proved** | 1918: U − F23 − E23 | 0: E23 |
| G024 | `envelope_ok:155`: `source['scope']['project_id'] is not None` | 0: **NONE — not proved** | 1918: U − F24 − E24 | 0: E24 |
| G025 | `envelope_ok:156`: `source['scope']['server_id'] != source['server_id']` | 1: `isolated-app-source-scope-server_id` | 1917: U − F25 − E25 | 0: E25 |
| G026 | `envelope_ok:157`: `source['original_output'] is None` | 0: **NONE — not proved** | 1917: U − F26 − E26 | 1: E26 |
| G027 | `envelope_ok:158`: `source['original_output']['profile_id'] != scope['profile_id']` | 2: `isolated-envelope_ok-149-12`, `isolated-envelope_ok-158-19` | 1916: U − F27 − E27 | 0: E27 |
| G028 | `envelope_ok:159`: `d['payload']['browser_session_id'] not in source['original_output']['session_refs']` | 1: `isolated-app-source-original_output-session_refs` | 1917: U − F28 − E28 | 0: E28 |
| G029 | `envelope_ok:160`: `any((stage['original_operation_id'] != source['original_operation_id'] for stage in source['stage_custody'].values()))` | 1: `isolated-app-source-stage_custody-owner_commit-original_operation_id` | 1917: U − F29 − E29 | 0: E29 |
| G030 | `envelope_ok:162`: `not all((isinstance(source.get(k), str) and 0 < len(source[k]) <= 256 and ('\n' not in source[k]) for k in ('server_id', 'original_operation_id')))` | 2: `application-trailing-LF-server_id`, `application-trailing-LF-original_operation_id` | 1916: U − F30 − E30 | 0: E30 |
| G031 | `receipt_ok:169`: `not (shared_valid('AppendReceipt', r) and shared_valid('custody_v2', custody) and shared_valid('full_value_result', result))` | 84: `receipt-field-durability_state`, `receipt-unknown-field`, `receipt-missing-field`; 3 more exact IDs in F31 | 1834: U − F31 − E31 | 0: E31 |
| G032 | `receipt_ok:172`: `r == custody['first_append_receipt'] == result['first_append_receipt']` | 259: `corrupt-receipt`, `receipt-field-event_id`, `receipt-field-sequence_id`; 22 more exact IDs in F32 | 1659: U − F32 − E32 | 0: E32 |
| G033 | `receipt_ok:173`: `r['event_id'] == event['event_id']` | 14: `isolated-receipt-original-event_id` | 1904: U − F33 − E33 | 0: E33 |
| G034 | `receipt_ok:173`: `r['sequence_id'] == event['sequence_id']` | 14: `isolated-receipt-original-sequence_id` | 1904: U − F34 − E34 | 0: E34 |
| G035 | `receipt_ok:174`: `r['byte_offset'] < r['durable_end_offset']` | 14: `isolated-receipt-end-offset-order` | 1904: U − F35 − E35 | 0: E35 |
| G036 | `receipt_ok:175`: `custody['original_event_value_commitment'] == result['original_event_value_commitment'] == commitment(event)` | 42: `full-value-commitment-corrupt`, `original-storage-metadata-commitment`, `history-after-live-state-advances-forged-original` | 1876: U − F36 − E36 | 0: E36 |
| G037 | `receipt_ok:176`: `custody['original_segment_ref'] == result['original_segment_ref']` | 1: `isolated-receipt_ok-176-16` | 1917: U − F37 − E37 | 0: E37 |
| G038 | `receipt_ok:177`: `custody['storage_instance_id'] == d['storage_instance_id']` | 1: `isolated-receipt_ok-177-16` | 1917: U − F38 − E38 | 0: E38 |
| G039 | `receipt_ok:178`: `custody['scope_partition'] == d['scope_partition']` | 1: `isolated-receipt_ok-178-16` | 1917: U − F39 − E39 | 0: E39 |
| G040 | `receipt_ok:179`: `custody['event_id'] == event['event_id']` | 1: `isolated-receipt_ok-179-16` | 1917: U − F40 − E40 | 0: E40 |
| G041 | `receipt_ok:179`: `custody['event_type'] == event['event_type']` | 1: `isolated-receipt_ok-179-61` | 1917: U − F41 − E41 | 0: E41 |
| G042 | `receipt_ok:180`: `custody['idempotency_key'] == event['idempotency_key']` | 1: `isolated-receipt_ok-180-16` | 1917: U − F42 − E42 | 0: E42 |
| G043 | `receipt_ok:181`: `custody['producer_semantic_digest'] == _codec.event_producer_semantic_digest(event)` | 28: `corrupt-receipt`, `isolated-checkpoint-receipt-custody` | 1890: U − F43 − E43 | 0: E43 |
| G044 | `token_matches_storage:185`: `token['storage_instance_id'] == storage_instance_id` | 131: `source-instance-mismatch`, `token-storage-disagrees-with-event`, `checkpoint-foreign-root-key-and-ref`; 11 more exact IDs in F44 | 1787: U − F44 − E44 | 0: E44 |
| G045 | `token_matches_storage:186`: `token['source_selection']['storage_instance_id'] == storage_instance_id` | 15: `source-instance-mismatch`, `isolated-token_matches_storage-186-16` | 1903: U − F45 − E45 | 0: E45 |
| G046 | `token_matches_storage:187`: `token['checkpoint_key'] == key` | 15: `checkpoint-foreign-root-key`, `isolated-token_matches_storage-187-16` | 1903: U − F46 − E46 | 0: E46 |
| G047 | `token_matches_storage:188`: `token['checkpoint_ref'] == key + '#/generations/' + token['generation_id']` | 29: `checkpoint-foreign-root-ref`, `checkpoint-ref-generation-mismatch`, `isolated-token_matches_storage-188-16` | 1889: U − F47 − E47 | 0: E47 |
| G048 | `token_matches_storage:189`: `token['index_dataset_name'] == 'event_record_index.v2@' + token['generation_id']` | 15: `checkpoint-dataset-generation-mismatch`, `isolated-token_matches_storage-189-16` | 1903: U − F48 − E48 | 0: E48 |
| G049 | `payload_ok:200`: `list(validator(read(c['payload_schema_ref'])).iter_errors(p))` | 9: `trailing-LF-payload-source_ref`, `trailing-LF-payload-provenance_ref`, `trailing-LF-payload-outcome_ref` | 1909: U − F49 − E49 | 0: E49 |
| G050 | `payload_ok:202`: `not x['owner_command_authorized']` | 15: `owner-command-refusal-not-overridden`, `isolated-payload_ok-202-7` | 1903: U − F50 − E50 | 0: E50 |
| G051 | `payload_ok:211`: `not safe_refs(p)` | 42: `unsafe-content-reference`, `credential-shaped-reference`, `forbidden-reference` | 1876: U − F51 − E51 | 0: E51 |
| G052 | `payload_ok:214`: `x['scope'] != scope` | 16: `envelope-mismatch`, `isolated-payload_ok-214-7`, `isolated-payload_ok-214-30` | 1902: U − F52 − E52 | 0: E52 |
| G053 | `payload_ok:214`: `x['envelope_project_id'] != scope.get('project_id')` | 15: `envelope-mismatch`, `isolated-payload_ok-214-30` | 1903: U − F53 − E53 | 0: E53 |
| G054 | `payload_ok:216`: `p.get('run_id') != x['envelope_run_id']` | 1: `isolated-payload_ok-216-7` | 1917: U − F54 − E54 | 0: E54 |
| G055 | `payload_ok:218`: `p.get('browser_session_id') and x['session_security_class'] != 'ordinary'` | 2: `protected-capture`, `isolated-payload_ok-218-7` | 1916: U − F55 − E55 | 0: E55 |
| G056 | `payload_ok:222`: `x['config_inspected']` | 6: `invalid-transition`, `publish-current-source-join-refused`, `append-recovery-current-source-join-refused`; 3 more exact IDs in F56 | 1912: U − F56 − E56 | 0: E56 |
| G057 | `payload_ok:222`: `x['doctor_invocation_id'] == p['doctor_invocation_id']` | 1: `isolated-payload_ok-222-41` | 1917: U − F57 − E57 | 0: E57 |
| G058 | `payload_ok:224`: `x['launch_outcome'] == 'launched'` | 6: `invalid-transition`, `publish-current-source-join-refused`, `append-recovery-current-source-join-refused`; 3 more exact IDs in F58 | 1912: U − F58 − E58 | 0: E58 |
| G059 | `payload_ok:224`: `x['driver_session_id'] == p['session_id']` | 1: `isolated-payload_ok-224-53` | 1917: U − F59 − E59 | 0: E59 |
| G060 | `payload_ok:226`: `x['session_state'] == 'running'` | 6: `invalid-transition`, `publish-current-source-join-refused`, `append-recovery-current-source-join-refused`; 3 more exact IDs in F60 | 1912: U − F60 − E60 | 0: E60 |
| G061 | `payload_ok:226`: `p['step_revision'] > x['previous_revision']` | 1: `isolated-payload_ok-226-51` | 1917: U − F61 − E61 | 0: E61 |
| G062 | `payload_ok:228`: `x['artifact']['id'] == p['artifact_id']` | 8: `invalid-transition`, `publish-current-source-join-refused`, `append-recovery-current-source-join-refused`; 5 more exact IDs in F62 | 1910: U − F62 − E62 | 0: E62 |
| G063 | `payload_ok:228`: `x['artifact']['ref'] == p['artifact_ref']` | 1: `isolated-payload_ok-228-60` | 1917: U − F63 − E63 | 0: E63 |
| G064 | `payload_ok:229`: `x['artifact']['receipt_ref'] == p['artifact_receipt_ref']` | 1: `isolated-payload_ok-229-20` | 1917: U − F64 − E64 | 0: E64 |
| G065 | `payload_ok:229`: `x['artifact']['committed']` | 5: `invalid-transition`, `publish-current-source-join-refused`, `append-recovery-current-source-join-refused`; 2 more exact IDs in F65 | 1913: U − F65 − E65 | 0: E65 |
| G066 | `payload_ok:231`: `x['session_state'] == 'running'` | 7: `invalid-transition`, `publish-current-source-join-refused`, `append-recovery-current-source-join-refused`; 4 more exact IDs in F66 | 1911: U − F66 − E66 | 0: E66 |
| G067 | `payload_ok:231`: `x['finalization']['committed']` | 5: `invalid-transition`, `publish-current-source-join-refused`, `append-recovery-current-source-join-refused`; 2 more exact IDs in F67 | 1913: U − F67 − E67 | 0: E67 |
| G068 | `payload_ok:232`: `all((x['finalization'][k] == p[k] for k in ('manifest_ref', 'summary_ref', 'checks_ref')))` | 1: `isolated-payload_ok-232-20` | 1917: U − F68 − E68 | 0: E68 |
| G069 | `payload_ok:234`: `p['degradation_revision'] > x['previous_revision']` | 4: `history-after-live-state-advances-invalid-original-transition`, `isolated-payload_ok-234-16`, `isolated-payload_ok-234-71`; 1 more exact IDs in F69 | 1914: U − F69 − E69 | 0: E69 |
| G070 | `payload_ok:234`: `not x['visible_dependency_available']` | 1: `isolated-payload_ok-234-71` | 1917: U − F70 − E70 | 0: E70 |
| G071 | `payload_ok:235`: `x['launch_outcome'] == ('refused' if p['requested_visual_mode'] == 'forced_visible' else 'headless')` | 2: `history-after-live-state-advances-invalid-original-transition`, `isolated-payload_ok-235-20` | 1916: U − F71 − E71 | 0: E71 |
| G072 | `payload_ok:237`: `x['target_resolution'] in ('explicit', 'owning_surface', 'explicit_new_thread')` | 19: `invalid-transition`, `unresolved-target`, `no-auto-send`; 16 more exact IDs in F72 | 1899: U − F72 − E72 | 0: E72 |
| G073 | `payload_ok:238`: `p['target_resolution'] == x['target_resolution']` | 2: `isolated-payload_ok-237-16`, `isolated-payload_ok-238-20` | 1916: U − F73 − E73 | 0: E73 |
| G074 | `payload_ok:239`: `x['resolved_thread_id'] == p['thread_id']` | 2: `unresolved-target`, `isolated-payload_ok-239-20` | 1916: U − F74 − E74 | 0: E74 |
| G075 | `payload_ok:239`: `x['thread_writable']` | 1: `isolated-payload_ok-239-66` | 1917: U − F75 − E75 | 0: E75 |
| G076 | `payload_ok:240`: `x['chip']['chip_id'] == p['chip_id']` | 1: `isolated-payload_ok-240-20` | 1917: U − F76 − E76 | 0: E76 |
| G077 | `payload_ok:240`: `x['chip']['thread_id'] == p['thread_id']` | 1: `isolated-payload_ok-240-61` | 1917: U − F77 − E77 | 0: E77 |
| G078 | `payload_ok:241`: `x['chip']['attachment_type'] == p['attachment_type']` | 1: `isolated-payload_ok-241-20` | 1917: U − F78 − E78 | 0: E78 |
| G079 | `payload_ok:242`: `x['chip']['source_ref'] == p['source_ref']` | 1: `isolated-payload_ok-242-20` | 1917: U − F79 − E79 | 0: E79 |
| G080 | `payload_ok:242`: `x['chip']['committed']` | 1: `isolated-payload_ok-242-67` | 1917: U − F80 − E80 | 0: E80 |
| G081 | `payload_ok:243`: `x['chip']['status'] == p['capture_status']` | 1: `isolated-payload_ok-243-20` | 1917: U − F81 − E81 | 0: E81 |
| G082 | `payload_ok:243`: `x['thread_scope'] == scope` | 2: `cross-namespace-thread-refused`, `isolated-payload_ok-243-67` | 1916: U − F82 − E82 | 0: E82 |
| G083 | `payload_ok:243`: `not x['auto_send']` | 2: `no-auto-send`, `isolated-payload_ok-243-98` | 1916: U − F83 − E83 | 0: E83 |
| G084 | `payload_ok:250`: `p['previous_state'] in before` | 39: `invalid-transition`, `no-dap-flattening`, `no-terminal-rewrite`; 15 more exact IDs in F84 | 1879: U − F84 − E84 | 0: E84 |
| G085 | `payload_ok:250`: `p['workflow_state'] == after` | 0: **NONE — not proved** | 1918: U − F85 − E85 | 0: E85 |
| G086 | `payload_ok:251`: `x['workflow_state'] == p['previous_state']` | 18: `invalid-transition`, `publish-current-source-join-refused`, `append-recovery-current-source-join-refused`; 3 more exact IDs in F86 | 1900: U − F86 − E86 | 0: E86 |
| G087 | `payload_ok:251`: `p['workflow_revision'] == x['previous_revision'] + 1` | 1: `isolated-payload_ok-251-67` | 1917: U − F87 − E87 | 0: E87 |
| G088 | `payload_ok:252`: `x['dev_session_id'] == p['dev_session_id']` | 1: `isolated-payload_ok-252-20` | 1917: U − F88 − E88 | 0: E88 |
| G089 | `payload_ok:252`: `x['managed_outcome_committed']` | 1: `isolated-payload_ok-252-67` | 1917: U − F89 − E89 | 0: E89 |
| G090 | `payload_ok:253`: `x['operation_id'] == p['operation_id']` | 5: `wrong-owner-operation`, `isolated-payload_ok-253-20` | 1913: U − F90 − E90 | 0: E90 |
| G091 | `payload_ok:254`: `n != 'dev.session.started' or x['launch_outcome'] == 'launched'` | 1: `isolated-payload_ok-254-21` | 1917: U − F91 − E91 | 0: E91 |
| G092 | `payload_ok:255`: `n != 'dev.session.stopped' or x['managed_resources_settled']` | 1: `isolated-payload_ok-255-21` | 1917: U − F92 − E92 | 0: E92 |
| G093 | `payload_ok:256`: `x['dap_state_after'] == x['dap_state_before'] or (x['dap_transition_ref'] is not None and x['dap_owner_verified'])` | 5: `no-dap-flattening`, `isolated-payload_ok-256-21` | 1913: U − F93 − E93 | 0: E93 |
| G094 | `payload_ok:257`: `all((p.get(k) == x['links'].get(k) for k in ('run_id', 'thread_id', 'workspace_tab_id', 'terminal_session_id', 'dap_session_id')))` | 1: `isolated-payload_ok-257-20` | 1917: U − F94 − E94 | 0: E94 |
| G095 | `payload_ok:258`: `not x['rewrite_terminal_history']` | 5: `no-terminal-rewrite`, `isolated-payload_ok-258-20` | 1913: U − F95 − E95 | 0: E95 |
| G096 | `payload_ok:260`: `x['preview_subject_id'] == p['preview_subject_id']` | 26: `invalid-transition`, `subject-mismatch`, `runtime-mismatch`; 11 more exact IDs in F96 | 1892: U − F96 − E96 | 0: E96 |
| G097 | `payload_ok:261`: `x['preview_session_id'] == p['preview_session_id']` | 4: `runtime-mismatch`, `isolated-payload_ok-261-20` | 1914: U − F97 − E97 | 0: E97 |
| G098 | `payload_ok:262`: `x['source_revision'] == p['source_revision']` | 1: `isolated-payload_ok-262-20` | 1917: U − F98 − E98 | 0: E98 |
| G099 | `payload_ok:262`: `x['runtime_verified']` | 1: `isolated-payload_ok-262-69` | 1917: U − F99 − E99 | 0: E99 |
| G100 | `payload_ok:263`: `not x['restored_live_claim']` | 13: `invalid-transition`, `publish-current-source-join-refused`, `append-recovery-current-source-join-refused`; 2 more exact IDs in F100 | 1905: U − F100 − E100 | 0: E100 |
| G101 | `payload_ok:264`: `n != 'preview.session.started' or (x['session_state'] == 'created' and p['runtime_state'] == 'loading')` | 1: `isolated-payload_ok-264-21` | 1917: U − F101 − E101 | 0: E101 |
| G102 | `payload_ok:265`: `n != 'preview.session.stopped' or (x['session_state'] != 'closed' and p['runtime_state'] == 'closed' and x['managed_resources_settled'])` | 1: `isolated-payload_ok-265-21` | 1917: U − F102 − E102 | 0: E102 |
| G103 | `payload_ok:266`: `n != 'preview.session.refreshed' or (x['session_state'] in ('ready', 'stale', 'degraded', 'error') and x['refreshable'] and x['refresh_committed'] and (p['preview_revision'] > x['previous_revision']) and (p['refresh_origin'] == 'cmd.browser.reload' and bool(p.get('browser_session_id')) and (p['browser_session_id'] == x['browser_session_id']) or (p['refresh_origin'] == 'filemanager.preview_refresh' and (not p.get('browser_session_id')))))` | 1: `isolated-payload_ok-266-21` | 1917: U − F103 − E103 | 0: E103 |
| G104 | `evaluate:288`: `'projector_replay_only' in policies` | 14: `replay-only-context-recovery` | 1904: U − F104 − E104 | 0: E104 |
| G105 | `evaluate:294`: `out is None` | 28: `backup-loss`, `publish-before-body-commit` | 1876: U − F105 − E105 | 14: E105 |
| G106 | `evaluate:294`: `not out['committed']` | 14: `publish-before-body-commit` | 1904: U − F106 − E106 | 0: E106 |
| G107 | `evaluate:294`: `not d['backup_closure_verified']` | 14: `backup-loss` | 1904: U − F107 − E107 | 0: E107 |
| G108 | `evaluate:296`: `not payload_ok(c, o['payload'], d['original_context'])` | 138: `corrupt-outcome`, `changed-bytes`, `retry-compares-semantic-actor`; 18 more exact IDs in F108 | 1780: U − F108 − E108 | 0: E108 |
| G109 | `evaluate:296`: `not envelope_ok(c, d)` | 52: `retry-compares-semantic-actor`, `event-envelope-unknown-field`, `event-envelope-missing-field`; 10 more exact IDs in F109 | 1866: U − F109 − E109 | 0: E109 |
| G110 | `evaluate:297`: `p != o['payload']` | 0: **NONE — not proved** | 1918: U − F110 − E110 | 0: E110 |
| G111 | `evaluate:297`: `out['payload'] != o['payload']` | 14: `isolated-outcome-original-payload-copy` | 1904: U − F111 − E111 | 0: E111 |
| G112 | `evaluate:298`: `out['event_id'] != o['event_id']` | 14: `corrupt-outcome` | 1904: U − F112 − E112 | 0: E112 |
| G113 | `evaluate:298`: `o['event']['payload'] != o['payload']` | 0: **NONE — not proved** | 1918: U − F113 − E113 | 0: E113 |
| G114 | `evaluate:299`: `o['event']['event_id'] != o['event_id']` | 14: `isolated-original-event-id-copy` | 1904: U − F114 − E114 | 0: E114 |
| G115 | `evaluate:299`: `o['idempotency_key'] != o['event']['idempotency_key']` | 14: `isolated-original-key-copy` | 1904: U − F115 − E115 | 0: E115 |
| G116 | `evaluate:301`: `p.get('outcome_ref', out['source_ref']) != out['source_ref']` | 7: `outcome-source-ref-mismatch` | 1911: U − F116 − E116 | 0: E116 |
| G117 | `evaluate:306`: `(op == 'publish' or (op == 'recover' and r is None)) and (not payload_ok(c, o['payload'], x))` | 26: `publish-current-source-join-refused`, `append-recovery-current-source-join-refused` | 1892: U − F117 − E117 | 0: E117 |
| G118 | `evaluate:308`: `op == 'read' and (d['reader_withdrawn'] or d['reader_installed'] != c['consumer'])` | 28: `history-after-live-state-advances-reader-withdrawn`, `history-after-live-state-advances-reader-version-mismatch` | 1890: U − F118 − E118 | 0: E118 |
| G119 | `evaluate:310`: `op in ('publish', 'read') and (not d['permission_now'] or d['source_deleted_now'] or (not d['share_current']) or (not x['owner_command_authorized']))` | 127: `read-deleted`, `read-denied`, `publish-guard-permission_now`; 7 more exact IDs in F119 | 1791: U − F119 − E119 | 0: E119 |
| G120 | `evaluate:317`: `not receipt_ok(d)` | 238: `corrupt-receipt`, `receipt-field-event_id`, `receipt-field-sequence_id`; 14 more exact IDs in F120 | 1680: U − F120 − E120 | 0: E120 |
| G121 | `evaluate:319`: `op == 'publish' and (not d['receipt_retained'])` | 14: `terminal-before-receipt` | 1904: U − F121 − E121 | 0: E121 |
| G122 | `evaluate:324`: `list(validator(read(c['checkpoint_schema_ref'])).iter_errors(cp))` | 168: `unknown-checkpoint-field`, `persisted-snapshot`, `trailing-LF-checkpoint-index_read_token-generation_id`; 9 more exact IDs in F122 | 1750: U − F122 − E122 | 0: E122 |
| G123 | `evaluate:325`: `len(_codec.canonical_messagepack_bytes(cp)) > 16384` | 0: **NONE — not proved** | 1918: U − F123 − E123 | 0: E123 |
| G124 | `evaluate:327`: `op == 'rebuild' and (not d['retained_prefix_complete'])` | 14: `rebuild-missing-prefix` | 1904: U − F124 − E124 | 0: E124 |
| G125 | `evaluate:330`: `d['expected_previous'] != d['stored_previous']` | 308: `cas-race`, `token-change`, `snapshot-change`; 19 more exact IDs in F125 | 1610: U − F125 − E125 | 0: E125 |
| G126 | `evaluate:330`: `d['reader_installed'] != c['consumer']` | 14: `stale-reader-version` | 1904: U − F126 − E126 | 0: E126 |
| G127 | `evaluate:331`: `d['reader_withdrawn']` | 14: `withdrawn-reader` | 1904: U − F127 − E127 | 0: E127 |
| G128 | `evaluate:331`: `not d['permission_now']` | 14: `checkpoint-read-denied` | 1904: U − F128 − E128 | 0: E128 |
| G129 | `evaluate:331`: `d['source_deleted_now']` | 14: `checkpoint-source-deleted` | 1904: U − F129 − E129 | 0: E129 |
| G130 | `evaluate:332`: `cp['state'] != 'current'` | 14: `withdrawn-checkpoint` | 1904: U − F130 − E130 | 0: E130 |
| G131 | `evaluate:332`: `token != d['selected_token']` | 28: `token-change`, `reinstall-old-source-refused` | 1890: U − F131 − E131 | 0: E131 |
| G132 | `evaluate:333`: `d['live_snapshot_id'] != d['current_live_snapshot_id']` | 14: `snapshot-change` | 1904: U − F132 − E132 | 0: E132 |
| G133 | `evaluate:334`: `not token_matches_storage(token, d['storage_instance_id'])` | 112: `source-instance-mismatch`, `token-storage-disagrees-with-event`, `checkpoint-foreign-root-key-and-ref`; 5 more exact IDs in F133 | 1806: U − F133 − E133 | 0: E133 |
| G134 | `evaluate:335`: `not d['share_current']` | 14: `isolated-checkpoint-share` | 1904: U − F134 − E134 | 0: E134 |
| G135 | `evaluate:335`: `not envelope_ok(c, d)` | 14: `isolated-checkpoint-envelope-schema` | 1904: U − F135 − E135 | 0: E135 |
| G136 | `evaluate:335`: `not receipt_ok(d)` | 14: `isolated-checkpoint-receipt-custody` | 1904: U − F136 − E136 | 0: E136 |
| G137 | `evaluate:336`: `cp.get('project_id') != p.get('project_id')` | 13: `isolated-checkpoint-owner-scope` | 1905: U − F137 − E137 | 0: E137 |
| G138 | `evaluate:336`: `cp.get('scope') != p.get('scope')` | 1: `isolated-checkpoint-owner-scope` | 1917: U − F138 − E138 | 0: E138 |
| G139 | `evaluate:344`: `source['storage_instance_id'] != d['storage_instance_id']` | 154: `coverage-gap`, `global-scan-end-required`, `initial-global-row-drop-and-low-change`; 8 more exact IDs in F139 | 1764: U − F139 − E139 | 0: E139 |
| G140 | `evaluate:345`: `source['index_read_token'] != token` | 14: `isolated-selected-source-token-copy` | 1904: U − F140 − E140 | 0: E140 |
| G141 | `evaluate:345`: `source['last_sequence'] != d['selected_high']` | 14: `isolated-source-high-bound` | 1904: U − F141 − E141 | 0: E141 |
| G142 | `evaluate:346`: `[r['sequence'] for r in source_rows] != list(range(source['first_sequence'], source['last_sequence'] + 1))` | 14: `isolated-complete-source-prefix` | 1904: U − F142 − E142 | 0: E142 |
| G143 | `evaluate:347`: `any((r['scope_partition'] != _codec.scope_partition('application' if r['scope']['kind'] == 'app' else 'project', r['scope']['project_id']) for r in source_rows))` | 14: `isolated-source-row-partition` | 1904: U − F143 − E143 | 0: E143 |
| G144 | `evaluate:348`: `low != start` | 14: `initial-global-row-drop-and-low-change` | 1904: U − F144 − E144 | 0: E144 |
| G145 | `evaluate:348`: `rows != [r for r in source_rows if low <= r['sequence'] <= high]` | 14: `isolated-scanned-row-source-copy` | 1904: U − F145 − E145 | 0: E145 |
| G146 | `evaluate:349`: `[r['sequence'] for r in rows] != list(range(low, high + 1))` | 0: **NONE — not proved** | 1918: U − F146 − E146 | 0: E146 |
| G147 | `evaluate:350`: `cp['through_sequence_id'] != high` | 14: `global-scan-end-required` | 1904: U − F147 − E147 | 0: E147 |
| G148 | `evaluate:350`: `high != d['selected_high']` | 14: `isolated-scan-selected-high` | 1904: U − F148 − E148 | 0: E148 |
| G149 | `evaluate:351`: `prior is not None and (list(validator(read(c['checkpoint_schema_ref'])).iter_errors(prior)) or not token_matches_storage(prior['index_read_token'], d['storage_instance_id']) or any((prior['index_read_token'][key] != token[key] for key in ('storage_instance_id', 'generation_id', 'generation_anchor_sha256'))) or (prior.get('project_id') != cp.get('project_id')) or (prior.get('scope') != cp.get('scope')) or (prior['state'] != 'current'))` | 14: `prior-checkpoint-foreign-root` | 1904: U − F149 − E149 | 0: E149 |
| G150 | `evaluate:360`: `prior is not None and (not earlier or prior['last_event_id'] != earlier[-1])` | 14: `isolated-prior-last-matching-event` | 1904: U − F150 − E150 | 0: E150 |
| G151 | `evaluate:363`: `last is None` | 56: `filtered-omission`, `last-event-is-not-global-frontier`, `zero-match-suffix-cannot-invent-match`; 1 more exact IDs in F151 | 1862: U − F151 − E151 | 0: E151 |
| G152 | `evaluate:363`: `matches != d['selected_matches']` | 14: `filtered-omission` | 1904: U − F152 − E152 | 0: E152 |
| G153 | `evaluate:363`: `cp['last_event_id'] != last` | 28: `last-event-is-not-global-frontier`, `zero-match-suffix-cannot-invent-match` | 1890: U − F153 − E153 | 0: E153 |
| G154 | `evaluate:368`: `admitted is None` | 28: `withdrawn-writer`, `writer-past-cutoff-refused` | 1890: U − F154 − E154 | 0: E154 |
| G155 | `evaluate:368`: `admitted > d['withdrawal_frontier']` | 14: `writer-past-cutoff-refused` | 1904: U − F155 − E155 | 0: E155 |
| G156 | `evaluate:314`: `op == 'recover' and (not d['permission_now'] or d['source_deleted_now'] or (not d['share_current']))` | 42: `append-recovery-guard-permission_now`, `append-recovery-guard-source_deleted_now`, `append-recovery-guard-share_current` | 1876: U − F156 − E156 | 0: E156 |
| G157 | `value_valid:444`: `list(validator(read(schema_ref)).iter_errors(value))` | 25: `no-workflow-or-dap`, `no-flat-dap-id`, `no-workflow-debug-state-alias`; 20 more exact IDs in F157 | 1893: U − F157 − E157 | 0: E157 |
| G158 | `value_valid:446`: `len(_codec.canonical_messagepack_bytes(value)) > 16384` | 1: `oversize-valid-DAP-value` | 1917: U − F158 − E158 | 0: E158 |
| G159 | `value_valid:450`: `value['project_id'] != dap['project_id']` | 5: `dap-root-mismatch`, `dap-topology-mismatch`, `dap-waiter-required`; 2 more exact IDs in F159 | 1913: U − F159 − E159 | 0: E159 |
| G160 | `value_valid:450`: `value['dev_session_id'] != dap['dev_session_id']` | 1: `dap-root-mismatch` | 1917: U − F160 − E160 | 0: E160 |
| G161 | `value_valid:451`: `value['project_id'] != dap['topology']['project_id']` | 1: `dap-topology-mismatch` | 1917: U − F161 − E161 | 0: E161 |
| G162 | `value_valid:452`: `_debug.validate(dap, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json'))` | 3: `dap-waiter-required`, `dap-trigger-after-waiter`, `dap-terminal-truth` | 1915: U − F162 − E162 | 0: E162 |
| G163 | `migrate:459`: `not evidence.get('verified')` | 2: `reject-unbacked-migration`, `no-unverified-source-map` | 1916: U − F163 − E163 | 0: E163 |
| G164 | `migrate:459`: `not evidence.get('backup_verified')` | 1: `reject-unbacked-migration` | 1917: U − F164 − E164 | 0: E164 |
| G165 | `migrate:462`: `_debug.validate(source, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json'))` | 0: **NONE — not proved** | 1918: U − F165 − E165 | 0: E165 |
| G166 | `migrate:464`: `source['project_id'] != evidence['project_id']` | 1: `reject-ambiguous-root` | 1917: U − F166 − E166 | 0: E166 |
| G167 | `migrate:464`: `source['dev_session_id'] != evidence['dev_session_id']` | 1: `reject-ambiguous-root` | 1917: U − F167 − E167 | 0: E167 |
| G168 | `migrate:469`: `value_valid('Plans/ds15_dev_session_record_v2.schema.json', result)` | 6: `legacy-DAP-trailing-LF-source-adapter_capability_snapshot_ref`, `legacy-DAP-trailing-LF-source-owner_ref`, `legacy-DAP-trailing-LF-source-lease_ref`; 3 more exact IDs in F168 | 1912: U − F168 − E168 | 0: E168 |
| G169 | `migrate:472`: `len(mappings) != 1` | 3: `no-ambiguous-subject`, `no-source-path-guess`, `isolated-preview-map-source-id` | 1914: U − F169 − E169 | 1: E169 |
| G170 | `migrate:472`: `mappings[0]['preview_id'] != source['preview_id']` | 1: `isolated-preview-map-source-id` | 1917: U − F170 − E170 | 0: E170 |
| G171 | `migrate:473`: `mappings[0]['source_file'] != source['source_file']` | 1: `no-source-path-guess` | 1917: U − F171 − E171 | 0: E171 |
| G172 | `migrate:473`: `source['status'] not in ('starting', 'running', 'stopped', 'error')` | 0: **NONE — not proved** | 1918: U − F172 − E172 | 0: E172 |
| G173 | `migrate:477`: `value_valid('Plans/ds15_preview_state_v2.schema.json', result)` | 1: `isolated-preview-result-closed-schema` | 1917: U − F173 − E173 | 0: E173 |
| G174 | `migrate:479`: `source.get('thread_id') != evidence.get('thread_id')` | 2: `no-cross-thread-migration`, `isolated-capture-original-scope` | 1916: U − F174 − E174 | 0: E174 |
| G175 | `migrate:479`: `source.get('scope') != evidence.get('scope')` | 1: `isolated-capture-original-scope` | 1917: U − F175 − E175 | 0: E175 |
| G176 | `migrate:483`: `value_valid('Plans/ds15_browser_capture_chip_v2.schema.json', result)` | 1: `isolated-capture-result-closed-schema` | 1917: U − F176 − E176 | 0: E176 |

## Guards without a flipping negative

These rows are retained as gaps. A duplicate constraint or a prerequisite dereference can explain a zero, but a zero is never relabeled PASS.

- **G003** `envelope_ok:132` — `not re.fullmatch('[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+', e['event_type'])`
- **G019** `envelope_ok:151` — `source['schema_id'] != 'pm.application_source.browser_transition.v1'`
- **G020** `envelope_ok:152` — `source['interface_id'] != 'owner.browser.transition.application@1.0.0'`
- **G023** `envelope_ok:155` — `source['scope']['scope_kind'] != 'application'`
- **G024** `envelope_ok:155` — `source['scope']['project_id'] is not None`
- **G026** `envelope_ok:157` — `source['original_output'] is None`
- **G085** `payload_ok:250` — `p['workflow_state'] == after`
- **G110** `evaluate:297` — `p != o['payload']`
- **G113** `evaluate:298` — `o['event']['payload'] != o['payload']`
- **G123** `evaluate:325` — `len(_codec.canonical_messagepack_bytes(cp)) > 16384`
- **G146** `evaluate:349` — `[r['sequence'] for r in rows] != list(range(low, high + 1))`
- **G165** `migrate:462` — `_debug.validate(source, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json'))`
- **G172** `migrate:473` — `source['status'] not in ('starting', 'running', 'stopped', 'error')`
