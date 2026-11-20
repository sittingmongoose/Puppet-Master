#!/usr/bin/env python3
"""Original shared adapter calls on the current Goal started checker source."""

import argparse
from pathlib import Path

import pm_goal_dg5_methodb_stage7 as pilot
import pm_goal_dg_s_oracles as source
import pm_goal_guard_tables as tables

FAMILY = 'goal_run.started'
ADAPTERS = pilot.ADAPTERS
A = source.A


def start_world(directory):
    return source.ST.StartWorld(source.Suite(directory).tmp(), source.edition('v3')).build_owners()


def registry_role_type(directory, negative):
    world = start_world(directory)
    owner = A.TestOwner(A.OwnerRegistry(), owner_id='TEST_ONLY:stage7-new-owner')
    role = '' if negative else owner.role
    return world, world.registry.register, (owner, role), {}


def registry_duplicate(directory, negative):
    world = start_world(directory)
    owner = world.owners['native']
    if not negative:
        owner = A.TestOwner(A.OwnerRegistry(), owner_id='TEST_ONLY:stage7-new-owner')
    return world, world.registry.register, (owner, owner.role), {}


def registry_role_match(directory, negative):
    world = start_world(directory)
    owner = world.owners['native']
    role = 'TEST_ONLY:unrelated-role' if negative else owner.role
    return world, world.registry.owner, (owner.owner_id, role), {}


def codec_key(directory, negative):
    world = start_world(directory)
    return world, A.exact_json, ({1 if negative else '1': 'test value'},), {}


def issue_immutable(directory, negative):
    world = start_world(directory)
    owner = world.owners['native']
    original_ref = 'TEST_ONLY:stage7-original-ref'
    owner.issue(None, {'value': 'first'}, ref=original_ref)
    ref = original_ref if negative else original_ref + ':second'
    return world, owner.issue, (None, {'value': 'second'}), {'ref': ref}


def withdrawn_handle(directory, negative):
    world = start_world(directory)
    owner = world.owners['native']
    handle = owner.issue(None, {'value': 'first'})
    if negative:
        owner.withdraw(handle)
    return world, owner.resolve, (handle,), {}


def original_ref_type(directory, negative):
    world = start_world(directory)
    owner = world.owners['native']
    value = {'value': 'first'}
    # The real issuer accepts this ref when supplied explicitly. It creates
    # the original whose type is then checked by the complete authenticate call.
    ref = 1 if negative else 'TEST_ONLY:stage7-original-ref'
    owner.issue(None, value, ref=ref)
    return world, owner.authenticate, (ref, value), {}


def withdrawn_reference(directory, negative):
    world = start_world(directory)
    owner = world.owners['native']
    value = {'value': 'first'}
    ref = 'TEST_ONLY:stage7-original-ref'
    handle = owner.issue(None, value, ref=ref)
    if negative:
        owner.withdraw(handle)
    return world, owner.authenticate, (ref, value), {}


def original_bytes(directory, negative):
    world = start_world(directory)
    owner = world.owners['native']
    ref = 'TEST_ONLY:stage7-original-ref'
    owner.issue(None, {'value': 'first'}, ref=ref)
    presented = {'value': 'changed' if negative else 'first'}
    return world, owner.authenticate, (ref, presented), {}


def activation(directory):
    world = start_world(directory)
    owner = A.ActivationOwner(A.OwnerRegistry(), owner_id='TEST_ONLY:stage7-activation')
    owner.birth('subject', 'ready')
    return world, owner


def activation_state(directory, negative):
    world, owner = activation(directory)
    state = 'other' if negative else 'ready'
    return world, owner.transition, ('subject', state, 0, 'active'), {'cause_ref': 'TEST_ONLY:cause'}


def activation_revision(directory, negative):
    world, owner = activation(directory)
    return world, owner.transition, ('subject', 'ready', int(negative), 'active'), {'cause_ref': 'TEST_ONLY:cause'}


CASES = {
    'activation-revision': (ADAPTERS, 575, 'activation/cas_revision', activation_revision),
    'activation-state': (ADAPTERS, 574, 'activation/cas_state', activation_state),
    'original-bytes': (ADAPTERS, 503, 'original/bytes', original_bytes),
    'withdrawn-reference': (ADAPTERS, 500, 'original/withdrawn', withdrawn_reference),
    'original-ref-type': (ADAPTERS, 497, 'original/ref_type', original_ref_type),
    'withdrawn-handle': (ADAPTERS, 484, 'original/withdrawn', withdrawn_handle),
    'issue-immutable': (ADAPTERS, 466, 'issue/immutable_ref', issue_immutable),
    'codec-key': (ADAPTERS, 421, 'custody/exact_json/key', codec_key),
    'registry-role-match': (ADAPTERS, 330, 'registry/role', registry_role_match),
    'registry-duplicate': (ADAPTERS, 322, 'registry/duplicate_id', registry_duplicate),
    'registry-role-type': (ADAPTERS, 321, 'registry/role_type', registry_role_type),
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
