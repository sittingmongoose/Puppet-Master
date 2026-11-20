#!/usr/bin/env python3
"""Original Goal started checker fixtures for selected batch 10 rows."""
import argparse
from pathlib import Path

import pm_goal_dg_s_oracles as source
import pm_goal_dg5_methodb_stage7 as pilot
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables

FAMILY = 'goal_run.started'
READERS = 'scripts/pm_goal_dg_s_readers.py'
START = 'scripts/pm_goal_dg_s_start.py'
WORLD = 'scripts/pm_goal_dg_s_world.py'
S = source.S
W = source.W
R = source.R


def selector(directory, negative):
    suite = source.Suite(directory)
    world, handles = source.new_world(suite)
    acquired, _ = world.start.acquire_all(handles)
    selected = acquired['d01_current']['workflow']['head']['current_body']
    if negative:
        selected = dict(selected, stage7_extra='x')
    return world, W.resolve_selector, (world.storage, selected, 'start/d01_head_body'), {}


def ready_retry(directory):
    suite = source.Suite(directory)
    world, handles = source.new_world(suite)
    world.fault = 'after_prepare'
    try:
        world.start.commit_start(source.request(world), handles)
    except S.Crash as error:
        pilot.require(error.point == 'after_prepare', str(error))
    else:
        raise ValueError('original Start did not stop after prepare')
    world.fault = None
    return world, handles


def prepared_candidate(directory, negative):
    world, handles = ready_retry(directory)
    if negative:
        edition = world.edition
        owner = world.owners['input:native_compile']
        ref = edition.activation.replace('workflow_activation_sources.v4',
                                         'current_activation_materialization_join.v1')
        ref += '#/$defs/SevenDurableOriginalInputs/properties/native_compile'
        original = W.skeleton(edition.bank, edition.custody + '#/$defs/OriginalWorkflowArgument')
        value = original['seven_original_inputs']['native_compile']
        handles['input:native_compile'] = (owner.owner_id, owner.issue_whole(
            ref, value, kind='seven_input:native_compile', prefix='stage7_native_compile'))
    return world, world.start.commit_start, (source.request(world), handles), {}


def complete_projection(directory, negative):
    world, _, _ = source.started(source.Suite(directory))
    if negative:
        source.extra_event(world, 'stage7-post-start', run=world.ctx.goal_run_id, event_type='goal_run.blocked')
    projector = R.StartedProjector(world.registry, world=world)
    projector.install()
    generation = projector.stage()
    return world, projector.replay, (generation,), {}


def projection_commitment(directory, negative):
    world, _, _ = source.started(source.Suite(directory))
    original = R.original_started(world)
    if negative:
        # Both presented copies agree. Recomputing the digest over the
        # untouched original event must still detect the changed value.
        original['original_append']['exact_custody']['original_event_value_commitment']['sha256'] = '0' * 64
    rep = R.Representation(world)
    record = R.projection_record(world, original)
    wrapper = rep.encode(record, 'grsg_' + '0' * 64)
    return world, rep.decode, (wrapper, original), {}


def stored_group(directory, negative):
    world, _, outcome = source.started(source.Suite(directory))
    event_id = outcome['original_append']['event']['event_id']
    if negative:
        info = world.storage.events[event_id]
        group = next(g for g in world.storage.groups if g['commit']['commit_group_id'] == info['commit_group_id'])
        group['commit']['durability_class'] = 'stage7-invalid'
    return world, world.storage.active_durable_group, (event_id,), {}


def frame_header(directory, negative):
    world, _, outcome = source.started(source.Suite(directory))
    event = world.storage.read_event(outcome['original_append']['event']['event_id'])
    if negative:
        event['event_id'] = 'TEST_ONLY:' + ('x' * S.HEADER_CAP)
    return world, S.encode_event_frame, (event, 1), {}


CASES = {
    'frame-header': (pilot.STORAGE, 440, 'frame/header_cap', frame_header),
    'stored-group': (pilot.STORAGE, 1618, 'group/schema', stored_group),
    'projection-commitment': (READERS, 491, 'representation/commitment_recomputed', projection_commitment),
    'complete-projection': (READERS, 654, 'projector/reducer/unsupported_same_run:goal_run.blocked', complete_projection),
    'prepared-candidate': (START, 1002, 'start/idempotency_conflict', prepared_candidate),
    'selector': (WORLD, 458, 'start/d01_head_body/selector_type', selector),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('case', choices=CASES)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--leave-enabled', action='store_true')
    args = parser.parse_args()
    pilot.run(args.case, args.out.resolve(), leave_enabled=args.leave_enabled, cases=CASES, family=FAMILY)


if __name__ == '__main__':
    main()
