#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the complete DX checker routes.

Usage: python3 scripts/pm-executor-number-corpus.py [--family F]... [--json out.json]

Every number value of Plans/event_number_recipe_corpus.json in the number scope (raw JSON spellings of
the token, parse, slot, jcs and parse_token cases; exact integers of the integer, uint64, physical and
jcs_value cases) is placed at the event_sequence slot of each selected DX family and run through:

- the four numeric boundaries (identity, digest, canonical, payload_bytes) of run_numeric_case;
- the complete current-writer capture route: the family baseline with event_sequence changed in the
  payload and every copy (inline envelope payload, joined operation record, transition mirror,
  reserved and post-state sequence), the operation record rehashed;
- the receipt trace model: an append and its exact retry (first receipt returned).

The expected outcome is composed independently from the shared helpers only (loads_current_json,
current_integer with the slot minimum 0, qualified_jcs, storage_value_bytes); a DX result that differs
is a failure. Date-time cases are out of scope (part 2B). Exit 0 when every route agrees.
"""
import argparse
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_executor_event_semantics as sem  # noqa: E402
sys.modules.setdefault('pm_executor_event_semantics', sem)
import pm_executor_event_contracts as con  # noqa: E402
from pm_event_numbers import (EVENT_VALUE, Refusal, current_integer, loads_current_json, qualified_jcs,  # noqa: E402
                              storage_value_bytes)
from pm_event_numbers_corpus import NUMBER_OPS  # noqa: E402

RAW_OPS = ('token', 'parse', 'slot', 'jcs', 'parse_token')
VALUE_OPS = ('integer', 'uint64', 'physical', 'jcs_value')


def corpus_values():
    doc = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    seen = {}
    for case in doc['cases']:
        if case['op'] not in NUMBER_OPS or 'date_time_profile' in case:
            continue
        spelling = None
        if case['op'] in RAW_OPS and type(case.get('raw')) is str:
            spelling = case['raw']
        elif case['op'] in VALUE_OPS and type(case.get('value')) is dict and set(case['value']) == {'@int'}:
            spelling = case['value']['@int']
        if spelling is not None:
            seen.setdefault(spelling, []).append(case['id'])
    return seen


def shared_expectation(spelling, boundary):
    """accept/reject from the shared helpers alone (DX slot: integer, minimum 0)."""
    try:
        value = loads_current_json(spelling)
    except Refusal:
        return 'reject'
    if boundary == 'canonical':
        def owner_domain(item):  # the DX owner domain: no float/decimal aliases anywhere in the value
            if type(item) is dict:
                return all([type(k) is str and owner_domain(v) for k, v in item.items()])
            if type(item) is list:
                return all([owner_domain(v) for v in item])
            return item is None or type(item) in (str, bool, int)
        if not owner_domain(value):
            return 'reject'
        try:
            qualified_jcs({'nested': [value]})
        except Refusal:
            return 'reject'
        return 'accept'
    try:
        current_integer(value, minimum=0)
    except Refusal:
        return 'reject'
    if boundary == 'payload_bytes':
        try:
            storage_value_bytes(value, profile=EVENT_VALUE)
        except Refusal:
            return 'reject'
        return 'accept'
    try:
        qualified_jcs([value])
    except Refusal:
        return 'reject'
    return 'accept'


def outcome(call):
    try:
        call()
        return 'accept', None
    except sem.TableRefusal as error:
        return 'reject', error.row
    except Exception as error:  # an untracked refusal is a failure of the lane checker
        return 'untracked', type(error).__name__


def coherent_capture(family, contract, value):
    doc = copy.deepcopy(family['baseline'])
    payload, capture = doc['payload'], doc['capture']
    payload['event_sequence'] = value
    if capture['envelope'].get('payload_ref') is None:
        capture['envelope']['payload']['event_sequence'] = value
    slot, _, field = contract['semantic_adapter']['joins']['event_sequence'].split('.')
    capture['records'][slot]['body'][field] = value
    capture['records'][slot]['sha256'] = sem.digest(capture['records'][slot]['body']) if outcome(
        lambda: sem.digest(capture['records'][slot]['body']))[0] == 'accept' else capture['records'][slot]['sha256']
    capture['transition']['event_sequence'] = value
    capture['post_state']['event_sequence'] = value
    capture['transition']['observed_payload'] = sem.source_observation(contract['semantic_adapter'], capture['records'])
    return doc


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--family', action='append')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    contracts = {c['event_type']: c for c in json.loads((ROOT / 'Plans/executor_event_contracts.json').read_text())['families']}
    families = sem.expand_fixture_literals(json.loads((ROOT / 'Plans/executor_event_semantic_fixtures.json').read_text())['families'])
    values = corpus_values()
    results, failures = [], []
    for name in sorted(args.family or contracts):
        contract, family = contracts[name], families[name]
        for spelling, ids in sorted(values.items()):
            for boundary in ('identity', 'digest', 'canonical', 'payload_bytes'):
                case = {'case': 'corpus', 'boundary': boundary, 'spelling': spelling}
                got, row = outcome(lambda: sem.run_numeric_case(contract, family['baseline'], case))
                want = shared_expectation(spelling, boundary)
                results.append([name, spelling, boundary, want, got, row])
                if got != want:
                    failures.append(results[-1] + [ids])
            # A complete current write needs the identity preimage and the SP-337 payload bytes.
            want = ('accept' if shared_expectation(spelling, 'identity') == 'accept'
                    and shared_expectation(spelling, 'payload_bytes') == 'accept' else 'reject')
            try:
                value = loads_current_json(spelling)
            except Refusal:
                continue  # a refused spelling never reaches a typed payload slot
            if type(value) is not int:
                continue  # a non-integer is a schema-type defect of the slot, covered by the boundaries above
            doc = coherent_capture(family, contract, value)
            got, row = outcome(lambda: sem.validate_capture(contract, doc['payload'], doc['capture']))
            results.append([name, spelling, 'capture', want, got, row])
            if got != want:
                failures.append(results[-1] + [ids])
            scenario = {'case': 'corpus', 'operations': [{'op': 'append', 'payload_changes': {'event_sequence': value}},
                                                       {'op': 'append', 'payload_changes': {'event_sequence': value}}]}
            try:
                trace = sem.run_trace(contract, family['baseline']['payload'], scenario)['outputs']
                got = 'accept' if trace == ['first-receipt-001', 'first-receipt-001'] else 'reject'
                row = trace
            except sem.TableRefusal as error:
                got, row = 'reject', error.row
            results.append([name, spelling, 'trace_first_receipt', want, got, row])
            if got != want:
                failures.append(results[-1] + [ids])
    summary = {'status': 'fail' if failures else 'pass', 'corpus_values': len(values), 'families': len(args.family or contracts),
               'route_runs': len(results), 'failures': failures,
               'accepted': sum(r[4] == 'accept' for r in results), 'refused': sum(r[4] == 'reject' for r in results)}
    if args.json:
        args.json.write_text(json.dumps({**summary, 'results': results}, indent=1) + '\n')
    print(json.dumps(summary, indent=1)[:4000])
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
