"""Exercise the existing TEST_ONLY backup owner with Goal Update and migration custody."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import shutil
from unittest.mock import patch

import pm_goal_dg_cb_c5_cases as c5
import pm_goal_dg_cb_c6_cases as c6
import pm_goal_dg_cb_migration as migration
import pm_goal_dg_cb_owners as migration_owners
import pm_goal_dg_cf3_restore as backup
import pm_goal_dg_u_owners as update
import pm_goal_test_owner_adapters as adapters
import pm_goal_test_storage as storage
from pm_goal_depth_replay import check, write_evidence
from pm_goal_depth_update import goal_effects


def restore_unit(root, original, missing):
    registry = adapters.OwnerRegistry()
    issuer = backup.BackupOwner(registry)
    tombstones = backup.TombstoneOwner(registry)
    driver = backup.RestoreDriver(registry)
    unit_dir = root / 'unit'
    backup_source = backup.W.LaneStorage.open(original.root)
    check(backup_source.commit_generation == original.commit_generation,
          'Opening original Storage for backup changed its commit generation')
    handle, unit = issuer.take(backup_source, unit_dir)
    incomplete = root / 'incomplete'
    incomplete.mkdir()
    shutil.copyfile(unit_dir / backup.UNIT_FILE, incomplete / backup.UNIT_FILE)
    check(missing in {member['path'] for member in unit['members']},
          f'Backup did not include required member {missing}')
    for member in unit['members']:
        path = member['path']
        raw = (unit_dir / path).read_bytes()
        check(len(raw) == member['bytes'] and sha256(raw).hexdigest() == member['sha256'],
              f'Backup changed physical bytes for {path}')
        if path != missing:
            dest = incomplete / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(raw)
    refused_target = root / 'refused' / 'storage'
    try:
        driver.restore(backup_owner=issuer, handle=handle, unit_dir=incomplete, target=refused_target,
                       tombstones=tombstones, scopes=[])
    except backup.W.LaneRefusal as error:
        check(error.code == 'restore/unit_incomplete', f'Wrong incomplete-unit refusal: {error.code}')
    else:
        raise AssertionError('Restore accepted a unit missing one required authority member')
    check(not refused_target.exists(), 'Incomplete unit installed a target before refusal')

    target = root / 'restored' / 'storage'
    result = driver.restore(backup_owner=issuer, handle=handle, unit_dir=unit_dir, target=target,
                            tombstones=tombstones, scopes=[])
    restored = result['storage']
    check(restored.storage_instance_id == original.storage_instance_id and
          restored.cells == original.cells and restored.reservations == original.reservations and
          restored.events == original.events and restored.custody == original.custody and
          restored.packs == original.packs,
          'Restore changed original owner cells, reservations, events, custody or packs')
    return target, dict(manifest=unit, omitted_member=missing, exact_refusal='restore/unit_incomplete')


def provider_backup(root):
    world = update.World(root / 'original')
    goal = update.birth_goal(world)
    scope = goal['scope']
    accepted, source = update.agent_request(world, goal, 'Approved replacement 🌿')
    original_approval = world.approvals.state(accepted['approval_id'])
    original_proposal = source['proposal']
    proposal_id = original_proposal['command_instance_id']
    first_dispatch = world.sir.proposal_dispatch(proposal_id, 'goal-depth/backup')
    same_dispatch = world.sir.admit_proposal(original_proposal)
    retried = world.approvals.capture(proposal_id)
    check(same_dispatch == first_dispatch and world.approvals.state(accepted['approval_id']) == original_approval,
          'An equal retry changed the underlying dispatch or first approval')
    original_bytes = update.msgpack(original_proposal)
    altered = dict(original_proposal, return_route_ref='route:TEST_ONLY:other-proposal-route')
    before_conflict = world.observe_effects()
    try:
        world.sir.admit_proposal(altered)
    except adapters.AdapterRefusal as error:
        check(str(error) == 'dgu/sir/proposal_conflict', f'Wrong proposal retry refusal: {error}')
    else:
        raise AssertionError('SIR accepted an altered proposal under an existing dispatch identity')
    check(world.observe_effects() == before_conflict, 'Altered dispatch retry changed the store')

    command_id = accepted['command_instance_id']
    world.command.run(accepted)
    terminal = world.sir.replay(command_id)['terminal']
    check(terminal['result']['status'] == 'succeeded', 'Original provider result did not settle')
    large, large_source = update.agent_request(world, goal, '🌿' * 4000)
    world.approvals.revoke(large['approval_id'])
    approval_cells = {key: world.approvals.state(key) for key in (accepted['approval_id'], large['approval_id'])}
    large_approval = approval_cells[large['approval_id']]
    carrier = world.storage.cell(world.approvals.table, large['approval_id'])['value']
    payload_ref = carrier['payload_ref']
    pack_path = 'packs/' + payload_ref['blake3']
    proposal_root = update.CONTRACTS_URI + '#/$defs/StorageProposal'
    wrapper_errors = {}
    for size, approval in (('inline', original_approval), ('large', large_approval)):
        wrapper_errors[size] = [dict(path=list(error.absolute_path), keyword=error.validator)
                                for error in world.approvals.bank.errors(proposal_root, approval['stored_proposal'])]

    target, evidence = restore_unit(root, world.storage, pack_path)
    reopened = update.World(target.parent, create=False)
    for original in (source, large_source):
        proposal = original['proposal']
        key = proposal['command_instance_id']
        check(reopened.sir.proposal_dispatch(key, 'goal-depth/restore') ==
              world.sir.proposal_dispatch(key, 'goal-depth/backup'), 'Restore changed original proposal dispatch')
        for name in ('instruction_message_id', 'source_message_id'):
            message_id = proposal[name]
            check(reopened.chat.read(message_id, 'goal-depth/restore') ==
                  world.chat.read(message_id, 'goal-depth/backup'), 'Restore changed an original chat source')
    check({key: reopened.approvals.state(key) for key in approval_cells} == approval_cells,
          'Restore changed original approval or decision bytes')
    check(reopened.storage.read_pack(payload_ref, expected_media_type=update.MEDIA) == update.msgpack(large_approval),
          'Restored physical owner-cell pack does not contain the complete original value')
    try:
        reopened.approvals.read_resolution(large['approval_id'], 'goal-depth/restore')
    except adapters.AdapterRefusal as error:
        check(str(error) == 'goal-depth/restore/approval_revoked', f'Wrong revoked-approval refusal: {error}')
    else:
        raise AssertionError('Restore revived an already-revoked approval')
    reopened.installation.withdraw()
    reopened.threads.delete(scope['project_id'], scope['thread_id'])
    before = goal_effects(reopened)
    check(reopened.sir.replay(command_id)['terminal'] == terminal and goal_effects(reopened) == before,
          'Retained replay after withdrawal or deletion changed the original result or Goal effects')
    return dict(evidence, proposal_retry=dict(original_dispatch_id=first_dispatch['dispatch_id'],
                first_approval_id=accepted['approval_id'], retry_approval_id=retried['approval_id'],
                original_request_reused=retried['request'] == original_approval['request'],
                original_decision_preserved=original_approval['resolution']['decision'] == 'approved',
                altered_dispatch_refusal='dgu/sir/proposal_conflict'),
                storage_proposal_root=proposal_root, stored_wrapper_errors=wrapper_errors,
                original_proposal_msgpack_sha256=update.sha(original_bytes),
                inline_wrapper_request_sha256=original_approval['stored_proposal']['original_request_sha256'],
                source_request_commitments={key: row['request_sha256'] for key, row in approval_cells.items()},
                approval_owner_epoch=large_approval['approval_owner_epoch'], generic_owner_cell_pack=payload_ref,
                selected_proposal_content=large_approval['stored_proposal']['content'],
                revoked_approval_refusal='goal-depth/restore/approval_revoked',
                terminal_sha256=update.sha(update.msgpack(terminal)))


def migration_backup(root):
    world = migration.migration_world(root / 'original')
    scope = migration_owners.legacy_goal(world, revisions=2)
    world.host_stop.manual(scope, 'stop')
    pending = world.goal.reserve_pending(scope, world.host_stop.record(scope)['user_stop_epoch'])
    selector, request, result = c5.run(world, scope)
    mid = selector['migration_id']
    withdrawal_request = c6.withdrawal_request(world, scope, mid)
    withdrawal = world.coordinator.withdraw(withdrawal_request)
    parts = world.coordinator.manifest_parts_of(scope, mid)
    check(result['disposition'] == 'enrolled' and parts and
          withdrawal['preserved_pending_operation_ids'] == [pending['operation_id']],
          'Expected original enrolled result, manifest and preserved pending work')

    committed_manifest = storage.decode_canonical((world.storage.root / 'CURRENT').read_bytes())['manifest_ref']
    target, evidence = restore_unit(root, world.storage, committed_manifest)
    reopened = migration.open_world(target)
    maintenance = reopened.maintenance.source()
    reopened.maintenance.restore()
    current = reopened.maintenance.source()
    check(current == dict(maintenance, restore_epoch=maintenance['restore_epoch'] + 1),
          'Original maintenance owner did not retain root and advance only restore epoch')
    before = reopened.storage.cell_generation
    check(reopened.coordinator.recover(selector) == result and
          reopened.coordinator.manifest_parts_of(scope, mid) == parts and
          reopened.coordinator.withdraw(withdrawal_request) == withdrawal and
          reopened.storage.cell_generation == before and reopened.binding.domain_withdrawn,
          'Restore changed migration custody or the cutoff, or repeated an original transaction')
    check(c5.goal_physical(reopened, scope) == c5.goal_physical(world, scope) and
          reopened.host_stop.record(scope) == world.host_stop.record(scope),
          'Restore changed the original Goal bytes or host Stop')
    reopened.maintenance.request_deletion(scope)
    try:
        reopened.coordinator.read_result(selector)
    except adapters.AdapterRefusal as error:
        check(str(error) == 'M/read_result/deleted', f'Wrong current deletion refusal: {error}')
    else:
        raise AssertionError('Current deletion did not fence original result disclosure')
    return dict(evidence, migration_result_sha256=migration_owners.row_sha(result),
                source_capture_sha256=migration_owners.row_sha(request),
                manifest_parts_sha256=[migration_owners.row_sha(part) for _, part in parts],
                withdrawal_sha256=migration_owners.row_sha(withdrawal),
                restore_epoch=current['restore_epoch'], current_deletion_refusal='M/read_result/deleted')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('family', choices=('update', 'cancel'))
    args = parser.parse_args()
    root = args.out.resolve()
    root.mkdir(parents=True)

    def retain_retired_manifest(path, *args, **kwargs):
        # Keep rotated TEST_ONLY files for the scope of this evidence run.
        check(path.is_relative_to(root) and path.match('manifest.*.msgpack'), f'Unexpected removal: {path}')
        retained = path.with_name('retained-' + path.name)
        check(not retained.exists(), f'Retired manifest already retained: {retained}')
        path.rename(retained)

    with patch.object(Path, 'unlink', retain_retired_manifest):
        evidence = (provider_backup if args.family == 'update' else migration_backup)(root)
    write_evidence(root / 'backup.json', evidence)
    print(json.dumps(dict(family=args.family, authority_members=len(evidence['manifest']['members']),
                          exact_refusal=evidence['exact_refusal'])))


if __name__ == '__main__':
    main()
