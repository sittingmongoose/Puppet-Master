"""Exercise the existing TEST_ONLY backup owner with Goal Update and migration custody."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import shutil

import pm_goal_dg_cb_c5_cases as c5
import pm_goal_dg_cb_c6_cases as c6
import pm_goal_dg_cb_migration as migration
import pm_goal_dg_cb_owners as migration_owners
import pm_goal_dg_cf3_restore as backup
import pm_goal_dg_u_owners as update
import pm_goal_depth_provider as provider
import pm_goal_test_owner_adapters as adapters
import pm_goal_test_storage as storage
from pm_goal_depth_replay import check, retain_manifests, write_evidence
from pm_goal_depth_update import expect_refusal, goal_effects


class ProviderBackupOwner(backup.BackupOwner):
    """SP-1130/U7 supplements the physical unit with its original provider inventory."""

    def __init__(self, registry):
        super().__init__(registry)
        self.provider_units = {}

    def take_world(self, live, source, dest):
        approval = live.approvals
        rows = {}
        for approval_id, core in approval.rows().items():
            approval.read_request(approval_id, 'depth/provider/backup')
            _, proposal = approval.read_stored_proposal(core, 'depth/provider/backup')
            key = update.resolution_key(core['scope'], approval_id)
            cell = live.storage.cell(provider.RESOLUTION, key)
            resolved = approval.read_stored_resolution(core['scope'], approval_id, 'depth/provider/backup') if cell else None
            rows[approval_id] = (core, proposal, resolved)
        handle, unit = self.take(source, dest)
        self.provider_units[handle] = (approval.owner_id, approval.owner_epoch, rows)
        return handle, unit

    def restore_world(self, driver, *, current, handle, unit_dir, target, tombstones):
        # Authenticate the sealed physical unit and consult current owner state
        # independently of what the old backup says, before a target exists.
        where = 'depth/provider/restore'
        unit = self.authenticate_unit(handle, (unit_dir / backup.UNIT_FILE).read_bytes())
        owner_id, epoch, rows = self.provider_units[handle]
        current.registry.authenticate_owner(current.approvals, 'hitl_approval')
        update.require(where + '/owner_identity', current.storage.storage_instance_id == unit['storage_instance_id']
                       and current.approvals.owner_id == owner_id)
        update.require(where + '/owner_epoch', current.approvals.owner_epoch == epoch)
        current.installation.require_installed(where)
        for approval_id, (original, proposal, resolution) in rows.items():
            scope = original['scope']
            thread = current.threads.require_content(scope, where)
            update.require(where + '/hold', not thread.get('hold'))
            current.permissions.check(proposal['permission_snapshot_ref'], proposal['actor_ref'], scope,
                                      'propose_goal_update', where)
            actual = current.approvals.state(approval_id)
            update.require(where + '/approval_unavailable', actual is not None)
            update.require(where + '/approval_revocation', actual['revoked'] == original['revoked'])
            update.require(where + '/approval_issuance', actual == original)
            current.approvals.read_request(approval_id, where)
            if resolution is not None:
                decision = resolution['resolution']
                permission = current.permissions.check(actual['approver_permission_ref'], decision['approver_ref'],
                                                       scope, 'approve_goal_update', where)
                update.require(where + '/not_person', permission['person'] is True)
                update.require(where + '/approval_resolution', resolution == current.approvals.read_stored_resolution(
                    scope, approval_id, where))
                expiry = actual['expires_at_utc']
                if not actual['revoked'] and decision['decision'] == 'approved' and expiry is not None:
                    update.require(where + '/approval_expired', provider.utc_order(current.now()) < provider.utc_order(expiry))
        return driver.restore(backup_owner=self, handle=handle, unit_dir=unit_dir, target=target,
                              tombstones=tombstones, scopes=[])


class MigrationBackupOwner(backup.BackupOwner):
    """SP-1131/M8 restore checks against independently current migration authority."""

    def __init__(self, registry, scope):
        super().__init__(registry)
        self.scope = scope
        self.migration_units = {}

    @staticmethod
    def root_of(world):
        world.registry.authenticate_owner(world.maintenance, 'storage_maintenance')
        source = world.maintenance.source()
        return tuple(source[name] for name in ('storage_instance_id', 'root_identity', 'namespace'))

    @staticmethod
    def domain_of(world):
        return dict(selection=world.coordinator.current_domain_selection(),
                    withdrawn=world.binding.domain_withdrawn, native_root=world.registration.root_identity)

    def take_world(self, live, source, dest):
        root, domain = self.root_of(live), self.domain_of(live)
        handle, unit = self.take(source, dest)
        self.migration_units[handle] = (root, domain)
        return handle, unit

    def restore_world(self, driver, *, current, handle, unit_dir, target, tombstones):
        self.authenticate_unit(handle, (unit_dir / backup.UNIT_FILE).read_bytes())
        root, domain = self.migration_units[handle]
        # M8: an archive cannot supply its own current root, domain or scope
        # permissions. A current tombstone or hold fences installation.
        where = 'depth/migration/restore'
        update.require(where + '/root', self.root_of(current) == root)
        update.require(where + '/domain', self.domain_of(current) == domain)
        scope_state = current.maintenance.scope_state(self.scope)
        update.require(where + '/deleted', not scope_state['deletion_requested'])
        update.require(where + '/hold', not scope_state['holds'])
        return driver.restore(backup_owner=self, handle=handle, unit_dir=unit_dir, target=target,
                              tombstones=tombstones, scopes=[])


def provider_restore_fences(root, world, restore, unguarded, *, goal, proposal, approval_id, approver_permission,
                            packed_approval_id, pack_ref):
    """Current owners change one fact after backup. The prior driver is the reverted control."""
    scope = goal['scope']
    prefix = 'depth/provider/restore/'

    def retain_current_pack(w):
        path = w.storage.root / 'packs' / pack_ref['blake3']
        path.rename(path.with_name('held-' + path.name))

    cases = (
        ('permission', prefix + 'permission_revoked', lambda w: w.permissions.revoke(approver_permission)),
        ('deletion', prefix + 'content_unavailable', lambda w: w.threads.delete(scope['project_id'], scope['thread_id'])),
        ('hold', prefix + 'hold', lambda w: w.threads.place_hold(scope)),
        ('epoch', prefix + 'owner_epoch', lambda w: w.approvals.advance_owner_epoch()),
        ('revocation', prefix + 'approval_revocation', lambda w: w.approvals.revoke(approval_id)),
        ('expiry', prefix + 'approval_expired', lambda w: setattr(w, 'now', lambda: w.approvals.state(approval_id)['expires_at_utc'])),
        ('withdrawal', prefix + 'installation_unavailable', lambda w: w.installation.withdraw()),
        ('proposal_pack', 'pack/present', retain_current_pack),
    )
    evidence = {}
    for name, code, change in cases:
        baseline = root / name
        current_path = shutil.copytree(world.root, baseline / 'live')
        current = provider.World(current_path, create=False)
        change(current)
        target = baseline / 'refused' / 'storage'
        before = current.observe_effects()
        refusal = expect_refusal(code, lambda: restore(current, target))
        check(not target.exists() and current.observe_effects() == before,
              f'Restore {name} refusal created a target or changed current authority')
        bypass = baseline / 'reverted' / 'storage'
        unguarded(bypass)
        reopened = provider.World(bypass.parent, create=False)
        replay = reopened.approvals.read_resolution(approval_id, 'depth/restore/reverted')
        check(replay['request']['target'] == proposal['target'],
              f'The provider-neutral restored approval did not expose the stale {name} authority')
        if name == 'proposal_pack':
            recovered = reopened.approvals.read_request(packed_approval_id, 'depth/restore/reverted')
            check(len(recovered['target']['objective_text']) == 4000,
                  'Reverted restore did not recover the old unavailable proposal content')
        evidence[name] = dict(exact_refusal=refusal, refused_target_absent=not target.exists(),
                              reverted_exposed_approval=replay['resolution']['approval_id'])
    return evidence


def restore_unit(root, world, missing, *, issuer_factory, probes):
    registry = adapters.OwnerRegistry()
    issuer = issuer_factory(registry)
    tombstones = backup.TombstoneOwner(registry)
    driver = backup.RestoreDriver(registry)
    unit_dir = root / 'unit'
    original = world.storage
    backup_source = backup.W.LaneStorage.open(original.root)
    check(backup_source.commit_generation == original.commit_generation,
          'Opening original Storage for backup changed its commit generation')
    handle, unit = issuer.take_world(world, backup_source, unit_dir)

    def physical(target, source=unit_dir):
        return driver.restore(backup_owner=issuer, handle=handle, unit_dir=source, target=target,
                              tombstones=tombstones, scopes=[])

    def guarded(current, target, source=unit_dir):
        return issuer.restore_world(driver, current=current, handle=handle, unit_dir=source,
                                    target=target, tombstones=tombstones)
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
        guarded(world, refused_target, incomplete)
    except backup.W.LaneRefusal as error:
        check(error.code == 'restore/unit_incomplete', f'Wrong incomplete-unit refusal: {error.code}')
    else:
        raise AssertionError('Restore accepted a unit missing one required authority member')
    check(not refused_target.exists(), 'Incomplete unit installed a target before refusal')

    target = root / 'restored' / 'storage'
    result = guarded(world, target)
    restored = result['storage']
    check(restored.storage_instance_id == original.storage_instance_id and
          restored.cells == original.cells and restored.reservations == original.reservations and
          restored.events == original.events and restored.custody == original.custody and
          restored.packs == original.packs,
          'Restore changed original owner cells, reservations, events, custody or packs')
    evidence = dict(manifest=unit, omitted_member=missing, exact_refusal='restore/unit_incomplete',
                    current_authority=probes(root / 'current-authority', guarded, physical))
    return target, evidence


def provider_backup(root):
    world = provider.World(root / 'original', selected_expiry='2050-01-02T12:00:00.1000Z')
    goal = update.birth_goal(world)
    scope = goal['scope']
    accepted, source = update.agent_request(world, goal, 'Approved replacement 🌿')
    original_approval = world.approvals.read_resolution(accepted['approval_id'], 'goal-depth/backup')
    original_proposal = source['proposal']
    proposal_id = original_proposal['command_instance_id']
    first_dispatch = world.sir.proposal_dispatch(proposal_id, 'goal-depth/backup')
    same_dispatch = world.sir.admit_proposal(original_proposal)
    retried = world.approvals.capture(proposal_id)
    check(same_dispatch == first_dispatch and retried ==
          dict(approval_id=accepted['approval_id'], request=original_approval['request']) and
          world.approvals.read_resolution(accepted['approval_id'], 'goal-depth/backup') == original_approval,
          'An equal retry changed the underlying dispatch, first approval or original decision')
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
    large_stored, _ = world.approvals.read_stored_proposal(large_approval, 'goal-depth/backup')
    payload_ref = large_stored['content']['reference']
    pack_path = 'packs/' + payload_ref['blake3']
    proposal_root = update.CONTRACTS_URI + '#/$defs/StorageProposal'
    wrapper_errors = {}
    for size, core in zip(('inline', 'large'), approval_cells.values()):
        stored, _ = world.approvals.read_stored_proposal(core, 'goal-depth/backup')
        wrapper_errors[size] = list(world.approvals.bank.errors(proposal_root, stored))
    check(not any(wrapper_errors.values()), 'Selected proposal wrappers did not match the owner schema')

    def probes(path, guarded, physical):
        return provider_restore_fences(path, world, guarded, physical, goal=goal, proposal=source['proposal'],
                                       approval_id=accepted['approval_id'], approver_permission=source['approver_permission'],
                                       packed_approval_id=large['approval_id'], pack_ref=payload_ref)

    target, evidence = restore_unit(root, world, pack_path, issuer_factory=ProviderBackupOwner, probes=probes)
    reopened = provider.World(target.parent, create=False)
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
    check(reopened.storage.read_pack(payload_ref, expected_media_type=update.MEDIA) ==
          update.msgpack(large_source['proposal']), 'Restored SP-337 pack does not contain the complete original proposal')
    check(reopened.approvals.read_resolution(accepted['approval_id'], 'goal-depth/restore') == original_approval,
          'Restore did not retain the exact issued approval, protected resolution and expiry')
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
                inline_wrapper_request_sha256=original_approval['request']['proposal_request_sha256'],
                source_request_commitments={key: row['request_sha256'] for key, row in approval_cells.items()},
                approval_owner_epoch=large_approval['approval_owner_epoch'], selected_proposal_pack=payload_ref,
                selected_proposal_content=large_stored['content'],
                revoked_approval_refusal='goal-depth/restore/approval_revoked',
                terminal_sha256=update.sha(update.msgpack(terminal)))


def migration_restore_fences(root, world, restore, unguarded, scope, selector, result):
    """M8 owner changes made after the archive. The prior driver accepts all four."""
    def change_root(current):
        current.maintenance._update(lambda source: source.update(
            root_identity=migration_owners.uid('TEST_ONLY:storage-root')))

    cases = (
        ('deleted', lambda w: w.maintenance.request_deletion(scope)),
        ('hold', lambda w: w.maintenance.hold(scope)),
        ('root', change_root),
        ('domain', lambda w: w.coordinator.reinstall([scope])),
    )
    evidence = {}
    for name, change in cases:
        baseline = root / name
        live = shutil.copytree(world.storage.root, baseline / 'live')
        current = migration.open_world(live)
        change(current)
        target = baseline / 'refused' / 'storage'
        current_generation = current.storage.commit_generation
        refusal = expect_refusal('depth/migration/restore/' + name, lambda: restore(current, target))
        check(not target.exists() and current.storage.commit_generation == current_generation,
              f'Migration {name} refusal installed a target or changed current authority')
        bypass = baseline / 'reverted' / 'storage'
        unguarded(bypass)
        reopened = migration.open_world(bypass)
        before = MigrationBackupOwner.domain_of(world)
        check(reopened.coordinator.read_result(selector) == result and reopened.binding.domain_withdrawn and
              MigrationBackupOwner.root_of(reopened) == MigrationBackupOwner.root_of(world) and
              MigrationBackupOwner.domain_of(reopened) == before,
              'Unguarded restore did not expose the stale scope result, root or fenced domain')
        evidence[name] = dict(exact_refusal=refusal, refused_target_absent=not target.exists(),
                              reverted_read_result_sha256=migration_owners.row_sha(result),
                              current_scope=current.maintenance.scope_state(scope),
                              current_root=MigrationBackupOwner.root_of(current),
                              current_domain=MigrationBackupOwner.domain_of(current))
    return evidence


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
    def probes(path, guarded, physical):
        return migration_restore_fences(path, world, guarded, physical, scope, selector, result)

    target, evidence = restore_unit(root, world, committed_manifest, probes=probes,
                                    issuer_factory=lambda registry: MigrationBackupOwner(registry, scope))
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

    with retain_manifests(root):
        evidence = (provider_backup if args.family == 'update' else migration_backup)(root)
    write_evidence(root / 'backup.json', evidence)
    print(json.dumps(dict(family=args.family, authority_members=len(evidence['manifest']['members']),
                          exact_refusal=evidence['exact_refusal'])))


if __name__ == '__main__':
    main()
