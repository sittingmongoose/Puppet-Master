"""W3H witness catalogue: positives and single-defect negatives for every guard row, per family.

Each negative starts from one coherent valid original (pm_w3h_events.build_world) and changes one input
invariant; derived copies stay coherent (a field the original owner result carries changes in both the
payload and the source result). Every case names its boundary and expectation: ('accept',) or
('refuse', phase, row). Nothing here decides a checker result.
"""
import copy

import pm_w3h_events as m

F = m.FAMILIES
DEFAULT_SCOPE = 'project'


def _pe(w):
    return w['publication']['prepared_event']


def set_field(w, key, value):
    """Change one owner-result field coherently: inline payload copy and the source result."""
    _pe(w)['payload'][key] = copy.deepcopy(value)
    w['source']['result'][key] = copy.deepcopy(value)


def facts(w):
    return w['source']['facts']


def first_family_field(f):
    return next(k for k in m.family_result(f, m.VARIANTS.get(f, ('base',))[0]) if k != m.FAMILY_ROWS[f]['subject'])


def _alt(value):
    if type(value) is bool:
        return not value
    if type(value) is int:
        return value + 1
    if type(value) is list:
        return value + ['alt-ref']
    if value is None:
        return 'alt-ref'
    if len(value) == 64 and all(c in '0123456789abcdef' for c in value):
        return m.H(value)
    return value + '-alt'


def _alt_valid(f, key, value):
    sub = m.SCHEMAS[f]['$defs']['payload']['properties'][key]
    for candidate in [_alt(value)] + [e for e in sub.get('enum', []) if e != value]:
        if m._slot_validator(f, key).is_valid(candidate):
            return candidate
    return None


# --- witness specs: row -> list of (label, spec, mutate) ------------------------------------------------------
# spec keys: state, external, variant, scope, pad, families (filter), boundary (default 'verify')
W = {}


def wit(row, label, mutate, **spec):
    W.setdefault(row, []).append((label, spec, mutate))


def adm(key):
    return lambda w: w['admission'].__setitem__(key, False)


wit('AD01_family_admitted', 'family-not-admitted', adm('family_admitted'))
wit('AD02_edition_admitted', 'app-edition-not-admitted', adm('edition_admitted'), scope='application')
wit('AD03_writer_enabled', 'writer-withdrawn', adm('writer_enabled'))
wit('AD04_permission_current', 'permission-revoked', adm('permission_current'))
wit('AD05_stop_clear', 'stop-fences-effect', adm('stop_clear'))
wit('AD06_dedupe_available', 'dedupe-owner-unavailable', adm('dedupe_available'))

# jr ------------------------------------------------------------------------------------------------------
wit('JR01_closed_keys', 'unknown-journal-key', lambda w: w['publication'].__setitem__('extra', 1))
wit('JR01_closed_keys', 'missing-journal-key', lambda w: w['publication'].pop('source_record_ref'))
wit('JR02_scalar_fields', 'state-not-enum', lambda w: w['publication'].__setitem__('state', 'done'))
wit('JR02_scalar_fields', 'empty-instance', lambda w: w['publication'].__setitem__('storage_instance_id', ''))
wit('JR02_scalar_fields', 'partition-trailing-lf', lambda w: w['publication'].__setitem__('scope_partition', w['publication']['scope_partition'] + '\n'))
wit('JR02_scalar_fields', 'schema-id-other-family', lambda w: w['publication'].__setitem__('schema_id', 'pm.storage_value.w3h.other.publication.v1'))
wit('JR03_receipt_presence', 'settled-without-receipt', lambda w: w['publication'].__setitem__('first_append_receipt', None))
wit('JR03_receipt_presence', 'prepared-with-receipt', lambda w: w['publication'].__setitem__('first_append_receipt', copy.deepcopy(m.build_world(w['family'])['publication']['first_append_receipt'])), state='prepared')
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
for _label, _value in (('plus-zero-offset', '2026-11-05T10:00:02+00:00'), ('minus-zero-offset', '2026-11-05T10:00:02-00:00'),
                       ('lowercase-z', '2026-11-05T10:00:02z'), ('trailing-lf', '2026-11-05T10:00:02Z\n'),
                       ('hour-24', '2026-11-05T24:00:00Z'), ('no-zone', '2026-11-05T10:00:02'),
                       ('nonzero-offset', '2026-11-05T05:00:02-05:00'), ('feb-30', '2026-02-30T10:00:02Z')):
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
    body['source_receipt_ref'] = body['source_receipt_ref'][:-1] + ('2' if body['source_receipt_ref'][-1] != '2' else '3')
    raw = m.storage_value_bytes(body, profile=m.EVENT_VALUE)
    assert len(raw) == len(_pack(w)['bytes'])
    _pack(w)['bytes'] = raw


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
wit('EV13_body_physical', 'lone-surrogate-in-body', lambda w: set_field(w, first_family_field(w['family']), 'x\ud800') if type(w['source']['result'][first_family_field(w['family'])]) is str else _pe(w)['payload'].__setitem__('server_id', 'x\ud800'))
wit('EV14_inline_limit', 'inline-body-above-16384', lambda w: None, pad=16500)
wit('EV15_journal_physical', 'producer-sequence-above-uint64', lambda w: _pe(w).__setitem__('producer_sequence_id', 2 ** 64))
wit('EV16_journal_limit', 'journal-above-16384-body-below', lambda w: None, pad=9000)

# lg ------------------------------------------------------------------------------------------------------
wit('LG01_envelope_schema', 'empty-actor', lambda w: _pe(w).__setitem__('actor_ref', ''))
wit('LG01_envelope_schema', 'unknown-envelope-key', lambda w: _pe(w).__setitem__('extra', 1))
wit('LG01_envelope_schema', 'redaction-not-enum', lambda w: _pe(w).__setitem__('redaction_profile', 'plain'))
wit('LG01_envelope_schema', 'sequence-negative', lambda w: _pe(w).__setitem__('sequence_id', -1))
wit('LG01_envelope_schema', 'sequence-string', lambda w: _pe(w).__setitem__('sequence_id', '41'))
wit('LG01_envelope_schema', 'sequence-bool', lambda w: _pe(w).__setitem__('sequence_id', True))
wit('LG01_envelope_schema', 'occurred-not-string', lambda w: _pe(w).__setitem__('occurred_at_utc', 20261105))
wit('LG02_family_type', 'sibling-event-type', lambda w: _pe(w).__setitem__('event_type', 'todo.updated' if w['family'] != 'todo.updated' else 'todo.created'))
wit('LG03_payload_schema_id', 'envelope-names-other-schema', lambda w: _pe(w).__setitem__('payload_schema_id', 'pm.event_payload.other.v1'))
wit('LG04_payload_schema', 'payload-missing-required', lambda w: _pe(w)['payload'].pop('source_receipt_ref'))
wit('LG04_payload_schema', 'payload-unknown-key', lambda w: _pe(w)['payload'].__setitem__('notes', 'x'))
wit('LG04_payload_schema', 'payload-id-trailing-lf', lambda w: _pe(w)['payload'].__setitem__('owner_operation_id', _pe(w)['payload']['owner_operation_id'] + '\n'))
wit('LG04_payload_schema', 'payload-version-other', lambda w: _pe(w)['payload'].__setitem__('schema_version', '1.0.1'))
BOOL_FIELD = {f: next((k for k, v in m.SCHEMAS[f]['$defs']['payload']['properties'].items()
                       if v.get('type') == 'boolean' or type(v.get('const')) is bool), None) for f in F}
wit('LG04_payload_schema', 'payload-boolean-as-string', lambda w: _pe(w)['payload'].__setitem__(BOOL_FIELD[w['family']], 'false'),
    families=[f for f in F if BOOL_FIELD[f]])
wit('LG04_payload_schema', 'payload-null-for-string', lambda w: _pe(w)['payload'].__setitem__('server_id', None))
wit('LG04_payload_schema', 'payload-array-for-string', lambda w: _pe(w)['payload'].__setitem__('source_record_ref', ['src']))
wit('LG04_payload_schema', 'payload-object-for-string', lambda w: _pe(w)['payload'].__setitem__('owner_operation_id', {'id': 'op'}))
wit('LG04_payload_schema', 'payload-app-schema-with-project', lambda w: (_pe(w)['payload'].__setitem__('schema_id', m.payload_schema_id(w['family'], 'application')),
                                                                         _pe(w).__setitem__('payload_schema_id', m.payload_schema_id(w['family'], 'application'))),
    families=[f for f in F if 'application' in m.SCOPES[f]])
for _label, _value in (('trailing-lf', m.OCCURRED + '\n'), ('feb-30', '2026-02-30T10:00:00Z'), ('hour-24', '2026-11-05T24:00:00Z'),
                       ('no-zone', '2026-11-05T10:00:00.250'), ('slash-date', '2026/11/05T10:00:00Z'), ('bad-leap-second', '2026-11-05T10:00:60Z')):
    wit('LG05_occurred_clock', 'occurred-' + _label, lambda w, v=_value: (_pe(w).__setitem__('occurred_at_utc', v), w['source'].__setitem__('accepted_at_utc', v)))
for _row, _field in (('LG06_observed_clock', 'observed_at_utc'), ('LG07_persisted_clock', 'persisted_at_utc')):
    for _label, _value in (('plus-zero', '2026-11-05T10:00:01+00:00'), ('lowercase-z', '2026-11-05T10:00:01z'),
                           ('offset', '2026-11-05T12:00:01+02:00'), ('trailing-lf', '2026-11-05T10:00:01Z\n'),
                           ('no-zone', '2026-11-05T10:00:01'), ('minus-zero', '2026-11-05T10:00:01-00:00')):
        wit(_row, _field + '-' + _label, lambda w, v=_value, k=_field: (_pe(w).__setitem__(k, v), w['storage']['issued'].__setitem__(k, v)), state='prepared')
wit('LG08_sequence_uint64', 'sequence-float', lambda w: (_pe(w).__setitem__('sequence_id', 41.0), w['storage']['issued'].__setitem__('sequence_id', 41.0)), state='prepared')
wit('LG08_sequence_uint64', 'sequence-above-uint64', lambda w: (_pe(w).__setitem__('sequence_id', 2 ** 64), w['storage']['issued'].__setitem__('sequence_id', 2 ** 64)), state='prepared')
wit('LG09_producer_sequence', 'producer-sequence-float', lambda w: (_pe(w).__setitem__('producer_sequence_id', 7.0), w['source'].__setitem__('producer_sequence_id', 7.0)))
wit('LG10_payload_integers', 'payload-slot-float', lambda w: set_field(w, m.INT_SLOTS[w['family']][0][0], float(_pe(w)['payload'][m.INT_SLOTS[w['family']][0][0]])),
    families=[f for f in F if m.INT_SLOTS[f]])
wit('LG11_producer_route', 'producer-sequence-2^53+1', lambda w: (_pe(w).__setitem__('producer_sequence_id', 2 ** 53 + 1), w['source'].__setitem__('producer_sequence_id', 2 ** 53 + 1)))
wit('LG11_producer_route', 'payload-slot-2^53+1', lambda w: set_field(w, [s for s in m.INT_SLOTS[w['family']] if s[2] is None][0][0], 2 ** 53 + 1),
    families=[f for f in F if any(s[2] is None for s in m.INT_SLOTS[f]) and f not in ('todo.created',)])
wit('LG12_replay_current', 'replay-only-current-write', lambda w: _pe(w).__setitem__('replay_policy', 'projector_replay_only'))
wit('LG13_replay_family', 'append-once-policy', lambda w: _pe(w).__setitem__('replay_policy', 'append_once'))
wit('LG14_migration_null', 'migration-id-set', lambda w: _pe(w)['migration'].__setitem__('migration_id', 'mig-1'))
wit('LG15_redaction_family', 'redaction-no-secrets', lambda w: (_pe(w).__setitem__('redaction_profile', 'no_secrets'), w['source'].__setitem__('redaction_profile', 'no_secrets')))

# id ------------------------------------------------------------------------------------------------------
def _wrong_key(w):
    key = m.physical_key(w['family'], 'store-w3h-b', w['publication']['scope_partition'], w['publication']['owner_operation_id'])
    w['storage']['journal_key'] = key
    w['publication']['physical_key'] = key


wit('ID01_partition', 'partition-substituted', lambda w: w['publication'].__setitem__('scope_partition', 'project~b3RoZXI'))
wit('ID02_key_actual', 'storage-key-off-formula', _wrong_key)
wit('ID03_key_copy', 'journal-key-copy-substituted', lambda w: w['publication'].__setitem__('physical_key', w['publication']['physical_key'] + '00'))
wit('ID04_instance_copy', 'instance-copy-substituted', lambda w: w['publication'].__setitem__('storage_instance_id', 'store-w3h-b'))
wit('ID05_event_id', 'event-id-substituted', lambda w: _pe(w).__setitem__('event_id', 'evt-random-1'))
wit('ID05_event_id', 'event-id-other-instance', lambda w: _pe(w).__setitem__('event_id', m.event_id_of('store-w3h-b', w['source']['owner_operation_id'], w['family'])))
wit('ID06_idempotency_key', 'key-with-suffix', lambda w: _pe(w).__setitem__('idempotency_key', _pe(w)['idempotency_key'] + ':1'))
wit('ID06_idempotency_key', 'app-key-uses-project-recipe', lambda w: _pe(w).__setitem__('idempotency_key', m.idempotency_key_of('project', m.SERVER, w['source']['owner_operation_id'])), scope='application')
wit('ID07_operation_journal', 'journal-operation-reminted', lambda w: w['publication'].__setitem__('owner_operation_id', 'op:reminted'))
wit('ID08_operation_payload', 'payload-operation-reminted', lambda w: _pe(w)['payload'].__setitem__('owner_operation_id', 'op:reminted'))
wit('ID09_record_journal', 'journal-record-substituted', lambda w: w['publication'].__setitem__('source_record_ref', 'src:other'))
wit('ID10_record_payload', 'payload-record-substituted', lambda w: _pe(w)['payload'].__setitem__('source_record_ref', 'src:other'))
wit('ID11_receipt_journal', 'journal-receipt-substituted', lambda w: w['publication'].__setitem__('source_receipt_ref', 'rcpt:other'))
wit('ID12_receipt_payload', 'payload-receipt-substituted', lambda w: _pe(w)['payload'].__setitem__('source_receipt_ref', 'rcpt:other'))
wit('ID00_source_scope', 'source-scope-incoherent', lambda w: w['source'].__setitem__('project_id', None))

# sj ------------------------------------------------------------------------------------------------------
for _row, _field, _value, _kw in (
        ('SJ02_project_id', 'project_id', 'proj-beta', dict(scope='project')),
        ('SJ03_thread_id', 'thread_id', 'thread-9', {}), ('SJ04_run_id', 'run_id', 'run-x', {}),
        ('SJ05_node_id', 'node_id', 'node-x', {}), ('SJ06_attempt_id', 'attempt_id', 'att-x', {}),
        ('SJ07_actor_ref', 'actor_ref', 'user:mallory', {}), ('SJ08_requested_account', 'requested_account_ref', 'acct-x', {}),
        ('SJ09_effective_account', 'effective_account_ref', 'acct-y', {}), ('SJ10_occurred_at', 'occurred_at_utc', '2026-11-05T11:00:00Z', {}),
        ('SJ11_producer_sequence', 'producer_sequence_id', 8, {}), ('SJ12_correlation', 'correlation_id', 'corr-x', {}),
        ('SJ13_causation', 'causation_event_id', 'evt-c', {}), ('SJ14_parent', 'parent_event_id', 'evt-p', {})):
    wit(_row, 'event-' + _field + '-substituted', lambda w, k=_field, v=_value: _pe(w).__setitem__(k, v), state='prepared', **_kw)
wit('SJ15_redaction_source', 'source-redaction-differs', lambda w: w['source'].__setitem__('redaction_profile', 'redacted'), state='prepared')
wit('SJ17_payload_project', 'payload-project-substituted', lambda w: _pe(w)['payload'].__setitem__('project_id', 'proj-beta'), state='prepared')
wit('SJ18_payload_thread', 'payload-thread-substituted', lambda w: _pe(w)['payload'].__setitem__('thread_id', 'thread-9'), state='prepared')
wit('SJ19_payload_server', 'payload-server-substituted', lambda w: _pe(w)['payload'].__setitem__('server_id', 'server-x'), state='prepared')
wit('SJ20_payload_result', 'result-differs-from-payload',
    lambda w: w['source']['result'].__setitem__(first_family_field(w['family']), _alt_valid(w['family'], first_family_field(w['family']), w['source']['result'][first_family_field(w['family'])])),
    state='prepared')
wit('SJ21_source_owner', 'source-adapter-substituted', lambda w: w['source'].__setitem__('owner', 'OtherOwner::write'), state='prepared')
wit('SJ22_component_family', 'component-other-family', lambda w: w['source'].__setitem__('component', 'other.family'), state='prepared')
wit('SJ23_component_subject', 'component-other-subject', lambda w: w['source'].__setitem__('component_subject', 'other-subject'), state='prepared')
wit('SJ24_result_accepted', 'source-result-rejected', lambda w: w['source'].__setitem__('result_status', 'rejected'), state='prepared')

# st ------------------------------------------------------------------------------------------------------
wit('ST01_sequence_issued', 'sequence-copy-substituted', lambda w: _pe(w).__setitem__('sequence_id', 42), state='prepared')
wit('ST02_observed_issued', 'observed-copy-substituted', lambda w: _pe(w).__setitem__('observed_at_utc', '2026-11-05T10:00:09Z'), state='prepared')
wit('ST03_persisted_issued', 'persisted-copy-substituted', lambda w: _pe(w).__setitem__('persisted_at_utc', '2026-11-05T10:00:09Z'), state='prepared')
wit('ST04_receipt_event', 'receipt-other-event', lambda w: w['publication']['first_append_receipt'].__setitem__('event_id', 'evt-other'))
wit('ST05_receipt_sequence', 'receipt-other-sequence', lambda w: w['publication']['first_append_receipt'].__setitem__('sequence_id', 40))
wit('ST06_receipt_issued', 'receipt-offset-forged', lambda w: w['publication']['first_append_receipt'].__setitem__('byte_offset', 5000))
wit('ST06_receipt_issued', 'receipt-never-issued', lambda w: w['storage']['receipts'].clear(), state='appended')
wit('ST07_commitment_value', 'commitment-hash-forged', lambda w: w['publication']['full_value_commitment'].__setitem__('sha256', m.H('forged')))
wit('ST08_commitment_issued', 'commitment-never-issued', lambda w: w['storage']['commitments'].clear())

# fx: one owner fact changed; a payload field the predicate reads changes with the source result ---------------
def fx(row, label, mutate, families=None, variant=None):
    # Prepared state: no full-value commitment yet, so a coherent owner-result change is this row's defect alone.
    wit(row, label, mutate, families=families, variant=variant, state='prepared')


def setf(path, value):
    def apply(w):
        node = facts(w)
        for k in path[:-1]:
            node = node[k]
        node[path[-1]] = copy.deepcopy(value)
    return apply


def both_graphs(fn):
    def apply(w):
        fn(facts(w)['before'])
        fn(facts(w)['after'])
    return apply


P, WIN, DIS, QUO, NAM, COM, TODO = ([f for f in F if m.GROUP_OF[f] == g] for g in ('plan', 'window', 'dispatch', 'quota', 'named', 'compose', 'todo'))
fx('AP01_version_committed', 'version-not-committed', setf(('committed_version', 'committed'), False))
fx('AP02_committed_join', 'committed-hash-differs', setf(('committed_version', 'hash'), m.H('plan-7@9')))
fx('AP03_version_change', 'same-version-claimed', lambda w: (set_field(w, 'plan_version', 2), set_field(w, 'plan_hash', m.H('plan-7@2')),
                                                             facts(w)['committed_version'].update(version=2, hash=m.H('plan-7@2'))))
fx('AP04_binding_join', 'binding-other-version', lambda w: (facts(w)['binding_before'].update(version=1), facts(w)['binding_after'].update(version=1)))
fx('AP05_binding_invalidated', 'binding-still-pending', setf(('binding_after', 'status'), 'pending'))
fx('AP06_old_target_retained', 'rebound-to-latest', lambda w: facts(w)['binding_after'].update(version=3, hash=m.H('plan-7@3')))
fx('AP06_old_target_retained', 'old-target-hash-substituted', setf(('binding_after', 'hash'), m.H('plan-7@x')))
fx('AP07_no_build', 'build-started', setf(('build_started',), True))
fx('EW01_target_exact', 'target-hash-differs', lambda w: (facts(w)['schedule'].update(target_hash=m.H('other')), facts(w).__setitem__('target_after', copy.deepcopy(facts(w)['schedule']))))
fx('EW02_revision_expected', 'stale-expected-revision', lambda w: facts(w)['revision'].update(expected=facts(w)['revision']['before'] + 1))
fx('EW03_revision_committed', 'revision-not-committed', lambda w: facts(w)['revision'].update(after=facts(w)['revision']['after'] + 1))
fx('EW04_window_policy', 'zone-rewritten', setf(('policy', 'zone'), 'UTC'))
fx('EW05_window_effect', 'request-acceptance-only', setf(('result_kind',), 'requested'))
fx('EW06_no_dispatch', 'window-dispatched-work', setf(('dispatched_work',), 1))
fx('EW07_reason_exact', 'reason-translated', setf(('owner_reason',), 'target_cancelled'), families=['execution_window.invalidated'])
fx('EW08_target_retained', 'rebound-latest-target', setf(('target_after', 'target_version'), 3), families=['execution_window.invalidated'])
fx('EW09_safe_narrowing', 'narrowing-immediate', setf(('applies_at',), 'immediate'), families=['execution_window.updated'])
fx('DS01_snapshot_frozen', 'snapshot-rederived', setf(('snapshot', 'text_hash'), m.H('composer text')))
fx('DS02_snapshot_ref', 'snapshot-ref-other', setf(('snapshot_ref',), 'snap-2'))
for _f, _bad in (('scheduled_dispatch.created', 'scheduled'), ('scheduled_dispatch.updated', 'dispatched'), ('scheduled_dispatch.held', 'held'),
                 ('scheduled_dispatch.cancelled', 'dispatched'), ('scheduled_dispatch.dispatched', 'cancelled'), ('scheduled_dispatch.failed', 'cancelled')):
    fx('DS03_state_permits', 'state-forbids-' + _bad, setf(('state_before',), _bad), families=[_f])
fx('DS04_revision_expected', 'stale-expected', lambda w: facts(w)['revision'].update(expected=facts(w)['revision']['before'] + 1))
fx('DS05_revision_committed', 'revision-skipped', lambda w: facts(w)['revision'].update(after=facts(w)['revision']['after'] + 1))
fx('DS06_effect_receipt', 'request-accepted-only', setf(('receipt_kind',), 'request_accepted'))
for _kind in ('held', 'succeeded', 'run_admitted'):
    fx('DS06_effect_receipt', 'failed-from-' + _kind, setf(('receipt_kind',), _kind), families=['scheduled_dispatch.failed'])
for _row, _key in (('DS07_stop_clear', 'stop_clear'), ('DS08_pause_clear', 'pause_clear'), ('DS09_decision_eligible', 'decision'), ('DS10_final_eligible', 'final')):
    fx(_row, _key + '-false', setf(('eligibility', _key), False), families=['scheduled_dispatch.dispatched'])
fx('DS11_no_backlog', 'backlog-burst', setf(('occurrence', 'dispatches'), 3), families=['scheduled_dispatch.dispatched', 'scheduled_dispatch.held'])
fx('DS12_missed_policy', 'missed-policy-rewritten', setf(('occurrence', 'missed_policy'), 'next_available'), families=['scheduled_dispatch.dispatched', 'scheduled_dispatch.held'])
fx('DS13_dispatch_key', 'dispatch-key-reminted', setf(('dispatch_key',), 'sdk-2'), families=['scheduled_dispatch.dispatched'])
fx('DS14_revalidation', 'revalidation-refused', setf(('revalidation', 'accepted'), False), families=['scheduled_dispatch.dispatched'])
fx('DS15_outcome_certain', 'outcome-uncertain', setf(('outcome_certain',), False), families=['scheduled_dispatch.failed'])
fx('DS16_clauses_exact', 'clauses-substituted', setf(('clauses',), ['other_clause']), families=['scheduled_dispatch.failed', 'scheduled_dispatch.held'])
for _row, _path, _value in (('QT01_route_run', ('route', 'run_id'), 'run-x'), ('QT02_route_provider', ('route', 'provider_id'), 'prov-x'),
                            ('QT03_route_account', ('route', 'account_id'), 'acct-x'), ('QT04_reset_truth', ('reset_source',), 'locally_inferred'),
                            ('QT05_quota_effect', ('result_kind',), 'requested'), ('QT06_stop_preserved', ('stop_preserved',), False),
                            ('QT07_pause_preserved', ('pause_preserved',), False), ('QT08_states_unchanged', ('states_unchanged',), False)):
    fx(_row, '-'.join(_path) + '-substituted', setf(_path, _value))
fx('QT09_eligibility_exact', 'eligibility-flipped', setf(('eligibility', 'eligible'), False), families=['runtime.quota_resume_attempted'])
fx('QT10_stop_epoch_final', 'stop-epoch-advanced-before-dispatch', setf(('epochs', 'final'), 2), families=['runtime.quota_resume_attempted'])
fx('QT11_consent_changed', 'consent-unchanged', setf(('enabled_before',), True), families=['runtime.quota_resume_consent_changed'])
fx('QT12_run_unfinished', 'run-finished', setf(('run_unfinished',), False), families=['runtime.quota_wait_started'])
fx('PA01_user_actor', 'agent-actor', setf(('actor', 'kind'), 'agent'))
fx('PA02_actor_authorized', 'unauthorized-user', setf(('actor', 'authorized'), False))
fx('PA03_custody_present', 'pause-custody-missing', setf(('record_before',), None))
fx('PA04_value_changed', 'noop-set', setf(('record_before', 'paused'), True))
fx('PA05_epoch_record', 'epoch-not-record', lambda w: set_field(w, 'user_stop_epoch', 5))
fx('PA06_revision_record', 'revision-not-record', lambda w: set_field(w, 'pause_revision', 3))
fx('PA07_on_epoch', 'pause-without-epoch-increment', lambda w: (facts(w)['record_after'].update(epoch=3), set_field(w, 'user_stop_epoch', 3)))
fx('PA08_scope_latch', 'other-scope-latch', lambda w: facts(w).__setitem__('latch_scope', 'application' if w['scope'] == 'project' else 'project'))
fx('PA09_no_dispatch', 'clear-dispatched-backlog', setf(('dispatched',), 1), variant='off')
fx('PA10_per_run_preserved', 'clear-dropped-run-stop', setf(('per_run_after',), []), variant='off')
for _row, _path, _value in (('NP01_plan_id', ('plan', 'named_plan_id'), 'np-2'), ('NP02_plan_project', ('plan', 'project_id'), 'proj-beta'),
                            ('NP03_resolution', ('resolution',), 'name_match'), ('NP06_currentness', ('currentness_after',), m.H('stale')),
                            ('NP07_named_effect', ('result_kind',), 'requested'), ('NP08_actual_change', ('changed',), False),
                            ('NP09_children_preserved', ('children_after', 'run:4'), 'cancelled')):
    fx(_row, '-'.join(_path) + '-substituted', setf(_path, _value))
fx('NP04_revision_expected', 'stale-expected', lambda w: facts(w)['revision'].update(expected=facts(w)['revision']['before'] + 1))
fx('NP05_revision_committed', 'revision-skipped', lambda w: facts(w)['revision'].update(after=facts(w)['revision']['after'] + 1))
fx('NP10_archive_confirmation', 'active-children-unconfirmed', setf(('confirmed',), False), families=['named_plan.archived'])
fx('NP11_lifecycle', 'lifecycle-before-differs', lambda w: facts(w).__setitem__('lifecycle_before', facts(w)['lifecycle_after']), families=['named_plan.archived', 'named_plan.restored'])
fx('NP12_child_publication', 'child-edge-unproven', setf(('child_publication', 'validated'), False), families=['named_plan.child_refs_changed'])
fx('NP13_refs_after', 'current-refs-differ', setf(('refs_after', 'current'), ['prd:9']), families=['named_plan.child_refs_changed'])
fx('NP14_history_preserved', 'earlier-ref-dropped', setf(('refs_before', 'current'), ['prd:0', 'prd:5']), families=['named_plan.child_refs_changed'])
fx('NP15_priority_join', 'priority-before-differs', setf(('priority_before',), 'low'), families=['named_plan.priority_changed'])
fx('NP16_name_join', 'name-before-differs', setf(('name_before',), 'name-0'), families=['named_plan.renamed'])
fx('NP17_shell_join', 'creation-receipt-differs', setf(('shell', 'creation_receipt_ref'), 'crt-2'), families=['named_plan.created'])
for _row, _path, _value in (('CO01_scenario_project', ('scenario_project',), 'proj-beta'), ('CO02_config_fingerprint', ('resolved_config_hash',), m.H('cfg-x')),
                            ('CO03_validation', ('validation',), 'stale'), ('CO04_scenario_effect', ('result_kind',), 'requested'),
                            ('CO05_revision', ('revision_after',), 'scnrev-4')):
    fx(_row, '-'.join(_path) + '-substituted', setf(_path, _value))
fx('CO06_previous_revision', 'previous-revision-differs', setf(('revision_before',), 'scnrev-1'), families=['docker.compose.scenario.edited'])
fx('CO07_edit_changed', 'unchanged-edit', lambda w: (facts(w).__setitem__('revision_before', 'scnrev-3'), set_field(w, 'previous_scenario_revision_ref', 'scnrev-3')), families=['docker.compose.scenario.edited'])
fx('CO08_run_receipt', 'run-receipt-other', setf(('run_receipt', 'ref'), 'runrcpt-9'), families=['docker.compose.scenario.run'])
fx('CO09_run_launched', 'dispatch-acceptance-only', setf(('run_receipt', 'status'), 'dispatch_accepted'), families=['docker.compose.scenario.run'])
fx('CO10_not_compose_down', 'claims-containers-stopped', setf(('containers_stopped_claim',), True), families=['docker.compose.scenario.deleted'])
for _row, _path, _value, _variant in (('GO01_goal_id', ('goal', 'goal_id'), 'goal-2', None), ('GO02_goal_revision', ('goal', 'revision'), 6, None),
                                      ('GO03_owning_run', ('owning_run',), 'run-x', None), ('GO04_tuple_unique', ('tuple_originals',), 1, None),
                                      ('GO05_continue_unfinished', ('goal', 'objective_finished'), True, 'continue'),
                                      ('GO06_continue_thread', ('thread_eligible',), False, 'continue'),
                                      ('GO07_continue_attempt', ('next_attempt', 'admitted'), False, 'continue'),
                                      ('GO08_complete_evidence', ('completion', 'accepted'), False, 'complete'),
                                      ('GO10_dispatch_stop', ('stop_epoch', 'dispatch'), 4, 'continue'),
                                      ('GO11_goal_preserved', ('goal_after', 'budget'), 11, None)):
    fx(_row, '-'.join(_path) + '-substituted', setf(_path, _value), variant=_variant)
fx('GO09_stop_epoch', 'payload-epoch-not-decision', lambda w: set_field(w, 'user_stop_epoch', 4))
fx('TD01_join_exact', 'title-join', setf(('join',), 'title_match'))
fx('TD02_list_thread', 'list-other-thread', setf(('list', 'thread_id'), 'thread-9'))
fx('TD03_item_thread', 'item-other-thread', lambda w: [facts(w)[g]['todo-3'].update(thread_id='thread-9', depends_on=[]) for g in ('before', 'after') if 'todo-3' in facts(w)[g]],
   families=[f for f in TODO if f != 'todo.dependency_changed'])
fx('TD04_list_currentness', 'stale-list-revision', setf(('currentness', 'expected_list_revision'), 6))
fx('TD05_plan_currentness', 'plan-version-moved', setf(('currentness', 'plan_version_actual'), 3))
fx('TD06_run_currentness', 'run-epoch-moved', setf(('currentness', 'run_epoch_actual'), 2))
fx('TD07_list_revision', 'list-revision-skipped', setf(('list', 'revision_after'), 9))
fx('TD08_item_expected', 'item-expected-stale', setf(('before', 'todo-3', 'revision'), 3), families=[f for f in TODO if f != 'todo.created'])
fx('TD08_item_expected', 'created-over-existing-revision', lambda w: facts(w)['before'].__setitem__('todo-3', m._item('pending', [], 2, 3)), families=['todo.created'])
fx('TD09_item_committed', 'item-revision-skipped', setf(('after', 'todo-3', 'revision'), 6))


def _add_dep(item, dep):
    def apply(graph):
        if item in graph and dep not in graph[item]['depends_on']:
            graph[item]['depends_on'] = graph[item]['depends_on'] + [dep]
    return apply


fx('TD10_graph_self', 'self-dependency', both_graphs(_add_dep('todo-2', 'todo-2')))
fx('TD11_graph_unknown', 'unknown-dependency', both_graphs(_add_dep('todo-2', 'todo-9')))
fx('TD12_graph_cross_thread', 'foreign-dependency',
   both_graphs(lambda g: (g.__setitem__('todo-x', m._item('pending', [], 9, 1, thread_id='thread-9')), _add_dep('todo-2', 'todo-x')(g))))
fx('TD13_graph_cycle', 'dependency-cycle', both_graphs(_add_dep('todo-1', 'todo-2')))
fx('TD14_effect_validated', 'result-not-validated', setf(('result', 'validated'), False))
fx('TD15_effect_kind', 'result-other-kind', setf(('result', 'kind'), 'requested'))
fx('TD16_claim_evidence', 'claim-without-evidence', lambda w: facts(w)['evidence'].pop(facts(w)['claims'][0]),
   families=['todo.removed_from_current_list', 'todo.work_bound', 'todo.status_changed'])
fx('TD17_atomic', 'partial-cohort', setf(('atomic',), False))
fx('TD18_initial_pending', 'created-in-progress', setf(('after', 'todo-3', 'status'), 'in_progress'), families=['todo.created'])
fx('TD19_new_identity', 'created-identity-already-owned', lambda w: facts(w)['before'].__setitem__('todo-3', m._item('pending', [], 2, 0)), families=['todo.created'])
fx('TD20_depends_join', 'edges-differ-from-payload', setf(('after', 'todo-3', 'depends_on'), ['todo-2']), families=['todo.dependency_changed'])
fx('TD21_depends_changed', 'edges-unchanged', setf(('before', 'todo-3', 'depends_on'), ['todo-1', 'todo-2']), families=['todo.dependency_changed'])
fx('TD22_removed_membership', 'still-member', setf(('after', 'todo-3', 'member'), True), families=['todo.removed_from_current_list'])
fx('TD23_active_dispositions', 'active-binding-orphaned', lambda w: facts(w)['active_bindings'][0].__setitem__('disposition', None), families=['todo.removed_from_current_list'])
fx('TD24_removed_rollup', 'removed-child-in-rollup', lambda w: facts(w)['parent_rollup']['children'].append('todo-3'), families=['todo.removed_from_current_list'])
fx('TD25_order_join', 'order-differs-from-payload', setf(('after', 'todo-3', 'display_order'), 6), families=['todo.reordered'])
fx('TD26_order_dependency', 'reorder-changed-edge', setf(('after', 'todo-2', 'depends_on'), []), families=['todo.reordered'])
fx('TD27_order_parent', 'reorder-changed-parent', setf(('after', 'todo-2', 'parent'), 'todo-1'), families=['todo.reordered'])
fx('TD28_order_status', 'reorder-changed-status', setf(('after', 'todo-2', 'status'), 'in_progress'), families=['todo.reordered'])
fx('TD29_order_parallel', 'reorder-changed-group', setf(('after', 'todo-2', 'parallel_group'), 'pg-1'), families=['todo.reordered'])
fx('TD30_from_status', 'from-status-not-previous', setf(('before', 'todo-3', 'status'), 'blocked'), families=['todo.status_changed'])
fx('TD31_to_status', 'to-status-not-committed', setf(('after', 'todo-3', 'status'), 'skipped'), families=['todo.status_changed'])
fx('TD32_outcome_evidence', 'tool-success-only', setf(('outcome', 'accepted'), False), families=['todo.status_changed'], variant='complete')
fx('TD33_parent_required_child', 'required-child-unfinished', setf(('children', 0, 'status'), 'in_progress'), families=['todo.status_changed'], variant='complete')
fx('TD34_bulk_receipts', 'bulk-item-without-receipt', lambda w: facts(w)['bulk'].append(dict(item='todo-4', receipt=None)), families=['todo.status_changed'], variant='complete')
fx('TD35_quota_status', 'blocked-by-quota-wait', setf(('block_reason',), 'quota_wait'), families=['todo.status_changed'], variant='block')
fx('TD36_dependency_status', 'blocked-by-dependency-wait', setf(('block_reason',), 'dependency_wait'), families=['todo.status_changed'], variant='block')
fx('TD37_cause_join', 'cause-ref-differs', setf(('cause', 'ref'), 'adm-9'), families=['todo.status_changed'])
fx('TD38_update_resolution', 'title-match-other-thread', setf(('update_resolution',), 'title_match'), families=['todo.updated'])
fx('TD39_supported_fields', 'historical-summary-field', setf(('changed_fields',), ['summary']), families=['todo.updated'])
fx('TD40_item_revision_ref', 'revision-record-differs', setf(('item_revision_ref',), 'irev-9'), families=['todo.updated'])
fx('TD41_work_identity', 'work-substituted', setf(('admission', 'work_id'), 'work-9'), families=['todo.work_bound'])
fx('TD42_attempt_identity', 'attempt-substituted', setf(('admission', 'attempt_id'), 'att-9'), families=['todo.work_bound'])
fx('TD43_admission_receipt', 'admission-unaccepted', setf(('admission', 'status'), 'pending'), families=['todo.work_bound'])
fx('TD44_binding_join', 'binding-substituted', setf(('admission', 'binding_id'), 'bind-9'), families=['todo.work_bound'])


# --- enumeration -------------------------------------------------------------------------------------------
PHASE_OF = {row[0]: phase for phase, (_c, _t, rows) in m.ROWS.items() for row in rows}
FX_FAMILIES = {r[0]: (frozenset(f for f in F if m.GROUP_OF[f] == g) if r[3] is None else r[3]) for g, rows in m.FX.items() for r in rows}


def _world(f, spec):
    scope = spec.get('scope') or DEFAULT_SCOPE
    variants = m.VARIANTS.get(f, ('base',))
    variant = spec.get('variant')
    if scope not in m.SCOPES[f] or (variant is not None and variant not in variants):
        return None
    return m.build_world(f, scope, variant, spec.get('state', 'settled'), spec.get('external', False), spec.get('pad', 0))


def verify_witnesses():
    """(case_id, family, world, expected) for every single-defect publication witness."""
    out = []
    for row, items in W.items():
        phase = PHASE_OF[row]
        for label, spec, mutate in items:
            fams = spec.get('families') or F
            if row in FX_FAMILIES:
                fams = [f for f in fams if f in FX_FAMILIES[row]]
            for f in fams:
                w = _world(f, spec)
                if w is None:
                    continue
                mutate(w)
                out.append((f'verify/{f}/{w["scope"]}/{row}/{label}', f, w, ('refuse', phase, row)))
    return out


def verify_positives():
    out = []
    for f in F:
        for scope in m.SCOPES[f]:
            for variant in m.VARIANTS.get(f, ('base',)):
                for state in ('prepared', 'appended', 'settled'):
                    for external in (False, True):
                        w = m.build_world(f, scope, variant, state, external)
                        out.append((f'verify/{f}/{scope}/{variant}/{state}/{"external" if external else "inline"}', f, w, ('accept',)))
        # Size boundaries: an external 16,385-byte body; an inline journal of exactly 16,384 bytes.
        base = len(next(iter(m.build_world(f, 'project', None, 'settled', True)['storage']['packs'].values()))['bytes'])
        sizes = {}
        for pad in range(16385 - base - 8, 16385 - base + 8):
            w = m.build_world(f, 'project', None, 'settled', True, pad_server=pad)
            sizes.setdefault(len(next(iter(w['storage']['packs'].values()))['bytes']), pad)
        w = m.build_world(f, 'project', None, 'settled', True, pad_server=sizes[16385])
        assert len(next(iter(w['storage']['packs'].values()))['bytes']) == 16385
        out.append((f'verify/{f}/boundary/external-body-16385', f, w, ('accept',)))
        size = len(m.storage_value_bytes(m.build_world(f, 'project', None, 'prepared', False, pad=0)['publication'], profile=m.EVENT_VALUE))
        found = {}
        for pad in range((16384 - size) // 2 - 40, (16384 - size) // 2 + 40):
            for corr in (0, 1):
                w = m.build_world(f, 'project', None, 'prepared', False, pad=pad, pad_corr=corr)
                found.setdefault(len(m.storage_value_bytes(w['publication'], profile=m.EVENT_VALUE)), (pad, corr))
        assert 16384 in found and 16385 in found, (f, sorted(found)[:3])
        out.append((f'verify/{f}/boundary/inline-journal-16384', f, m.build_world(f, 'project', None, 'prepared', False, *found[16384]), ('accept',)))
        out.append((f'verify/{f}/boundary/inline-journal-16385', f, m.build_world(f, 'project', None, 'prepared', False, *found[16385]),
                    ('refuse', 'ev', 'EV16_journal_limit')))
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
        neg('incoming-payload-missing-field', 'RY03_incoming_shape', imut=lambda i: i['payload'].pop('source_record_ref'))
        neg('incoming-producer-sequence-float', 'RY04_incoming_numbers', imut=lambda i: i.__setitem__('producer_sequence_id', 7.0))
        neg('other-scoped-identity', 'RY05_original_present', imut=lambda i: i.__setitem__('idempotency_key', i['idempotency_key'] + '00'))
        neg('original-commitment-lost', 'RY06_original_verified', wmut=lambda w: w['storage']['commitments'].clear())
        neg('semantic-field-changed', 'RY07_semantic_equal', imut=lambda i: i['payload'].__setitem__(
            first_family_field(f), _alt_valid(f, first_family_field(f), i['payload'][first_family_field(f)])))
        neg('new-clock-on-retry', 'RY07_semantic_equal', imut=lambda i: i.__setitem__('occurred_at_utc', '2026-11-05T12:00:00Z'))
        neg('new-producer-sequence-on-retry', 'RY07_semantic_equal', imut=lambda i: i.__setitem__('producer_sequence_id', 8))
    return out


def transition_cases():
    out = []

    def pub(f, state, scope='project', external=False):
        return m.build_world(f, scope, None, state, external)['publication'] if state != 'absent' else None
    for f in F:
        for prior_state, next_state in (('absent', 'prepared'), ('prepared', 'appended'), ('appended', 'settled')):
            for external in (False, True):
                w = m.build_world(f, 'project', None, next_state, external)
                prior = pub(f, prior_state, external=external)
                t = dict(world=w, prior=prior, expected=copy.deepcopy(prior), proposed=w['publication'], cleanup=None)
                out.append((f'transition/{f}/{prior_state}-{next_state}/{external}', f, t, ('accept',)))
        for state in ('prepared', 'appended', 'settled'):
            w = m.build_world(f, state=state)
            t = dict(world=w, prior=w['publication'], expected=copy.deepcopy(w['publication']), proposed=copy.deepcopy(w['publication']), cleanup=None)
            out.append((f'transition/{f}/same-state-{state}-read-only', f, t, ('accept',)))
        w = m.build_world(f, state='prepared')
        t = dict(world=w, prior=None, expected=None, proposed=None, cleanup=None)
        out.append((f'transition/{f}/absent-absent-abort-without-effect', f, t, ('accept',)))
        w = m.build_world(f, state='settled')
        t = dict(world=w, prior=w['publication'], expected=copy.deepcopy(w['publication']), proposed=None, cleanup=cleanup_request(f))
        out.append((f'transition/{f}/settled-cleanup', f, t, ('accept',)))

        def neg(label, row, prior_state, next_state, mut=None, cleanup=None):
            w = m.build_world(f, state=next_state) if next_state != 'absent' else m.build_world(f, state='settled')
            prior = pub(f, prior_state)
            t = dict(world=w, prior=prior, expected=copy.deepcopy(prior), proposed=w['publication'] if next_state != 'absent' else None, cleanup=cleanup)
            if mut:
                mut(t)
            out.append((f'transition/{f}/{label}', f, t, ('refuse', 'tr', row)))
        neg('stale-cas', 'TR01_cas_expected', 'prepared', 'appended', lambda t: t.__setitem__('expected', None))
        neg('skip-to-appended', 'TR02_edge_legal', 'absent', 'appended')
        neg('regress-settled-to-prepared', 'TR02_edge_legal', 'settled', 'prepared')
        neg('remove-prepared', 'TR02_edge_legal', 'prepared', 'absent')
        neg('skip-prepared-to-settled', 'TR02_edge_legal', 'prepared', 'settled')
        neg('skip-absent-to-settled', 'TR02_edge_legal', 'absent', 'settled')
        neg('remove-appended', 'TR02_edge_legal', 'appended', 'absent')
        neg('regress-appended-to-prepared', 'TR02_edge_legal', 'appended', 'prepared')
        neg('regress-settled-to-appended', 'TR02_edge_legal', 'settled', 'appended')
        neg('frozen-event-mutated', 'TR03_frozen_event', 'prepared', 'appended',
            lambda t: (t['prior']['prepared_event'].__setitem__('correlation_id', 'corr-old'), t.__setitem__('expected', copy.deepcopy(t['prior']))))
        neg('frozen-copy-mutated', 'TR04_frozen_copies', 'prepared', 'appended',
            lambda t: (t['prior'].__setitem__('source_receipt_ref', 'rcpt:old'), t.__setitem__('expected', copy.deepcopy(t['prior']))))
        neg('forged-receipt-on-append', 'TR05_proposed_verified', 'prepared', 'appended',
            lambda t: t['proposed']['first_append_receipt'].__setitem__('byte_offset', 5000))
        neg('drain-after-writer-withdrawal', 'TR05_proposed_verified', 'prepared', 'appended',
            lambda t: t['world']['admission'].__setitem__('writer_enabled', False))
        bad = cleanup_request(f)
        bad['trigger'] = 'age_expired'
        neg('cleanup-by-age', 'TR06_cleanup_authorized', 'settled', 'absent', cleanup=bad)
        neg('cleanup-without-request', 'TR06_cleanup_authorized', 'settled', 'absent', cleanup=None)
    return out


def cleanup_request(f):
    policy = m.GROUP_POLICY[m.FAMILY_ROWS[f]['group']]
    trigger = {'RP-AUTHORITY-INDEFINITE': 'owning_data_deleted', 'RP-CHAT-THREAD-LIFETIME': 'thread_deleted_purge_due',
               'RP-GOAL-THREAD-LIFETIME': 'goal_thread_deleted'}[policy]
    return dict(policy_ref=policy, trigger=trigger, original_state='settled', pending_result=False, append_unresolved=False,
                ack_unresolved=False, deletes_receipt=False, recovery_anchor=False, live_reference=False, hold=False,
                backup_settled=True, as_index=False)


def cleanup_cases():
    out = []
    for f in F:
        out.append((f'cleanup/{f}/eligible', f, cleanup_request(f), ('accept',)))
        for row, key, value in (('CL01_policy_bound', 'policy_ref', 'RP-EVENT-INDEX-SOURCE'), ('CL02_policy_eligible', 'trigger', 'age_expired'),
                                ('CL02_policy_eligible', 'trigger', 'count_exceeded'), ('CL03_settled_only', 'original_state', 'appended'),
                                ('CL04_pending_released', 'pending_result', True), ('CL05_append_resolved', 'append_unresolved', True),
                                ('CL06_ack_resolved', 'ack_unresolved', True), ('CL07_receipt_kept', 'deletes_receipt', True),
                                ('CL08_recovery_anchor', 'recovery_anchor', True), ('CL09_live_reference', 'live_reference', True),
                                ('CL10_hold_clear', 'hold', True), ('CL11_backup_settled', 'backup_settled', False), ('CL12_not_index', 'as_index', True)):
            r = cleanup_request(f)
            r[key] = value
            out.append((f'cleanup/{f}/{key}-{value}', f, r, ('refuse', 'cl', row)))
        if m.GROUP_POLICY[m.FAMILY_ROWS[f]['group']] != 'RP-CHAT-THREAD-LIFETIME':
            r = cleanup_request(f)
            r['trigger'] = 'thread_deleted_purge_due'   # a sibling policy's trigger is not this policy's
            out.append((f'cleanup/{f}/sibling-policy-trigger', f, r, ('refuse', 'cl', 'CL02_policy_eligible')))
    return out


def sealed(f, scope='project', external=False):
    return m.seal_write_receipt(m.build_world(f, scope, None, 'settled', external))


def retained_cases():
    out = []
    for f in F:
        for scope in m.SCOPES[f]:
            for external in (False, True):
                w = sealed(f, scope, external)
                out.append((f'retained/{f}/{scope}/{external}', f, (w, m.default_read(w)), ('accept',)))
        w = sealed(f)
        w['admission'].update(family_admitted=False, writer_enabled=False, permission_current=False, stop_clear=False)
        w['live'] = dict(source_revision=99, route='moved', object='deleted-live')
        out.append((f'retained/{f}/after-live-change-and-writer-withdrawal', f, (w, m.default_read(w)), ('accept',)))

        def neg(label, row, wmut=None, rmut=None, phase='rr'):
            w = sealed(f)
            read = m.default_read(w)
            if wmut:
                wmut(w)
            if rmut:
                rmut(read)
            out.append((f'retained/{f}/{label}', f, (w, read), ('refuse', phase, row)))
        neg('missing-receipt', 'RR01_receipt_present', lambda w: w['storage']['sealed'].clear())
        neg('receipt-at-other-locator', 'RR01_receipt_present', lambda w: w['storage']['sealed'][0].__setitem__('locator', w['storage']['journal_key'] + '00'))
        neg('ambiguous-receipts', 'RR02_receipt_unique', lambda w: w['storage']['sealed'].append(copy.deepcopy(w['storage']['sealed'][0])))
        neg('receipt-for-another-original', 'RR03_receipt_binding', lambda w: w['storage']['sealed'][0]['binding'].__setitem__('event_id', 'w3h@1:other'))
        neg('unknown-recipe', 'RR04_recipe_known', lambda w: w['storage']['sealed'][0]['recipe'].__setitem__('registry_revision', 'w3h-prepared-0'))
        other = F[(F.index(f) + 1) % len(F)]
        neg('sibling-family-recipe', 'RR05_recipe_edition', lambda w, o=other: w['storage']['sealed'][0].__setitem__('recipe', dict(m.RECIPES[(o, 'project')].__dict__)))
        neg('original-commitment-lost', 'RR06_original_verified', lambda w: w['storage']['commitments'].clear())
        neg('reader-withdrawn', 'RD01_reader_enabled', rmut=lambda r: r.__setitem__('reader_enabled', False), phase='rd')
        neg('permission-withdrawn', 'RD02_read_permission', rmut=lambda r: r.__setitem__('read_permission', False), phase='rd')
        neg('owning-data-deleted', 'RD03_not_deleted', rmut=lambda r: r.__setitem__('deleted', True), phase='rd')
        neg('effect-through-reader', 'RD04_read_only', rmut=lambda r: r.__setitem__('requested_effects', 1), phase='rd')
        neg('token-other-instance', 'RD05_token_instance', rmut=lambda r: r['token'].__setitem__('storage_instance_id', 'store-w3h-b'), phase='rd')
        neg('frontier-moved', 'RD06_token_frontier', rmut=lambda r: r['live'].__setitem__('frontier', 42), phase='rd')
        neg('snapshot-substituted', 'RD07_token_snapshot', rmut=lambda r: r['live'].__setitem__('snapshot_id', 'snap-tx-2'), phase='rd')
        neg('range-gap', 'RD08_coverage', rmut=lambda r: r['token'].__setitem__('covered', [[0, 20], [22, 41]]), phase='rd')
        neg('other-partition-selection', 'RD09_selection', rmut=lambda r: r['token'].__setitem__('partition', 'project~b3RoZXI'), phase='rd')
        if 'application' in m.SCOPES[f]:
            neg('app-recipe-for-project-original', 'RR05_recipe_edition',
                lambda w: w['storage']['sealed'][0].__setitem__('recipe', dict(m.RECIPES[(f, 'application')].__dict__)))
    return out


COHORT_CHANGES = {'todo.dependency_changed': dict(depends_on=['todo-1', 'todo-2']), 'todo.reordered': dict(display_order=5),
                  'todo.status_changed': dict(status='in_progress'), 'todo.work_bound': dict(binding='bind-1'),
                  'todo.updated': dict(title_ref='t3b'), 'todo.removed_from_current_list': dict(member=False)}
COHORTS = (('todo.dependency_changed', 'todo.reordered'), ('todo.work_bound', 'todo.status_changed'),
           ('todo.updated', 'todo.reordered'), ('todo.created',), ('todo.removed_from_current_list',))


def compound_world(families=COHORTS[0]):
    """One owner mutation of todo-3 whose actual before/after graph yields exactly these member facts."""
    members = [m.build_world(f) for f in families]
    before = copy.deepcopy(m.build_world('todo.updated')['source']['facts']['before'])
    before['todo-3']['title_ref'] = 't3'
    after = copy.deepcopy(before)
    if families == ('todo.created',):
        del before['todo-3']
    for f in families:
        after['todo-3'].update(COHORT_CHANGES.get(f, {}))
    ids = [m.logical_of(x)['event_id'] for x in members]
    admitted = {f: True for f in families}
    return dict(members=members, before=before, after=after, admitted=admitted, txn={i: 'txn-1' for i in ids}, body_txn='txn-1',
                group=dict(members=list(ids), receipts={i: copy.deepcopy(x['publication']['first_append_receipt']) for i, x in zip(ids, members)}),
                ack_claims_complete=True)


def compound_cases():
    out = []
    for cohort in COHORTS:
        name = '+'.join(f.split('.')[-1] for f in cohort)
        out.append((f'compound/{name}/published', cohort[0], compound_world(cohort), ('accept',)))

        def neg(label, row, mut, cohort=cohort, name=name):
            cw = compound_world(cohort)
            mut(cw)
            out.append((f'compound/{name}/{label}', cohort[-1], cw, ('refuse', 'cp', row)))

        def drop_member(cw):
            removed = cw['members'].pop()
            rid = m.logical_of(removed)['event_id']
            cw['group']['members'].remove(rid)
            cw['group']['receipts'].pop(rid)
        if len(cohort) > 1:
            neg('cohort-missing-component', 'CP01_members_derived', drop_member)
        else:
            neg('cohort-claims-extra-component', 'CP01_members_derived', lambda cw: cw['after']['todo-2'].update(display_order=7))
        neg('member-not-admitted', 'CP02_members_admitted', lambda cw, f=cohort[-1]: cw['admitted'].__setitem__(f, False))
        neg('member-other-transaction', 'CP03_members_atomic', lambda cw: cw['txn'].__setitem__(sorted(cw['txn'])[0], 'txn-2'))
        neg('group-missing-member', 'CP04_group_complete', lambda cw: cw['group']['members'].pop())
        neg('ack-without-member-receipt', 'CP05_group_receipts', lambda cw: cw['group']['receipts'].pop(sorted(cw['group']['receipts'])[0]))
        neg('member-source-rejected', 'CP06_members_verified', lambda cw: cw['members'][0]['source'].__setitem__('result_status', 'rejected'))
    return out


def retention_cases(registry):
    out = []
    for f in F:
        out.append((f'retention/{f}/bound', f, registry, ('accept',)))
        fid = m.FAMILY_ROWS[f]['storage_family_id']
        policy = m.GROUP_POLICY[m.FAMILY_ROWS[f]['group']]

        def neg(label, row, mut):
            reg = dict(registry, families=[copy.deepcopy(r) if r.get('family_id') == fid else r for r in registry['families']],
                       retention_policies=[copy.deepcopy(p) for p in registry['retention_policies']])
            mut(reg)
            out.append((f'retention/{f}/{label}', f, reg, ('refuse', 'rt', row)))

        def row_of(reg):
            return next(r for r in reg['families'] if r.get('family_id') == fid)

        def obj_of(reg):
            return next(p for p in reg['retention_policies'] if p['policy_id'] == policy)
        neg('row-missing', 'RT01_row_present', lambda reg: reg.__setitem__('families', [r for r in reg['families'] if r.get('family_id') != fid]))
        neg('index-policy', 'RT02_policy_ref', lambda reg: row_of(reg).__setitem__('retention_policy_ref', 'RP-EVENT-INDEX-SOURCE'))
        neg('policy-object-missing', 'RT03_policy_object', lambda reg: reg.__setitem__('retention_policies', [p for p in reg['retention_policies'] if p['policy_id'] != policy]))
        if policy == 'RP-CHAT-THREAD-LIFETIME':
            neg('chat-cap-changed', 'RT04_policy_terms', lambda reg: obj_of(reg).__setitem__('max_cardinality', 100000))
            neg('chat-drops-old-history', 'RT04_policy_terms', lambda reg: obj_of(reg).__setitem__('overflow_action', 'drop_oldest'))
        elif policy == 'RP-GOAL-THREAD-LIFETIME':
            neg('goal-count-cap-imported', 'RT04_policy_terms', lambda reg: obj_of(reg).__setitem__('max_cardinality', 250000))
        else:
            neg('indefinite-gets-ttl', 'RT04_policy_terms', lambda reg: obj_of(reg).__setitem__('ttl_seconds', 86400))
        neg('rebuildable-index-class', 'RT05_canonical_class', lambda reg: row_of(reg)['recovery_disposition'].__setitem__('authority_class', 'rebuildable_index'))
        neg('group-not-named', 'RT06_decision_named', lambda reg: row_of(reg).__setitem__('retention_compaction', 'canonical publication custody'))
    return out


# --- boundary dispatch (shared by the CLI and the guard-table suites) ----------------------------------------
def outcome(boundary, value):
    """None (accepted) or the first refusal (phase, row, code) of one boundary call."""
    if boundary == 'verify':
        return m.verify_publication(value, 'current')
    if boundary == 'retry':
        r = m.retry(*value)
        return None if r[0] == 'return_original_without_effect' else r[1]
    if boundary == 'transition':
        r = m.transition(value)
        return None if r[0] in ('written', 'read_only_resolution') else r[1]
    if boundary == 'cleanup':
        r = m.cleanup(value[0], value[1])
        return None if r == 'removed' else r[1]
    if boundary == 'retained':
        w, read = value
        before = copy.deepcopy(w)
        sealed_before = len(w['storage'].get('sealed', []))
        r = m.retained_read(w, read)
        assert len(w['storage'].get('sealed', [])) == sealed_before, 'a read created a receipt'
        assert m.exact(w, before), 'a read changed custody bytes'
        return None if r[0] == 'available' else r[1]
    if boundary == 'compound':
        r = m.compound(value)
        return None if r == 'published' else r[1]
    if boundary == 'retention':
        family, registry = value
        r = m.retention_cell(family, registry)
        return None if r == 'bound' else r[1]
    raise AssertionError(boundary)


def all_cases(registry):
    out = []
    out += [(cid, f, 'verify', w, exp) for cid, f, w, exp in verify_positives() + verify_witnesses()]
    out += [(cid, f, 'retry', v, exp) for cid, f, v, exp in retry_cases()]
    out += [(cid, f, 'transition', v, exp) for cid, f, v, exp in transition_cases()]
    out += [(cid, f, 'cleanup', (f, v), exp) for cid, f, v, exp in cleanup_cases()]
    out += [(cid, f, 'retained', v, exp) for cid, f, v, exp in retained_cases()]
    out += [(cid, f, 'compound', v, exp) for cid, f, v, exp in compound_cases()]
    out += [(cid, f, 'retention', (f, v), exp) for cid, f, v, exp in retention_cases(registry)]
    return out
