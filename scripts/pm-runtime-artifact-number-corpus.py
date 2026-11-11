#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through DR's complete checker routes (sweep part 2B).

Every number value of the shared corpus's number scope (raw spellings parsed
with the shared loads_current_json, exact integers and Python values), plus
three 4,400-digit integers, is placed at four DR slots and run through the
complete current-writer route:

  sequence      EventRecord.sequence_id (Storage uint, SP-1100 physical route): fresh append, exact retry
  producer      EventRecord.producer_sequence_id (CV-317 producer projection; the restore identity revision): append, retry
  receipt       AppendReceipt.byte_offset (Storage uint): append with that first receipt, retry
  payload       runtime_artifact.screenshot type_payload.width (schema integer, minimum 1): decode, append, retry

The expected outcome is composed from the shared helpers alone
(current_integer with the slot's owner bounds, qualified_jcs for JCS routes,
storage_value_bytes for physical routes); the lane checker is never asked
what it expects. A route that raises anything other than a table refusal is
UNTRACKED and fails the run. Prints JSON; exit 0 only with 0 disagreements
and 0 untracked results.

Usage: python3 scripts/pm-runtime-artifact-number-corpus.py [--family F ...]
"""
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import sys
import traceback

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
_SPEC = importlib.util.spec_from_file_location('pm_runtime_artifact_event_drafts', ROOT / 'scripts/pm-runtime-artifact-event-drafts.py')
dr = importlib.util.module_from_spec(_SPEC)
sys.modules['pm_runtime_artifact_event_drafts'] = dr
_SPEC.loader.exec_module(dr)

import pm_event_numbers as shared  # noqa: E402
from pm_event_numbers_corpus import number_case  # noqa: E402

RAW_OPS = ('token', 'slot', 'parse_token', 'parse')
LONG = (10 ** 4399, -(10 ** 4399), 10 ** 4399 + 1)


def decode_value(value):
    """The corpus's typed value notation to a Python value."""
    if isinstance(value, dict) and len(value) == 1:
        (tag, text), = value.items()
        if tag == '@int':
            with dr.exact_digits():
                return int(text)
        if tag == '@float':
            return float(text)
    return value


def corpus_values():
    """(label, value or None, parse refusal or None) for every number-scope value, deduplicated."""
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    seen, values = set(), []

    def add(label, value, refusal):
        key = (type(value).__name__, repr(value) if not isinstance(value, int) or abs(value) < 10 ** 30 else hex(value), refusal)
        if key not in seen:
            seen.add(key)
            values.append((label, value, refusal))
    for case in corpus['cases']:
        if not number_case(case):
            continue
        if case['op'] in RAW_OPS and isinstance(case.get('raw'), str):
            try:
                with dr.exact_digits():
                    add('raw:' + case['id'], shared.loads_current_json(case['raw']), None)
            except shared.Refusal as refusal:
                add('raw:' + case['id'], None, refusal.reason)
        elif case['op'] in ('integer', 'uint64') and 'value' in case:
            add('value:' + case['id'], decode_value(case['value']), None)
    for index, value in enumerate(LONG):
        add('long:4400-digit-' + str(index), value, None)
    return values


def ok(action):
    try:
        action()
        return True
    except shared.Refusal:
        return False


def expected(route, value, family):
    """Accept or refuse, from the shared helpers and the slot's owner bounds only."""
    if route == 'producer' and value is None and not family.endswith('.restore_point'):
        # The EventRecord slot is nullable_non_negative_integer: null is not an integer slot. For
        # restore_point the ordinal is also the RAP-113 identity revision, an exact integer >= 0.
        return 'accepted'
    if route == 'payload':
        admitted = dr.integer_refusal(value, minimum=1) is None
    else:
        admitted = dr.integer_refusal(value, minimum=0) is None
    if not admitted:
        return 'refused'
    if route in ('producer', 'payload'):
        return 'accepted' if ok(lambda: shared.qualified_jcs(value)) else 'refused'
    return 'accepted' if ok(lambda: shared.storage_value_bytes(value, profile=shared.EVENT_VALUE)) else 'refused'


def actual(row, fixtures, route, value):
    family = row['event_type']
    full = copy.deepcopy(fixtures['positive_events'][family])
    receipt = copy.deepcopy(fixtures['first_append_receipts'][family])
    if route == 'sequence':
        full['sequence_id'] = value
    elif route == 'producer':
        full['producer_sequence_id'] = value
        if family.endswith('.restore_point') and dr.integer_refusal(value, minimum=0) is None:
            full['idempotency_key'] = dr.identity(family, full['payload'], value)
    elif route == 'receipt':
        receipt['byte_offset'] = value
    elif route == 'payload':
        full['payload']['type_payload']['width'] = value
        if dr.untracked(lambda: dr.decode(row, full, {})) == 'refused':
            return 'refused'
    model = dr.AppendModel(row, {}, receipt, fixtures['custody_template'])
    first = model.append(copy.deepcopy(full), True)
    if not isinstance(first, dict):
        return 'refused'
    retry = model.append(copy.deepcopy(full), True)
    return 'accepted' if retry is first and len(model.scoped) == 1 else 'retry_mismatch'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', action='append')
    args = parser.parse_args()
    fixtures = dr.load('Plans/runtime_artifact_event_drafts.fixtures.json')
    rows = [r for r in dr.load('Plans/runtime_artifact_event_drafts.json')['rows']
            if args.family is None or r['event_type'] in args.family]
    values = corpus_values()
    runs, disagreements, untracked, parse_refused = 0, [], [], []
    counts = dict(accepted=0, refused=0)
    for label, value, refusal in values:
        if refusal is not None:
            parse_refused.append(dict(value=label, refusal=refusal))
    for row in rows:
        family = row['event_type']
        routes = ['sequence', 'producer', 'receipt'] + (['payload'] if family.endswith('.screenshot') else [])
        for label, value, refusal in values:
            if refusal is not None:
                continue
            for route in routes:
                runs += 1
                want = expected(route, value, family)
                try:
                    with dr.exact_digits():
                        got = actual(row, fixtures, route, value)
                except dr.TableRefusal:
                    got = 'refused'
                except Exception as error:  # noqa: BLE001 - every other exception is untracked
                    untracked.append(dict(family=family, route=route, value=label, error=repr(error)[:300],
                                          where=traceback.format_exc().strip().splitlines()[-3:]))
                    continue
                counts[got] = counts.get(got, 0) + 1
                if got != want:
                    disagreements.append(dict(family=family, route=route, value=label, expected=want, actual=got))
    result = dict(status='pass' if not disagreements and not untracked else 'fail', values=len(values),
                  parse_refused=len(parse_refused), parse_refusals=parse_refused, route_runs=runs, outcomes=counts,
                  disagreements=disagreements, untracked=untracked,
                  scope='shared number corpus number scope through DR complete current-writer routes; static model, no native storage')
    print(json.dumps(result, indent=2))
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
