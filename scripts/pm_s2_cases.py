"""PNC-019 S2 witness catalogue: positives and single-defect negatives for every guard row of the DL-300 checker.

Each negative starts from one coherent valid original (pm_s2_dl300_events.build_world) and changes one input
invariant; derived copies stay coherent (a field the original owner result carries changes in both the payload and
the source result). Every case names its boundary and expectation: ('accept',) or ('refuse', table, row). Nothing
here decides a checker result. The shape follows the reviewed W3H catalogue (scripts/pm_w3h_cases.py).
"""
import copy

import pm_s2_dl300_events as m

F = m.FAMILIES
S, RQ, RS = m.SETTINGS, m.REQUESTED, m.RESOLVED
STRING_KEY = {S: 'redacted_summary_ref', RQ: 'tool_id', RS: 'return_context_ref'}


def _pe(w):
    return w['publication']['prepared_event']


def set_field(w, key, value):
    """Change one owner-result field coherently: inline payload copy and the source result."""
    _pe(w)['payload'][key] = copy.deepcopy(value)
    w['source']['result'][key] = copy.deepcopy(value)


def facts(w):
    return w['source']['facts']


def table_of(row):
    for phase, (_c, _t, rows) in m.ROWS.items():
        for table, part in m.part_rows(phase).items():
            if any(r[0] == row for r in part):
                return table
    raise KeyError(row)


# --- witness specs: row -> list of (label, spec, mutate) ------------------------------------------------------
# spec keys: state, external, variant, scope, pad, pad_corr, families (filter)
W = {}


def wit(row, label, mutate, **spec):
    W.setdefault(row, []).append((label, spec, mutate))


def adm(key):
    return lambda w: w['admission'].__setitem__(key, False)


wit('AD01_family_registered', 'family-revision-not-registered', lambda w: w['admission']['registered_family'].__setitem__('family_revision', '1.1.0'))
wit('AD01_family_registered', 'other-family-registered', lambda w: w['admission']['registered_family'].__setitem__('event_type', 'settings.updated'))
wit('AD02_edition_selected', 'edition-missing', lambda w: w['admission'].__setitem__('editions', [e for e in w['admission']['editions'] if e['scope_kind'] != w['scope']]))
wit('AD02_edition_selected', 'edition-other-schema', lambda w: [e.__setitem__('payload_schema_id', 'pm.other.v1') for e in w['admission']['editions'] if e['scope_kind'] == w['scope']])
wit('AD02_edition_selected', 'edition-duplicated', lambda w: w['admission']['editions'].append(copy.deepcopy(next(e for e in w['admission']['editions'] if e['scope_kind'] == w['scope']))))
wit('AD03_producer_adopted', 'producer-not-adopted', adm('producer_adopted'))
wit('AD04_writer_enabled', 'writer-withdrawn', adm('writer_enabled'))
wit('AD05_permission_current', 'permission-revoked', adm('permission_current'))
wit('AD06_stop_clear', 'stop-fences-effect', adm('stop_clear'))
wit('AD07_dedupe_available', 'dedupe-owner-unavailable', adm('dedupe_available'))

# jr ------------------------------------------------------------------------------------------------------
wit('JR01_closed_keys', 'unknown-journal-key', lambda w: w['publication'].__setitem__('extra', 1))
wit('JR01_closed_keys', 'missing-journal-key', lambda w: w['publication'].pop('source_record_ref'))
wit('JR02_scalar_fields', 'state-not-enum', lambda w: w['publication'].__setitem__('state', 'done'))
wit('JR02_scalar_fields', 'empty-instance', lambda w: w['publication'].__setitem__('storage_instance_id', ''))
wit('JR02_scalar_fields', 'partition-trailing-lf', lambda w: w['publication'].__setitem__('scope_partition', w['publication']['scope_partition'] + '\n'))
wit('JR02_scalar_fields', 'schema-id-other-family', lambda w: w['publication'].__setitem__('schema_id', 'pm.storage_value.s2.other.publication.v1'))
wit('JR03_receipt_presence', 'settled-without-receipt', lambda w: w['publication'].__setitem__('first_append_receipt', None))
wit('JR03_receipt_presence', 'prepared-with-receipt', lambda w: w['publication'].__setitem__('first_append_receipt', copy.deepcopy(m.build_world(w['family'], w['scope'], w['variant'])['publication']['first_append_receipt'])), state='prepared')
wit('JR04_commitment_presence', 'settled-without-commitment', lambda w: w['publication'].__setitem__('full_value_commitment', None))
wit('JR04_commitment_presence', 'appended-without-commitment', lambda w: w['publication'].__setitem__('full_value_commitment', None), state='appended')
wit('JR05_receipt_shape', 'receipt-missing-field', lambda w: w['publication']['first_append_receipt'].pop('segment_name'))
wit('JR05_receipt_shape', 'receipt-not-synced', lambda w: w['publication']['first_append_receipt'].__setitem__('durability_state', 'pending'))
wit('JR05_receipt_shape', 'receipt-string-offset', lambda w: w['publication']['first_append_receipt'].__setitem__('byte_offset', '4096'))
wit('JR06_commitment_shape', 'commitment-wrong-codec', lambda w: w['publication']['full_value_commitment'].__setitem__('codec', 'json'))
wit('JR06_commitment_shape', 'commitment-uppercase-hash', lambda w: w['publication']['full_value_commitment'].__setitem__('sha256', w['publication']['full_value_commitment']['sha256'].upper()))
wit('JR07_receipt_numbers', 'receipt-offset-float', lambda w: w['publication']['first_append_receipt'].__setitem__('byte_offset', 4096.0))
wit('JR07_receipt_numbers', 'receipt-sequence-above-uint64', lambda w: w['publication']['first_append_receipt'].__setitem__('sequence_id', 2 ** 64))
wit('JR07_receipt_numbers', 'receipt-generation-float', lambda w: w['publication']['first_append_receipt'].__setitem__('manifest_generation', 9.0))
# E5-2 = A (Jared, 2026-11-13): acknowledged_at_utc takes the EventRecord profile; offsets and lowercase z are owner-valid
# and are accepted in verify_positives (ACK_ACCEPTED).
ACK_ACCEPTED = (('plus-zero-offset', '2026-11-14T10:00:02+00:00'), ('minus-zero-offset', '2026-11-14T10:00:02-00:00'),
                ('lowercase-z', '2026-11-14T10:00:02z'), ('nonzero-offset', '2026-11-14T05:00:02-05:00'))
for _label, _value in (('trailing-lf', '2026-11-14T10:00:02Z\n'), ('hour-24', '2026-11-14T24:00:00Z'),
                       ('no-zone', '2026-11-14T10:00:02'), ('feb-30', '2026-02-30T10:00:02Z')):
    wit('JR08_ack_clock', 'ack-' + _label, lambda w, v=_value: w['publication']['first_append_receipt'].__setitem__('acknowledged_at_utc', v))


# ev ------------------------------------------------------------------------------------------------------
def _both_forms(w):
    ext = m.build_world(w['family'], w['scope'], w['variant'], w['publication']['state'], True)
    _pe(w)['payload_ref'] = _pe(ext)['payload_ref']


def _repack(w, body_bytes, media=None):
    """Replace the pack and descriptor coherently (digest, size), then apply one defect elsewhere."""
    ref = _pe(w)['payload_ref']
    old = w['storage']['packs'].pop(ref['blake3_id'])
    digest = m.blake3(body_bytes).hexdigest()
    w['storage']['packs'][digest] = dict(old, bytes=body_bytes, media_type=media or old['media_type'])
    ref.update(ref='payload:v1:' + digest, blake3_id=digest, byte_size=len(body_bytes), media_type=media or ref['media_type'])


def _pack(w):
    return w['storage']['packs'][_pe(w)['payload_ref']['blake3_id']]


def _same_length_other_body(w):
    body = m.decode_storage_value(_pack(w)['bytes'], profile=m.EVENT_VALUE)
    key = STRING_KEY[w['family']]
    body[key] = body[key][:-1] + ('2' if body[key][-1] != '2' else '3')
    raw = m.storage_value_bytes(body, profile=m.EVENT_VALUE)
    assert len(raw) == len(_pack(w)['bytes'])
    _pack(w)['bytes'] = raw


def _journal_limit_pad(f):
    """pad_corr making the inline journal exceed 16,384 bytes while the inline body stays below it."""
    base = m.build_world(f, state='prepared')
    size = len(m.storage_value_bytes(base['publication'], profile=m.EVENT_VALUE))
    return 16384 - size + 600


wit('EV01_representation', 'inline-and-descriptor', _both_forms)
wit('EV01_representation', 'null-body-null-ref', lambda w: _pe(w).__setitem__('payload', None))
wit('EV02_descriptor_schema', 'ref-uppercase-hex', lambda w: _pe(w)['payload_ref'].__setitem__('ref', _pe(w)['payload_ref']['ref'].upper().replace('PAYLOAD:V1:', 'payload:v1:')), external=True)
wit('EV02_descriptor_schema', 'ref-sha256-route', lambda w: _pe(w)['payload_ref'].__setitem__('ref', 'sha256:' + _pe(w)['payload_ref']['blake3_id']), external=True)
wit('EV02_descriptor_schema', 'id-trailing-lf', lambda w: _pe(w)['payload_ref'].__setitem__('blake3_id', _pe(w)['payload_ref']['blake3_id'] + '\n'), external=True)
wit('EV02_descriptor_schema', 'size-string', lambda w: _pe(w)['payload_ref'].__setitem__('byte_size', str(_pe(w)['payload_ref']['byte_size'])), external=True)
wit('EV02_descriptor_schema', 'size-bool', lambda w: _pe(w)['payload_ref'].__setitem__('byte_size', True), external=True)
wit('EV02_descriptor_schema', 'unknown-descriptor-key', lambda w: _pe(w)['payload_ref'].__setitem__('codec', 'x'), external=True)
wit('EV03_descriptor_size_integer', 'size-float', lambda w: _pe(w)['payload_ref'].__setitem__('byte_size', float(_pe(w)['payload_ref']['byte_size'])), external=True)
wit('EV04_route_id', 'route-names-other-body', lambda w: _pe(w)['payload_ref'].__setitem__('ref', 'payload:v1:' + m.H('other')), external=True)
wit('EV05_pack_present', 'pack-missing', lambda w: w['storage']['packs'].clear(), external=True)
wit('EV06_pack_synced', 'pack-not-synced', lambda w: _pack(w).__setitem__('pack_synced', False), external=True)
wit('EV07_index_synced', 'index-not-synced', lambda w: _pack(w).__setitem__('index_synced', False), external=True)
wit('EV08_pack_digest', 'pack-bytes-substituted', _same_length_other_body, external=True)
wit('EV09_pack_size', 'size-off-by-one', lambda w: _pe(w)['payload_ref'].__setitem__('byte_size', _pe(w)['payload_ref']['byte_size'] + 1), external=True)
wit('EV10_media_declared', 'descriptor-media-differs', lambda w: _pe(w)['payload_ref'].__setitem__('media_type', 'application/json'), external=True)
wit('EV11_media_profile', 'pack-and-descriptor-json', lambda w: (_pack(w).__setitem__('media_type', 'application/json'), _pe(w)['payload_ref'].__setitem__('media_type', 'application/json')), external=True)
wit('EV12_body_decodes', 'body-is-array', lambda w: _repack(w, m.storage_value_bytes(['not', 'an', 'object'], profile=m.EVENT_VALUE)), external=True)
wit('EV12_body_decodes', 'body-noncanonical', lambda w: _repack(w, b'\xc0\xc0'), external=True)
wit('EV13_body_physical', 'lone-surrogate-in-body', lambda w: set_field(w, STRING_KEY[w['family']], 'x\ud800'))
wit('EV14_inline_limit', 'inline-body-above-16384', lambda w: None, pad=120, families=[S, RQ])
wit('EV16_journal_limit', 'journal-above-16384-body-below', lambda w: None, pad_corr='journal')
wit('EV15_journal_physical', 'producer-sequence-above-uint64', lambda w: _pe(w).__setitem__('producer_sequence_id', 2 ** 64))

# lg ------------------------------------------------------------------------------------------------------
wit('LG01_envelope_schema', 'empty-actor', lambda w: _pe(w).__setitem__('actor_ref', ''))
wit('LG01_envelope_schema', 'unknown-envelope-key', lambda w: _pe(w).__setitem__('extra', 1))
wit('LG01_envelope_schema', 'redaction-not-enum', lambda w: _pe(w).__setitem__('redaction_profile', 'plain'))
wit('LG01_envelope_schema', 'sequence-negative', lambda w: _pe(w).__setitem__('sequence_id', -1))
wit('LG01_envelope_schema', 'sequence-string', lambda w: _pe(w).__setitem__('sequence_id', '41'))
wit('LG01_envelope_schema', 'sequence-bool', lambda w: _pe(w).__setitem__('sequence_id', True))
wit('LG01_envelope_schema', 'occurred-not-string', lambda w: _pe(w).__setitem__('occurred_at_utc', 20261114))
SIBLING = {S: 'settings.updated', RQ: RS, RS: RQ}
wit('LG02_family_type', 'sibling-event-type', lambda w: _pe(w).__setitem__('event_type', SIBLING[w['family']]))
wit('LG03_payload_schema_id', 'envelope-names-other-schema', lambda w: _pe(w).__setitem__('payload_schema_id', 'pm.event_payload.other.v1'))
wit('LG03_payload_schema_id', 'envelope-names-sibling-schema', lambda w: _pe(w).__setitem__('payload_schema_id', m.FAMILY_ROWS[SIBLING[w['family']]]['payload_schema_id'] if w['family'] != S else 'pm.settings.updated.v1'))
REQUIRED_KEY = {S: 'transaction_receipt_ref', RQ: 'request_evidence', RS: 'result_evidence'}
wit('LG04_payload_schema', 'payload-missing-required', lambda w: (_pe(w)['payload'].pop(REQUIRED_KEY[w['family']]), w['source']['result'].pop(REQUIRED_KEY[w['family']])))
wit('LG04_payload_schema', 'payload-unknown-key', lambda w: set_field(w, 'notes', 'x'))
wit('LG04_payload_schema', 'payload-version-other', lambda w: set_field(w, 'schema_version', '1.0.1'))
wit('LG04_payload_schema', 'payload-null-for-string', lambda w: set_field(w, STRING_KEY[w['family']], None))
wit('LG04_payload_schema', 'payload-array-for-string', lambda w: set_field(w, STRING_KEY[w['family']], ['x']))
wit('LG04_payload_schema', 'payload-string-over-256', lambda w: set_field(w, STRING_KEY[w['family']], 'y' * 257))
wit('LG04_payload_schema', 'settings-project-scope', lambda w: set_field(w, 'scope', m.scope_object('project')), families=[S])
wit('LG04_payload_schema', 'settings-revision-key-pattern', lambda w: (_pe(w)['payload']['before_revisions'].__setitem__('BadKey', 4), w['source']['result']['before_revisions'].__setitem__('BadKey', 4)), families=[S])
wit('LG04_payload_schema', 'settings-revision-negative', lambda w: (_pe(w)['payload']['after_revisions'].__setitem__('appearance.theme.mode', -1), w['source']['result']['after_revisions'].__setitem__('appearance.theme.mode', -1)), families=[S])
wit('LG04_payload_schema', 'settings-revision-string', lambda w: (_pe(w)['payload']['after_revisions'].__setitem__('appearance.theme.mode', '5'), w['source']['result']['after_revisions'].__setitem__('appearance.theme.mode', '5')), families=[S])
wit('LG04_payload_schema', 'settings-revision-bool', lambda w: (_pe(w)['payload']['after_revisions'].__setitem__('appearance.theme.mode', True), w['source']['result']['after_revisions'].__setitem__('appearance.theme.mode', True)), families=[S])
wit('LG04_payload_schema', 'settings-duplicate-changed-id', lambda w: set_field(w, 'changed_setting_ids', _pe(w)['payload']['changed_setting_ids'] + [_pe(w)['payload']['changed_setting_ids'][0]]), families=[S])
wit('LG04_payload_schema', 'settings-everywhere-with-client', lambda w: (_pe(w)['payload']['target'].__setitem__('client_id', 'client-1'), w['source']['result']['target'].__setitem__('client_id', 'client-1')), families=[S])
wit('LG04_payload_schema', 'settings-hash-uppercase', lambda w: set_field(w, 'after_sha256', _pe(w)['payload']['after_sha256'].upper()), families=[S])
wit('LG04_payload_schema', 'request-target-hash-short', lambda w: set_field(w, 'target_sha256', 'abc'), families=[RQ])
wit('LG04_payload_schema', 'request-context-missing-scope', lambda w: (_pe(w)['payload']['context'].pop('scope'), w['source']['result']['context'].pop('scope')), families=[RQ])
wit('LG04_payload_schema', 'request-app-scope-with-project', lambda w: (_pe(w)['payload']['context']['scope'].__setitem__('project_id', 'proj-alpha'), w['source']['result']['context']['scope'].__setitem__('project_id', 'proj-alpha')), families=[RQ], scope='application')
wit('LG04_payload_schema', 'request-expiry-not-string', lambda w: set_field(w, 'expires_at_utc', 20261114), families=[RQ])
wit('LG04_payload_schema', 'request-epoch-string', lambda w: (_pe(w)['payload']['context'].__setitem__('task_stop_epoch', '5'), w['source']['result']['context'].__setitem__('task_stop_epoch', '5')), families=[RQ])
wit('LG04_payload_schema', 'resolution-decision-pending', lambda w: set_field(w, 'decision', 'pending'), families=[RS])
wit('LG04_payload_schema', 'resolution-digest-uppercase', lambda w: set_field(w, 'request_sha256', _pe(w)['payload']['request_sha256'].upper()), families=[RS])
wit('LG04_payload_schema', 'resolution-evidence-revision-negative', lambda w: (_pe(w)['payload']['person_evidence'].__setitem__('revision', -1), w['source']['result']['person_evidence'].__setitem__('revision', -1)), families=[RS])
for _label, _value in (('trailing-lf', m.OCCURRED + '\n'), ('feb-30', '2026-02-30T10:00:00Z'), ('hour-24', '2026-11-14T24:00:00Z'),
                       ('no-zone', '2026-11-14T10:00:00.250'), ('slash-date', '2026/11/14T10:00:00Z'), ('bad-leap-second', '2026-11-14T10:00:60Z')):
    wit('LG05_occurred_clock', 'occurred-' + _label, lambda w, v=_value: (_pe(w).__setitem__('occurred_at_utc', v), w['source'].__setitem__('accepted_at_utc', v)), families=[S, RQ])
for _row, _field in (('LG06_observed_clock', 'observed_at_utc'), ('LG07_persisted_clock', 'persisted_at_utc')):
    for _label, _value in (('plus-zero', '2026-11-14T10:00:01+00:00'), ('lowercase-z', '2026-11-14T10:00:01z'),
                           ('offset', '2026-11-14T12:00:01+02:00'), ('trailing-lf', '2026-11-14T10:00:01Z\n'),
                           ('no-zone', '2026-11-14T10:00:01'), ('minus-zero', '2026-11-14T10:00:01-00:00')):
        wit(_row, _field + '-' + _label, lambda w, v=_value, k=_field: (_pe(w).__setitem__(k, v), w['storage']['issued'].__setitem__(k, v)), state='prepared')
wit('LG08_sequence_uint64', 'sequence-float', lambda w: (_pe(w).__setitem__('sequence_id', 41.0), w['storage']['issued'].__setitem__('sequence_id', 41.0)), state='prepared')
wit('LG08_sequence_uint64', 'sequence-above-uint64', lambda w: (_pe(w).__setitem__('sequence_id', 2 ** 64), w['storage']['issued'].__setitem__('sequence_id', 2 ** 64)), state='prepared')
wit('LG09_producer_sequence', 'producer-sequence-float', lambda w: (_pe(w).__setitem__('producer_sequence_id', 7.0), w['source'].__setitem__('producer_sequence_id', 7.0)))


def _int_slot(w, value):
    f = w['family']
    path, _uri, _min = m.INT_SLOTS[f][0]
    concrete = m.slot_values(_pe(w)['payload'], path)[0][0]
    for target in (_pe(w)['payload'], w['source']['result']):
        node = target
        for part in concrete[:-1]:
            node = node[part]
        node[concrete[-1]] = value


def _map_slot(w, value):
    for target in (_pe(w)['payload'], w['source']['result']):
        target['after_revisions']['appearance.theme.mode'] = value


wit('LG10_payload_integers', 'payload-slot-float', lambda w: _int_slot(w, 3.0))
wit('LG10_payload_integers', 'payload-map-slot-float', lambda w: _map_slot(w, 5.0), families=[S])
wit('LG11_producer_route', 'producer-sequence-2^53+1', lambda w: (_pe(w).__setitem__('producer_sequence_id', 2 ** 53 + 1), w['source'].__setitem__('producer_sequence_id', 2 ** 53 + 1)))
wit('LG11_producer_route', 'payload-slot-2^53+1', lambda w: _int_slot(w, 2 ** 53 + 1))
wit('LG12_replay_current', 'replay-only-current-write', lambda w: _pe(w).__setitem__('replay_policy', 'projector_replay_only'))
wit('LG13_replay_family', 'append-once-policy', lambda w: _pe(w).__setitem__('replay_policy', 'append_once'))
wit('LG13_replay_family', 'dedupe-by-event-id-policy', lambda w: _pe(w).__setitem__('replay_policy', 'dedupe_by_event_id'))
wit('LG14_migration_null', 'migration-id-set', lambda w: _pe(w)['migration'].__setitem__('migration_id', 'mig-1'))
wit('LG14_migration_null', 'compatibility-alias-set', lambda w: _pe(w)['migration'].__setitem__('compatibility_event_type', 'settings.updated'))
wit('LG15_redaction_family', 'redaction-no-secrets', lambda w: (_pe(w).__setitem__('redaction_profile', 'no_secrets'), w['source'].__setitem__('redaction_profile', 'no_secrets')))
wit('LG15_redaction_family', 'redaction-redacted', lambda w: (_pe(w).__setitem__('redaction_profile', 'redacted'), w['source'].__setitem__('redaction_profile', 'redacted')))
for _label, _value in (('trailing-lf', m.EXPIRES + '\n'), ('feb-30', '2026-02-30T10:30:00Z'), ('hour-24', '2026-11-14T24:00:00Z'),
                       ('no-zone', '2026-11-14T10:30:00')):
    wit('LG16_payload_clocks', 'expiry-' + _label, lambda w, v=_value: set_field(w, 'expires_at_utc', v), families=[RQ])


# id ------------------------------------------------------------------------------------------------------
def _wrong_key(w):
    key = m.physical_key(w['family'], 'other-store', w['publication']['scope_partition'], w['publication']['owner_operation_id'])
    w['storage']['journal_key'] = key
    w['publication']['physical_key'] = key


wit('ID00_source_scope', 'source-scope-incoherent', lambda w: w['source'].__setitem__('project_id', None), scope='project', families=[RQ, RS])
wit('ID00_source_scope', 'source-app-with-project', lambda w: w['source'].__setitem__('project_id', 'proj-x'), families=[S])
wit('ID01_partition', 'partition-substituted', lambda w: w['publication'].__setitem__('scope_partition', 'project~b3RoZXI'))
wit('ID02_key_actual', 'storage-key-off-formula', _wrong_key)
wit('ID03_key_copy', 'journal-key-copy-substituted', lambda w: w['publication'].__setitem__('physical_key', w['publication']['physical_key'] + '00'))
wit('ID04_instance_copy', 'instance-copy-substituted', lambda w: w['publication'].__setitem__('storage_instance_id', 'other-store'))
wit('ID05_event_id', 'event-id-substituted', lambda w: _pe(w).__setitem__('event_id', 'evt-random-1'))
wit('ID05_event_id', 'event-id-other-instance', lambda w: _pe(w).__setitem__('event_id', m.event_id_of('other-store', w['source']['owner_operation_id'], w['family'])))
wit('ID06_idempotency_key', 'key-with-suffix', lambda w: _pe(w).__setitem__('idempotency_key', _pe(w)['idempotency_key'] + ':1'))
wit('ID06_idempotency_key', 'app-key-uses-project-recipe', lambda w: _pe(w).__setitem__('idempotency_key', m.idempotency_key_of('project', w['source']['server_id'], w['source']['owner_operation_id'])), scope='application')
wit('ID06_idempotency_key', 'app-key-other-server', lambda w: _pe(w).__setitem__('idempotency_key', m.idempotency_key_of('application', 'server-9', w['source']['owner_operation_id'])), scope='application')
wit('ID07_operation_journal', 'journal-operation-reminted', lambda w: w['publication'].__setitem__('owner_operation_id', 'op:reminted'))
wit('ID08_record_journal', 'journal-record-substituted', lambda w: w['publication'].__setitem__('source_record_ref', 'src:other'))
wit('ID09_receipt_journal', 'journal-receipt-substituted', lambda w: w['publication'].__setitem__('source_receipt_ref', 'rcpt:other'))

# sj ------------------------------------------------------------------------------------------------------
for _row, _field, _value, _kw in (
        ('SJ02_project_id', 'project_id', 'proj-beta', dict(scope='project', families=[RQ, RS])),
        ('SJ03_thread_id', 'thread_id', 'thread-9', {}), ('SJ04_run_id', 'run_id', 'run-x', {}),
        ('SJ05_node_id', 'node_id', 'node-x', {}), ('SJ06_attempt_id', 'attempt_id', 'att-x', {}),
        ('SJ07_actor_ref', 'actor_ref', 'user:mallory', {}), ('SJ08_requested_account', 'requested_account_ref', 'acct-x', {}),
        ('SJ09_effective_account', 'effective_account_ref', 'acct-y', {}), ('SJ10_occurred_at', 'occurred_at_utc', '2026-11-14T10:05:00Z', dict(families=[S, RQ])),
        ('SJ11_producer_sequence', 'producer_sequence_id', 8, {}), ('SJ12_correlation', 'correlation_id', 'corr-x', {}),
        ('SJ13_causation', 'causation_event_id', 'evt-c', {}), ('SJ14_parent', 'parent_event_id', 'evt-p', {})):
    wit(_row, 'event-' + _field + '-substituted', lambda w, k=_field, v=_value: _pe(w).__setitem__(k, v), state='prepared', **_kw)
wit('SJ10_occurred_at', 'event-occurred-substituted-expired', lambda w: _pe(w).__setitem__('occurred_at_utc', '2026-11-14T10:45:00Z'), state='prepared', families=[RS], variant='expired')
wit('SJ15_redaction_source', 'source-redaction-differs', lambda w: w['source'].__setitem__('redaction_profile', 'redacted'), state='prepared')
ALT = {S: ('redacted_summary_ref', 'settings-summary:txn-other'), RQ: ('tool_id', 'tool.other'), RS: ('return_context_ref', 'return:other')}
wit('SJ20_payload_result', 'result-differs-from-payload', lambda w: w['source']['result'].__setitem__(ALT[w['family']][0], ALT[w['family']][1]), state='prepared')
wit('SJ21_source_owner', 'source-adapter-substituted', lambda w: w['source'].__setitem__('owner', 'OtherOwner::write'), state='prepared')
wit('SJ22_component_family', 'component-other-family', lambda w: w['source'].__setitem__('component', 'other.family'), state='prepared')
wit('SJ23_component_subject', 'component-other-subject', lambda w: w['source'].__setitem__('component_subject', 'other-subject'), state='prepared')
wit('SJ24_result_accepted', 'source-result-rejected', lambda w: w['source'].__setitem__('result_status', 'rejected'), state='prepared')

# st ------------------------------------------------------------------------------------------------------
wit('ST01_sequence_issued', 'sequence-copy-substituted', lambda w: _pe(w).__setitem__('sequence_id', 42), state='prepared')
wit('ST02_observed_issued', 'observed-copy-substituted', lambda w: _pe(w).__setitem__('observed_at_utc', '2026-11-14T11:00:09Z'), state='prepared')
wit('ST03_persisted_issued', 'persisted-copy-substituted', lambda w: _pe(w).__setitem__('persisted_at_utc', '2026-11-14T11:00:09Z'), state='prepared')
wit('ST04_receipt_event', 'receipt-other-event', lambda w: w['publication']['first_append_receipt'].__setitem__('event_id', 'evt-other'))
wit('ST05_receipt_sequence', 'receipt-other-sequence', lambda w: w['publication']['first_append_receipt'].__setitem__('sequence_id', 40))
wit('ST06_receipt_issued', 'receipt-offset-forged', lambda w: w['publication']['first_append_receipt'].__setitem__('byte_offset', 5000))
wit('ST06_receipt_issued', 'receipt-never-issued', lambda w: w['storage']['receipts'].clear(), state='appended')
wit('ST07_commitment_value', 'commitment-hash-forged', lambda w: w['publication']['full_value_commitment'].__setitem__('sha256', m.H('forged')))
wit('ST08_commitment_issued', 'commitment-never-issued', lambda w: w['storage']['commitments'].clear())


# fx: one owner fact changed; a payload field the predicate reads changes with the source result ----------------
def fx(row, label, mutate, families, variant=None, scope=None):
    # Prepared state: no full-value commitment yet, so a coherent owner-result change is this row's defect alone.
    wit(row, label, mutate, families=families, variant=variant, scope=scope, state='prepared')


def setf(*path_value):
    """Change one nested owner-result field coherently (payload and source result)."""
    *path, value = path_value

    def mut(w):
        for target in (_pe(w)['payload'], w['source']['result']):
            node = target
            for part in path[:-1]:
                node = node[part]
            node[path[-1]] = copy.deepcopy(value)
    return mut


def fact(*path_value):
    *path, value = path_value

    def mut(w):
        node = facts(w)
        for part in path[:-1]:
            node = node[part]
        node[path[-1]] = copy.deepcopy(value)
    return mut


# settings.layer.changed (CV-2300 items)
def _device(w):
    tgt = dict(level='device', level_key='config:device:' + m.hx('client-1'), computer_key=None, project_id=None,
               client_id='client-1', provider_id=None, account_id=None)
    setf('target', tgt)(w)
    facts(w)['committed_target'] = copy.deepcopy(tgt)
    w['source']['component_subject'] = tgt['level_key']


fx('SL01_server_writer_level', 'device-level-has-no-server-writer', _device, [S])
fx('SL02_sole_writer', 'payload-server-not-sole-writer', fact('sole_writer_server_id', 'server-9'), [S], variant='computer_server')
fx('SL02_sole_writer', 'host-level-written-by-other-server', fact('sole_writer_server_id', 'server-2'), [S], variant='computer_host')
fx('SL03_writer_role', 'follower-mirror-commits', fact('writer_role', 'follower_mirror'), [S])
fx('SL03_writer_role', 'client-cache-commits', fact('writer_role', 'client_cache'), [S])
fx('SL04_target_join', 'target-other-computer', fact('committed_target', 'computer_key', {'kind': 'server', 'id': 'server-4'}), [S], variant='computer_server')
fx('SL05_changed_nonempty', 'transaction-committed-nothing',
   lambda w: (fact('committed_rows', {})(w), setf('changed_setting_ids', [])(w), setf('before_revisions', {})(w), setf('after_revisions', {})(w)), [S])
fx('SL07_revision_keys', 'changed-ids-omit-a-committed-row',
   lambda w: (setf('before_revisions', 'appearance.theme.accent', 2)(w), setf('after_revisions', 'appearance.theme.accent', 3)(w),
              facts(w)['committed_rows'].__setitem__('appearance.theme.accent', (2, 3))), [S])
fx('SL07_revision_keys', 'revision-maps-omit-a-changed-id',
   lambda w: (setf('changed_setting_ids', _pe(w)['payload']['changed_setting_ids'] + ['appearance.theme.accent'])(w)), [S])
fx('SL08_revision_before', 'before-revision-not-prior', setf('before_revisions', 'appearance.theme.mode', 3), [S])
fx('SL09_revision_after', 'after-revision-not-committed', lambda w: (setf('after_revisions', 'appearance.theme.mode', 6)(w), facts(w)['committed_rows'].__setitem__('appearance.theme.mode', (4, 5))), [S])
fx('SL10_revision_step', 'cas-skipped-a-revision', lambda w: (setf('after_revisions', 'appearance.theme.mode', 6)(w), facts(w)['committed_rows'].__setitem__('appearance.theme.mode', (4, 6))), [S])
fx('SL11_snapshot_before', 'before-hash-not-snapshot', fact('snapshot_before_sha256', m.H('other-before')), [S])
fx('SL12_snapshot_after', 'after-hash-not-snapshot', fact('snapshot_after_sha256', m.H('other-after')), [S])
fx('SL13_effect_nonempty', 'no-op-equal-hashes', lambda w: (setf('after_sha256', _pe(w)['payload']['before_sha256'])(w), fact('snapshot_after_sha256', _pe(w)['payload']['before_sha256'])(w)), [S])
fx('SL14_home_generation', 'stale-writer-generation', fact('level_head_generation', 4), [S])
fx('SL15_receipt_ref', 'receipt-ref-other-transaction', setf('transaction_receipt_ref', 'settings-receipt:txn-9'), [S])
fx('SL16_summary_ref', 'summary-other-transaction', fact('summary_ref', 'settings-summary:txn-9'), [S])
fx('SL17_summary_redacted', 'summary-not-redacted', fact('summary_redacted', False), [S])

# approval.chat_tool_requested (CV-2301 items)
fx('RQ01_record_pending', 'record-already-approved', fact('record', 'decision', 'approved'), [RQ])
fx('RQ02_record_unresolved', 'record-has-resolution', fact('record', 'resolution_ref', 'resolution:req-1'), [RQ])
fx('RQ03_approval_id', 'approval-id-not-record', fact('record', 'request_id', 'req-9'), [RQ])
fx('RQ04_run', 'run-not-record', fact('record', 'run_id', 'run-9'), [RQ])
fx('RQ05_tool', 'tool-not-record', fact('record', 'tool_id', 'tool.other'), [RQ])
fx('RQ06_target_ref', 'target-ref-not-record', fact('record', 'target_ref', 'target:other'), [RQ])
fx('RQ07_target_hash', 'target-hash-not-record', fact('record', 'target_sha256', m.H('other-target')), [RQ])
fx('RQ08_context_scope', 'context-scope-other-server', fact('record', 'scope', 'server_id', 'server-9'), [RQ])
fx('RQ09_context_thread', 'context-thread-not-record', fact('record', 'thread_id', 'thread-9'), [RQ])
fx('RQ10_context_instance', 'context-instance-not-storage', fact('storage_instance_id', 'other-store'), [RQ])
fx('RQ11_scope_stop', 'scope-stop-epoch-stale', fact('record', 'scope_stop_epoch', 3), [RQ])
fx('RQ12_task_stop', 'task-stop-epoch-stale', fact('record', 'task_stop_epoch', 6), [RQ])
fx('RQ13_permission_snapshot', 'permission-snapshot-other', fact('record', 'permission_snapshot_ref', 'perm-snapshot:snap-9'), [RQ])
fx('RQ14_request_source', 'request-source-other', fact('record', 'request_source_ref', 'request-source:req-9'), [RQ])
fx('RQ15_actor', 'context-actor-not-source', setf('context', 'actor_ref', 'agent:run-9'), [RQ])
fx('RQ16_scope_kind', 'context-project-not-source', lambda w: (setf('context', 'scope', 'project_id', 'proj-beta')(w), setf('context', 'scope', 'scope_partition', m.partition_of('project', 'proj-beta'))(w), fact('record', 'scope', copy.deepcopy(_pe(w)['payload']['context']['scope']))(w)), [RQ], scope='project')
fx('RQ17_expiry_future', 'expiry-before-request', setf('expires_at_utc', '2026-11-14T09:00:00Z'), [RQ])
fx('RQ17_expiry_future', 'expiry-equals-request', setf('expires_at_utc', '2026-11-14T10:00:00.25Z'), [RQ])
fx('RQ18_human_decision', 'mode-authority-covers-ask', fact('human_decision_required', False), [RQ])


# approval.chat_tool_resolved (CV-2302 items)
def _request_payload_change(key, value):
    def mut(w):
        facts(w)['request']['payload'][key] = value
    return mut


fx('RS01_request_present', 'no-paired-request', fact('request', None), [RS])
fx('RS02_request_settled', 'request-only-prepared', fact('request', 'state', 'prepared'), [RS])
fx('RS02_request_settled', 'request-only-appended', fact('request', 'state', 'appended'), [RS])
fx('RS03_approval_join', 'paired-request-other-approval', lambda w: (_request_payload_change('approval_id', 'req-9')(w), setf('request_sha256', m.request_digest(facts(w)['request']['payload']))(w)), [RS])
fx('RS04_record_join', 'record-other-request', fact('record', 'request_id', 'req-9'), [RS])
fx('RS05_request_digest', 'digest-not-request', setf('request_sha256', m.H('other-request')), [RS])
fx('RS05_request_digest', 'digest-of-changed-request', lambda w: (_request_payload_change('tool_id', 'tool.other')(w)), [RS])
fx('RS06_decision_terminal', 'record-still-pending', fact('record', 'decision', 'pending'), [RS])
fx('RS06_decision_terminal', 'record-other-decision', fact('record', 'decision', 'declined'), [RS], variant='approved')
fx('RS07_resolution_ref', 'record-resolution-other', fact('record', 'resolution_ref', 'resolution:req-9'), [RS])
fx('RS08_causation', 'causation-not-request-event', lambda w: (w['source'].__setitem__('causation_event_id', 'evt-other'), _pe(w).__setitem__('causation_event_id', 'evt-other')), [RS])
fx('RS09_same_scope', 'request-other-thread', fact('request', 'thread_id', 'thread-9'), [RS])
fx('RS09_same_scope', 'request-other-run', fact('request', 'run_id', 'run-9'), [RS])
fx('RS10_expiry_order', 'approved-after-expiry', lambda w: (w['source'].__setitem__('accepted_at_utc', '2026-11-14T10:31:00Z'), _pe(w).__setitem__('occurred_at_utc', '2026-11-14T10:31:00Z')), [RS], variant='approved')
fx('RS10_expiry_order', 'expired-before-expiry', lambda w: (w['source'].__setitem__('accepted_at_utc', '2026-11-14T10:29:59Z'), _pe(w).__setitem__('occurred_at_utc', '2026-11-14T10:29:59Z')), [RS], variant='expired')
fx('RS11_human_decision', 'agent-approves-own-ask', fact('actual_human', False), [RS], variant='approved')
fx('RS11_human_decision', 'mode-declines-for-person', fact('actual_human', False), [RS], variant='declined')
fx('RS12_return_context', 'return-context-other', setf('return_context_ref', 'return:thread-1/turn-10'), [RS])
fx('RS13_single_resolution', 'second-resolution', fact('prior_resolution', 'resolution:req-1:first'), [RS])


# --- enumeration -------------------------------------------------------------------------------------------
TABLE_OF = {row[0]: table_of(row[0]) for phase, (_c, _t, rows) in m.ROWS.items() for row in rows}


def _world(f, spec):
    scope = spec.get('scope') or m.SCOPES[f][0]
    variant = spec.get('variant')
    if scope not in m.SCOPES[f] or (variant is not None and variant not in m.VARIANTS[f]):
        return None
    pad_corr = spec.get('pad_corr', 0)
    if pad_corr == 'journal':
        pad_corr = _journal_limit_pad(f)
    return m.build_world(f, scope, variant, spec.get('state', 'settled'), spec.get('external', False), spec.get('pad', 0), pad_corr)


def verify_witnesses():
    """(case_id, family, world, expected) for every single-defect publication witness."""
    out = []
    for row, items in W.items():
        table = TABLE_OF[row]
        for label, spec, mutate in items:
            for f in spec.get('families') or F:
                w = _world(f, spec)
                if w is None:
                    continue
                mutate(w)
                out.append((f'verify/{f}/{w["scope"]}/{row}/{label}', f, w, ('refuse', table, row)))
    return out


def _size_body(w):
    return len(next(iter(w['storage']['packs'].values()))['bytes'])


def verify_positives():
    out = []
    for f in F:
        for scope in m.SCOPES[f]:
            for variant in m.VARIANTS[f]:
                for state in ('prepared', 'appended', 'settled'):
                    for external in (False, True):
                        w = m.build_world(f, scope, variant, state, external)
                        out.append((f'verify/{f}/{scope}/{variant}/{state}/{"external" if external else "inline"}', f, w, ('accept',)))
            # E5-2 = A: an owner-valid receipt acknowledgement time with an offset or a lowercase z is accepted
            for label, value in ACK_ACCEPTED:
                w = m.build_world(f, scope, None, 'settled', False)
                w['publication']['first_append_receipt']['acknowledged_at_utc'] = value
                for issued in w['storage']['receipts'].values():  # Storage issued that receipt (ST06 join)
                    issued['acknowledged_at_utc'] = value
                out.append((f'verify/{f}/{scope}/settled/receipt-ack-{label}', f, w, ('accept',)))
        if f == RQ:
            for label, value in (('offset', '2026-11-14T05:30:00-05:00'), ('lowercase-z', '2026-11-14T10:30:00z'),
                                 ('long-fraction', '2026-11-14T10:30:00.123456789012Z')):
                w = m.build_world(f, state='prepared')   # before the first receipt: the payload is still the owner's to set
                set_field(w, 'expires_at_utc', value)
                out.append((f'verify/{f}/expiry-owner-valid-{label}', f, w, ('accept',)))
        # Inline journal of exactly 16,384 bytes accepted, 16,385 refused at EV16 (correlation_id grows in the
        # source and the event alike).
        base = len(m.storage_value_bytes(m.build_world(f, state='prepared')['publication'], profile=m.EVENT_VALUE))
        found = {}
        for corr in range(16384 - base - 40, 16384 - base + 40):
            w = m.build_world(f, state='prepared', pad_corr=corr)
            found.setdefault(len(m.storage_value_bytes(w['publication'], profile=m.EVENT_VALUE)), corr)
        assert 16384 in found and 16385 in found, (f, sorted(found)[:3])
        out.append((f'verify/{f}/boundary/inline-journal-16384', f, m.build_world(f, state='prepared', pad_corr=found[16384]), ('accept',)))
        out.append((f'verify/{f}/boundary/inline-journal-16385', f, m.build_world(f, state='prepared', pad_corr=found[16385]),
                    ('refuse', TABLE_OF['EV16_journal_limit'], 'EV16_journal_limit')))
        if f in (S, RQ):
            # External SP-337 body of exactly 16,385 bytes (pad adds whole entries, fine adds single bytes).
            sizes = {}
            pad = 0
            while _size_body(m.build_world(f, state='settled', external=True, pad=pad + 1)) <= 16385 - 200:
                pad += 1
            for p in (pad, pad + 1):
                for fine in range(0, 230):
                    sizes.setdefault(_size_body(m.build_world(f, state='settled', external=True, pad=p, fine=fine)), (p, fine))
                if 16385 in sizes:
                    break
            assert 16385 in sizes, (f, min(sizes), max(sizes))
            pad, fine = sizes[16385]
            w = m.build_world(f, state='settled', external=True, pad=pad, fine=fine)
            assert _size_body(w) == 16385
            out.append((f'verify/{f}/boundary/external-body-16385', f, w, ('accept',)))
    return out


def incoming_of(w):
    return copy.deepcopy(m.logical_of(w))


def retry_cases():
    out = []
    for f in F:
        for scope in m.SCOPES[f]:
            for external in (False, True):
                w = m.build_world(f, scope, None, 'settled', external)
                out.append((f'retry/{f}/{scope}/{external}/identical', f, (w, incoming_of(w)), ('accept',)))
        w = m.build_world(f)
        inc = incoming_of(w)
        inc.update(sequence_id=99, observed_at_utc='2027-01-01T00:00:00Z', persisted_at_utc='2027-01-01T00:00:01Z')
        out.append((f'retry/{f}/storage-metadata-not-semantic', f, (w, inc), ('accept',)))
        w = m.build_world(f, state='prepared')
        out.append((f'retry/{f}/prepared-original-resolves', f, (w, incoming_of(w)), ('accept',)))

        def neg(label, row, wmut=None, imut=None, state='settled'):
            w = m.build_world(f, state=state)
            inc = incoming_of(w)
            if wmut:
                wmut(w)
            if imut:
                imut(inc)
            out.append((f'retry/{f}/{label}', f, (w, inc), ('refuse', 'ry', row)))
        neg('replay-only-retry', 'RY01_incoming_policy', imut=lambda i: i.__setitem__('replay_policy', 'projector_replay_only'))
        neg('dedupe-unavailable', 'RY02_dedupe_available', wmut=lambda w: w['admission'].__setitem__('dedupe_available', False))
        neg('incoming-payload-missing-field', 'RY03_incoming_shape', imut=lambda i: i['payload'].pop(REQUIRED_KEY[f]))
        neg('incoming-producer-sequence-float', 'RY04_incoming_numbers', imut=lambda i: i.__setitem__('producer_sequence_id', 7.0))
        neg('other-scoped-identity', 'RY05_original_present', imut=lambda i: i.__setitem__('idempotency_key', i['idempotency_key'] + '00'))
        neg('original-commitment-lost', 'RY06_original_verified', wmut=lambda w: w['storage']['commitments'].clear())
        neg('semantic-field-changed', 'RY07_semantic_equal', imut=lambda i: i['payload'].__setitem__(ALT[f][0], ALT[f][1]))
        neg('new-clock-on-retry', 'RY07_semantic_equal', imut=lambda i: i.__setitem__('occurred_at_utc', '2026-11-14T10:10:00Z'))
        neg('new-producer-sequence-on-retry', 'RY07_semantic_equal', imut=lambda i: i.__setitem__('producer_sequence_id', 8))
        if f == RS:
            # A second, different resolution of the same approval reuses the operation identity and conflicts.
            neg('second-resolution-other-decision', 'RY07_semantic_equal', imut=lambda i: i['payload'].__setitem__('decision', 'declined'))
    return out


def transition_cases():
    out = []

    def pub(f, state, external=False):
        return m.build_world(f, None, None, state, external)['publication'] if state != 'absent' else None
    for f in F:
        for prior_state, next_state in (('absent', 'prepared'), ('prepared', 'appended'), ('appended', 'settled')):
            for external in (False, True):
                w = m.build_world(f, None, None, next_state, external)
                prior = pub(f, prior_state, external=external)
                t = dict(world=w, prior=prior, expected=copy.deepcopy(prior), proposed=w['publication'], cleanup=None)
                out.append((f'transition/{f}/{prior_state}-{next_state}/{external}', f, t, ('accept',)))
        for state in ('prepared', 'appended', 'settled'):
            w = m.build_world(f, state=state)
            t = dict(world=w, prior=w['publication'], expected=copy.deepcopy(w['publication']), proposed=copy.deepcopy(w['publication']), cleanup=None)
            out.append((f'transition/{f}/same-state-{state}-read-only', f, t, ('accept',)))
        w = m.build_world(f, state='prepared')
        out.append((f'transition/{f}/absent-absent-abort-without-effect', f, dict(world=w, prior=None, expected=None, proposed=None, cleanup=None), ('accept',)))
        w = m.build_world(f, state='settled')
        t = dict(world=w, prior=w['publication'], expected=copy.deepcopy(w['publication']), proposed=None, cleanup=cleanup_request())
        out.append((f'transition/{f}/settled-cleanup', f, t, ('accept',)))

        def neg(label, row, prior_state, next_state, mut=None, cleanup=None):
            w = m.build_world(f, state=next_state) if next_state != 'absent' else m.build_world(f, state='settled')
            prior = pub(f, prior_state)
            t = dict(world=w, prior=prior, expected=copy.deepcopy(prior), proposed=w['publication'] if next_state != 'absent' else None, cleanup=cleanup)
            if mut:
                mut(t)
            out.append((f'transition/{f}/{label}', f, t, ('refuse', 'tr', row)))
        neg('stale-cas', 'TR01_cas_expected', 'prepared', 'appended', lambda t: t.__setitem__('expected', None))
        for a, b in (('absent', 'appended'), ('settled', 'prepared'), ('prepared', 'absent'), ('prepared', 'settled'),
                     ('absent', 'settled'), ('appended', 'absent'), ('appended', 'prepared'), ('settled', 'appended')):
            neg(f'illegal-{a}-to-{b}', 'TR02_edge_legal', a, b)
        neg('frozen-event-mutated', 'TR03_frozen_event', 'prepared', 'appended',
            lambda t: (t['prior']['prepared_event'].__setitem__('correlation_id', 'corr-old'), t.__setitem__('expected', copy.deepcopy(t['prior']))))
        neg('frozen-copy-mutated', 'TR04_frozen_copies', 'prepared', 'appended',
            lambda t: (t['prior'].__setitem__('source_receipt_ref', 'rcpt:old'), t.__setitem__('expected', copy.deepcopy(t['prior']))))
        neg('forged-receipt-on-append', 'TR05_proposed_verified', 'prepared', 'appended',
            lambda t: t['proposed']['first_append_receipt'].__setitem__('byte_offset', 5000))
        neg('drain-after-writer-withdrawal', 'TR05_proposed_verified', 'prepared', 'appended',
            lambda t: t['world']['admission'].__setitem__('writer_enabled', False))
        bad = cleanup_request()
        bad['trigger'] = 'age_expired'
        neg('cleanup-by-age', 'TR06_cleanup_authorized', 'settled', 'absent', cleanup=bad)
        neg('cleanup-without-request', 'TR06_cleanup_authorized', 'settled', 'absent', cleanup=None)
    return out


def cleanup_request():
    return dict(policy_ref=m.JOURNAL_POLICY, trigger='owning_data_deleted', original_state='settled', pending_result=False,
                append_unresolved=False, ack_unresolved=False, deletes_receipt=False, recovery_anchor=False, live_reference=False,
                hold=False, backup_settled=True, as_index=False)


def cleanup_cases():
    out = []
    for f in F:
        out.append((f'cleanup/{f}/eligible', f, cleanup_request(), ('accept',)))
        for row, key, value in (('CL01_policy_bound', 'policy_ref', 'RP-EVENT-INDEX-SOURCE'), ('CL02_policy_eligible', 'trigger', 'age_expired'),
                                ('CL02_policy_eligible', 'trigger', 'count_exceeded'), ('CL02_policy_eligible', 'trigger', 'thread_deleted_purge_due'),
                                ('CL03_settled_only', 'original_state', 'appended'),
                                ('CL04_pending_released', 'pending_result', True), ('CL05_append_resolved', 'append_unresolved', True),
                                ('CL06_ack_resolved', 'ack_unresolved', True), ('CL07_receipt_kept', 'deletes_receipt', True),
                                ('CL08_recovery_anchor', 'recovery_anchor', True), ('CL09_live_reference', 'live_reference', True),
                                ('CL10_hold_clear', 'hold', True), ('CL11_backup_settled', 'backup_settled', False), ('CL12_not_index', 'as_index', True)):
            r = cleanup_request()
            r[key] = value
            out.append((f'cleanup/{f}/{key}-{value}', f, r, ('refuse', TABLE_OF[row], row)))
    return out


def sealed(f, scope=None, external=False, variant=None):
    return m.seal_write_receipt(m.build_world(f, scope, variant, 'settled', external))


def retained_cases():
    out = []
    for f in F:
        for scope in m.SCOPES[f]:
            for external in (False, True):
                w = sealed(f, scope, external)
                out.append((f'retained/{f}/{scope}/{external}', f, (w, m.default_read(w)), ('accept',)))
        w = sealed(f)
        w['admission'].update(producer_adopted=False, writer_enabled=False, permission_current=False, stop_clear=False)
        w['live'] = dict(source_revision=99, route='moved', object='deleted-live')
        out.append((f'retained/{f}/after-live-change-and-writer-withdrawal', f, (w, m.default_read(w)), ('accept',)))

        def neg(label, row, wmut=None, rmut=None):
            w = sealed(f)
            read = m.default_read(w)
            if wmut:
                wmut(w)
            if rmut:
                rmut(read)
            out.append((f'retained/{f}/{label}', f, (w, read), ('refuse', TABLE_OF[row], row)))
        neg('missing-receipt', 'RR01_receipt_present', lambda w: w['storage']['sealed'].clear())
        neg('receipt-at-other-locator', 'RR01_receipt_present', lambda w: w['storage']['sealed'][0].__setitem__('locator', w['storage']['journal_key'] + '00'))
        neg('ambiguous-receipts', 'RR02_receipt_unique', lambda w: w['storage']['sealed'].append(copy.deepcopy(w['storage']['sealed'][0])))
        neg('receipt-for-another-original', 'RR03_receipt_binding', lambda w: w['storage']['sealed'][0]['binding'].__setitem__('event_id', 's2dl300@1:other'))
        neg('unknown-recipe', 'RR04_recipe_known', lambda w: w['storage']['sealed'][0]['recipe'].__setitem__('registry_revision', '2026-10-09.1'))
        other = F[(F.index(f) + 1) % len(F)]
        neg('sibling-family-recipe', 'RR05_recipe_edition', lambda w, o=other: w['storage']['sealed'][0].__setitem__('recipe', dict(m.RECIPES[(o, m.SCOPES[o][0])].__dict__)))
        neg('original-commitment-lost', 'RR06_original_verified', lambda w: w['storage']['commitments'].clear())
        neg('reader-withdrawn', 'RD01_reader_enabled', rmut=lambda r: r.__setitem__('reader_enabled', False))
        neg('permission-withdrawn', 'RD02_read_permission', rmut=lambda r: r.__setitem__('read_permission', False))
        neg('owning-data-deleted', 'RD03_not_deleted', rmut=lambda r: r.__setitem__('deleted', True))
        neg('effect-through-reader', 'RD04_read_only', rmut=lambda r: r.__setitem__('requested_effects', 1))
        neg('token-missing-snapshot', 'RD05_token_schema', rmut=lambda r: r['token'].pop('redb_snapshot_id'))
        neg('token-extra-field', 'RD05_token_schema', rmut=lambda r: r['token'].__setitem__('covered', [0, 41]))
        neg('token-other-instance', 'RD06_token_instance', rmut=lambda r: r['token'].__setitem__('storage_instance_id', '00000000-0000-4000-8000-0000000000b9'))
        neg('frontier-moved', 'RD07_token_frontier', rmut=lambda r: r['live'].__setitem__('frontier_revision', 42))
        neg('frontier-hash-changed', 'RD07_token_frontier', rmut=lambda r: r['live'].__setitem__('frontier_sha256', m.H('frontier-41b')))
        neg('generation-replaced', 'RD08_token_generation', rmut=lambda r: r['live'].__setitem__('generation_id', 'eig_' + m.H('generation-5')))
        neg('generation-degraded', 'RD08_token_generation', rmut=lambda r: r['live'].__setitem__('healthy', False))
        neg('snapshot-substituted', 'RD09_token_snapshot', rmut=lambda r: r['live'].__setitem__('snapshot_id', 'snap-tx-2'))
        neg('other-partition-selection', 'RD10_selection', rmut=lambda r: r['selection'].__setitem__('scope_partition', 'project~b3RoZXI'))
        neg('sibling-type-selection', 'RD10_selection', rmut=lambda r: r['selection'].__setitem__('event_type', SIBLING[f]))
        neg('reader-persists-token', 'RD11_nothing_stored', rmut=lambda r: r.__setitem__('stores_token', True))
        if len(m.SCOPES[f]) > 1:
            neg('app-recipe-for-project-original', 'RR05_recipe_edition',
                lambda w: w['storage']['sealed'][0].__setitem__('recipe', dict(m.RECIPES[(f, 'application')].__dict__)))
    return out


def retention_cases(registry):
    out = []
    for f in F:
        out.append((f'retention/{f}/bound', f, (registry, m.REGISTRY_ROWS), ('accept',)))
        fid = m.FAMILY_ROWS[f]['storage_family_id']

        def neg(label, row, mut, ev_mut=None):
            reg = dict(registry, families=[copy.deepcopy(r) if r.get('family_id') == fid else r for r in registry['families']],
                       retention_policies=[copy.deepcopy(p) for p in registry['retention_policies']])
            rows = copy.deepcopy(m.REGISTRY_ROWS)
            mut(reg)
            if ev_mut:
                ev_mut(rows)
            out.append((f'retention/{f}/{label}', f, (reg, rows), ('refuse', 'rt', row)))

        def row_of(reg):
            return next(r for r in reg['families'] if r.get('family_id') == fid)

        def obj_of(reg):
            return next(p for p in reg['retention_policies'] if p['policy_id'] == m.JOURNAL_POLICY)
        neg('row-missing', 'RT01_row_present', lambda reg: reg.__setitem__('families', [r for r in reg['families'] if r.get('family_id') != fid]))
        neg('index-policy', 'RT02_policy_ref', lambda reg: row_of(reg).__setitem__('retention_policy_ref', 'RP-EVENT-INDEX-SOURCE'))
        neg('event-row-other-policy', 'RT03_registry_agrees', lambda reg: None,
            ev_mut=lambda rows: rows[f]['retention_policy_ref'].__setitem__('policy_id', 'RP-CHAT-THREAD-LIFETIME'))
        neg('policy-object-missing', 'RT04_policy_object', lambda reg: reg.__setitem__('retention_policies', [p for p in reg['retention_policies'] if p['policy_id'] != m.JOURNAL_POLICY]))
        neg('indefinite-gets-ttl', 'RT05_policy_terms', lambda reg: obj_of(reg).__setitem__('ttl_seconds', 86400))
        neg('rebuildable-index-class', 'RT06_canonical_class', lambda reg: row_of(reg)['recovery_disposition'].__setitem__('authority_class', 'rebuildable_index'))
        neg('decision-not-named', 'RT07_decision_named', lambda reg: row_of(reg).__setitem__('retention_compaction', 'canonical publication custody'))
    return out


# --- boundary dispatch (shared by the CLI and the guard-table suites) ----------------------------------------
def outcome(boundary, value):
    """None (accepted) or the first refusal (table, row, code) of one boundary call."""
    if boundary == 'verify':
        return m.verify_publication(value, 'current')
    if boundary == 'retry':
        r = m.retry(*value)
        return None if r[0] == 'return_original_without_effect' else r[1]
    if boundary == 'transition':
        r = m.transition(value)
        return None if r[0] in ('written', 'read_only_resolution') else r[1]
    if boundary == 'cleanup':
        r = m.cleanup(value)
        return None if r == 'removed' else r[1]
    if boundary == 'retained':
        w, read = value
        before = copy.deepcopy(w)
        sealed_before = len(w['storage'].get('sealed', []))
        r = m.retained_read(w, read)
        assert len(w['storage'].get('sealed', [])) == sealed_before, 'a read created a receipt'
        assert m.exact(w, before), 'a read changed custody bytes'
        return None if r[0] == 'available' else r[1]
    if boundary == 'retention':
        family, (registry, event_rows) = value
        r = m.retention_cell(family, registry, event_rows)
        return None if r == 'bound' else r[1]
    raise AssertionError(boundary)


def all_cases(registry):
    out = []
    out += [(cid, f, 'verify', w, exp) for cid, f, w, exp in verify_positives() + verify_witnesses()]
    out += [(cid, f, 'retry', v, exp) for cid, f, v, exp in retry_cases()]
    out += [(cid, f, 'transition', v, exp) for cid, f, v, exp in transition_cases()]
    out += [(cid, f, 'cleanup', v, exp) for cid, f, v, exp in cleanup_cases()]
    out += [(cid, f, 'retained', v, exp) for cid, f, v, exp in retained_cases()]
    out += [(cid, f, 'retention', (f, v), exp) for cid, f, v, exp in retention_cases(registry)]
    return out
