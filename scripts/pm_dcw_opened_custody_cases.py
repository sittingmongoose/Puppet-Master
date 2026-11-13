#!/usr/bin/env python3
"""Full loaded-operation witnesses for separately owned opened-source custody."""
import copy
import ast
import json

import pm_dcw_event_oracles as m


OPERATIONS = ('append', 'publish', 'retry', 'read', 'rebuild', 'compatibility_read')


def cases(row):
    if row['event_type'] != 'wizard.deferred_payload.loaded':
        return []
    from pm_dcw_event_numeric_cases import schema_rules
    from pm_dcw_event_fixtures import source_reference
    result = []
    opened_row = dict(row, event_type='wizard.opened', source_family='wizard_open_evidence',
                      source_schema='Plans/dcw/wizard_open_evidence.schema.json',
                      schema='Plans/event_payloads/planning_wizard/wizard_opened.schema.json')
    path = opened_row['source_schema']
    source_site = 'O197'  # Named Method B row; legacy line-number cuts are retired.


    def add(name, value, expected, guards=(), rules=(), defaults=(), reason='One predecessor custody invariant.'):
        for op in OPERATIONS:
            s = copy.deepcopy(value)
            if op == 'compatibility_read':
                s['event']['replay_policy'] = 'projector_replay_only'
            result.append(dict(case_id='round7_opened_' + name + '_' + op, operation=op,
                               expected=expected, _value=s, isolation=dict(guards=list(guards),
                               schema_rules=list(rules), schema_defaults=list(defaults), duplicate_reason=reason)))

    base = copy.deepcopy(row['positive'])
    add('valid', base, 'accept')
    source = base['authority']['opened_source']
    event_id = source['prepared_event']['event_id']
    s = copy.deepcopy(base); del s['authority']['results'][source['result']['result_ref']]
    add('missing_result', s, 'original_result', ['wizard_source:326'])
    s = copy.deepcopy(base); del s['authority']['opened_source']
    add('missing_source', s, 'opened_source_missing', [source_site])
    for name, value in [('null', None), ('string', 'false'), ('array', [])]:
        s = copy.deepcopy(base); s['authority']['opened_source'] = value
        add('source_' + name, s, 'opened_source_missing', [source_site])
    # Each required field has its own omission. Removing its required-property
    # rule also removes only its downstream availability precondition, using the
    # frozen valid field as the explicit continuation (same rule as the corpus).
    for field, original in source.items():
        s = copy.deepcopy(base); del s['authority']['opened_source'][field]
        rules = schema_rules(path, s['authority']['opened_source'], 'inline')
        defaults = [dict(path=path, definition='inline', field=field, value=original)]
        add('missing_field_' + field, s, 'schema', rules=rules, defaults=defaults,
            reason='Required original-source field and its downstream availability; frozen valid-field continuation only.')
    s = copy.deepcopy(base)
    keep = ('publication', 'first_append_receipt', 'original_event_value_commitment', 'original_segment_ref')
    s['authority']['opened_source'] = {k: source[k] for k in keep}
    add('receipt_without_owner_evidence', s, 'schema',
        rules=schema_rules(path, s['authority']['opened_source'], 'inline'),
        defaults=[dict(path=path, definition='inline', field=k, value=v) for k, v in source.items() if k not in keep],
        reason='One absent owner-evidence source, split into every independent required-field witness above; explicit frozen-field continuation.')
    s = copy.deepcopy(base); s['authority']['opened_source']['request']['project_id'] = 'foreign-project'
    add('foreign_request_project', s, 'current_child_join', ['wizard_source:323', 'wizard_source:324'],
        reason='The same request Project identity is checked against the event/child and original request observation.')
    for field in ('sequence_id',):
        for name, value in [('decimal', 10.0), ('exponent', float('1e1')), ('string', '10'),
                            ('boolean', True), ('null', None), ('array', []), ('object', {'value': 10})]:
            s = copy.deepcopy(base); s['authority']['opened_source']['prepared_event'][field] = value
            o = s['authority']['opened_source']
            rules = schema_rules(path, o, 'inline') + schema_rules(path, o)
            guards = ['wizard_source:349']
            if type(value) is float:
                guards.append('canonical_msgpack:codec_type:float')
            add('prepared_sequence_' + name, s,
                'latest_source_event' if field == 'sequence_id' and name in ('decimal', 'exponent') else 'schema', guards, rules,
                reason='One prepared original sequence type/value: source schema, integer-only codec and exact prepared/original comparison are named duplicates. The codec mutant encodes actual float bytes; it does not repair the input.')
    for name, value in [('decimal', 1.0), ('exponent', float('1e0')), ('string', '1'), ('boolean', True),
                        ('null', None), ('array', []), ('object', {'value': 1})]:
        s = copy.deepcopy(base); s['authority']['results'][source['result']['result_ref']]['child_revision'] = value
        add('original_result_revision_' + name, s, 'original_result', ['wizard_source:326'])
    for field, value, expected, guards in [
        ('storage_instance_id', '22222222-2222-4222-8222-222222222222', 'storage_instance', ['verify:408']),
                ('source_ref', 'wizard_open_evidence:' + 'f' * 64, 'source_ref', ['wizard_source:321']),
    ]:
        s = copy.deepcopy(base); s['authority']['opened_source'][field] = value
        add('forged_' + field, s, expected, guards)
    from pm_dcw_event_regressions import scenario
    full_row = next(r for r in json.loads((m.ROOT / 'Plans/dcw_event_contract_fixtures.json').read_text())['families'] if r['event_type'] == row['event_type'])
    s = scenario(row, next(c for c in full_row['cases'] if c['case_id'] == 'coherent_restore_preserves_original_bytes'))
    s['authority']['opened_source']['recovery_epoch'] = 2
    key = ['wizard_open_evidence.v1', 'project-a', 'planning-run-a', 'request-a']
    s['authority']['restored_sources'][m.compact_digest(key)] = m.hashlib.sha256(m.canonical_msgpack(s['authority']['opened_source'])).hexdigest()
    add('future_recovery_epoch', s, 'restore_epoch', ['verify:412'])
    s = copy.deepcopy(base); s['authority']['opened_source_key'] = ['wizard_open_evidence.v1', 'foreign', 'planning-run-a', 'request-a']
    add('foreign_source_key', s, 'source_key', ['wizard_source:320'])
    s = copy.deepcopy(base); s['authority']['opened_source']['prepared_event']['event_id'] = 'forged-opened-event'
    add('forged_prepared_event', s, 'latest_source_event', ['wizard_source:349'])
    for name, value in [('withdrawn', True), ('string_false', 'false'), ('string_zero', '0'), ('null', None),
                        ('array', []), ('object', {'value': False}), ('zero', 0), ('float_zero', 0.0)]:
        s = copy.deepcopy(base); s['authority']['opened_reader_withdrawn'] = value
        add('reader_' + name, s, 'reader_withdrawn', ['verify:455'])
    s = copy.deepcopy(base); del s['authority']['opened_reader_withdrawn']
    add('reader_state_missing', s, 'reader_withdrawn', ['verify:455'])
    s = copy.deepcopy(base); c = s['authority']['custody'][event_id]
    c['original_event_value_commitment']['sha256'] = 'f' * 64
    s['authority']['opened_source']['original_event_value_commitment'] = copy.deepcopy(c['original_event_value_commitment'])
    add('forged_commitment', s, 'original_commitment', ['original_receipt:246'])
    s = copy.deepcopy(base); c = s['authority']['custody'][event_id]
    c['producer_semantic_digest'] = 'f' * 64
    add('forged_semantic_digest', s, 'idempotency_conflict', ['original_receipt:244'])
    s = copy.deepcopy(base); s['authority']['opened_source']['result']['status'] = 'seed_loaded'
    s['authority']['results'][source['result']['result_ref']]['status'] = 'seed_loaded'
    original = s['authority']['opened_source']
    add('result_boundary', s, 'schema', ['wizard_source:339'],
        schema_rules(path, original, 'inline') + schema_rules(path, original),
        reason='The opened-result schema and opened boundary guard repeat the exact original successful-open predicate; its owner observation is coherent.')
    s = copy.deepcopy(base); c = s['authority']['custody'][event_id]
    c['first_append_receipt']['sequence_id'] += 1
    s['authority']['opened_source']['first_append_receipt'] = copy.deepcopy(c['first_append_receipt'])
    add('forged_receipt_sequence', s, 'receipt_event_sequence', ['original_receipt:248'])

    # A source pack is a distinct physical dependency, even below the boundary.
    # This explicit valid reference control never substitutes for the event pack.
    referenced = copy.deepcopy(base)
    pred = dict(referenced, source=referenced['authority']['opened_source'],
                event=referenced['authority']['opened_source']['prepared_event'],
                source_key=['wizard_open_evidence.v1', 'project-a', 'planning-run-a', 'request-a'])
    source_reference(opened_row, pred)
    referenced['authority']['opened_stored_source'] = pred['stored_source']
    # SP-337 source schemas permit overflow references only, so grow the complete
    # original and its immutable seed observation coherently before issuing it.
    m.source_size_fixture(opened_row, pred, 20000, True)
    referenced['authority']['opened_stored_source'] = pred['stored_source']
    referenced['source']['seed'] = copy.deepcopy(pred['source']['seed'])
    source_reference(row, referenced)  # Loaded source now also needs its own pack.
    add('referenced_source_valid', referenced, 'accept')
    ref = referenced['authority']['opened_stored_source']['source_payload_ref']
    for field, expected, guard in [('readable', 'source_payload_unavailable', 'source_storage:393'),
                                   ('durable', 'source_payload_not_durable', 'source_storage:394'),
                                   ('index_durable', 'source_payload_not_durable', 'source_storage:394')]:
        for name, value in [('false', False), ('string_false', 'false'), ('string_zero', '0'), ('null', None),
                            ('array', []), ('object', {'value': False}), ('zero', 0), ('one', 1)]:
            s = copy.deepcopy(referenced); s['authority']['payloads'][ref['blake3']][field] = value
            add('source_pack_' + field + '_' + name, s, expected, [guard])
    s = copy.deepcopy(referenced); del s['authority']['payloads'][ref['blake3']]
    add('source_pack_missing', s, 'source_payload_missing', ['source_storage:392'])
    for case in result[-len(OPERATIONS):]:
        case['_fallback_authority'] = copy.deepcopy(referenced['authority'])
    # The predecessor's own source and reachable pack must belong to the same
    # verified restore boundary; the loaded source's inventory cannot cover it.
    restored = scenario(row, next(c for c in full_row['cases'] if c['case_id'] == 'coherent_restore_preserves_original_bytes'))
    s = copy.deepcopy(restored); del s['authority']['restored_sources'][m.compact_digest(key)]
    add('restore_source_inventory_missing', s, 'restore_source_inventory', ['verify:416'])
    restored_ref = copy.deepcopy(referenced)
    for field in ('recovery_epoch', 'restore_admission', 'restored_sources', 'restored_boundary_sha256'):
        restored_ref['authority'][field] = copy.deepcopy(restored['authority'][field])
    restored_ref['control'] = copy.deepcopy(restored['control'])
    from pm_dcw_event_fixtures import refresh_restore, seal_originals
    refresh_restore(restored_ref)
    add('referenced_restore_valid', restored_ref, 'accept')
    s = copy.deepcopy(restored_ref); del s['authority']['restored_payloads'][ref['blake3']]
    add('restore_payload_inventory_missing', s, 'restore_payload_inventory', ['verify:420'])
    # Distinct immutable permission snapshots let loss of predecessor read access
    # fail independently of access to the loaded event itself.
    permission = copy.deepcopy(base); opened_source = permission['authority']['opened_source']
    opened_source['request'].update(request_ref='request:opened-original', permission_snapshot_id='permission:opened-original')
    opened_source['result']['request_ref'] = opened_source['request']['request_ref']
    opened_source['prepared_event']['payload']['permission_snapshot_id'] = 'permission:opened-original'
    permission['authority']['requests'][opened_source['request']['request_ref']] = copy.deepcopy(opened_source['request'])
    permission['authority']['results'][opened_source['result']['result_ref']] = copy.deepcopy(opened_source['result'])
    permission['authority']['permission_snapshots'].append('permission:opened-original')
    seal_originals(permission)
    add('distinct_original_permission_valid', permission, 'accept')
    s = copy.deepcopy(permission); s['authority']['permission_snapshots'].remove('permission:opened-original')
    add('original_permission_unavailable', s, 'permission_or_deleted_source', ['verify:440'])
    # Readers preserve valid history after every live writer eligibility change.
    for op in ('read', 'rebuild', 'compatibility_read'):
        s = copy.deepcopy(base)
        s['control'].update(expected_value_revision=999, effect_state='unknown', writer_cutoff=True)
        s['authority']['writable_projects'] = []
        if op == 'compatibility_read':
            s['event']['replay_policy'] = 'projector_replay_only'
        result.append(dict(case_id='round7_opened_retained_' + op, operation=op, expected='accept', _value=s))
    return result
