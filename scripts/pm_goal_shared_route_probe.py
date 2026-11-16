#!/usr/bin/env python3
"""Standing checks for routed shared refusals; TEST_ONLY, native NOT_RUN."""
from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path

import pm_goal_test_owner_adapters as A
import pm_goal_test_source as G
import pm_goal_test_storage as S


def signature(error):
    return dict(exception=type(error).__name__, args=list(error.args), message=str(error),
                code=getattr(error, 'code', None), klass=getattr(error, 'klass', None))


def refused(run, expected):
    try:
        run()
    except Exception as error:
        actual = signature(error)
        assert actual == expected, (actual, expected)
        return actual
    raise AssertionError('ACCEPTED instead of the routed refusal')


def storage_site():
    control = dict(commit_group_id='group', segment_name='segment', segment_generation=1,
                   manifest_generation=1, durability_class='ordinary',
                   acknowledged_at_utc='2026-11-16T00:00:00.000Z', first_sequence=1,
                   last_sequence=1, members=[['event', 1, 'digest']], restore_admission=None)
    assert set(control) == set(S.COMMIT_KEYS)
    assert S._commit_shape(control, 1, 1) is None
    negative = dict(control, extra_member=True)
    before = copy.deepcopy(negative)
    result = refused(lambda: S._commit_shape(negative, 1, 1),
                     signature(S.FrameError('Corrupt', 'commit_payload_shape')))
    assert negative == before
    return dict(control=control, negative=negative, refusal=result)


def source_site():
    reducer = G.LifecycleReducer('run')
    event = dict(event_type='goal_run.started', event_id='start', sequence_id=1)
    custody = dict(group_digest='group')
    control = reducer.step(reducer.initial(), event, custody)
    assert control['status'] == 'started' and len(control['events']) == 1
    before = copy.deepcopy(control)
    result = refused(lambda: reducer.step(control, event, custody),
                     signature(G.Halt('reducer/duplicate_start')))
    assert control == before
    return dict(control=before, negative_event=event, refusal=result)


def adapter_site():
    owner = A.TestOwner(A.OwnerRegistry())
    handle = owner.issue(None, {'value': 'retained'}, kind='route_probe')
    ref, value = owner.resolve(handle)
    assert value == {'value': 'retained'}
    result = refused(lambda: copy.copy(handle), signature(A.AdapterRefusal('handle/not_copyable')))
    assert owner.resolve(handle) == (ref, value)
    return dict(retained=value, refusal=result)


def helper_contract(module):
    """Instances, args, implicit context and explicit cause survive both helpers."""
    for name in ('shared_require', 'shared_refuse'):
        helper = getattr(module, name)
        for cause_mode in ('implicit', 'explicit', 'suppressed'):
            original = ValueError('original context')
            error = module.FrameError('Corrupt', 'probe') if module is S else (
                module.Halt('probe') if module is G else module.AdapterRefusal('probe'))
            expected = signature(error)
            try:
                raise original
            except ValueError:
                kwargs = {} if cause_mode == 'implicit' else {
                    'cause': original if cause_mode == 'explicit' else None}
                try:
                    if name == 'shared_require':
                        helper(error, False, **kwargs)
                    else:
                        helper(error, **kwargs)
                except Exception as caught:
                    assert caught is error and signature(caught) == expected
                    assert caught.__context__ is original
                    assert caught.__cause__ is (original if cause_mode == 'explicit' else None)
                    assert caught.__suppress_context__ == (cause_mode != 'implicit')
                else:
                    raise AssertionError('shared helper accepted a refusal')
        assert module.shared_require(error, True) is None
    return 'instance, class, args, message, code, context and cause preserved'


CHECKS = {'storage_commit_shape': storage_site, 'source_duplicate_start': source_site,
          'adapter_copy': adapter_site,
          'storage_helpers': lambda: helper_contract(S),
          'source_helpers': lambda: helper_contract(G),
          'adapter_helpers': lambda: helper_contract(A)}


def selftest(s, work):
    for name, check in CHECKS.items():
        s.positive('shared_routes', name, check)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', choices=CHECKS)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    cases = []
    for name in ([args.site] if args.site else CHECKS):
        try:
            cases.append(dict(id=name, status='pass', detail=CHECKS[name]()))
        except Exception as error:
            cases.append(dict(id=name, status='fail', error=type(error).__name__ + ': ' + str(error)))
    result = dict(qualification='TEST_ONLY', native_execution='NOT_RUN', cases=cases,
                  status='pass' if all(c['status'] == 'pass' for c in cases) else 'fail')
    args.out.write_text(json.dumps(result, indent=1) + '\n')
    print(json.dumps(result))
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())
