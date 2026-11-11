"""DG6A sweep part 2B one-defect witnesses: CV-1101 date-time and SP-1101 retained dispatch.

Case generation only: this module decides no refusal. The checker mains call these builders on valid parents;
each case changes one thing (a coherent original change counts once: the candidate and the original evidence
carry the same new original) and asserts the complete checker's exact result.

- datetime_payload: the shared CV-1101 predicate runs THROUGH the lane validator: each malformed timestamp is
  refused by the complete payload check, and the validation error's cause is the shared Refusal with its reason
  (a refusal by a pattern never counts); owner-valid leap seconds, year 0000, lowercase t/z, offsets and long
  fractions are accepted.
- history_all: SP-1101 custody rows HC01..HC05 on the history reader, the legacy-recipe downgrade, owner-valid and
  owner-invalid retained timestamps, CV-253 on retained Storage instants, former-valid integral floats under a
  legacy recipe and their refusal under a current recipe, and a large-metadata retained positive.
- retry_all: SP-1101 custody rows RQ01..RQ05 on the alert/panel retained retry.
"""
import copy

import pm_dg6a_custody as custody
from pm_event_numbers import Refusal

FOREIGN_STORE = '00000000-0000-4000-8000-000000000002'
# (value, shared Refusal reason) under the EventRecord profile, at every DG6A family timestamp.
DATETIME_REFUSALS = (('2026-11-04T24:00:00Z', 'date_time_hour'), ('2026-11-04T18:60:00Z', 'date_time_minute'),
                     ('2026-11-04T23:59:60Z', 'date_time_leap_second'), ('2025-02-29T18:00:00Z', 'date_time_day'),
                     ('2026-13-04T18:00:00Z', 'date_time_month'), ('2026-11-04T18:00:00+24:00', 'date_time_offset_hour'),
                     ('2026-11-04T18:00:00+00:60', 'date_time_offset_minute'), ('2026-11-04T18:00:00Z\n', 'date_time_syntax'),
                     ('2026-11-04 18:00:00Z', 'date_time_syntax'), ('2026-11-04T18:00:00', 'date_time_syntax'),
                     ('2016-12-31T23:59:60+01:00', 'date_time_leap_second'))
DATETIME_ACCEPTS = ('2016-12-31T23:59:60Z', '2017-01-01T01:59:60+02:00', '2016-12-31T23:59:60.5Z', '0000-01-01T00:00:00Z',
                    '2026-11-04t18:00:00z', '2026-11-04T18:00:00.123456789012Z', '2026-11-04T18:00:00-05:30',
                    '2024-02-29T23:59:59Z')
# CV-253 storage_utc_z at the Storage-assigned observed_at_utc/persisted_at_utc.
STORAGE_REFUSALS = ('2026-11-04T18:00:00+00:00', '2026-11-04T18:00:00-00:00', '2026-11-04T18:00:00z',
                    '2026-11-04T20:00:00+02:00', '2026-11-04T24:00:00Z', '2026-11-04T18:00:00Z\n')
STORAGE_ACCEPTS = ('2016-12-31T23:59:60Z', '2026-11-04T18:00:00.123456789012Z', '0000-01-01T00:00:00Z')
TIMESTAMP_FIELDS = ('ts', 'settled_at_utc', 'snooze_until', 'mute_expires_at', 'created_at', 'updated_at', 'resolved_at')


def expect(actual, expected, name):
    assert actual == expected, (name, actual, expected)
    return 1


def causes(errors):
    """Every shared Refusal reason a validation error (or a oneOf/anyOf sub-error) carries as its cause."""
    found, pending = set(), list(errors)
    while pending:
        error = pending.pop()
        if isinstance(error.cause, Refusal):
            found.add(error.cause.reason)
        pending.extend(error.context or ())
    return found


def datetime_payload(check, validate, payload, order_ok=lambda value: True):
    """check(payload) is the complete payload check (truthy = refused); validate(payload) the lane validator's errors."""
    count = 0
    fields = [k for k in TIMESTAMP_FIELDS if type(payload.get(k)) is str]
    assert fields, 'a DG6A payload carries a timestamp'
    assert not check(payload)
    for field in fields:
        for value, reason in DATETIME_REFUSALS:
            altered = dict(payload, **{field: value})
            assert check(altered), ('malformed timestamp accepted', field, value)
            count += expect(causes(validate(altered)), {reason}, 'cv1101_cause_' + field)
        for value in DATETIME_ACCEPTS:
            altered = dict(payload, **{field: value})
            if order_ok(altered):
                count += expect(bool(check(altered)), False, 'cv1101_accept_' + field + '_' + value)
    return count


def _read(reader, request, expected, unavailable):
    try:
        reader(request, expected)
    except unavailable as error:
        return error.guards
    return []


def _coherent(base, expected, change):
    request, original = copy.deepcopy(base), copy.deepcopy(expected)
    change(request['event'])
    change(original['event'])
    return request, original


def _move(event):
    """A distinct original: the first-receipt durable_end_offset moved by one (no reader row joins it elsewhere)."""
    event['receipt']['first_append_receipt']['durable_end_offset'] += 1


def _int_field(payload):
    return next(k for k, v in payload.items() if type(v) is int and type(v) is not bool)


def _ts_field(payload):
    return next(k for k in TIMESTAMP_FIELDS if type(payload.get(k)) is str)


def history_custody(base, expected, reader, unavailable, event_type):
    """HC01..HC05 one-defect witnesses on one valid retained read (base request, expected original evidence)."""
    count = expect(_read(reader, copy.deepcopy(base), copy.deepcopy(expected), unavailable), [], 'custody_base')
    request, original = _coherent(base, expected, _move)
    count += expect(_read(reader, request, original, unavailable), ['original_authority'], 'custody_forged_original')
    with custody.written([original['event']]):
        count += expect(_read(reader, request, original, unavailable), [], 'custody_written_original')
        foreign_store = custody.binding_of(dict(original['event'], storage_instance_id=FOREIGN_STORE),
                                           custody.record_bytes(original['event']))
    with custody.written([original['event']], binding=foreign_store):
        count += expect(_read(reader, request, original, unavailable), ['original_binding'], 'custody_foreign_binding')
    with custody.written([original['event']], recipe=custody.replaced_resource_recipe(original['event'])):
        count += expect(_read(reader, request, original, unavailable), ['recipe_unsupported'], 'custody_replaced_resource')
    with custody.written([original['event']], recipe=custody.foreign_recipe(event_type)):
        count += expect(_read(reader, request, original, unavailable), ['original_verification'], 'custody_foreign_recipe')
    if custody.FROZEN[custody.recipe_of(expected['event'])].identity != custody.IDENTITY_LEGACY:
        def forge_id(event):
            event['event_id'] = event['event_id'][:-1] + ('0' if event['event_id'][-1] != '0' else '1')
        request, original = _coherent(base, expected, forge_id)
        with custody.written([original['event']]):
            count += expect(_read(reader, request, original, unavailable), ['original_verification'], 'custody_identity_recomputed')
    payload = expected['event']['payload']
    if 'original_event_ref' not in payload:  # a HISTORICAL_ONLY mapping also joins the original ref
        request, original = _coherent(base, expected, lambda e: e.update(event_ref=e['event_ref'] + ':unwritten'))
        count += expect(_read(reader, request, original, unavailable), ['original_unavailable'], 'custody_unknown_ref')
    return count


def history_retained(base, expected, reader, unavailable, legacy):
    """Retained-original timestamps, Storage instants, number recipes and large metadata (each original is Storage history)."""
    count = 0
    payload = expected['event']['payload']
    ts = _ts_field(payload)
    for value in DATETIME_ACCEPTS:
        request, original = _coherent(base, expected, lambda e, value=value: e['payload'].update({ts: value}))
        with custody.written([original['event']]):
            count += expect(_read(reader, request, original, unavailable), [], 'retained_owner_valid_' + ts + '_' + value)
    for value, _reason in DATETIME_REFUSALS:
        # A writer that skipped format enforcement does not make this owner-valid history (CV-1101, SP-1101).
        request, original = _coherent(base, expected, lambda e, value=value: e['payload'].update({ts: value}))
        with custody.written([original['event']]):
            count += expect(_read(reader, request, original, unavailable), ['historical_payload'], 'retained_owner_invalid_' + ts)
    for value in ('2026-11-04t18:00:00z', '2026-11-04T20:00:00+02:00'):
        # acknowledged_at_utc keeps its owner schemas' broad format: date-time (EventRecord profile).
        request, original = _coherent(base, expected, lambda e, value=value: e['receipt']['first_append_receipt'].update(
            acknowledged_at_utc=value))
        with custody.written([original['event']]):
            count += expect(_read(reader, request, original, unavailable), [], 'retained_receipt_instant_' + value)
    for field in ('observed_at_utc', 'persisted_at_utc'):
        for value in STORAGE_ACCEPTS:
            request, original = _coherent(base, expected, lambda e, value=value, field=field: e.update({field: value}))
            with custody.written([original['event']]):
                count += expect(_read(reader, request, original, unavailable), [], 'retained_storage_' + field + '_' + value)
        for value in STORAGE_REFUSALS:
            request, original = _coherent(base, expected, lambda e, value=value, field=field: e.update({field: value}))
            with custody.written([original['event']]):
                count += expect(_read(reader, request, original, unavailable), ['event_original'], 'retained_storage_' + field)
    # SP-1101 number recipes: an integral float the original edition's schema admitted stays readable under a
    # legacy recipe; a current recipe (CV-1100 exact integers) refuses it.
    field = _int_field(payload)
    request, original = _coherent(base, expected, lambda e: e['payload'].update({field: float(e['payload'][field])}))
    with custody.written([original['event']]):
        count += expect(_read(reader, request, original, unavailable), [] if legacy else ['historical_payload'],
                        'retained_integral_float_' + field)
    # Large Storage metadata: a retained original at sequence 2^64-1 under a checkpoint through 2^64-1.
    top = 2 ** 64 - 1

    def large(event):
        event['sequence_id'] = event['receipt']['sequence_id'] = top
        event['receipt']['first_append_receipt']['sequence_id'] = event['receipt']['original_append_result']['sequence_id'] = top
    request, original = _coherent(base, expected, large)
    request['checkpoint']['through_sequence_id'] = original['checkpoint']['through_sequence_id'] = top
    with custody.written([original['event']]):
        count += expect(_read(reader, request, original, unavailable), [], 'retained_large_sequence')
    return count


def history_downgrade(base, expected, reader, unavailable, event_type):
    """A current original sealed under its family's legacy v1 tuple: custody resolves the (authentic) selection and
    the frozen v1 edition refuses the current payload (HG15); the request never picks an edition."""
    with custody.written([expected['event']], recipe=custody.edition_recipe(event_type, '1.0.0')):
        return expect(_read(reader, copy.deepcopy(base), copy.deepcopy(expected), unavailable), ['historical_payload'],
                      'custody_legacy_downgrade')


def history_all(base, expected, reader, unavailable, event_type, legacy=False, downgrade=False):
    count = history_custody(base, expected, reader, unavailable, event_type)
    count += history_retained(base, expected, reader, unavailable, legacy)
    if downgrade:
        count += history_downgrade(base, expected, reader, unavailable, event_type)
    return count


def retry_all(protocol, context, operation, code, event_type):
    """RQ01..RQ05 one-defect witnesses on a valid retained retry (context carries append_original/append_resolution)."""
    count = expect(protocol(copy.deepcopy(context), operation), [], 'retry_custody_base')

    def both(change):
        value = copy.deepcopy(context)
        for key in ('append_original', 'append_resolution'):
            change(value[key])
        return value
    value = both(_move)
    count += expect(protocol(value, operation), [code], 'retry_custody_forged_original')
    original = value['append_original']
    with custody.written([original]):
        count += expect(protocol(value, operation), [], 'retry_custody_written_original')
        foreign_store = custody.binding_of(dict(original, storage_instance_id=FOREIGN_STORE), custody.record_bytes(original))
    with custody.written([original], binding=foreign_store):
        count += expect(protocol(value, operation), [code], 'retry_custody_foreign_binding')
    with custody.written([original], recipe=custody.replaced_resource_recipe(original)):
        count += expect(protocol(value, operation), [code], 'retry_custody_replaced_resource')
    with custody.written([original], recipe=custody.foreign_recipe(event_type)):
        count += expect(protocol(value, operation), [code], 'retry_custody_foreign_recipe')
    value = both(lambda e: e.update(event_ref=e['event_ref'] + ':unwritten'))
    count += expect(protocol(value, operation), [code], 'retry_custody_unknown_ref')
    return count
