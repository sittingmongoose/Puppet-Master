#!/usr/bin/env python3
"""Sweep part 2B witnesses (S-FMT1 date-time, S-N2 SP-1101 retained dispatch) and the sealed write custody.

Usage: python3 scripts/pm_ds15_p2b_cases.py --write            (write Plans/ds15_p2b_cases.json from CASES)
       python3 scripts/pm_ds15_p2b_cases.py --write-custody    (write Plans/ds15_original_custody.json)
       python3 scripts/pm_ds15_p2b_cases.py --check            (both files current; every witness as stated)

Each witness starts from a named valid parent of its own family (a semantic case, a deck-2 base or a value
fixture), changes one fact, and moves every copy that observes it ('cohere': the retained envelope copy,
custody producer digest and the CV-339 commitment copies of an edited original; 'store': the custody copy of
the Storage instance). A negative must be refused with its FIRST refusal exactly at its target row; a
timestamp negative must also carry the shared pm_event_datetime Refusal with the named reason as the cause
of a validation error of the named record (CV-1101: the installed predicate runs through the validator). A
positive must give exactly its expected result with no refusal recorded.

The sealed write custody (Plans/ds15_original_custody.json) is the static stand-in for Storage's SP-1101
custody. The builder records it once from the committed fixture world: every Storage instance the fixtures
use is a ds15-v1 custody store for all 23 families; every original that reaches the retained resolution
(rd_resolve) after passing every frozen-recipe check is sealed in the store that holds it; the part 2B
positives marked 'seal' are sealed as written originals; and the wrong-tuple and older-recipe originals the
SX05/SX06 witnesses need are sealed with exactly that recipe. The part 2B negatives are never sealed. At
check time the case under check never adds to it.
"""
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'Plans/ds15_p2b_cases.json'
CUSTODY = ROOT / 'Plans/ds15_original_custody.json'
FIXTURE_STORES = ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222')
STORE_NO_CUSTODY = '33333333-3333-4333-8333-333333333333'   # SX01: no sealed write custody at all
STORE_V0 = '44444444-4444-4444-8444-444444444444'           # SX02: custody records the older ds15-v0 writer
STORE_EMPTY = '66666666-6666-4666-8666-666666666666'        # SX03: a ds15-v1 custody store that holds no copy
BIG = 2 ** 53 + 1

# (id, family, parent, op, changes, maintain, expect, extra)
#   parent: ('sem', case id) | ('deck2', base) | ('value', schema ref, case id)
#   changes: {slash path: value}; 'original/event/...' edits of the original event
#   maintain: 'cohere' (copy the edited original event to the retained envelope and recompute the custody
#             producer digest and both commitment copies), 'store' (move the custody Storage instance copy)
#   expect: {'row': refusing row, 'result': result} for a negative; {'result': ...} for a positive
#   extra: {'cause': [record, reason]} timestamp cause check; {'seal': true} sealed as a written original;
#          {'seal_as': [event_type, write_recipe]} sealed with exactly that (wrong) family or recipe
LIVE, CAPTURE, UPDATE = 'live.step.updated', 'browser.context_captured', 'catalog.update.started'
DEV = 'Plans/ds15_dev_session_record_v2.schema.json'
REFUSE = {'result': 'REFUSE', 'effects': 0}
ACCEPT = {'result': 'ACCEPT', 'effects': 0}
ORIGINAL = {'result': 'ORIGINAL', 'effects': 0, 'event_id': 'event:live_step_updated:1', 'receipt_ref': 'receipt:live_step_updated:1'}
UNAVAILABLE = {'result': 'UNAVAILABLE', 'effects': 0}
CASES = [
    # S-FMT1: the shared predicate refuses through the validator, EventRecord profile (current envelope)
    ('T01-occurred-hour-24', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/occurred_at_utc': '2026-09-11T24:00:00Z'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_hour']}),
    ('T02-occurred-trailing-LF', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/occurred_at_utc': '2026-09-11T21:00:00Z\n'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_syntax']}),
    ('T03-occurred-false-leap-second', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/occurred_at_utc': '2015-12-31T23:59:60Z'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_leap_second']}),
    ('T04-occurred-space-separator', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/occurred_at_utc': '2026-09-11 21:00:00Z'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_syntax']}),
    ('T05-occurred-month-13', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/occurred_at_utc': '2026-13-11T21:00:00Z'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_month']}),
    ('T06-occurred-offset-hour-24', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/occurred_at_utc': '2026-09-11T21:00:00+24:00'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_offset_hour']}),
    ('T07-occurred-missing-zone', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/occurred_at_utc': '2026-09-11T21:00:00'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_syntax']}),
    # S-FMT1: CV-253 storage_utc_z on the Storage-assigned fields (current envelope)
    ('T08-observed-plus-zero', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/observed_at_utc': '2026-09-11T21:00:01+00:00'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_utc_z']}),
    ('T09-persisted-lowercase-z', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/persisted_at_utc': '2026-09-11T21:00:01z'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_utc_z']}),
    ('T10-persisted-minus-zero', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/persisted_at_utc': '2026-09-11T21:00:01-00:00'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_utc_z']}),
    ('T11-observed-nonzero-offset', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/observed_at_utc': '2026-09-11T23:00:01+02:00'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_utc_z']}),
    ('T12-observed-trailing-LF', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/observed_at_utc': '2026-09-11T21:00:01Z\n'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_syntax']}),
    # S-FMT1: retained originals keep CV-253 on Storage fields; a skipped old check authorizes nothing
    ('T13-retained-original-observed-offset', LIVE, ('sem', 'read-current'), 'read',
     {'original/event/observed_at_utc': '2026-09-11T21:00:01+00:00'}, ['commitments'],
     {'row': 'ORIGINAL_EVENT_schema', 'result': REFUSE}, {'cause': ['original_event', 'date_time_utc_z']}),
    ('T14-retained-original-occurred-hour-24', LIVE, ('sem', 'read-current'), 'read',
     {'original/event/occurred_at_utc': '2026-09-11T24:00:00Z'}, ['cohere'],
     {'row': 'ENVELOPE_V1_schema', 'result': REFUSE}, {'cause': ['envelope', 'date_time_hour']}),
    ('T15-retained-envelope-persisted-lowercase-z', LIVE, ('sem', 'read-current'), 'read',
     {'envelope/persisted_at_utc': '2026-09-11T21:00:01z'}, [], {'row': 'ENVELOPE_V1_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_utc_z']}),
    # S-FMT1: the first receipt's acknowledged_at_utc (owner format: date-time, EventRecord profile)
    ('T16-receipt-acknowledged-month-13', LIVE, ('sem', 'read-current'), 'read',
     {'receipt/acknowledged_at_utc': '2026-13-04T18:00:00Z'}, [], {'row': 'RECEIPT_schema', 'result': REFUSE},
     {'cause': ['receipt', 'date_time_month']}),
    ('T17-custody-acknowledged-feb-30', LIVE, ('sem', 'read-current'), 'read',
     {'custody/first_append_receipt/acknowledged_at_utc': '2026-02-30T18:00:00Z'}, [],
     {'row': 'CUSTODY_schema', 'result': REFUSE}, {'cause': ['custody', 'date_time_day']}),
    # S-FMT1: the dev session record v2 timestamps (owner format: date-time, EventRecord profile)
    ('T18-dev-record-created-offset-hour', 'shared', ('value', DEV, 'workflow-and-real-subordinate-dap'), None,
     {'value/dap/created_at_utc': '2026-11-04T00:00:00+24:00'}, [], {'row': 'VALUE_schema', 'result': False},
     {'cause': ['value', 'date_time_offset_hour']}),
    ('T19-dev-record-updated-minute-60', 'shared', ('value', DEV, 'workflow-and-real-subordinate-dap'), None,
     {'value/dap/updated_at_utc': '2026-11-04T00:60:02Z'}, [], {'row': 'VALUE_schema', 'result': False},
     {'cause': ['value', 'date_time_minute']}),
    # S-FMT1: deck 2 reuses the same validators
    ('T20-deck2-occurred-minute-60', UPDATE, ('deck2', 'project'), 'envelope_boundary',
     {'envelope/occurred_at_utc': '2026-09-11T21:60:00Z'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_minute']}),
    ('T21-deck2-observed-plus-zero', UPDATE, ('deck2', 'project'), 'envelope_boundary',
     {'envelope/observed_at_utc': '2026-09-11T21:00:01+00:00'}, [], {'row': 'ENVELOPE_schema', 'result': REFUSE},
     {'cause': ['envelope', 'date_time_utc_z']}),
    # S-FMT1 positives: owner-valid forms CV-1101 admits (current envelope)
    ('TP01-occurred-lowercase-offset-leap-second', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/occurred_at_utc': '2016-12-31t18:59:60.123456789012-05:00'}, [], {'result': ACCEPT}, {}),
    ('TP02-occurred-lowercase-z-year-0000', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/occurred_at_utc': '0000-01-01T00:00:00z'}, [], {'result': ACCEPT}, {}),
    ('TP03-observed-leap-second-long-fraction', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/observed_at_utc': '2016-12-31T23:59:60.999999999999Z'}, [], {'result': ACCEPT}, {}),
    ('TP04-persisted-lowercase-t', LIVE, ('sem', 'valid-transition'), 'payload',
     {'envelope/persisted_at_utc': '2026-09-11t21:00:01Z'}, [], {'result': ACCEPT}, {}),
    ('TP05-receipt-acknowledged-offset', LIVE, ('sem', 'read-current'), 'read',
     {'receipt/acknowledged_at_utc': '2026-11-04T13:00:00-05:00',
      'custody/first_append_receipt/acknowledged_at_utc': '2026-11-04T13:00:00-05:00',
      'issued_result/first_append_receipt/acknowledged_at_utc': '2026-11-04T13:00:00-05:00'}, [],
     {'result': ORIGINAL}, {}),
    ('TP06-dev-record-created-offset-fraction', 'shared', ('value', DEV, 'workflow-and-real-subordinate-dap'), None,
     {'value/dap/created_at_utc': '2026-11-03T19:00:00.5-05:00'}, [], {'result': True}, {}),
    # S-FMT1 + S-N2 positives: owner-valid retained history keeps its exact spelling under ds15-v1
    ('TP07-retained-original-lowercase-offset', LIVE, ('sem', 'read-current'), 'read',
     {'original/event/occurred_at_utc': '2026-09-11t16:00:00.000000000001-05:00'}, ['cohere'],
     {'result': ORIGINAL}, {'seal': True}),
    ('TP08-retained-original-leap-second-retry', LIVE, ('sem', 'original-retry'), 'recover',
     {'original/event/occurred_at_utc': '2016-12-31T23:59:60.5Z'}, ['cohere'], {'result': ORIGINAL}, {'seal': True}),
    # S-N2 positives: a retained ds15-v1 original whose producer_sequence_id is past 2^53 (read and retry)
    ('SXP1-retained-producer-sequence-past-2p53-read', LIVE, ('sem', 'read-current'), 'read',
     {'original/event/producer_sequence_id': BIG}, ['cohere'], {'result': ORIGINAL}, {'seal': True}),
    ('SXP2-retained-producer-sequence-past-2p53-retry', LIVE, ('sem', 'original-retry'), 'recover',
     {'original/event/producer_sequence_id': BIG}, ['cohere'], {'result': ORIGINAL}, {'seal': True}),
    # S-N2: rd_recipe, one selection from the sealed write custody, before any retained read
    ('SX01-read-store-without-custody', LIVE, ('sem', 'read-current'), 'read',
     {'storage_instance_id': STORE_NO_CUSTODY}, ['store'], {'row': 'SX01_custody_store', 'result': UNAVAILABLE}, {}),
    ('SX01-recover-store-without-custody', LIVE, ('sem', 'original-retry'), 'recover',
     {'storage_instance_id': STORE_NO_CUSTODY}, ['store'], {'row': 'SX01_custody_store', 'result': REFUSE}, {}),
    ('SX01-append-recovery-store-without-custody', LIVE, ('sem', 'append-recovery'), 'recover',
     {'storage_instance_id': STORE_NO_CUSTODY}, [], {'row': 'SX01_custody_store', 'result': REFUSE}, {}),
    ('SX02-read-store-older-recipe', LIVE, ('sem', 'read-current'), 'read',
     {'storage_instance_id': STORE_V0}, ['store'], {'row': 'SX02_recipe_installed', 'result': REFUSE}, {}),
    ('SX02-deck2-receipt-store-older-recipe', UPDATE, ('deck2', 'project'), 'read',
     {'storage_instance_id': STORE_V0}, ['store'], {'row': 'SX02_recipe_installed', 'result': REFUSE}, {}),
    # S-N2: rd_resolve, the shared RetainedDispatcher through the sealed original owner
    ('SX03-original-not-held-by-store', LIVE, ('sem', 'read-current'), 'read',
     {'storage_instance_id': STORE_EMPTY}, ['store'], {'row': 'SX03_original_sealed', 'result': REFUSE}, {}),
    ('SX03-append-recovery-original-not-held', LIVE, ('sem', 'append-recovery'), 'recover',
     {'storage_instance_id': STORE_EMPTY}, [], {'row': 'SX03_original_sealed', 'result': REFUSE}, {}),
    ('SX04-coherent-forgery-actor', LIVE, ('sem', 'read-current'), 'read',
     {'original/event/actor_ref': 'actor:forged'}, ['cohere'], {'row': 'SX04_original_authentic', 'result': REFUSE}, {}),
    ('SX04-coherent-forgery-occurred-at', LIVE, ('sem', 'original-retry'), 'recover',
     {'original/event/occurred_at_utc': '2026-09-11T20:59:59Z'}, ['cohere'],
     {'row': 'SX04_original_authentic', 'result': REFUSE}, {}),
    ('SX04-coherent-forgery-persisted-at', LIVE, ('sem', 'read-current'), 'read',
     {'original/event/persisted_at_utc': '2026-09-11T21:00:02Z'}, ['commitments'],
     {'row': 'SX04_original_authentic', 'result': REFUSE}, {}),
    ('SX04-deck2-coherent-forgery', UPDATE, ('deck2', 'project'), 'read',
     {'original/event/actor_ref': 'actor:forged'}, ['cohere'], {'row': 'SX04_original_authentic', 'result': REFUSE}, {}),
    ('SX05-original-sealed-under-another-family', LIVE, ('sem', 'read-current'), 'read',
     {'original/event/actor_ref': 'actor:sealed-wrong-family'}, ['cohere'],
     {'row': 'SX05_original_verification', 'result': REFUSE}, {'seal_as': ['live.session.started', 'ds15-v1']}),
    ('SX06-original-sealed-under-older-recipe', LIVE, ('sem', 'read-current'), 'read',
     {'original/event/actor_ref': 'actor:sealed-v0'}, ['cohere'],
     {'row': 'SX06_recipe_known', 'result': REFUSE}, {'seal_as': [LIVE, 'ds15-v0']}),
    # S-N2: a request cannot select or downgrade the recipe (the original-evidence carrier is closed)
    ('SXR1-request-selects-current-recipe', LIVE, ('sem', 'read-current'), 'read',
     {'original_recipe': 'current'}, [], {'row': 'EVIDENCE_schema', 'result': REFUSE}, {}),
    ('SXR2-request-recipe-override', LIVE, ('sem', 'original-retry'), 'recover',
     {'recipe_override': 'ds15-v1'}, [], {'row': 'EVIDENCE_schema', 'result': REFUSE}, {}),
]


def load_models():
    import pm_ds15_p2a_cases as p2a
    return p2a.load_models()


def contract_fixture(model, family, deck2):
    if deck2:
        c = next(c for c in model.read('Plans/ds15_deck2_contracts.json') if c['event_type'] == family)
        f = next(f for f in model.read('Plans/ds15_deck2_fixtures.json') if f['event_type'] == family)
    else:
        c = next(c for c in model.read('Plans/ds15_event_contracts.json') if c['event_type'] == family)
        f = next(f for f in model.read('Plans/ds15_event_contract_fixtures.json') if f['event_type'] == family)
    return c, f


def recompute_copies(model, data, envelope):
    """Observation maintenance after an original edit: the retained envelope copy (when asked), the custody
    producer digest and the two CV-339 commitment copies, recomputed from the edited original."""
    event = data['original']['event']
    if envelope:
        data['envelope'] = copy.deepcopy(event)
    data['custody']['producer_semantic_digest'] = model.recipe_producer_digest(model.V1, event)
    sha = model.full_value_commitment(event)
    for key in ('custody', 'issued_result'):
        data[key]['original_event_value_commitment']['sha256'] = sha


def build(m16, deck, case):
    wid, family, parent, op, changes, maintain, expect, extra = case
    if parent[0] == 'value':
        fixture = next(f for f in m16.read('Plans/ds15_value_contract_fixtures.json') if f['schema_ref'] == parent[1])
        data = {'schema_ref': parent[1], 'value': copy.deepcopy(fixture['positive'])}
        m16.patch(data['value'], next(z for z in fixture['cases'] if z['id'] == parent[2])['changes'])
        model, contract = m16, None
    elif parent[0] == 'deck2':
        model = deck.base
        contract, fixture = contract_fixture(deck, family, True)
        data = copy.deepcopy(fixture['bases'][parent[1]])
    else:
        model = m16
        contract, fixture = contract_fixture(m16, family, False)
        seed = next(z for z in fixture['semantic_cases'] if z['id'] == parent[1])
        data = m16.semantic_input(contract, fixture, seed)
    model.patch(data, changes)
    for step in maintain:
        if step == 'cohere':
            recompute_copies(model, data, envelope=True)
        elif step == 'commitments':
            recompute_copies(model, data, envelope=False)
        elif step == 'store':
            data['custody']['storage_instance_id'] = data['storage_instance_id']
        else:
            raise AssertionError(step)
    return model, contract, op, data


def call(m16, deck, case, model, contract, op, data):
    parent = case[2]
    if parent[0] == 'value':
        return lambda: m16.value_valid(data['schema_ref'], copy.deepcopy(data['value']))
    if parent[0] == 'deck2':
        return lambda: deck.evaluate(contract, op, copy.deepcopy(data))
    return lambda: m16.evaluate(contract, op, copy.deepcopy(data))


def run(m16, deck, case):
    model, contract, op, data = build(m16, deck, case)
    records = []
    m16.RECORDER = deck.base.RECORDER = records
    try:
        result = call(m16, deck, case, model, contract, op, data)()
    finally:
        m16.RECORDER = deck.base.RECORDER = None
    first = next((r for r in records if r[2] is not None), None)
    return result, first, (model, contract, op, data)


def causes(error):
    """Every shared-predicate Refusal reason among an error and its oneOf/anyOf context."""
    found = []
    stack = [error]
    while stack:
        e = stack.pop()
        if isinstance(e.cause, model_refusal()):
            found.append(e.cause.reason)
        stack.extend(e.context or ())
    return found


def model_refusal():
    from pm_event_numbers import Refusal
    return Refusal


def record_causes(model, contract, data, record):
    """Refusal reasons of the shared predicate in the named record's validation (its own validator)."""
    er = model.read('Plans/event_record.schema.json')
    receipt = model.read('Plans/event_append_receipt_contracts.schema.json')
    if record == 'envelope':
        validators = [(model.validator(er, recipe), data['envelope']) for recipe in (model.CURRENT, model.V1)]
    elif record == 'original_event':
        validators = [(model.validator(er, model.V1), data['original']['event'])]
    elif record in ('receipt', 'custody'):
        kind_name = 'AppendReceipt' if record == 'receipt' else 'custody_v2'
        validators = [(model.validator({'$defs': receipt['$defs'], '$ref': '#/$defs/' + kind_name}, model.V1), data[record])]
    elif record == 'value':
        validators = [(model.validator(model.read(data['schema_ref'])), data['value'])]
    else:
        raise AssertionError(record)
    found = []
    for v, instance in validators:
        for error in v.original.iter_errors(instance):
            found += causes(error)
        for error in model.storage_datetime_errors(instance, v.storage_fields, v.storage_profile):
            found += causes(error)
    return found


def check_case(m16, deck, case):
    result, first, built = run(m16, deck, case)
    expect, extra = case[6], case[7]
    problems = []
    if 'row' in expect:
        row = first[2][0] if first else None
        if row != expect['row']:
            problems.append(f"first refusal {first[0] + ':' + row if first else None}, not {expect['row']}")
    elif first is not None:
        problems.append(f'refusal recorded on a positive: {first[0]}:{first[2][0]}')
    if result != expect['result']:
        problems.append(f"result {result!r}, not {expect['result']!r}")
    if 'cause' in extra:
        record, reason = extra['cause']
        got = record_causes(built[0], built[1], built[3], record)
        if reason not in got:
            problems.append(f'shared predicate cause {reason} not found in {record}: {got}')
    return problems


def fixture_cases():
    rows = json.loads(FIXTURE.read_text())
    return [(r['id'], r['family'], tuple(r['parent']), r['operation'], r['changes'], r['maintain'], r['expect'], r['extra'])
            for r in rows]


def rows_of(cases):
    return [{'id': c[0], 'family': c[1], 'parent': list(c[2]), 'operation': c[3], 'changes': c[4], 'maintain': c[5],
             'expect': c[6], 'extra': c[7]} for c in cases]


def witness_calls(m16, deck):
    """(id, family, kind, pair, call) for the guard-table suite builder, inputs built before recording."""
    out = []
    for case in fixture_cases():
        model, contract, op, data = build(m16, deck, case)
        out.append((f'p2b/{case[0]}', case[1] if case[1] != 'shared' else 'shared', 'p2b', None,
                    call(m16, deck, case, model, contract, op, data)))
    return out


def check(m16, deck, cases):
    problems = []
    for case in cases:
        found = check_case(m16, deck, case)
        if found:
            problems.append({'id': case[0], 'problems': found})
    return problems


# --------------------------------------------------------------------------- sealed write custody builder
def binding_row(model, data, event_type=None, write_recipe='ds15-v1'):
    event = data['original']['event']
    binding = dict(storage_instance_id=data['storage_instance_id'], scope_kind=event['scope_kind'],
                   server_id=model.DS15_SERVER, project_id=event['project_id'], event_type=event['event_type'],
                   event_id=event['event_id'], idempotency_key=event['idempotency_key'],
                   owner_operation_id=event['correlation_id'], source_commitment=model.full_value_commitment(event))
    return {'original_ref': event['event_id'], 'event_type': event_type or event['event_type'],
            'write_recipe': write_recipe, 'binding': binding}


def build_custody():
    """Record the sealed write custody once from the committed fixture world (see the module docstring)."""
    import pm_ds15_guard_suites as suites
    m16, deck = suites.m16, suites.deck
    models = (m16, deck.base)
    families = sorted({c['event_type'] for c in m16.read('Plans/ds15_event_contracts.json')}
                      | {c['event_type'] for c in m16.read('Plans/ds15_deck2_contracts.json')})
    manifests = {}
    for name in families:
        c = m16.contract_of(name)
        manifests[name] = m16.recipe_resource_manifest(c['payload_schema_ref'], m16.context_schema_ref(c))
    stores = {s: {'write_recipe': 'ds15-v1', 'families': families} for s in (*FIXTURE_STORES, STORE_EMPTY)}
    stores[STORE_V0] = {'write_recipe': 'ds15-v0', 'families': families}
    custody = {'schema_id': 'pm.ds15.original_write_custody.fixture.v1',
               'description': ("Static stand-in for Storage's SP-1101 sealed write custody of DS15 originals (sweep part 2B, "
                               "S-N2). stores: the write recipe each Storage instance's custody records per family; "
                               "resource_manifests: the SHA-256 manifest of the frozen resources each family's originals "
                               "were written against; sealed_originals: the binding (Storage instance, scope, Server, "
                               "Project, event type, ids, owner operation, CV-339 commitment) and write recipe sealed at "
                               "each original ref. Recorded once by scripts/pm_ds15_p2b_cases.py --write-custody; the case "
                               "under check never adds to it. Native custody NOT_RUN."),
               'stores': stores, 'resource_manifests': manifests, 'sealed_originals': []}
    CUSTODY.write_text(json.dumps(custody, indent=1, sort_keys=True) + '\n')
    for model in models:
        model.read.cache_clear()
        model.original_custody.cache_clear()
    sealed = {}
    reached = []

    def recording(d):
        reached.append(copy.deepcopy({'storage_instance_id': d['storage_instance_id'], 'original': d['original']}))
        return None
    saved = [model.resolve_refusal for model in models]
    for model in models:
        model.resolve_refusal = recording
    try:
        for wid, family, kind_name, pair, run_call in suites.witness_calls():
            if wid.startswith('p2b/'):
                continue
            reached.clear()
            suites.run_recorded(run_call)
            for d in reached:
                row = binding_row(m16, d)
                sealed[json.dumps(row, sort_keys=True)] = row
        if FIXTURE.exists():
            for case in fixture_cases():
                extra = case[7]
                if extra.get('seal') or extra.get('seal_as'):
                    _, _, _, data = build(m16, deck, case)
                    event_type, recipe = extra.get('seal_as') or (None, 'ds15-v1')
                    row = binding_row(m16, data, event_type, recipe)
                    sealed[json.dumps(row, sort_keys=True)] = row
    finally:
        for model, original in zip(models, saved):
            model.resolve_refusal = original
    custody['sealed_originals'] = sorted(sealed.values(), key=lambda r: json.dumps(r, sort_keys=True))
    CUSTODY.write_text(json.dumps(custody, indent=1, sort_keys=True) + '\n')
    return custody


def main():
    if '--write' in sys.argv:
        FIXTURE.write_text(json.dumps(rows_of(CASES), indent=1, ensure_ascii=True) + '\n')
        print(f'wrote {len(CASES)} witnesses')
        if '--write-custody' not in sys.argv:
            return 0
    if '--write-custody' in sys.argv:
        custody = build_custody()
        print(f"wrote {len(custody['sealed_originals'])} sealed originals, {len(custody['stores'])} stores")
        return 0
    m16, deck = load_models()
    if '--explore' in sys.argv:
        for case in CASES:
            print('OK  ' if not check_case(m16, deck, case) else 'MISS', case[0], check_case(m16, deck, case))
        return 0
    cases = fixture_cases()
    problems = check(m16, deck, cases)
    stale = json.loads(FIXTURE.read_text()) != json.loads(json.dumps(rows_of(CASES)))
    negatives = sum(1 for c in cases if 'row' in c[6])
    print(json.dumps({'status': 'pass' if not problems and not stale else 'fail', 'witnesses': len(cases),
                      'negatives': negatives, 'positives': len(cases) - negatives, 'stale_fixture': stale,
                      'problems': problems}))
    return 1 if problems or stale else 0


if __name__ == '__main__':
    sys.exit(main())
