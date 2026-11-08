#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through DMEM's own number boundaries (sweep part 2B numbers).

Every number-scope case of Plans/event_number_recipe_corpus.json (pm_event_numbers_corpus.number_case)
whose operation has a DMEM boundary runs through that boundary of the complete DMEM checker, and its
outcome is compared with the corpus's own independent oracle (expected value, bytes or refusal reason):

- uint64: a Storage sequence_id of a complete current writer candidate through append_current; the
  SP-1100 Storage uint64 row (AP01) must give the corpus reason, and an accepted candidate must return
  the exact integer;
- integer, slot and current_json_slot without bounds, numeric values: DMEM's CV-1100 commitment-number
  gate (the AP02 observation number_error over producer fields), after the current parser for raw input;
- current_json: DMEM's raw-literal parser (json_numbers, the shared loads_current_json);
- physical with the SP-278 INDEX_BINDING profile: DMEM's value-size route (the CV-1100 gate, then the
  shared INDEX_BINDING dispatcher), compared byte for byte.

Operations or values with no DMEM boundary are counted as not applicable with the reason. The date-time
scope (cases with a date_time_profile) is never selected.
"""
import copy
from decimal import Decimal
import json
from pathlib import Path

from pm_event_numbers import INDEX_BINDING, JsonNumber, Refusal, storage_value_bytes
from pm_event_numbers_corpus import _at, _value, number_case, typed

ROOT = Path(__file__).resolve().parents[1]
NOT_APPLICABLE = {
    'token': 'DMEM parses raw JSON literals with loads_current_json (current_json and slot cases), never bare tokens',
    'parse': 'DMEM has no loads_exact boundary; it never retains JsonNumber tokens',
    'parse_token': 'DMEM has no loads_exact boundary',
    'boolean': 'DMEM flag rows are value predicates (is True / is False), not the exact_boolean type gate',
    'append_policy': 'DMEM current writers admit only dedupe_by_idempotency_key (AP04/AP05), a stricter owner policy',
    'decode': 'DMEM decodes no stored MessagePack bytes',
    'payload': 'DMEM inline payloads have no SP-337 payload references',
    'history': 'retained-recipe dispatch (SP-1101) is a part 2B item that crosses the date-time scope',
    'recipe_constructor': 'retained-recipe dispatch (SP-1101) is a part 2B item',
    'binding_constructor': 'retained-recipe dispatch (SP-1101) is a part 2B item',
    'json_number': 'DMEM never carries JsonNumber tokens past its parser',
    'parsed_decimal': 'DMEM refuses every ParsedDecimal at its integer gate; it builds none',
    'full_value_commitment': 'the CV-339 full-value commitment depends on SP-1101 retained dispatch (part 2B)',
    'jcs': 'DMEM has no JCS route: retries compare the producer fields exactly; local recipes are not JCS',
    'jcs_value': 'DMEM has no JCS route',
    'jcs_kind_declaration': 'DMEM has no JCS route',
    'producer': 'DMEM has no CV-317 producer digest: retries compare the producer fields exactly',
}
NUMERIC = (int, float, Decimal, JsonNumber)


def outcome(function):
    try:
        return 'accepted', function()
    except Refusal as refusal:
        return 'refused', refusal.reason
    except Exception as exc:  # noqa: BLE001 - an exception is a failed case, never a refusal or acceptance
        return 'error', type(exc).__name__ + ': ' + str(exc)


def expected_of(case):
    """The corpus oracle: a refusal reason, or the typed returns encoding (pm_event_numbers_corpus.typed), else the output."""
    if 'error' in case:
        return 'refused', case['error']
    return 'accepted', case['returns'] if 'returns' in case else case.get('output')


def gate(m, value):
    """DMEM's CV-1100 commitment-number gate: the AP02 observation for a producer value."""
    error = m.number_error({'n': value})
    if error is not None:
        return 'refused', error
    return 'accepted', value


def writer_uint64(m, writer, before, event, value):
    candidate = {**m.canonical_value(before['operation'], event.rsplit('.', 1)[1]), 'sequence_id': value}
    try:
        _, output = writer(copy.deepcopy(before), candidate, event)
    except m.TableRefusal as refusal:
        if (refusal.phase, refusal.row) != ('ap_uint64', 'AP01_storage_uint64'):
            return 'mismatch', refusal.phase + '/' + refusal.row
        return 'refused', m.storage_uint64_errors(candidate)[0][1]
    return 'accepted', output['sequence_id']


def short(value):
    """A bounded description (Python refuses str() of an integer above 4300 digits)."""
    try:
        return str(value)[:60]
    except ValueError:
        return '<value holding an integer above 4300 decimal digits>' 


def run(m, fixtures, event, writer=None):
    """[(case id, ok, detail)] for every number-scope case with a DMEM boundary, plus one coverage line.

    m is the custody core; writer is the family's complete current writer (the archive module's
    append_current for the Card 1b families, which adds the cutoff gate), by default m.append_current.
    """
    writer = writer or m.append_current
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    before = next(f['states'] for f in fixtures['writer_families'] if f['event_type'] == event)['before'] \
        if 'writer_families' in fixtures else next(f['writer_states'] for f in fixtures['families'] if f['event_type'] == event)['before']
    results, skipped = [], {}

    def skip(key):
        skipped[key] = skipped.get(key, 0) + 1
    for case in corpus['cases']:
        if not number_case(case):
            continue
        op = case['op']
        earlier_gate = False
        want = expected_of(case)
        if op in NOT_APPLICABLE:
            skip(op)
            continue
        if op == 'uint64':
            value = _value(case['value'])
            if type(value) is JsonNumber:
                skip('uint64/json_number_carrier')
                continue
            got = writer_uint64(m, writer, before, event, value)
        elif op in ('integer', 'slot', 'current_json_slot'):
            if case.get('bounds'):
                skip(op + '/bounds')
                continue
            if op == 'integer':
                parsed = ('accepted', _value(case['value']))
            elif op == 'slot':
                parsed = outcome(lambda: m.json_numbers('{"nested":{"number":' + case['raw'] + '}}')['nested']['number'])
            else:
                parsed = outcome(lambda: _at(m.json_numbers(case['raw']), case['path']))
            if parsed[0] != 'accepted':
                got = parsed
            elif not isinstance(parsed[1], NUMERIC) or type(parsed[1]) is bool:
                skip(op + '/non_number_type')  # a non-number's type is its slot schema's verdict, not the number gate
                continue
            else:
                got = gate(m, parsed[1])
        elif op == 'current_json':
            if case.get('numeric_kinds'):
                skip('current_json/numeric_kinds')
                continue
            got = outcome(lambda: m.json_numbers(case['raw']))
        elif op == 'physical':
            if case.get('profile') != INDEX_BINDING:
                skip('physical/' + str(case.get('profile')))
                continue
            if 'reported_length' in case:
                skip('physical/reported_length')  # DMEM values are builtin JSON trees; no length-reporting container
                continue
            value = _value(case['value'])
            admitted = outcome(lambda: m.canonical_numbers(value))
            if admitted[0] != 'accepted':
                # The codec is never reached: DMEM's CV-1100 integer gate refuses a float first. Agreement
                # here is refusal of the same value; both reasons are recorded.
                got = ('refused', admitted[1])
                earlier_gate = True
            else:
                got = outcome(lambda: storage_value_bytes(admitted[1], profile=INDEX_BINDING).hex())
        else:
            skip('unmapped/' + op)
            continue
        if want[0] == 'accepted':
            ok = got[0] == 'accepted' and (want[1] in (None, 'accepted') or
                                           (typed(got[1]) == want[1] if 'returns' in case else got[1] == want[1]))
        elif earlier_gate:
            ok = got[0] == 'refused'
        else:
            ok = got == want
        note = ' (refused first by the CV-1100 integer gate)' if earlier_gate else ''
        results.append((case['id'], ok, f'{op}: expected {want[0]} {short(want[1])}; DMEM {got[0]} {short(got[1])}{note}'))
    unmapped = sorted(k for k in skipped if k.startswith('unmapped/'))
    results.append(('coverage', not unmapped and len(results) > 0,
                    f'{len(results)} DMEM-boundary cases; not applicable: ' + json.dumps(skipped, sort_keys=True)))
    return results
