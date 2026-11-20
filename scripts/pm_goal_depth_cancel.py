"""Selected M1–M9 legacy-source and withdrawal checks on DG-CB's original TEST_ONLY owners."""
import argparse
import copy
from hashlib import sha256
import json
import os
from pathlib import Path
from unittest.mock import patch

import pm_goal_dg_cb_c5_cases as c5
import pm_goal_dg_cb_c6_cases as c6
import pm_goal_dg_cb_crash as crash
import pm_goal_dg_cb_migration as migration
import pm_goal_dg_cb_oracles as cb
import pm_goal_dg_cb_owners as owners
from pm_goal_depth_replay import check, replay, store_image, write_evidence


def capture_cases(root, *, codec, edition, defect, marker, code, name):
    seed = root / (name + '-seed')
    world = migration.migration_world(seed)
    scope = owners.legacy_goal(world, codec=codec, control_edition=edition, revisions=2)
    original_goal = c5.goal_physical(world, scope)
    stop_before = world.cell(world.host_stop.FAMILY, world.host_stop.key(scope))
    selector = migration.selector(scope)
    original_cells = copy.deepcopy({key: cells for key, cells in world.storage.cells.items() if cells})
    fields = dict(scope=scope, selector=selector)

    def call(w, args):
        if args['alter_source_selection']:
            def substitute(mapping):
                images = [m for m in mapping['sources']
                          if m['selection']['physical_key'].startswith('goal_body_record|')]
                check(len(images) == 1, 'Expected exactly one original Goal body')
                image = images[0]
                if defect == 'codec':
                    image['codec_id'] = owners.MSGPACK
                elif defect == 'bytes':
                    raw = bytes.fromhex(image['bytes_hex'])
                    image['bytes_hex'] = (raw[:-1] + bytes([raw[-1] ^ 1])).hex()
                else:
                    image['selection']['schema_ref'] = owners.BODY + '#/$defs/storage_control'
                return mapping
            w.goal.statement_defect = substitute
        return w.coordinator.capture(args['selector'])

    def verify(label, w, args, request):
        check(c5.goal_physical(w, scope) == original_goal and
              w.cell(w.host_stop.FAMILY, w.host_stop.key(scope)) == stop_before and
              not w.storage.events, 'Migration capture changed the original Goal, Stop or events')
        if request is None:
            check({key: cells for key, cells in w.storage.cells.items() if cells} == original_cells and
                  w.coordinator.exclusion(scope) is None,
                  'Refused capture left a source, destination or exclusion effect')
            return dict(exclusion_held=False, destination_effects=False)
        body_image = next(m for m in request['owner_mappings'][0]['sources']
                          if m['selection']['physical_key'].startswith('goal_body_record|'))
        family, key = migration.split(body_image['selection']['physical_key'])
        stored_codec, stored_raw = original_goal[family, key]
        check(body_image['selection']['sha256'] == sha256(stored_raw).hexdigest(),
              'The witness changed the digest in addition to the selected field')
        check((body_image['bytes_hex'] == stored_raw.hex()) == (label != 'disabled' or defect != 'bytes'),
              'Only the bytes case may present different physical bytes')
        if label == 'disabled':
            return dict(presented_body=body_image, stored_codec=stored_codec,
                        stored_sha256=sha256(stored_raw).hexdigest())
        counts = c5.verify_request(w, scope, request)
        check(c5.owner_calls(w) == list(owners.ROLES), 'Original six owners were not all observed')
        destination_keys = c6.destination_keys(w, scope, selector['migration_id'], install=True)
        check(all(w.cell(table, key) is None for table, key in destination_keys), 'Destination appeared before commit')
        generation = w.storage.cell_generation
        result = w.coordinator.commit(request)
        check(w.storage.cell_generation == generation + 1 and
              all(w.cell(table, key) is not None for table, key in destination_keys),
              'The original result and destination members were not published in one transaction')
        revision, control = c5.verify_enrolled(w, scope, original_goal, stop_before, result, edition=edition)
        retained = migration.open_world(w.storage.root).coordinator.read_result(selector)
        check(retained == result, 'Original result changed after reopening Storage')
        parts = w.coordinator.manifest_parts_of(scope, selector['migration_id'])
        return dict(request=request, source_counts=counts, result=result, manifest_parts=parts,
                    original_stop=stop_before['value']['record'], installed_binding=revision,
                    installed_control=control, retained_result_sha256=owners.row_sha(retained))

    return replay(root / name, seed=seed, open_world=migration.open_world, module=migration,
                  function=migration.Coordinator.authenticate_mapping, marker=marker, code=code,
                  control=dict(fields, alter_source_selection=False), negative=dict(fields, alter_source_selection=True),
                  call=call, verify=verify)


def withdrawal_case(root):
    seed = root / 'withdrawal-seed'
    world = migration.migration_world(seed)
    scope = owners.legacy_goal(world, revisions=2)
    world.host_stop.manual(scope, 'stop')
    pending = world.goal.reserve_pending(scope, world.host_stop.record(scope)['user_stop_epoch'])
    selector, _, result = c5.run(world, scope)
    request = c6.withdrawal_request(world, scope, selector['migration_id'])
    result_key = world.coordinator.result_key(scope, selector['migration_id'])
    result_cell = world.cell(migration.RESULT, result_key)
    binding = world.cell(world.binding.CONTROL, world.binding.keys(scope)['control'])
    stop = world.cell(world.host_stop.FAMILY, world.host_stop.key(scope))

    def verify(label, w, args, value):
        check(w.cell(migration.RESULT, result_key) == result_cell and
              w.cell(w.binding.CONTROL, w.binding.keys(scope)['control']) == binding and
              w.cell(w.host_stop.FAMILY, w.host_stop.key(scope)) == stop,
              'Withdrawal altered the immutable migration result, binding, or original Stop')
        check(w.coordinator.read_result(selector) == result, 'Original audit result changed')
        if value is None:
            check(store_image(w.storage.root) == store_image(seed), 'Refused withdrawal changed the stored bytes')
            return dict(writer_cutoff=False, unchanged_result_sha256=owners.row_sha(result))
        check(value['original_result'] == request['expected_original_result'] and
              value['preserved_pending_operation_ids'] == [pending['operation_id']] and
              w.binding.domain_withdrawn is True,
              'Separate withdrawal did not name the original result, pending operation and cutoff')
        reopened = migration.open_world(w.storage.root)
        original = store_image(reopened.storage.root)
        check(reopened.coordinator.withdraw(request) == value and
              reopened.coordinator.read_result(selector) == result and
              store_image(reopened.storage.root) == original,
              'Withdrawal replay or retained audit changed the original store')
        return dict(withdrawal=value, original_result=result, source_stop=stop['value']['record'],
                    preserved_operation=pending, writer_cutoff=True)

    return replay(root / 'original-result', seed=seed, open_world=migration.open_world, module=migration,
                  function=migration.Coordinator.withdraw, marker="require('M/withdraw/original_result'",
                  code='M/withdraw/original_result', control=request, negative=dict(request, expected_original_result=None),
                  call=lambda w, p: w.coordinator.withdraw(p), verify=verify)


def original_corpus(root):
    """Re-run existing C5/C6 cases and their process crash cuts on the same checkout."""
    root.mkdir()
    suite = cb.Suite(root / 'cases')
    c5.cases(suite)
    # Supply our own output directory for the child-process matrix so the original
    # case runner does not create and remove another temporary copy of it.
    with patch.dict(os.environ, {'PM_DG_CB_SKIP_CRASH': '1'}):
        c6.cases(suite)
    crash_rows = crash.matrix(root / 'crash')
    failed = [c for c in suite.cases + crash_rows if c['status'] != 'pass']
    check(not failed, f"Original C5/C6 cases failed: {failed}")
    return dict(cases=suite.cases, crash_rows=crash_rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--original-corpus', action='store_true')
    args = parser.parse_args()
    args.out.mkdir(parents=True)
    cases = dict(
        json_codec=capture_cases(args.out, codec=owners.GOAL_JSON, edition='v1', defect='codec',
                                 marker="'M/%s/source_codec/%s'", code='M/capture/source_codec/goal_body_record',
                                 name='original-json-codec'),
        msgpack_schema=capture_cases(args.out, codec=owners.MSGPACK, edition='v2', defect='schema',
                                      marker="'M/%s/schema_ref/%s'", code='M/capture/schema_ref/goal_body_record',
                                      name='original-msgpack-schema'),
        original_bytes=capture_cases(args.out, codec=owners.GOAL_JSON, edition='v1', defect='bytes',
                                      marker="'M/%s/source_bytes/%s'", code='M/capture/source_bytes/goal_body_record',
                                      name='original-physical-bytes'),
        withdrawal=withdrawal_case(args.out),
    )
    write_evidence(args.out / 'cancel.json', dict(cases=cases))
    corpus = original_corpus(args.out / 'original-corpus') if args.original_corpus else None
    if corpus is not None:
        write_evidence(args.out / 'cancel-corpus.json', corpus)
    print(json.dumps(dict(exact_cut_and_restore=len(cases),
                          original_cases=len(corpus['cases']) if corpus else None,
                          crash_cuts=len(corpus['crash_rows']) if corpus else None)))


if __name__ == '__main__':
    main()
