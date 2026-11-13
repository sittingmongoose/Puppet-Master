"""Run the shared NUMRULE number corpus through the complete W3G checker routes (CV-1100, SP-1100, SP-1101).

Every number spelling of Plans/event_number_recipe_corpus.json in the number scope (the raw JSON text of the
token, parse, slot, current_json_slot, jcs and parse_token cases and the exact integers of the integer,
uint64, physical and jcs_value cases), plus a 4,400-digit integer, is parsed by the shared current ingress
(loads_current_json) and written into a coherent W3G original of every family at every integer slot the
lane owns:

- payload/<slot>: each payload integer slot of the selected selector, written into the stored payload and
  its native fact together (refinish re-derives every copy and commitment); checked through every table
  except the family owner tables (fx_/en_<family>), whose before/after owner relations are fixed to the base
  value and carry their own witnesses;
- producer_sequence/append, /retry: EventRecord producer_sequence_id in the native source and the event,
  through the complete current append and an exact retry;
- storage_sequence/append, /history: the Storage-issued sequence_id (event, Storage's issued record and the
  first receipt) through the complete append and an SP-1101 retained read of the sealed original;
- receipt_sequence: the first-receipt sequence_id alone; a receipt must carry its event's sequence_id (41), so every
  other value is refused (NM05 when not an exact uint64, ST08 otherwise);
- frontier: the SP-278 read-token frontier_revision of a retained read (stored and live token together).

The expected outcome is composed from the shared helpers alone (loads_current_json, current_integer with the
schema bounds, storage_uint64, storage_value_bytes, qualified_jcs), never from the checker. A 4,400-digit
integer must reach a refusal row without an exception. Date-time cases are the date-time suite's.
"""
import copy
import json
from pathlib import Path

import pm_w3g_events as m
import pm_w3g_spec as spec
from pm_event_numbers import (EVENT_VALUE, Refusal, current_integer, loads_current_json, qualified_jcs,
                              storage_uint64, storage_value_bytes)
from pm_event_numbers_corpus import NUMBER_OPS

ROOT = Path(__file__).resolve().parents[1]
RAW_OPS = ('token', 'parse', 'slot', 'current_json_slot', 'jcs', 'parse_token')
VALUE_OPS = ('integer', 'uint64', 'physical', 'jcs_value')


def corpus_values():
    doc = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    seen = {}
    for case in doc['cases']:
        if case['op'] not in NUMBER_OPS or 'date_time_profile' in case:
            continue
        spelling = None
        raw = case.get('raw')
        if case['op'] in RAW_OPS and type(raw) is str:
            if case['op'] == 'current_json_slot':
                try:
                    tree = json.loads(raw)
                    if case.get('path') == ['n', 0] and type(tree) is dict and list(tree) == ['n']:
                        spelling = raw[raw.index('[') + 1:raw.rindex(']')]
                except ValueError:
                    spelling = None
            else:
                spelling = raw
        elif case['op'] in VALUE_OPS and type(case.get('value')) is dict and set(case['value']) == {'@int'}:
            spelling = case['value']['@int']
        if spelling is not None:
            seen.setdefault(spelling, []).append(case['id'])
    seen.setdefault('9' * 4400, ['w3g-4400-digit-integer'])
    return seen


def parsed(spelling):
    try:
        with m.exact_integer_digits():
            return True, loads_current_json(spelling)
    except (Refusal, ValueError):
        return False, None


def admitted(value, minimum=None, uint64=False, maximum=None):
    if type(value) is not int:
        return False
    try:
        with m.exact_integer_digits():
            storage_uint64(value) if uint64 else current_integer(value, minimum=minimum, maximum=maximum)
    except Refusal:
        return False
    return True


def physical(value):
    try:
        with m.exact_integer_digits():
            storage_value_bytes([value], profile=EVENT_VALUE)
    except (Refusal, ValueError, OverflowError):
        return False
    return True


def producer(value, path):
    tree = node = {}
    for key in path[:-1]:
        node = node.setdefault(key, {})
    node[path[-1]] = value
    try:
        with m.exact_integer_digits():
            qualified_jcs(tree)
    except (Refusal, ValueError):
        return False
    return True


def route(w, exclude_family_tables=False):
    with m.exact_integer_digits():
        obs, _ = m.observe(w)
        slug = m.FAM[w['family']]['slug']
        for phase in m.order(w):
            if exclude_family_tables and (phase == f'fx_{slug}' or phase.startswith(f'en_{slug}_')):
                continue
            first = m.refusal(phase, obs)
            if first is not None:
                return first
    return None


def _slot_fact(f, k):
    return spec.PAYLOAD[f][k]


def run():
    values = corpus_values()
    mismatches, crashes = [], []
    counts = dict(spellings=len(values), ingress_refused=0, routes=0, accepted=0, refused=0)
    for spelling, ids in sorted(values.items(), key=lambda kv: (len(kv[0]), kv[0])):
        ok, value = parsed(spelling)
        if not ok:
            counts['ingress_refused'] += 1
            continue
        phys = physical(value)
        for f in m.FAMILIES:
            for scope in m.SCOPES[f]:
                checks = []
                for k, minimum, maximum, nullable in m._int_slots(f, scope):
                    path = _slot_fact(f, k)
                    if path.startswith('@'):
                        continue
                    w = m.build_world(f, scope)
                    w['event']['payload'][k] = copy.deepcopy(value)
                    m.refinish(w)
                    want = admitted(value, minimum, maximum=maximum) and phys and producer(value, ('payload', k))
                    checks.append((f'payload/{k}', want, lambda w=w: route(w, exclude_family_tables=True)))
                if phys:
                    w = m.build_world(f, scope, native_patch=dict(producer_sequence_id=copy.deepcopy(value)))
                    want = admitted(value, 0) and producer(value, ('producer_sequence_id',))
                    checks.append(('producer_sequence/append', want, lambda w=w: m.check(w)))
                    if want:
                        wr = m.build_world(f, scope, boundary=m.RT, native_patch=dict(producer_sequence_id=copy.deepcopy(value)))
                        checks.append(('producer_sequence/retry', True, lambda w=wr: m.check(w)))
                    for b in (m.A, m.HI):
                        w2 = m.build_world(f, scope, boundary=b)
                        w2['event']['sequence_id'] = copy.deepcopy(value)
                        m.refinish(w2)
                        eid = w2['event']['event_id']
                        w2['storage']['issued'][eid]['sequence_id'] = copy.deepcopy(value)
                        w2['storage']['receipts'][eid]['sequence_id'] = copy.deepcopy(value)
                        checks.append((f'storage_sequence/{b}', admitted(value, uint64=True), lambda w=w2: m.check(w)))
                w3 = m.build_world(f, scope)
                w3['storage']['receipts'][w3['event']['event_id']]['sequence_id'] = copy.deepcopy(value)
                # the receipt alone: it must equal the event's sequence_id (41), so only the exact integer 41 is accepted
                checks.append(('receipt_sequence', type(value) is int and value == 41, lambda w=w3: m.check(w)))
                w4 = m.build_world(f, scope, boundary=m.HI)
                w4['checkpoint']['live_token']['frontier_revision'] = copy.deepcopy(value)
                w4['checkpoint']['stored_token']['frontier_revision'] = copy.deepcopy(value)
                w4['request']['checkpoint']['frontier_revision'] = copy.deepcopy(value) if type(value) is int else 41
                if type(value) is int and admitted(value, uint64=True):
                    w4['checkpoint']['coverage'] = [[0, value]] if value >= 0 else w4['checkpoint']['coverage']
                checks.append(('frontier', admitted(value, uint64=True) and type(value) is int, lambda w=w4: m.check(w)))
                for name, want, fn in checks:
                    counts['routes'] += 1
                    try:
                        got = fn()
                    except Exception as error:   # a crash is never a refusal
                        crashes.append(dict(spelling=spelling[:40], len=len(spelling), family=f, scope=scope, route=name,
                                            error=f'{type(error).__name__}: {str(error)[:160]}'))
                        continue
                    counts['accepted' if got is None else 'refused'] += 1
                    if (got is None) != want:
                        mismatches.append(dict(spelling=spelling[:40], len=len(spelling), corpus_ids=ids[:3], family=f, scope=scope,
                                               route=name, expected='accept' if want else 'refuse', got=got))
    return dict(status='pass' if not mismatches and not crashes else 'fail', counts=counts, mismatches=mismatches[:100],
                mismatch_count=len(mismatches), crashes=crashes[:50], crash_count=len(crashes))
