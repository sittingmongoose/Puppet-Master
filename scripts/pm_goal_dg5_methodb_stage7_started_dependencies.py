#!/usr/bin/env python3
"""Check the original Start preparation and retained-reader dependencies."""
import argparse
import ast
from pathlib import Path

import pm_goal_dg5_methodb_stage7 as pilot
import pm_goal_dg5_methodb_stage7_started as started
from pm_goal_dg5_methodb_stage7_dependencies import source, verdict
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables

FAMILY = started.FAMILY
START = started.START
READERS = started.READERS
WORLD = started.WORLD
O = started.source
S = started.S


def site(path, line):
    return pilot.bridge.site_name(path, line)


PENDING = {
    'dg5/site/pm_goal_dg_s_start.py:1004': dict(
        kind='entailed-by-pending-prepared-check',
        families=[FAMILY],
        depends_on=[site(START, 973)],
        sites=[(START, 965), (START, 969), (START, 971), (START, 972), (START, 973),
               (START, 1001), (START, 1004)],
        argument=(
            'Both checks use the same local pending and prepared values assigned at :969 and :971. '
            'When prepared is absent, a nonempty pending fails :973 before reaching :1004. '
            'The same other-operation request refuses at :973 alone and at :1004 alone, '
            'with start/pending_other_operation in both cases. Restoration returns to :973.'),
    ),
}


def call(fixture, label, cut=()):
    return pilot.call(fixture, label, sweep.Collector(judge=False), cut=cut, family=FAMILY)


def trials(fixture, label, choices):
    result = {name: call(fixture, label, cut) for name, cut in choices.items()}
    pilot.require(len({run['input_sha256'] for run in result.values()}) == 1,
                  'complete-call argument or store binding changed')
    return result


def pending(directory):
    module = ast.parse((pilot.ROOT / START).read_text())
    method = next(node for node in ast.walk(module)
                  if isinstance(node, ast.FunctionDef) and node.name == 'commit_start')
    refs = [(node.lineno, ast.unparse(node)) for node in ast.walk(method)
            if isinstance(node, (ast.Name, ast.Assign)) and
               any(isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store) and n.id in ('prepared', 'pending')
                   for n in ast.walk(node))]
    assignments = sorted(line for line, text in refs if '=' in text)
    pilot.require(assignments == [969, 971], 'pending/prepared are no longer stable locals')

    world, handles = O.new_world(O.Suite(directory / 'valid'))
    control = call((world, world.start.commit_start, (O.request(world), handles), {}), 'new original preparation')
    verdict(control)
    world, handles = started.ready_retry(directory / 'invalid')
    fixture = world, world.start.commit_start, (O.request(world, 'TEST_ONLY:start-op:2'), handles), {}
    early, late = site(START, 973), site(START, 1004)
    result = trials(fixture, 'other operation while prepared', dict(
        baseline=(), early_disabled=(early,), late_disabled=(late,), restored=()))
    code = 'start/pending_other_operation'
    verdict(result['baseline'], early, code)
    verdict(result['early_disabled'], late, code)
    verdict(result['late_disabled'], early, code)
    verdict(result['restored'], early, code)
    return dict(row=late, control=control, trials=result, source=[source(START, 969, 971, 972, 973, 1001, 1004)])


def retained(directory):
    world, _, _ = O.started(O.Suite(directory / 'valid'))
    function = O.R.retained_native
    control = call((world, function, (world,), {}), 'valid retained original')
    verdict(control)
    world, _ = O.new_world(O.Suite(directory / 'invalid'))
    fixture = world, function, (world,), {}
    early, late = site(READERS, 77), site(WORLD, 458)
    result = trials(fixture, 'retained acquisition before original Start', dict(
        baseline=(), first_disabled=(early,), later_disabled=(late,), restored=()))
    verdict(result['baseline'], early, 'retained/no_committed_start')
    verdict(result['first_disabled'], late, 'retained/commit/selector_type')
    verdict(result['later_disabled'], early, 'retained/no_committed_start')
    verdict(result['restored'], early, 'retained/no_committed_start')
    return dict(row=early, control=control, trials=result, source=[source(READERS, 77, 79), source(WORLD, 458)])


def main():
    functions = {'pending': pending, 'retained': retained}
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('case', choices=functions)
    p.add_argument('--out', type=Path, required=True)
    args = p.parse_args()
    args.out.mkdir(parents=True)
    tables.DISCOVERY = True
    result = functions[args.case](args.out)
    pilot.write(args.out / 'implication.json', result)


if __name__ == '__main__':
    main()
