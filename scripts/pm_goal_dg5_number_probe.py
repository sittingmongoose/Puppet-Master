#!/usr/bin/env python3
"""T248/T249: actual SIR admission and unbounded recorder observations (TEST_ONLY)."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

import pm_goal_dg_u_oracles as suite
import pm_goal_test_owner_adapters as adapters

CASE_IDS = (
    'U1/P/expected_revision_2p53',
    'U1/N/expected_revision_2p53_plus_1',
    'U1/N/expected_revision_2p60',
    'U1/N/expected_revision_4400_digits',
)


def observations():
    limit = sys.get_int_max_str_digits()
    huge = 10 ** 4400 - 1
    values = {'positive': huge, 'negative': -huge, 'successor': huge + 1}
    digests = {key: adapters.observation_digest({'expected_revision': value})
               for key, value in values.items()}
    assert len(set(digests.values())) == len(values)
    assert digests['positive'] == adapters.observation_digest({'expected_revision': huge})
    cyclic = {'expected_revision': huge}
    cyclic['self'] = cyclic
    assert adapters.observation_digest(cyclic) == adapters.observation_digest(cyclic)
    assert sys.get_int_max_str_digits() == limit
    return dict(digests=digests, cyclic_digest=adapters.observation_digest(cyclic),
                int_decimal_limit_unchanged=limit, value_bit_length=huge.bit_length())


def run(work):
    _selection, bad = suite.verify_selection()
    if bad:
        raise ValueError({'selection_pin_mismatch': bad})
    selected = {case['id']: case for case in suite.CASES}
    cases = [suite.run_case(selected[ident], work) for ident in CASE_IDS]
    try:
        observation = dict(status='pass', **observations())
    except Exception as error:
        observation = dict(status='fail', error=type(error).__name__ + ': ' + str(error))
    return dict(qualification='TEST_ONLY', native_execution='NOT_RUN',
                field='request.expected_revision', cases=cases, observations=observation,
                status='pass' if all(case['status'] == 'pass' for case in cases)
                and observation['status'] == 'pass' else 'fail')


def selftest(s, work):
    result = run(work)
    for case in result['cases']:
        def check(case=case):
            assert case['status'] == 'pass', case
        s.positive('numbers', case['id'], check)
    s.positive('recorder', 'integer_4400_digits_sign_hex_deterministic', observations)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.work.mkdir(parents=True, exist_ok=True)
    result = run(args.work)
    args.out.write_text(json.dumps(result, indent=1) + '\n')
    print(json.dumps(result))
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())
