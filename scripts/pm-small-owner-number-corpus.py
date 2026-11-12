#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the DM complete checker slots.

Scope: corpus token/integer/current-json cases at DM's current-input slot
(decode_current_json / current_integer_token), plus long-integer routes
through valid_event/publication/current_retry/reader on one family. Acceptance,
refusal (ValueError) and untracked exceptions are three separate outcomes.
DM's owner domain refuses every float token at current input; corpus cases
whose raw token is a float spelling are counted as domain refusals, never as
disagreements. Producer/storage corpus ops are covered by the shared
self-test and by the family suites' digest/byte equalities, not re-run here.
"""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
_spec = importlib.util.spec_from_file_location('dm', ROOT / 'scripts/pm-small-owner-events.py')
dm = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dm)

OPS = ('token', 'integer', 'current_json', 'current_json_slot')
# parse_token/json_number/parsed_decimal test the loads_exact preservation
# layer, which DM's current-input boundary never uses; counted separately.
PRESERVATION_OPS = ('parse_token', 'json_number', 'parsed_decimal')


def classify(fn):
    try:
        return ('accepted', fn())
    except ValueError:
        return ('refused', None)
    except Exception as error:  # untracked: never a successful refusal
        return ('untracked:' + type(error).__name__, None)


def _slot_value(case):
    import pm_event_numbers as numbers
    value = dm.decode_current_json(case['raw'])
    for key in case['path']:
        value = value[key]
    bounds = case.get('bounds') or {}
    return numbers.current_integer(value, minimum=bounds.get('minimum'), maximum=bounds.get('maximum'))


def main():
    import pm_event_numbers as numbers
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    counts = dict(total=0, agree=0, domain_refusals=0, disagreements=0, untracked=0,
                  preservation_layer_not_dm_boundary=0)
    disagreements = []

    def judge(case, outcome, value):
        if outcome.startswith('untracked'):
            counts['untracked'] += 1
            disagreements.append((case['id'], outcome))
        elif 'error' in case:
            if outcome == 'refused':
                counts['agree'] += 1
            else:
                counts['disagreements'] += 1
                disagreements.append((case['id'], 'dm accepted, corpus refused ' + str(case['error'])))
        elif outcome == 'refused':
            # DM current input refuses every float spelling by owner domain.
            shared, _ = classify(lambda: numbers.loads_current_json(case.get('raw', '')))
            if shared == 'accepted':
                counts['domain_refusals'] += 1
            else:
                counts['disagreements'] += 1
                disagreements.append((case['id'], 'dm refused, corpus accepted'))
        else:
            returns = case.get('returns') or {}
            with dm.exact_integer_digits():
                expected_int = int(returns['@int']) if '@int' in returns else None
            if expected_int is None or value == expected_int:
                counts['agree'] += 1
            else:
                counts['disagreements'] += 1
                disagreements.append((case['id'], 'value mismatch'))

    for case in corpus['cases']:
        if case.get('date_time_profile'):
            continue
        if case.get('op') in PRESERVATION_OPS:
            counts['preservation_layer_not_dm_boundary'] += 1
            continue
        if case.get('op') not in OPS:
            continue
        counts['total'] += 1
        if case['op'] == 'token':
            bounds = case.get('bounds') or {}
            judge(case, *classify(lambda: numbers.current_integer(
                dm.current_integer_token(case['raw']),
                minimum=bounds.get('minimum'), maximum=bounds.get('maximum'))))
        elif case['op'] == 'integer':
            raw_value = case.get('value')
            with dm.exact_integer_digits():
                typed = json.loads(json.dumps(raw_value)) if not isinstance(raw_value, str) else raw_value
            bounds = case.get('bounds') or {}
            judge(case, *classify(lambda: numbers.current_integer(typed, minimum=bounds.get('minimum'), maximum=bounds.get('maximum'))))
        elif case['op'] == 'current_json_slot':
            judge(case, *classify(lambda: _slot_value(case)))
        else:  # current_json
            outcome, value = classify(lambda: dm.decode_current_json(case['raw']))
            if outcome == 'accepted':
                judge(case, outcome, None)
            else:
                judge(case, outcome, value)
    # Long-integer routes through the complete checker (one family).
    fixtures = json.loads((ROOT / 'Plans/small_owner_event_fixtures.json').read_text())
    row = fixtures['families'][0]
    with dm.exact_integer_digits():
        big = int('9' * 4400)
    long_routes = {}
    # A 4,400-digit integer can never be a stored original (its full-value
    # preimage is outside the physical codec range, refused at construction);
    # it arrives only as forged incoming data against a valid original.
    state = dm.upstream_sequence_state(row, 7)
    authority = state['committed_authority']
    incoming = dict(state['event'], producer_sequence_id=big)
    forged = dict(state, event=incoming)
    long_routes['valid_event'] = classify(lambda: dm.valid_event(row, incoming, state['original_operation']))
    long_routes['publication_terminal'] = classify(lambda: dm.publication(row, forged)['terminal'])
    long_routes['current_retry'] = classify(lambda: dm.current_retry(row, incoming, authority)[0])
    long_routes['resolve_full_value'] = classify(lambda: dm.resolve_full_value(row, incoming, authority))
    long_routes['retained_digest_computes'] = classify(lambda: dm.retained_producer_digest(incoming) != authority['stored_custody']['producer_semantic_digest'])
    long_routes['decode_token'] = classify(lambda: dm.decode_current_json('9' * 4400) == big)
    long_ok = (
        long_routes['valid_event'] == ('accepted', False)
        and long_routes['publication_terminal'] == ('accepted', False)
        and long_routes['current_retry'] == ('accepted', 'identity_conflict_without_effect')
        and long_routes['resolve_full_value'] == ('accepted', None)
        and long_routes['retained_digest_computes'] == ('accepted', True)
        and long_routes['decode_token'] == ('accepted', True)
    )
    result = dict(status='pass' if counts['disagreements'] == 0 and counts['untracked'] == 0 and long_ok else 'fail',
                  counts=counts, disagreements=disagreements[:20],
                  long_integer_routes={k: v[0] + ':' + str(v[1]) for k, v in long_routes.items()})
    print(json.dumps(result, indent=1, sort_keys=True))
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    raise SystemExit(main())
