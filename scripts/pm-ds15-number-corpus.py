#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the complete DS15 checker routes.

Usage: python3 scripts/pm-ds15-number-corpus.py [--family F]... [--json out.json]

Every number value of Plans/event_number_recipe_corpus.json in the number scope (the raw JSON
spellings of the token, parse, slot, current_json_slot, jcs and parse_token cases and the exact
integers of the integer, uint64, physical and jcs_value cases) is written as JSON text into a valid
DS15 input of each selected family, parsed by the checker's own raw ingress (loads_current_json)
and run through these routes:

- payload_slot: the family payload schema at its integer slot (families that declare one);
- identity: the family identity recipe when that slot is an identity field;
- payload_op: the complete current-writer payload operation, with the payload and the envelope
  payload copy both changed and the idempotency key recomputed (slots no transition reads:
  live.session.started pid, preview.session.started and preview.session.stopped preview_revision);
- envelope_producer: the complete envelope boundary (a new append) at EventRecord producer_sequence_id;
- withdraw_admission: the complete writer-withdrawal operation with admitted_sequence and
  withdrawal_frontier both set to the value (Storage sequences);
- checkpoint_through: the checkpoint boundary at checkpoint.through_sequence_id (Storage sequence).

The expected outcome is composed from the shared helpers alone (loads_current_json, current_integer
with the slot's owner bounds, storage_uint64, storage_value_bytes, qualified_jcs with the owner's
type-sensitive path). Date-time cases are out of scope (part 2B). Exit 0 when every route agrees.
"""
import argparse
import copy
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_event_numbers import (EVENT_VALUE, Refusal, current_integer, loads_current_json, qualified_jcs,  # noqa: E402
                              storage_uint64, storage_value_bytes)
from pm_event_numbers_corpus import NUMBER_OPS  # noqa: E402

_spec = importlib.util.spec_from_file_location('ds15_sixteen', ROOT / 'scripts/pm-ds15-event-contracts.py')
base = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(base)
# The deck-2 checker patches its own private copy of the model; the sixteen families use `base`.
_spec = importlib.util.spec_from_file_location('ds15_deck2', ROOT / 'scripts/pm-ds15-deck2-contracts.py')
deck2 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(deck2)

RAW_OPS = ('token', 'parse', 'slot', 'current_json_slot', 'jcs', 'parse_token')
VALUE_OPS = ('integer', 'uint64', 'physical', 'jcs_value')
SLOTS = ('step_revision', 'degradation_revision', 'pid', 'workflow_revision', 'preview_revision')
PAYLOAD_OP_SLOTS = {'live.session.started': 'pid', 'preview.session.started': 'preview_revision',
                    'preview.session.stopped': 'preview_revision'}
MARKER = '__DS15_corpus_number__'


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
                # The slot value of a one-slot document, as its own spelling.
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
    return seen


def parsed(spelling):
    try:
        return True, loads_current_json(spelling)
    except Refusal:
        return False, None


def admitted(spelling, minimum=None, maximum=None, uint64=False):
    ok, value = parsed(spelling)
    if not ok:
        return False
    try:
        storage_uint64(value) if uint64 else current_integer(value, minimum=minimum, maximum=maximum)
    except Refusal:
        return False
    return True


def physical(spelling):
    ok, value = parsed(spelling)
    try:
        storage_value_bytes([value], profile=EVENT_VALUE)
    except Refusal:
        return False
    return ok


def producer(spelling, path):
    ok, value = parsed(spelling)
    if not ok:
        return False
    tree = {}
    node = tree
    for key in path[:-1]:
        node = node.setdefault(key, {})
    node[path[-1]] = value
    try:
        qualified_jcs(tree, type_sensitive_paths={tuple(path)})
    except Refusal:
        return False
    return True


def with_spelling(data, path, spelling):
    """JSON text of data with the value at path spelled exactly, parsed by the checker's raw ingress."""
    data = copy.deepcopy(data)
    base.patch(data, {path: MARKER})
    text = json.dumps(data)
    assert text.count(json.dumps(MARKER)) == 1, path
    return base.parse_operation_json(text.replace(json.dumps(MARKER), spelling))


def accepted(result):
    return base.proof_success(result)


def routes(name, contract, sixteen):
    """(route, data, path, run(data) -> bool, want(spelling) -> bool) for one family."""
    out = []
    if sixteen:
        fixture = next(f for f in base.read('Plans/ds15_event_contract_fixtures.json') if f['event_type'] == name)
        case = lambda cid: next(z for z in fixture['semantic_cases'] if z['id'] == cid)
        payload_parent = base.semantic_input(contract, fixture, case('valid-transition'))
        envelope_parent = base.semantic_input(contract, fixture, case('valid-inline-envelope-boundary'))
        withdraw_parent = base.semantic_input(contract, fixture, case('drain-admitted'))
        checkpoint_parent = copy.deepcopy(fixture['semantic_base'])
        evaluate = base.evaluate
    else:
        fixture = next(f for f in base.read('Plans/ds15_deck2_fixtures.json') if f['event_type'] == name)
        payload_parent = envelope_parent = withdraw_parent = checkpoint_parent = copy.deepcopy(fixture['bases']['project'])
        evaluate = deck2.evaluate
    model = base if sixteen else deck2.base
    schema = base.read(contract['payload_schema_ref'])
    slot = next((s for s in SLOTS if s in schema.get('properties', {})), None)
    if slot is not None:
        bounds = schema['properties'][slot]
        lo, hi = bounds.get('minimum'), bounds.get('maximum')
        payload = copy.deepcopy(payload_parent['payload'])
        out.append(('payload_slot', payload, slot,
                    lambda d: not model.schema_refused('sch_payload', model.validator(schema), d),
                    lambda s, lo=lo, hi=hi: admitted(s, lo, hi)))
        if slot in contract.get('identity_fields', []):
            out.append(('identity', payload, slot,
                        lambda d: model.identity(contract, d) is not None,
                        lambda s, lo=lo, hi=hi: admitted(s, lo, hi) and physical(s)))
        if PAYLOAD_OP_SLOTS.get(name) == slot:
            def run_payload(d, slot=slot):
                d['envelope']['payload'] = copy.deepcopy(d['payload'])
                d['envelope']['idempotency_key'] = model.identity(contract, d['payload'], d.get('application_source'))
                return accepted(evaluate(contract, 'payload', d))
            out.append(('payload_op', payload_parent, 'payload/' + slot, run_payload,
                        lambda s, lo=lo, hi=hi, slot=slot: (admitted(s, lo, hi) and physical(s)
                                                            and producer(s, ('payload', slot)))))
    out.append(('envelope_producer', envelope_parent, 'envelope/producer_sequence_id',
                lambda d: accepted(evaluate(contract, 'envelope_boundary', d)),
                lambda s: admitted(s, 0) and producer(s, ('producer_sequence_id',))))

    def run_withdraw(d):
        d['withdrawal_frontier'] = copy.deepcopy(d['admitted_sequence'])
        return accepted(evaluate(contract, 'withdraw_writer', d))
    out.append(('withdraw_admission', withdraw_parent, 'admitted_sequence', run_withdraw,
                lambda s: admitted(s, uint64=True)))
    out.append(('checkpoint_through', checkpoint_parent, 'checkpoint/through_sequence_id',
                lambda d: accepted(evaluate(contract, 'checkpoint_boundary', d)),
                lambda s: admitted(s, uint64=True)))
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--family', action='append')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    contracts = {c['event_type']: (c, True) for c in base.read('Plans/ds15_event_contracts.json')}
    contracts.update({c['event_type']: (c, False) for c in base.read('Plans/ds15_deck2_contracts.json')})
    values = corpus_values()
    results, failures, parents = [], [], []
    for name in sorted(args.family or contracts):
        contract, sixteen = contracts[name]
        for route, data, path, run, want in routes(name, contract, sixteen):
            parent_ok = run(copy.deepcopy(data))
            parents.append([name, route, parent_ok])
            if not parent_ok:
                failures.append([name, route, 'parent_refused'])
                continue
            for spelling, ids in sorted(values.items()):
                ok, candidate = with_spelling(data, path, spelling)
                got = run(candidate) if ok else False
                expected = want(spelling)
                results.append([name, route, spelling, expected, got])
                if got != expected:
                    failures.append([name, route, spelling, expected, got, ids])
    summary = {'status': 'pass' if not failures else 'fail', 'values': len(values),
               'families': len(args.family or contracts), 'route_runs': len(results),
               'accepted': sum(1 for r in results if r[4]), 'refused': sum(1 for r in results if not r[4]),
               'disagreements': len(failures), 'failures': failures[:50],
               'routes': sorted({r[1] for r in results}), 'parents': parents}
    if args.json:
        args.json.write_text(json.dumps(dict(summary, results=results), indent=1) + '\n')
    print(json.dumps({k: v for k, v in summary.items() if k != 'parents'}))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
