#!/usr/bin/env python3
"""DG5 real-input pattern probe at the original SIR admission boundary."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import tempfile
import copy
import importlib.util

import pm_goal_dg_u_oracles as suite
import pm_goal_dg_u_owners as owner
import pm_goal_test_owner_adapters as adapters

EXPECTED_REFUSAL = 'dgu/sir/request/schema/expected_currentness_hash'


def defective_request(work):
    w = owner.World(work)
    goal = owner.birth_goal(w)
    request = owner.direct_request(w, goal, 'Replacement')
    request['expected_currentness_hash'] += '\n'
    return w, request


def run(work):
    selection, bad = suite.verify_selection()
    if bad:
        raise ValueError(bad)
    w, request = defective_request(work)
    before = w.storage.observe()
    try:
        response = w.sir.admit(request)
    except suite.REFUSALS as error:
        result = dict(accepted=False, refusal=owner.refusal_code(error))
    else:
        result = dict(accepted=True, accepted_request=response['request'])
    result.update(qualification='TEST_ONLY', native_execution='NOT_RUN',
                  family='goal.updated', case='sir_admit_hash_trailing_LF',
                  declared_target='GoalUpdateRequestV2/properties/expected_currentness_hash/pattern',
                  canonical_subject='Plans/goal_runtime_contracts.schema.json#/$defs/GoalUpdateRequestV2',
                  before=before, after=w.storage.observe(), expected_refusal=EXPECTED_REFUSAL,
                  selection=selection['compatibility_selection'],
                  selection_sha256=hashlib.sha256(suite.SELECTION.read_bytes()).hexdigest())
    return result


def pattern_banks():
    """Every non-synthetic RootBank construction site in the shared adapters' users."""
    import pm_goal_test_demo_cf01 as cf01
    import pm_goal_test_source as source
    banks = list(zip(('updated', 'updated_consumer'), owner.banks()))
    banks += [('certified_identity', cf01.bank()), ('native_source', source.native_source_bank())]
    for name, paths in (
        ('migration', ['Plans/goal_own_c_contracts/dg-cb-migration-v1/test-only-sources.v1.schema.json',
                       'Plans/goal_execution_binding_custody.schema.json']),
        ('assignment', ['Plans/goal_own_c_contracts/dg-ca-assignment-successor-v1/assignment-audit-reference.v1.schema.json']),
        ('cancelled_payloads', ['Plans/executor_cancellation_contracts/schemas/goal-run-started.v3.schema.json',
                               'Plans/executor_cancellation_contracts/schemas/goal-run-cancelled.v3.schema.json']),
        ('contracts', ['Plans/goal_own_c_contracts/contracts.schema.json']),
    ):
        banks.append((name, adapters.RootBank([dict(path=p) for p in paths])))
    return banks


def pattern_trials(s, work):
    """A valid value and its LF variant at every pattern node, including unused definitions.

    Some owner patterns intentionally allow LF (unanchored substring searches,
    or patterns under not). Those keep their actual ECMA verdict and are named
    as such; no invented full-match rule is imposed on them.
    """
    from pm_goal_oracle_common import ecma_pattern
    path = owner.ROOT / 'scripts/pm-goal-gc-schema-closure.py'
    spec = importlib.util.spec_from_file_location('adapter_pattern_examples', path)
    examples = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(examples)
    rows, seen = [], set()

    def walk(value, pointer=''):
        if isinstance(value, dict):
            if isinstance(value.get('pattern'), str):
                yield pointer, value
            for key, item in value.items():
                yield from walk(item, pointer + '/' + key.replace('~', '~0').replace('/', '~1'))
        elif isinstance(value, list):
            for i, item in enumerate(value):
                yield from walk(item, pointer + '/' + str(i))

    for name, bank in pattern_banks():
        for uri, document in bank.documents.items():
            for pointer, node in walk(document):
                key = (bank.pins[uri], pointer)
                if key in seen:
                    continue
                seen.add(key)
                root = uri + '#' + pointer
                pattern = node['pattern']
                candidates = ([node['const']] if 'const' in node else []) + node.get('enum', [])
                candidates += examples.pattern_examples(pattern)
                control = next((x for x in candidates if isinstance(x, str) and not bank.errors(root, x)), None)
                ident = name + '/' + uri + '#' + pointer
                if control is None:
                    rows.append(dict(bank=name, root=root, owner_sha256=bank.pins[uri], pattern=pattern,
                                     status='NO_VALID_CONTROL'))
                    s.positive('patterns', ident + '/valid_control', lambda: _assert(False, 'no valid control: ' + ident))
                    continue
                defective = control + '\n'
                expected = ecma_pattern(pattern).search(defective) is not None
                errors = bank.errors(root, defective)
                pattern_errors = [e for e in errors if e.validator == 'pattern']
                def compare(expected=expected, errors=pattern_errors):
                    _assert(bool(errors) != expected, 'pattern LF verdict differs from shared ECMA search')
                s.positive('patterns', ident + ('/LF_permitted' if expected else '/LF_refused'), compare)
                rows.append(dict(bank=name, root=root, owner_sha256=bank.pins[uri], pattern=pattern,
                                 control=control, value=defective, expected_pattern_valid=expected,
                                 pattern_errors=len(pattern_errors), status='pass' if bool(pattern_errors) != expected else 'fail'))
    return rows


def _assert(value, message):
    assert value, message


def selftest(s, work):
    w, request = defective_request(work / 'sir')
    before = w.storage.observe()
    s.negative('patterns', 'dg5_sir_admit_hash_trailing_LF', lambda: w.sir.admit(request), EXPECTED_REFUSAL)
    s.positive('patterns', 'dg5_sir_refusal_preserves_store',
               lambda: _assert(before == w.storage.observe(), 'SIR refusal changed the store'))
    return pattern_trials(s, work)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    root = Path(tempfile.mkdtemp(prefix='pattern-', dir=args.work))
    try:
        result = run(root)
        args.out.write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(result))
        return int(result['accepted'] or result.get('refusal') != EXPECTED_REFUSAL or result['before'] != result['after'])
    finally:
        shutil.rmtree(root)


if __name__ == '__main__':
    raise SystemExit(main())
