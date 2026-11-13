"""Run the shared NUMRULE number corpus through the complete W3H checker routes (CV-1100, SP-1100, SP-1101).

Every number spelling of Plans/event_number_recipe_corpus.json in the number scope (the raw JSON text of the
token, parse, slot, current_json_slot, jcs and parse_token cases and the exact integers of the integer,
uint64, physical and jcs_value cases) is parsed by the shared current ingress (loads_current_json) and
written into a coherent W3H original of every family at every integer slot the lane owns:

- payload: each family payload integer slot, through the publication route (journal, representation,
  envelope, identity, source and custody tables); the family owner tables are excluded here because their
  before/after owner facts are fixed to the base value (each owner predicate has its own witnesses);
- producer_sequence: EventRecord producer_sequence_id through the complete current append (all tables),
  then an exact retry of that original;
- storage_sequence: the Storage-issued sequence_id through the complete append and an SP-1101 retained read
  of the sealed original;
- receipt: each AppendReceipt uint64 slot of a settled original (Storage's issued receipt carries it too);
- byte_size: the SP-337 descriptor byte_size of an external original.

The expected outcome is composed from the shared helpers alone (loads_current_json, current_integer with
the owner bounds, storage_uint64, storage_value_bytes, qualified_jcs with the slot's type-sensitive path,
and the exact pack length for byte_size), never from the checker. A 4,400-digit integer must reach a
refusal row without an exception. Date-time cases are the date-time suite's.
"""
import copy
import json
from pathlib import Path

import pm_w3h_events as m
from pm_event_numbers import (EVENT_VALUE, Refusal, current_integer, loads_current_json, qualified_jcs,
                              storage_uint64, storage_value_bytes)
from pm_event_numbers_corpus import NUMBER_OPS

ROOT = Path(__file__).resolve().parents[1]
RAW_OPS = ('token', 'parse', 'slot', 'current_json_slot', 'jcs', 'parse_token')
VALUE_OPS = ('integer', 'uint64', 'physical', 'jcs_value')
NON_FX = ('ad',) + m.VERIFY_ORDER


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
    seen.setdefault('9' * 4400, ['w3h-4400-digit-integer'])
    return seen


def parsed(spelling):
    try:
        with m.exact_integer_digits():
            return True, loads_current_json(spelling)
    except (Refusal, ValueError):
        return False, None


def admitted(value, minimum=None, maximum=None, uint64=False):
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
            qualified_jcs(tree, type_sensitive_paths={tuple(path)})
    except (Refusal, ValueError):
        return False
    return True


def route_refusal(w, phases):
    obs, _ = m.observe_publication(w, 'current')
    for phase in phases:
        first = m.refusal(phase, obs)
        if first is not None:
            return first
    return None


def run():
    values = corpus_values()
    mismatches, counts = [], dict(spellings=len(values), ingress_refused=0, routes=0, accepted=0, refused=0)
    for spelling, ids in sorted(values.items(), key=lambda kv: (len(kv[0]), kv[0])):
        ok, value = parsed(spelling)
        if not ok:
            counts['ingress_refused'] += 1
            continue
        for f in m.FAMILIES:
            checks = []
            for name, minimum, maximum, _nullable in m.INT_SLOTS[f]:
                w = m.build_world(f, state='prepared')
                w['publication']['prepared_event']['payload'][name] = copy.deepcopy(value)
                w['source']['result'][name] = copy.deepcopy(value)
                want = admitted(value, minimum, maximum) and physical(value) and producer(value, ('payload', name))
                checks.append((f'payload/{name}', want, lambda w=w: route_refusal(w, NON_FX)))
            if physical(value):
                w = m.build_world(f, state='settled')
                for target in (w['publication']['prepared_event'], w['source']):
                    target['producer_sequence_id'] = copy.deepcopy(value)
                ev = m.logical_of(w)
                w['publication']['full_value_commitment']['sha256'] = m.full_value_commitment(ev)
                w['storage']['commitments'][ev['event_id']]['sha256'] = m.full_value_commitment(ev)
                want = admitted(value, 0) and producer(value, ('producer_sequence_id',))
                checks.append(('producer_sequence/append', want, lambda w=w: m.verify_publication(w, 'current')))
                if want:
                    checks.append(('producer_sequence/retry', True, lambda w=w: (lambda r: None if r[0] != 'refused' else r[1])(
                        m.retry(w, copy.deepcopy(m.logical_of(w))))))
                w2 = m.build_world(f, state='settled')
                for target in (w2['publication']['prepared_event'], w2['storage']['issued'], w2['publication']['first_append_receipt'],
                               w2['storage']['receipts'][m.logical_of(w2)['event_id']]):
                    target['sequence_id'] = copy.deepcopy(value)
                ev2 = m.logical_of(w2)
                w2['publication']['full_value_commitment']['sha256'] = m.full_value_commitment(ev2)
                w2['storage']['commitments'][ev2['event_id']]['sha256'] = m.full_value_commitment(ev2)
                want2 = admitted(value, uint64=True)
                checks.append(('storage_sequence/append', want2, lambda w=w2: m.verify_publication(w, 'current')))
                sealed = m.seal_write_receipt(copy.deepcopy(w2)) if want2 else None
                if sealed is not None:
                    checks.append(('storage_sequence/retained', True, lambda w=sealed: (lambda r: None if r[0] == 'available' else r[1])(
                        m.retained_read(w, m.default_read(w)))))
            for slot in m.RECEIPT_UINT64:
                w = m.build_world(f, state='settled')
                ev = m.logical_of(w)
                for target in (w['publication']['first_append_receipt'], w['storage']['receipts'][ev['event_id']]):
                    target[slot] = copy.deepcopy(value)
                if slot == 'sequence_id':
                    continue   # the receipt sequence joins the event sequence: covered by storage_sequence above
                checks.append((f'receipt/{slot}', admitted(value, uint64=True) and physical(value),
                               lambda w=w: m.verify_publication(w, 'current')))
            w = m.build_world(f, state='prepared', external=True)
            w['publication']['prepared_event']['payload_ref']['byte_size'] = copy.deepcopy(value)
            pack_len = len(next(iter(w['storage']['packs'].values()))['bytes'])
            checks.append(('descriptor/byte_size', admitted(value, 0) and value == pack_len and physical(value),
                           lambda w=w: m.verify_publication(w, 'current')))
            for route, want, call in checks:
                counts['routes'] += 1
                try:
                    with m.exact_integer_digits():
                        got = call()
                except Exception as exc:   # never a refusal
                    mismatches.append(dict(spelling=spelling[:40], family=f, route=route, want=want, got=('exception', type(exc).__name__)))
                    continue
                counts['accepted' if got is None else 'refused'] += 1
                if (got is None) != want:
                    mismatches.append(dict(spelling=spelling[:40], family=f, route=route, want=want, got=got, corpus=ids[:3]))
    return dict(status='pass' if not mismatches else 'fail', counts=counts, mismatches=mismatches[:100],
                mismatch_count=len(mismatches))
