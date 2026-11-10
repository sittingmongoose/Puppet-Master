"""Sweep part 2B single-defect witnesses: the shared date-time check, the shared
number and physical rules, and SP-1101 retained dispatch.

Each negative starts from the same family's valid invocation and changes one
source fact. Timestamp witnesses change one timestamp string; number witnesses
change one integer and recompute only the copies that watch it; dispatch
witnesses change one authenticated owner fact or add one caller override.
"""
import copy

from pm_runtime_artifact_round8_cases import observation_source

# CV-1101 source/family profile (EventRecord occurred_at_utc, receipt and
# checkpoint date-time fields, the restore point's date-time fields).
BROAD_VALID = {
    'lowercase_separators': '2026-07-02t00:00:00z',
    'offset': '2026-07-02T05:30:00+05:30',
    'long_fraction': '2026-07-02T00:00:00.123456789012Z',
    'real_leap_second': '2016-12-31T23:59:60Z',
    'offset_leap_second': '2017-01-01T00:59:60+01:00',
}
BROAD_INVALID = {
    'missing_zone': '2026-07-02T00:00:00',
    'space_separator': '2026-07-02 00:00:00Z',
    'trailing_lf': '2026-07-02T00:00:00Z\n',
    'hour_24': '2026-07-02T24:00:00Z',
    'february_30': '2026-02-30T00:00:00Z',
    'false_leap_second': '2026-06-30T23:59:60Z',
    'offset_hour_24': '2026-07-02T00:00:00+24:00',
    'empty_fraction': '2026-07-02T00:00:00.Z',
}
# CV-253 Storage profile (observed_at_utc, persisted_at_utc): uppercase Z only.
STORAGE_VALID = {
    'long_fraction': '2026-07-02T00:00:01.000000000001Z',
    'real_leap_second': '2016-12-31T23:59:60Z',
}
STORAGE_INVALID = dict(BROAD_INVALID, **{
    'plus_zero_offset': '2026-07-02T00:00:01+00:00',
    'minus_zero_offset': '2026-07-02T00:00:01-00:00',
    'lowercase_z': '2026-07-02T00:00:01z',
    'nonzero_offset': '2026-07-02T01:00:01+01:00',
})
EXACT_2_53 = 2 ** 53          # exact binary64 and exact JCS decimal
BINARY64_LOSS = 2 ** 53 + 1   # jcs_binary64
DECIMAL_LOSS = 2 ** 60        # exact binary64, different JCS decimal (jcs_decimal)


def node(bundle):
    cp = bundle['checkpoint']
    return cp['generations'][cp['current_generation_id']]


def first_original(m, fixtures, family, full):
    """The family's own first-receipt original, as the append model issues it."""
    model = m.AppendModel(next(r for r in m.load('Plans/runtime_artifact_event_drafts.json')['rows']
                               if r['event_type'] == family), {}, fixtures['first_append_receipts'][family],
                          fixtures['custody_template'])
    return model.append(copy.deepcopy(full), True)


def cases(m, rows, fixtures):
    result = []

    def add(guard, family, name, good, bad):
        result.append((guard, family, name, good, bad))

    cp_schema = m.load(m.CHECKPOINT_SCHEMA.split('#')[0])
    for row in rows:
        family = row['event_type']
        full = fixtures['positive_events'][family]
        receipt = fixtures['first_append_receipts'][family]
        bundle = fixtures['checkpoint_positives'][family]

        # S08: EventRecord source profile, current and historical validators.
        for name, value in BROAD_INVALID.items():
            bad = dict(full, occurred_at_utc=value)
            add('S08', family, 'occurred_at_' + name, lambda n, e=full: n.EVENT_VALIDATOR.is_valid(e),
                lambda n, e=bad: n.EVENT_VALIDATOR.is_valid(e))
        for field in ('observed_at_utc', 'persisted_at_utc'):
            for name, value in STORAGE_INVALID.items():
                bad = dict(full, **{field: value})
                add('S08', family, field + '_' + name, lambda n, e=full: n.EVENT_VALIDATOR.is_valid(e),
                    lambda n, e=bad: n.EVENT_VALIDATOR.is_valid(e))
                add('S08', family, 'historical_' + field + '_' + name,
                    lambda n, e=full: n.validator(n.EVENT_VALIDATOR.schema, validation=n.HISTORICAL_V1).is_valid(e),
                    lambda n, e=bad: n.validator(n.EVENT_VALIDATOR.schema, validation=n.HISTORICAL_V1).is_valid(e))
        # Receipt, custody and result copies of acknowledged_at_utc.
        for name in ('missing_zone', 'february_30', 'trailing_lf', 'hour_24'):
            value = BROAD_INVALID[name]
            bad = dict(receipt, acknowledged_at_utc=value)
            add('S08', family, 'receipt_acknowledged_at_' + name, lambda n, q=receipt: n.RECEIPT_VALIDATOR.is_valid(q),
                lambda n, q=bad: n.RECEIPT_VALIDATOR.is_valid(q))
        # Checkpoint date-time fields (frontier.indexed_at_utc, first_prepared_at_utc, activated_at_utc).
        for field_path in (('frontier', 'indexed_at_utc'), ('first_prepared_at_utc',), ('activated_at_utc',)):
            for name in ('missing_zone', 'february_30', 'trailing_lf'):
                bad = copy.deepcopy(bundle['checkpoint'])
                m.set_path(node(dict(checkpoint=bad)), field_path, BROAD_INVALID[name])
                add('S08', family, 'checkpoint_' + '_'.join(field_path) + '_' + name,
                    lambda n, s=cp_schema, v=bundle['checkpoint']: n.validator(s, 'checkpoint').is_valid(v),
                    lambda n, s=cp_schema, v=bad: n.validator(s, 'checkpoint').is_valid(v))

        # I04 through the complete append route: a schema-valid Storage sequence
        # beyond the SP-1100 physical range has no EVENT_VALUE bytes.
        good = dict(full, sequence_id=2 ** 64 - 1)
        bad = dict(full, sequence_id=2 ** 64)
        add('I04', family, 'append_sequence_beyond_uint64',
            lambda n, r=row, e=good: n.AppendModel(r, {}, receipt, fixtures['custody_template']).append(e, True),
            lambda n, r=row, e=bad: n.AppendModel(r, {}, receipt, fixtures['custody_template']).append(e, True))

        if not family.endswith('.restore_point'):
            # A08 / F14: a producer ordinal whose JCS decimal differs (2^60).
            good = dict(full, producer_sequence_id=EXACT_2_53)
            bad = dict(full, producer_sequence_id=DECIMAL_LOSS)
            add('A08', family, 'producer_sequence_jcs_decimal',
                lambda n, r=row, e=good: n.AppendModel(r, {}, receipt, fixtures['custody_template']).append(e, True),
                lambda n, r=row, e=bad: n.AppendModel(r, {}, receipt, fixtures['custody_template']).append(e, True))
            original = first_original(m, fixtures, family, good)
            stored = copy.deepcopy(original)
            stored['event'] = copy.deepcopy(bad)
            stored['custody']['original_event_value_commitment'] = m.commitment(bad)
            stored['result']['original_event_value_commitment'] = m.commitment(bad)
            add('F14', family, 'producer_sequence_jcs_decimal',
                lambda n, e=good, o=original: n.full_value_matches(e, o, o['result'], o['custody']),
                lambda n, e=bad, o=stored: n.full_value_matches(e, o, o['result'], o['custody']))

        # D04q / V05q for every family: a lone surrogate in the summary has no
        # RFC 8785 encoding (qualified_jcs unicode_scalar); the schema admits the string.
        good = copy.deepcopy(full)
        good['payload'].setdefault('summary', 'summary')
        bad = copy.deepcopy(good)
        bad['payload']['summary'] += '\ud800'
        add('D04', family, 'inline_jcs_lone_surrogate', lambda n, r=row, e=good: n.decode(r, e, {}),
            lambda n, r=row, e=bad: n.decode(r, e, {}))
        add('V05', family, 'stored_inline_jcs_lone_surrogate', lambda n, e=good: n.stored_event_valid(e),
            lambda n, e=bad: n.stored_event_valid(e))
        # D04q / V05q: an inline payload integer whose JCS decimal differs.
        paths = [p for p in integer_paths(full['payload'])]
        for path in paths:
            good = copy.deepcopy(full)
            m.set_path(good['payload'], path, EXACT_2_53)
            bad = copy.deepcopy(full)
            m.set_path(bad['payload'], path, DECIMAL_LOSS)
            if not (m.guard_accepted(lambda: m.decode(row, good, {})) and m.stored_event_valid(good)):
                continue
            add('D04', family, 'inline_jcs_' + '_'.join(map(str, path)), lambda n, r=row, e=good: n.decode(r, e, {}),
                lambda n, r=row, e=bad: n.decode(r, e, {}))
            add('V05', family, 'stored_inline_jcs_' + '_'.join(map(str, path)), lambda n, e=good: n.stored_event_valid(e),
                lambda n, e=bad: n.stored_event_valid(e))
            break

        # H05b / H05c: SP-1101 dispatch of the family's own retained original.
        if family not in m.PROVIDER_HASH_PATHS:
            original = first_original(m, fixtures, family, full)
            source = m.history_source_for(row, full['payload'], original)
            foreign = copy.deepcopy(source)
            foreign['authenticated_original']['event']['event_id'] += '-foreign'
            add('H05', family, 'foreign_authenticated_binding', lambda n, r=row, o=original, s=source: n.resolve_history(r, o, s, {}),
                lambda n, r=row, o=original, s=foreign: n.resolve_history(r, o, s, {}))
            add('H05', family, 'caller_recipe_override', lambda n, r=row, o=original, s=source: n.resolve_history(r, o, s, {}),
                lambda n, r=row, o=original, s=source: n.resolve_history(r, o, s, {}, recipe_override=n.HISTORICAL_V1))

        if family.endswith('.restore_point'):
            restore_cases(m, fixtures, row, full, add)
    shared_cases(m, add)
    return result


def integer_paths(value, path=()):
    if type(value) is int:
        yield path
    elif type(value) is dict:
        for key, child in value.items():
            yield from integer_paths(child, (*path, key))
    elif type(value) is list:
        for index, child in enumerate(value):
            yield from integer_paths(child, (*path, index))


def restore_cases(m, fixtures, row, full, add):
    family = row['event_type']
    schema = m.load(row['payload_schema_ref'])
    payload = full['payload']
    # The restore point's own date-time fields (format: date-time in its schema).
    for name in ('missing_zone', 'february_30', 'trailing_lf', 'false_leap_second'):
        bad = copy.deepcopy(payload)
        bad['created_at_utc'] = BROAD_INVALID[name]
        add('S08', family, 'payload_created_at_' + name, lambda n, s=schema, p=payload: n.validator(s).is_valid(p),
            lambda n, s=schema, p=bad: n.validator(s).is_valid(p))
    # O14: the authenticated predecessor binding names another original.
    successor = fixtures['restore_successor']
    src = dict(proof_valid=True, predecessor_complete=True, snapshot_current=True,
               canonical_point=successor['payload']['type_payload'])
    src = observation_source(m, fixtures, row, full, {}, src)
    bad = copy.deepcopy(src)
    bad['predecessor_source']['authenticated_original']['event']['event_id'] += '-foreign'
    add('O14', family, 'foreign_predecessor_binding',
        lambda n, s=src: n.observation_admissible(successor, full, row, {}, s),
        lambda n, s=bad: n.observation_admissible(successor, full, row, {}, s))


def shared_cases(m, add):
    # I04 / I05: the shared SP-1100 EVENT_VALUE codec at the value boundary.
    add('I04', 'shared', 'uint64_overflow', lambda n: n.value_bytes({'v': 2 ** 64 - 1}), lambda n: n.value_bytes({'v': 2 ** 64}))
    add('I04', 'shared', 'int64_underflow', lambda n: n.value_bytes({'v': -2 ** 63}), lambda n: n.value_bytes({'v': -2 ** 63 - 1}))
    add('I05', 'shared', 'lone_surrogate_value', lambda n: n.value_bytes({'v': 'x'}), lambda n: n.value_bytes({'v': '\ud800'}))
    add('I05', 'shared', 'lone_surrogate_key', lambda n: n.value_bytes({'x': 1}), lambda n: n.value_bytes({'\udc00': 1}))
    # J01s: storage_form qualifies the payload's JCS preimage before any effect.
    for route, size in (('inline', 0), ('packed', 17000)):
        for name, value in (('binary64_loss', BINARY64_LOSS), ('decimal_loss', DECIMAL_LOSS)):
            add('J01', 'shared', 'storage_form_' + name + '_' + route,
                lambda n, size=size: n.storage_form({'number': EXACT_2_53, 'summary': 'x' * size}, {}),
                lambda n, v=value, size=size: n.storage_form({'number': v, 'summary': 'x' * size}, {}))
    # S08 on an open schema: the shared checker runs for every date-time format.
    schema = {'type': 'object', 'properties': {'ts': {'type': 'string', 'format': 'date-time'}}}
    for name, value in BROAD_INVALID.items():
        add('S08', 'shared', 'format_' + name, lambda n: n.validator(schema).is_valid({'ts': BROAD_VALID['offset']}),
            lambda n, v=value: n.validator(schema).is_valid({'ts': v}))
