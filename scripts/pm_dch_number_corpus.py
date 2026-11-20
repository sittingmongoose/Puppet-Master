#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through DCH's own number boundaries.

Part 2B numbers (CV-1100 / SP-1100). Every number-scope case of
Plans/event_number_recipe_corpus.json (pm_event_numbers_corpus.number_case)
whose operation has a DCH boundary is executed through that boundary of the
complete DCH checker, and its outcome is compared with the corpus's own
independent oracle (expected bytes, text, digest or refusal reason):

- physical, EVENT_VALUE profile: DCH body_bytes under the current recipe (the
  codec of every DCH current commitment, reference and size measurement);
- producer: DCH semantic_commitment / the CV-317 producer projection that the
  retry oracle compares (route bytes and digest);
- jcs and jcs_value without type/sign/kind declarations: DCH's JCS preimage
  call (qualified_jcs with no declarations; DCH owners declare none);
- uint64: a Storage sequence_id of a complete DCH current record through the
  current append joins (TY03/TY04 refuse; any other row refusing fails);
- integer without bounds, slot and current_json_slot without bounds: a DCH
  integer slot (revision) through the type walk, after the CV-1100 current
  parser for raw input.

Operations with no DCH boundary are counted as not applicable with the reason.
The date-time scope (cases with date_time_profile) is never selected.
"""
import copy
import json
from pathlib import Path

from pm_event_numbers import Refusal, loads_current_json, producer_semantic_bytes, qualified_jcs
from pm_event_numbers_corpus import _at, _value, number_case

ROOT = Path(__file__).resolve().parents[1]
NOT_APPLICABLE = {
    'token': 'DCH parses no bare integer tokens; raw input goes through loads_current_json (slot cases)',
    'parse': 'DCH has no loads_exact boundary (it never retains JsonNumber tokens)',
    'parse_token': 'DCH has no loads_exact boundary',
    'current_json': 'covered at DCH integer slots by the slot and current_json_slot cases',
    'boolean': 'DCH flag rows are value predicates (is True / is False), not the exact_boolean type gate',
    'append_policy': 'DCH current writers admit only dedupe_by_idempotency_key (rt_policy rows), a stricter owner policy',
    'decode': 'DCH decodes no stored MessagePack bytes',
    'payload': 'DCH payload references use their own SP-337 pack descriptor rows (rb_pack_*)',
    'history': 'retained-recipe dispatch (SP-1101) is a part 2B item that crosses the date-time scope',
    'recipe_constructor': 'retained-recipe dispatch (SP-1101) is a part 2B item',
    'binding_constructor': 'retained-recipe dispatch (SP-1101) is a part 2B item',
    'json_number': 'DCH never carries JsonNumber tokens',
    'parsed_decimal': 'DCH never carries ParsedDecimal values past its integer slots',
    'full_value_commitment': 'DCH has no CV-339 full-value commitment',
    'jcs_kind_declaration': 'DCH declares no numeric kinds',
}
EVENT = 'chat.message'


def outcome(function):
    try:
        return 'accepted', function()
    except Refusal as refusal:
        return 'refused', refusal.reason
    except Exception as exc:  # noqa: BLE001 - an exception is a failed case, never a refusal or acceptance
        return 'error', type(exc).__name__ + ': ' + str(exc)


def expected_of(case):
    return ('refused', case['error']) if 'error' in case else ('accepted', case.get('output'))


def run(m):
    """[(case id, ok, detail)] for every number-scope case with a DCH boundary, plus one coverage line."""
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    fixtures = json.loads((ROOT / 'Plans/dch_event_contract_fixtures.json').read_text())
    record = next(f['record'] for f in fixtures if f['event_type'] == EVENT and f['edition'] == 'project')
    base_event = json.loads((ROOT / 'Plans/seglog_frame_v2_wire_fixtures.json').read_text())['base_event']
    results, skipped = [], {}
    for case in corpus['cases']:
        if not number_case(case):
            continue
        op = case['op']
        want = expected_of(case)
        if op in NOT_APPLICABLE:
            skipped[op] = skipped.get(op, 0) + 1
            continue
        if op == 'physical':
            if case.get('profile') is not None:
                skipped['physical/' + case['profile']] = skipped.get('physical/' + case['profile'], 0) + 1
                continue
            got = outcome(lambda: m.body_bytes(_value(case['value'])).hex())
        elif op == 'producer':
            if case.get('qualification') or case.get('event_class'):
                skipped['producer/declared'] = skipped.get('producer/declared', 0) + 1
                continue
            event = copy.deepcopy(base_event)
            event.update(_value(case.get('changes', {})))
            for field in case.get('remove', []):
                del event[field]
            if case['route'] == 'digest':
                got = outcome(lambda: m.semantic_commitment(event))
            else:
                got = outcome(lambda: producer_semantic_bytes(event).decode('utf-8'))
                if got[0] == 'accepted':
                    # The DCH retry commitment is SHA-256 of exactly these bytes.
                    import hashlib
                    if m.semantic_commitment(event) != hashlib.sha256(got[1].encode('utf-8')).hexdigest():
                        got = ('mismatch', 'semantic_commitment')
        elif op in ('jcs', 'jcs_value'):
            if case.get('typed') or case.get('sign') or 'kind' in case:
                skipped[op + '/declared'] = skipped.get(op + '/declared', 0) + 1
                continue
            if op == 'jcs':
                if case.get('parser') != 'current':
                    skipped['jcs/loads_exact'] = skipped.get('jcs/loads_exact', 0) + 1
                    continue
                got = outcome(lambda: qualified_jcs(loads_current_json(case['raw'])).decode())
            else:
                got = outcome(lambda: qualified_jcs(_value(case['value'])).decode())
        elif op == 'uint64':
            candidate = {**copy.deepcopy(record), 'sequence_id': _value(case['value'])}
            got = table_outcome(m, lambda: m._joins(candidate, EVENT, None, m.STORAGE_INSTANCE, m.CURRENT_RULE),
                                {'TY03_integer_type': 'integer_type', 'TY04_uint64_range': 'integer_range'})
        elif op in ('integer', 'slot', 'current_json_slot'):
            if case.get('bounds'):
                skipped[op + '/bounds'] = skipped.get(op + '/bounds', 0) + 1
                continue
            if op == 'integer':
                parsed = ('accepted', _value(case['value']))
            elif op == 'slot':
                parsed = outcome(lambda: loads_current_json('{"nested":{"number":' + case['raw'] + '}}')['nested']['number'])
            else:
                parsed = outcome(lambda: _at(loads_current_json(case['raw']), case['path']))
            if parsed[0] == 'refused':
                got = parsed
            else:
                value = parsed[1]
                got = table_outcome(m, lambda: m._input_types({'revision': value}), {'TY03_integer_type': 'integer_type'})
        else:
            skipped['unmapped/' + op] = skipped.get('unmapped/' + op, 0) + 1
            continue
        if want[0] == 'accepted' and type(want[1]) is dict and set(want[1]) == {'head', 'length'} and got[0] == 'accepted':
            # Large outputs are given by their leading hex and exact byte length.
            ok = got[1].startswith(want[1]['head']) and len(got[1]) == 2 * want[1]['length']
        else:
            ok = got[0] == want[0] and (want[0] == 'refused' and got[1] == want[1]
                                        or want[0] == 'accepted' and (want[1] in (None, 'accepted') or got[1] == want[1]))
        results.append((case['id'], ok, f'{op}: expected {want[0]} {str(want[1])[:60]}; DCH {got[0]} {str(got[1])[:60]}'))
    unmapped = sorted(k for k in skipped if k.startswith('unmapped/'))
    results.append(('coverage', not unmapped and len(results) > 0,
                    f'{len(results)} DCH-boundary cases; not applicable: ' + json.dumps(skipped, sort_keys=True)))
    return results


def table_outcome(m, function, codes):
    """Run a DCH table boundary: accepted, or the corpus reason of the refusing row (any other row is a mismatch)."""
    try:
        function()
    except m.TableRefusal as refusal:
        return ('refused', codes.get(refusal.row, 'row ' + refusal.row))
    except Exception as exc:  # noqa: BLE001 - an exception is a failed case, never a refusal or acceptance
        return ('error', type(exc).__name__ + ': ' + str(exc))
    return ('accepted', None)
