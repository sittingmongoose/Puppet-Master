#!/usr/bin/env python3
"""Single-invariant numeric/type witnesses for the six DCW compositions."""
import copy
import json

import pm_dcw_event_oracles as m
from jsonschema import Draft202012Validator


def schema_rules(path, value, definition=None):
    from pm_dcw_event_isolation import schema_leaves, signature
    schema = m.load(path)
    if definition:
        schema = {'$ref': schema['$id'] + '#/$defs/' + definition}
    return [signature(path, definition, leaf)
            for error in Draft202012Validator(schema, registry=m.RESOURCES, format_checker=m.FORMAT).iter_errors(value)
            for leaf in schema_leaves(error)]


def cases(row):
    """Derived from valid controls; configurations name only the same invariant."""
    result = []

    def add(name, value, operation, expected, guards, rules=(), reason='One exact type/value invariant.'):
        result.append(dict(case_id='round6_' + name, _value=value, operation=operation, expected=expected,
                           isolation=dict(guards=guards, schema_rules=list(rules), duplicate_reason=reason)))

    wrong = [('string_false', 'false'), ('string_zero', '0'), ('null', None),
             ('array', []), ('object', {'value': False}), ('integer_zero', 0), ('integer_one', 1)]
    for field, operation, guard, code in [
        ('writer_cutoff', 'append', 'verify:443', 'writer_cutoff'),
        ('reader_withdrawn', 'read', 'verify:455', 'reader_withdrawn'),
        ('replacement_reader_admitted', 'rebuild', 'verify:458', 'rebuild_not_current'),
        ('rebuild_complete', 'rebuild', 'verify:458', 'rebuild_not_current'),
    ]:
        for label, invalid in wrong:
            value = copy.deepcopy(row['positive']); value['control'][field] = invalid
            add(field + '_' + label, value, operation, code, [guard])

    sequence = row['positive']['event']['sequence_id']
    for label, invalid in [('decimal', float(sequence)), ('exponent', json.loads(str(sequence) + 'e0')),
                           ('string_number', str(sequence)), ('boolean', True), ('null', None),
                           ('array', []), ('object', {'value': sequence})]:
        value = copy.deepcopy(row['positive'])
        value['event']['replay_policy'] = 'projector_replay_only'
        value['event']['sequence_id'] = invalid
        add('original_sequence_' + label, value, 'compatibility_read', 'schema', ['verify:472'],
            schema_rules('Plans/event_record.schema.json', value['event']),
            'The integer schema and exact original-value comparison repeat the same type/authenticity invariant; only replay_policy is projected.')

    for field in ('readable_projects', 'writable_projects', 'permission_snapshots'):
        value = copy.deepcopy(row['positive']); value['authority'][field] = value['authority'][field][0]
        guard = {'readable_projects': 'verify:439', 'permission_snapshots': 'verify:440', 'writable_projects': 'verify:442'}[field]
        add(field + '_string_container', value, 'publish', 'permission_or_deleted_source', [guard])
    value = copy.deepcopy(row['positive']); custody = value['authority']['custody'][value['event']['event_id']]
    group = value['authority']['durable_groups'][custody['first_append_receipt']['commit_group_id']]
    group['event_ids'] = json.dumps(group['event_ids'])
    add('group_event_ids_string_container', value, 'publish', 'receipt_group', ['original_receipt:255'])
    if row['event_type'].startswith('bundle.'):
        for field in ('outputs', 'outcomes'):
            value = copy.deepcopy(row['positive']); value['authority'][field] = json.dumps(value['authority'][field])
            add(field + '_string_container', value, 'publish', 'result_outputs', ['bundle_source:294'])
    value = copy.deepcopy(row['positive']); value['control']['admitted_families'] = row['event_type']
    add('admitted_families_string_container', value, 'publish', 'family_not_admitted', ['verify:407'])
    for label, invalid in wrong:
        value = copy.deepcopy(row['positive']); value['control']['effect_state'] = invalid
        add('effect_state_' + label, value, 'publish', 'effect_unknown', ['verify:438'])

    for label, invalid in [('float', 0.0), ('string', '0'), ('null', None), ('array', []), ('object', {'value': 0}), ('boolean', False)]:
        value = copy.deepcopy(row['positive']); value['authority']['recovery_epoch'] = invalid
        from pm_dcw_index_cases import sites
        add('authority_epoch_' + label, value, 'publish', 'restore_epoch', ['verify:409'] + (sites('index_recovery_epoch') if row['event_type'] == 'wizard.deferred_payload.loaded' else []))
    for label, invalid in [('float', 1.0), ('string', '1'), ('null', None), ('array', []), ('object', {'value': 1}), ('boolean', True)]:
        value = copy.deepcopy(row['positive']); value['control']['expected_value_revision'] = invalid
        add('source_CAS_' + label, value, 'publish', 'source_CAS', ['verify:437'])

    for field in ('sequence_id', 'payload'):
        original = row['positive']['event'][field]
        alternatives = wrong + ([('decimal', float(original)), ('exponent', json.loads(str(original) + 'e0'))] if field == 'sequence_id' else [('string_payload', 'body')])
        for label, invalid in alternatives:
            if type(invalid) is type(original) and invalid == original:
                continue
            value = copy.deepcopy(row['positive']); eid = value['event']['event_id']
            value['authority']['events'][eid][field] = invalid
            add('authenticated_original_' + field + '_' + label, value, 'publish', 'original_full_value', ['original_receipt:245'])
    for label, invalid in [('decimal', float(sequence)), ('exponent', json.loads(str(sequence) + 'e0')),
                           ('string', str(sequence)), ('boolean', True), ('null', None), ('array', []), ('object', {'value': sequence})]:
        value = copy.deepcopy(row['positive']); custody = value['authority']['custody'][value['event']['event_id']]
        custody['first_append_receipt']['sequence_id'] = invalid
        add('custody_sequence_' + label, value, 'publish', 'schema', ['original_receipt:248', 'original_receipt:251'],
            schema_rules('Plans/event_append_receipt_contracts.schema.json', custody, 'custody_v2'),
            'The custody integer domain, exact Storage event/receipt sequence join and exact observational receipt copy repeat this one original sequence invariant.')

    base_source = copy.deepcopy(row['positive']); m.source_size_fixture(row, base_source, 24576, True)
    for field, guard, code in [('readable', 'source_storage:393', 'source_payload_unavailable'),
                               ('durable', 'source_storage:394', 'source_payload_not_durable'),
                               ('index_durable', 'source_storage:394', 'source_payload_not_durable')]:
        for label, invalid in wrong:
            value = copy.deepcopy(base_source); ref = value['stored_source']['source_payload_ref']
            value['authority']['payloads'][ref['blake3']][field] = invalid
            add('source_pack_' + field + '_' + label, value, 'publish', code, [guard])

    # A complete independently issued reference composition, with all originals,
    # digests and source references coherent for each descriptor representation.
    from pm_dcw_event_fixtures import event_size_fixture, event_slots, seal_originals, source_reference
    base = copy.deepcopy(row['positive']); event_size_fixture(row, base, 20000, True)
    for field, guard, code in [('readable', 'event_body:190', 'event_payload_unavailable'),
                               ('durable', 'event_body:191', 'event_payload_not_durable'),
                               ('index_durable', 'event_body:191', 'event_payload_not_durable')]:
        for label, invalid in wrong:
            value = copy.deepcopy(base); ref = json.loads(value['event']['payload_ref'])
            value['authority']['event_payloads'][ref['blake3']][field] = invalid
            add('event_pack_' + field + '_' + label, value, 'publish', code, [guard])
    for label, spelling in [('decimal', '20000.0'), ('decimal_extra', '20000.00'), ('exponent', '2e4'),
                             ('exponent_plus', '2E+4'), ('negative_exponent', '200000e-1')]:
        value = copy.deepcopy(base); old = value['event']['payload_ref']
        new = old.replace('"byte_size":20000', '"byte_size":' + spelling)
        assert old != new
        for slot in event_slots(value):
            if slot['prepared_event']['event_id'] == value['event']['event_id']:
                slot['prepared_event']['payload_ref'] = new
        value['event']['payload_ref'] = new; seal_originals(value); source_reference(row, value)
        rules = schema_rules(row['schema'], json.loads(new), 'payload_reference')
        add('descriptor_' + label, value, 'publish', 'schema', ['domain:636', 'event_reference:171'], rules,
            'pm-uint schema format, integer-only canonical-JSON domain and exact descriptor re-encoding enforce one numeric representation; opaque descriptor originals are coherent.')
    from pm_dcw_opened_custody_cases import cases as opened_custody_cases
    from pm_dcw_index_cases import cases as index_cases
    from pm_dcw_registered_cases import cases as registered_cases
    return result + opened_custody_cases(row) + index_cases(row) + registered_cases(row)
