#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the complete DF checkers.

Usage: python3 scripts/pm-filesafe-number-corpus.py [--family F]... [--json out.json]

Every number value of Plans/event_number_recipe_corpus.json in the number scope (raw JSON
spellings of the token, parse, slot, jcs and parse_token cases; exact integers of the integer,
uint64, physical and jcs_value cases) is placed, for each DF family, at:

- the current raw route: the spelling spliced as JSON text at the first positive candidate's
  event.producer_sequence_id token, through materialization_raw_failures (CV-1100 raw grammar);
- the complete materialization at event.producer_sequence_id, with the custody producer digest
  and full-value commitment recomputed and every issued copy moved;
- the complete materialization at event.sequence_id, with the first-receipt copy, the custody
  full-value commitment and every issued copy moved;
- the complete payload contract at the family's own payload integer slot (the three families
  that declare one), through payload_failures at the semantic layer.

The expected outcome of every route is composed from the shared helpers alone
(loads_current_json, current_integer with the slot's schema minimum, producer_semantic_digest,
full_value_commitment, qualified_jcs with the 16 KiB inline limit); a DF result that differs,
or any exception out of a checker boundary, is a failure. Three 4,400-digit integers then run
the same routes plus a coherent writer-epoch materialization, which reaches the local source
commitment recipes (Project canonical MessagePack, CV-366 accepted_source): CV-1100 sets no
global ceiling, so a long integer must refuse through a row or a schema bound, never crash.
Date-time cases are out of scope (part 2B). Exit 0 when every route agrees.
"""
import argparse
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_filesafe_event_authority as A  # noqa: E402
import pm_filesafe_event_contracts as C  # noqa: E402
from pm_event_numbers import (Refusal, current_integer, full_value_commitment,  # noqa: E402
                              loads_current_json, producer_semantic_digest, qualified_jcs)
from pm_event_numbers_corpus import NUMBER_OPS  # noqa: E402

RAW_OPS = ('token', 'parse', 'slot', 'jcs', 'parse_token')
VALUE_OPS = ('integer', 'uint64', 'physical', 'jcs_value')
SLOT = '"__DF_CORPUS_SLOT__"'


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


def shared_ok(call):
    try:
        call()
        return True
    except Refusal:
        return False


def coherent(base, move):
    """Deep-copied (candidate, bank) with move(event, custody) applied and every copy refreshed."""
    candidate, bank = copy.deepcopy((base['candidate'], base['bank']))
    event, custody = candidate['event'], candidate['custody']
    move(event, custody)
    try:
        digest, _ = A.producer_facts(event)
    except Exception:  # input construction only; the checker run itself judges the lane
        digest = None
    if digest is not None:
        custody['producer_semantic_digest'] = digest
    try:
        commitment, _ = A.full_value_facts(event)
    except Exception:
        commitment = None
    if commitment is not None:
        custody['original_event_value_commitment']['sha256'] = commitment
    issued = {'event': copy.deepcopy(event), 'custody': copy.deepcopy(custody)}
    for stored in ('issued', 'retained_boundary'):
        if event['event_id'] in bank.get(stored, {}):
            bank[stored][event['event_id']] = copy.deepcopy(issued)
    return candidate, bank


def outcome(call):
    try:
        failures = call()
    except Exception as error:  # an exception out of a complete checker is a lane failure
        return 'untracked', type(error).__name__
    return ('accept', None) if not failures else ('reject', failures[:2])


def producer_expectation(candidate, value):
    event = candidate['event']
    return (shared_ok(lambda: current_integer(value, minimum=0))
            and shared_ok(lambda: producer_semantic_digest(event))
            and shared_ok(lambda: full_value_commitment(event)))


def sequence_expectation(candidate, value):
    event = candidate['event']
    return (shared_ok(lambda: current_integer(value, minimum=0))
            and shared_ok(lambda: full_value_commitment(event)))


def payload_slot(family):
    schema = json.loads((ROOT / ('Plans/event_payloads/' + family.replace('.', '_') + '_v2.schema.json')).read_text())
    for name, sub in schema.get('properties', {}).items():
        if isinstance(sub, dict) and sub.get('type') == 'integer':
            return name, sub.get('minimum', 0)
    return None, None


def run_routes(family, base, payload, validator, spelling, value, record):
    """value is the typed loads_current_json result, or None when the spelling itself refuses."""
    def emit(route, want, got, detail):
        record(family, spelling, route, want, got, detail)

    if value is None:
        marked = copy.deepcopy(base['candidate'])
        marked['event']['producer_sequence_id'] = '__DF_CORPUS_SLOT__'
        raw = json.dumps(marked).replace(SLOT, spelling, 1)
        got, detail = outcome(lambda: A.materialization_raw_failures(family, raw, copy.deepcopy(base['bank'])))
        emit('raw_producer', 'reject', got, detail)
        return
    candidate, bank = coherent(base, lambda e, c: e.__setitem__('producer_sequence_id', value))
    want = 'accept' if producer_expectation(candidate, value) else 'reject'
    got, detail = outcome(lambda: A.materialization_failures(family, candidate, bank))
    emit('producer_complete', want, got, detail)
    marked = copy.deepcopy(candidate)
    marked['event']['producer_sequence_id'] = '__DF_CORPUS_SLOT__'
    raw = json.dumps(marked).replace(SLOT, spelling, 1)
    got, detail = outcome(lambda: A.materialization_raw_failures(family, raw, bank))
    emit('raw_producer', want, got, detail)

    def move_sequence(event, custody):
        event['sequence_id'] = value
        custody['first_append_receipt']['sequence_id'] = value
    candidate, bank = coherent(base, move_sequence)
    want = 'accept' if sequence_expectation(candidate, value) else 'reject'
    got, detail = outcome(lambda: A.materialization_failures(family, candidate, bank))
    emit('sequence_complete', want, got, detail)

    name, minimum = payload_slot(family)
    if name is not None and isinstance(payload, dict) and name in payload:
        changed = copy.deepcopy(payload)
        changed[name] = value
        want = 'accept' if (shared_ok(lambda: current_integer(value, minimum=minimum))
                            and shared_ok(lambda: qualified_jcs(changed))
                            and len(qualified_jcs(changed)) <= C.INLINE_PAYLOAD_LIMIT) else 'reject'
        got, detail = outcome(lambda: C.payload_failures(family, changed, 'semantic', validator))
        emit('payload_contract', want, got, detail)


def long_integer_routes(family, base, payload, validator, record):
    for spelling in ('1' * 4400, '9' * 4400, '-' + '1' * 4400):
        value = loads_current_json(spelling)
        run_routes(family, base, payload, validator, spelling, value, record)
        epoch = value
        candidate, bank = copy.deepcopy((base['candidate'], base['bank']))
        source = candidate['source']
        selected = bank['sources'].get(source['source_ref'])
        for copy_of_source in (source, selected):
            if isinstance(copy_of_source, dict):
                copy_of_source['writer_epoch'] = epoch
        bank['writer_epoch'] = epoch
        try:
            commitment = A.source_commitment(source)
        except Exception:
            commitment = None
        if commitment is not None:
            for copy_of_source in (source, selected):
                if isinstance(copy_of_source, dict):
                    copy_of_source['accepted_source_sha256'] = commitment
        # The schema admits any non-negative exact epoch; a negative epoch is a schema refusal.
        # Either way the complete checker must answer through rows, never raise.
        got, detail = outcome(lambda: A.materialization_failures(family, candidate, bank))
        want = 'reject' if epoch < 0 or commitment is None else 'accept'
        record(family, spelling, 'writer_epoch_complete', want, got, detail)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--family', action='append')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    pack = A.load('Plans/filesafe_event_authority_fixtures.json')
    cpack = json.loads((ROOT / 'Plans/filesafe_event_contract_fixtures.json').read_text())
    payloads = {row['event_type']: row['positive_payloads'][0] for row in cpack['families']}
    values = corpus_values()
    results, failures = [], []

    def record(family, spelling, route, want, got, detail):
        row = [family, spelling if len(spelling) <= 48 else spelling[:24] + '..' + str(len(spelling)) + 'digits',
               route, want, got, None if detail is None else str(detail)[:160]]
        results.append(row)
        if got != want:
            failures.append(row + [values.get(spelling, ['long_integer'])])

    for row in pack['families']:
        family = row['event_type']
        if args.family and family not in args.family:
            continue
        base, payload = row['positive'][0], payloads[family]
        validator = C.payload_validator(family)
        for spelling in sorted(values):
            try:
                value = loads_current_json(spelling)
            except Refusal:
                value = None
            run_routes(family, base, payload, validator, spelling, value, record)
        long_integer_routes(family, base, payload, validator, record)
    summary = {'status': 'fail' if failures else 'pass', 'corpus_values': len(values),
               'families': len({r[0] for r in results}), 'route_runs': len(results),
               'accepted': sum(r[4] == 'accept' for r in results), 'refused': sum(r[4] == 'reject' for r in results),
               'untracked': sum(r[4] == 'untracked' for r in results), 'failures': failures}
    if args.json:
        args.json.write_text(json.dumps({**summary, 'results': results}, indent=1) + '\n')
    print(json.dumps(summary, indent=1)[:6000])
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
