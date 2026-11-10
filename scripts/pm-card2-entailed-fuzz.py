#!/usr/bin/env python3
"""Randomized evidence for the DCN entailed rows: none is ever the first refusal.

Finite evidence only; the written proofs in pm_card2_events.ENTAILED carry the claim. Each trial
takes a random DCN positive (or a retry/history path control of an append positive), replaces one
random scalar or container leaf with a value drawn from the same key elsewhere in the fixtures or
from a type-swap pool, and, for half of the trials, moves the copies that follow an edit of the
Storage original or the retained event (pm_card2_p2a_lib.sync_original / sync_candidate). The
complete checker then evaluates it. A trial fails when an entailed row is the first refusal, or
when an entailed row refuses together with a first row its proof does not name.

  python3 scripts/pm-card2-entailed-fuzz.py [--trials N] [--seed S]
"""
import argparse
import collections
import copy
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_card2_events as dcn  # noqa: E402
import pm_card2_p2a_lib as L  # noqa: E402

SWAPS = [None, True, False, 0, 1, 1.0, -1, 2**64, '', 'x', 'open', 'closed', 'Verified', 'pin', [], {}, ['created']]


def leaves(value, pointer=''):
    if type(value) is dict:
        for k, v in value.items():
            yield from leaves(v, pointer + '/' + k)
    elif type(value) is list and value and len(value) <= 40:
        for i, v in enumerate(value):
            yield from leaves(v, pointer + '/' + str(i))
    if pointer:
        yield pointer, value


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--trials', type=int, default=20000)
    parser.add_argument('--seed', type=int, default=20261110)
    args = parser.parse_args()
    rng = random.Random(args.seed)
    fixtures = dcn.load('card2_event_fixtures.json')
    bases = [c for c in fixtures['positives'] + fixtures['no_event_cases']]
    for c in fixtures['positives']:
        if c['path'] == 'append' and c['event']['event_type'] == 'memory.gist_state_changed':
            for path in ['retry', 'history']:
                x = copy.deepcopy(c); x['path'] = path; bases.append(x)
    pool = collections.defaultdict(list)
    for c in bases[:120]:
        for pointer, value in leaves(c):
            key = pointer.rsplit('/', 1)[-1]
            if type(value) not in (dict, list) and len(pool[key]) < 30 and value not in pool[key]:
                pool[key].append(value)
    counts = collections.Counter()
    entailed_cofail = collections.Counter()
    problems = []
    for trial in range(args.trials):
        c = copy.deepcopy(rng.choice(bases))
        paths = [p for p, _ in leaves(c) if not p.startswith('/id')]
        pointer = rng.choice(paths)
        key = pointer.rsplit('/', 1)[-1]
        choices = pool.get(key, []) + SWAPS
        value = copy.deepcopy(rng.choice(choices))
        try:
            c = dcn.mutate(c, [[pointer, value]])
        except (KeyError, IndexError, TypeError, ValueError):
            counts['unmutable'] += 1
            continue
        if rng.random() < 0.5:
            try:
                if pointer.startswith('/storage/event') and c.get('path') == 'retry':
                    L.sync_original(c)
                elif pointer.startswith('/event') and c.get('path') in ('retry', 'history'):
                    L.sync_candidate(c)
            except (KeyError, IndexError, TypeError, ValueError, AttributeError):
                counts['copies_not_synced'] += 1
        first, rows = dcn.evaluate(c)
        counts['refused' if first else 'accepted'] += 1
        if first is None:
            continue
        if first[0] in dcn.ENTAILED:
            problems.append({'trial': trial, 'pointer': pointer, 'value': repr(value)[:80], 'first': first[0], 'rows': rows})
            continue
        for row in rows:
            if row in dcn.ENTAILED:
                entailed_cofail[row] += 1
                if first[0] not in dcn.ENTAILED[row][0]:
                    counts['cofail_first_not_named'] += 1
                    entailed_cofail[row + ' (first not named: ' + first[0] + ')'] += 1
    result = {'status': 'pass' if not problems else 'fail', 'trials': args.trials, 'seed': args.seed, 'counts': dict(counts),
              'entailed_rows': len(dcn.ENTAILED), 'entailed_rows_seen_refusing': len([r for r in entailed_cofail if '(' not in r]),
              'entailed_cofailures': dict(sorted(entailed_cofail.items())), 'entailed_first': problems[:20]}
    print(json.dumps(result, indent=1, sort_keys=True, default=str))
    return 0 if not problems else 1


if __name__ == '__main__':
    raise SystemExit(main())
