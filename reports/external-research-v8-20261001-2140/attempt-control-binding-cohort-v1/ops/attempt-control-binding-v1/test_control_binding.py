"""Auth-free binding fixtures. No live ledger imports/reads or SDK/native calls."""
import contextlib
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
NOW = 1791001400.0

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def write(path, value):
    Path(path).write_text(json.dumps(value, indent=2, allow_nan=False) + '\n')


class BindingTests(unittest.TestCase):
    def setUp(self):
        self.b = load('auth_free_binding', HERE / 'control_binding.py')
        self.temp = tempfile.TemporaryDirectory(prefix='er8-binding-fixture-')
        self.addCleanup(self.temp.cleanup)
        self.t = Path(self.temp.name)
        for name in ('QUIET', 'ACCEPTANCE', 'BINDING_REVIEW'):
            setattr(self.b, name, self.t / (name + '.json'))
        self.interface = self.b.source_interface(['V8-BIO-CHECK'])
        self.release = self.b.read(self.b.V7)
        self.release.update(copy.deepcopy(self.interface['fields_for_root_release_after_separate_acceptance']))
        self.release['selected_positive_files'].update(self.b.read(HERE / 'integrated-controller/SOURCE_FREEZE.json')['closure_sha256'])
        review = {'schema': 'pm.er8.attempt-control-binding-independent-review.v1',
                  'independent': True, 'accepted': True,
                  'controller_snapshot': self.release['controller_snapshot'],
                  'control': self.b.ref(HERE / 'recovery-control.json')}
        write(self.b.BINDING_REVIEW, review)
        accept = {'schema': 'pm.er8.attempt-control-binding-root-acceptance.v1',
                  'root_authority': True, 'accepted': True, 'accepted_epoch': NOW - 10,
                  'controller_snapshot': self.release['controller_snapshot'],
                  'control': review['control'], 'independent_review': self.b.ref(self.b.BINDING_REVIEW)}
        write(self.b.ACCEPTANCE, accept)
        quiet = {'schema': 'pm.er8.attempt-v7-quiet.v1', 'root_authority': True,
                 'predecessor_release': self.interface['predecessor_release'], 'observed_epoch': NOW - 1,
                 'scheduler_absent': True, 'native_quiescent': True, 'parents_absent': True,
                 'actors_absent': True, 'permits_settled': True}
        write(self.b.QUIET, quiet)
        self.release['controller_acceptance'] = self.b.ref(self.b.BINDING_REVIEW)
        self.release['attempt_control_binding'] = {
            'pair_ids': self.interface['selected_pair_ids'],
            'declaration_closure': self.interface['declaration_closure'],
            'predecessor_release': self.interface['predecessor_release'],
            'source_acceptance': self.b.ref(self.b.ACCEPTANCE),
            'v7_quiet': self.b.ref(self.b.QUIET), 'reservation_receipt_id': 'fixture-only-append'}
        request = {'receipt_id': 'fixture-only-append', 'root_authority': True,
                   'pairs': self.interface['pairs'], 'declaration_closure': self.interface['declaration_closure'],
                   'predecessor_release': self.interface['predecessor_release'], 'caps': self.b.CAPS}
        self.state = {'reservation_by_case': {}, 'attempt_lineage_by_case': {},
                      'route_reviews': {self.release['route']: {'qualification_scope': 'NATIVE_ACCEPTED',
                          'accepted': True, 'pins': self.release['pins']}},
                      'attempt_reservation_receipts': {'fixture-only-append': {
                          'schema': 'pm.er8.attempt-reservation-receipt.v1', 'request': request,
                          'recorded_epoch': NOW - 2, 'native_starts_with_commitments': 144,
                          'occupied_seconds_with_commitments': 172800, 'no_old_commitment_retirement': True}}}
        for pair in self.interface['pairs']:
            for arm in pair['arms']:
                c = arm['new_attempt_case_id']
                self.state['attempt_lineage_by_case'][c] = {**copy.deepcopy(arm),
                    'attempt_pair_id': pair['attempt_pair_id'], 'common_binding': pair['common_binding'],
                    'caps': self.b.CAPS, 'reservation_receipt_id': 'fixture-only-append'}
                self.state['reservation_by_case'][c] = {'native_starts': 3, 'occupied_seconds': 5400,
                                                       'completed': False, 'final_job': arm['new_final_job']}

    def test_whole_pair_interface_is_unaccepted_and_never_reserves(self):
        self.assertFalse(self.interface['accepted']); self.assertFalse(self.interface['root_authority'])
        self.assertTrue(self.interface['source_only']); self.assertEqual(len(self.release['case_queue']), 2)
        self.assertEqual(len(self.release['allowed_jobs']), 6)
        self.assertEqual(set(self.release['case_sources']), set(self.release['case_queue']))
        self.assertEqual(self.b.read(HERE / 'recovery-control.json')['default_queue'], [])
        self.assertEqual(self.b.read(HERE / 'recovery-control.json')['ledger'], self.release['resume_ledger'])

    def test_all_subsets_consistent_stable_and_new_identity_only(self):
        ids = [p['logical_pair_id'] for p in self.b.read(self.b.DECLARATION)['pairs']]
        for mask in range(1, 64):
            selected = [x for i, x in enumerate(ids) if mask & (1 << i)]
            data = self.b.source_interface(list(reversed(selected)))
            fields = data['fields_for_root_release_after_separate_acceptance']
            self.assertEqual(data['selected_pair_ids'], selected)
            self.assertEqual(len(fields['case_queue']), 2 * len(selected))
            self.assertEqual(len(fields['allowed_jobs']), 6 * len(selected))
            self.assertEqual(set(fields['case_sources']), set(fields['case_queue']))
            self.assertTrue(all(c.endswith('-S8') for c in fields['case_queue']))

    def test_bad_empty_duplicate_alias_or_foreign_pairs_reject(self):
        for value in ([], ['V8-BIO-CHECK'] * 2, ['V8-BIO-CHECK-S8'], ['V8-BIO-RETR'], [True], 'V8-BIO-CHECK'):
            with self.subTest(value=value), self.assertRaises(ValueError): self.b.source_interface(value)

    def test_actual_boundary_dependencies_and_reuse_hashes(self):
        pins = self.b.dependencies()
        self.assertEqual(pins[str(self.b.REVIEW)], 'd2ac456db3d31e15189f0d47441b2f74fc9b8accda1f62b1886376909a6e49ae')
        for name in ('rolling.py', 'case_supervisor.py', 'stage_actor.py', 'external_stage_close.py', 'external_case_close.py', 'parent_receipt.py'):
            self.assertEqual(self.b.sha(HERE / 'integrated-controller' / name),
                             self.b.sha(LAB / 'dev/prospective-timing-v3/integrated-controller' / name))
        self.assertEqual(self.b.read(HERE / 'recovery-control.json')['deadline_epoch'], 1791013030.8303788)

    def test_positive_exact_release_and_append_at_ceiling(self):
        before = copy.deepcopy(self.state)
        self.b.validate_release(self.release, NOW)
        self.b.validate_ledger_binding(self.release, self.state)
        self.assertEqual(self.state, before)

    def test_split_or_wrong_queue_jobs_sources_control_and_caps_reject(self):
        for key in ('case_queue', 'allowed_jobs', 'case_sources', 'resume_ledger', 'controller_snapshot',
                    'production_entry', 'max_component_seconds', 'max_component_responses', 'outside_native_cap_seconds'):
            release = copy.deepcopy(self.release)
            release[key] = {} if isinstance(release[key], dict) else [] if isinstance(release[key], list) else 'wrong'
            with self.subTest(key=key), self.assertRaises(ValueError): self.b.validate_release(release, NOW)

    def test_missing_stale_negative_or_aliased_quiet_reject(self):
        original = self.b.read(self.b.QUIET)
        for key in ('root_authority', 'scheduler_absent', 'native_quiescent', 'parents_absent', 'actors_absent', 'permits_settled'):
            q = copy.deepcopy(original); q[key] = 1; write(self.b.QUIET, q)
            r = copy.deepcopy(self.release); r['attempt_control_binding']['v7_quiet'] = self.b.ref(self.b.QUIET)
            with self.subTest(key=key), self.assertRaises(ValueError): self.b.validate_release(r, NOW)
        for epoch in (NOW + 1, True, 1790905208):
            q = copy.deepcopy(original); q['observed_epoch'] = epoch; write(self.b.QUIET, q)
            r = copy.deepcopy(self.release); r['attempt_control_binding']['v7_quiet'] = self.b.ref(self.b.QUIET)
            with self.subTest(epoch=epoch), self.assertRaises(ValueError): self.b.validate_release(r, NOW)
        write(self.b.QUIET, original)
        r = copy.deepcopy(self.release); r['attempt_control_binding']['v7_quiet']['sha256'] = '0' * 64
        with self.assertRaises(ValueError): self.b.validate_release(r, NOW)
        alias = self.t / 'quiet-alias.json'; alias.symlink_to(self.b.QUIET)
        with self.assertRaises(ValueError): self.b.sha(alias)

    def test_independent_and_root_acceptance_required(self):
        for path, keys in ((self.b.ACCEPTANCE, ('accepted', 'root_authority')), (self.b.BINDING_REVIEW, ('accepted', 'independent'))):
            original = self.b.read(path)
            for key in keys:
                record = copy.deepcopy(original); record[key] = 1; write(path, record)
                r = copy.deepcopy(self.release)
                if path == self.b.BINDING_REVIEW:
                    accepted = self.b.read(self.b.ACCEPTANCE); accepted['independent_review'] = self.b.ref(path); write(self.b.ACCEPTANCE, accepted)
                    r['controller_acceptance'] = accepted['independent_review']
                r['attempt_control_binding']['source_acceptance'] = self.b.ref(self.b.ACCEPTANCE)
                with self.subTest(key=key), self.assertRaises(ValueError): self.b.validate_release(r, NOW)
            write(path, original)

    def test_receipt_absent_changed_subset_refunded_or_overcap_reject(self):
        for mutation in ('absent', 'pairs', 'retirement', 'starts', 'occupied', 'lineage', 'promise'):
            state = copy.deepcopy(self.state); receipt = state['attempt_reservation_receipts']['fixture-only-append']
            if mutation == 'absent': state['attempt_reservation_receipts'].clear()
            elif mutation == 'pairs': receipt['request']['pairs'][0]['arms'].pop()
            elif mutation == 'retirement': receipt['no_old_commitment_retirement'] = False
            elif mutation == 'starts': receipt['native_starts_with_commitments'] = 145
            elif mutation == 'occupied': receipt['occupied_seconds_with_commitments'] = 172801
            elif mutation == 'lineage': next(iter(state['attempt_lineage_by_case'].values()))['common_binding']['model'] = 'other'
            elif mutation == 'promise': next(iter(state['reservation_by_case'].values()))['final_job'] = 'wrong'
            before = copy.deepcopy(state)
            with self.subTest(mutation=mutation), self.assertRaises(ValueError): self.b.validate_ledger_binding(self.release, state)
            self.assertEqual(state, before)

    def test_nonfinite_late_or_bool_clock_reject(self):
        for value in (float('nan'), float('inf'), True, 1791013030.8303788, 1790905208):
            with self.subTest(value=value), self.assertRaises(ValueError): self.b.validate_release(self.release, value)

    def test_dependency_drift_and_duplicate_metadata_reject(self):
        pins = self.b.read(HERE / 'DEPENDENCIES.json')
        pins['positive_scoped_dependencies'][str(self.b.DECLARATION)] = '0' * 64
        oldread = self.b.read
        with patch.object(self.b, 'read', side_effect=lambda p: pins if Path(p) == HERE / 'DEPENDENCIES.json' else oldread(p)):
            with self.assertRaises(ValueError): self.b.source_interface(['V8-BIO-CHECK'])
        p = self.t / 'bad.json'; p.write_text('{"x":1,"x":2}')
        with self.assertRaises(ValueError): self.b.read(p)
        p.write_text('{"x":NaN}')
        with self.assertRaises(ValueError): self.b.read(p)

    def test_real_unchanged_planning_gate_all12_and_pin_drift(self):
        common = load('auth_free_common_planning', HERE / 'integrated-controller/common.py')
        ids = [p['logical_pair_id'] for p in self.b.read(self.b.DECLARATION)['pairs']]
        fields = self.b.source_interface(ids)['fields_for_root_release_after_separate_acceptance']
        for case in fields['case_queue']:
            self.assertEqual([s['seconds'] for s in common.check_planning(fields, case)['stages']], [1200, 1200, 900])
        r = copy.deepcopy(fields); r['planning_input_sha256'][common.CONTROL['planning_map']] = '0' * 64
        with self.assertRaises(ValueError): common.check_planning(r, fields['case_queue'][0])

    def test_unchanged_quiet_monitor_accepts_new_source_root_convention(self):
        import sys
        import types
        monitor = load('auth_free_quiet_monitor', LAB / 'ops/execution-resume-v1/quiet_production_monitor.py')
        source = self.t / 'source'; controller = source / 'integrated-controller'; controller.mkdir(parents=True)
        mechanical = controller / 'common.py'; mechanical.write_text('# fixture only\n')
        snapshot = controller / 'SOURCE_FREEZE.json'
        write(snapshot, {'closure_sha256': {str(mechanical): self.b.sha(mechanical)}})
        root = self.t / 'operator'; root.mkdir()
        runtime = root / 'fresh-s8-fixture'
        release = copy.deepcopy(self.release); release['controller_snapshot'] = self.b.ref(snapshot)
        release_path = self.t / 'fixture-root-release.json'; write(release_path, release)
        checked = []
        common = types.SimpleNamespace(CONTROL={'operator_root': str(root)},
                    check_release=lambda value: checked.append(value), ledger=lambda action: {'active_jobs': []})
        class HeldProcess:
            pid = 2147483646
            def poll(inner): return 0
            def wait(inner): return 0
        argv = ['quiet_production_monitor.py', '--root-release', str(release_path),
                '--release-sha256', self.b.sha(release_path), '--source-root', str(source), '--run-root', str(runtime)]
        with patch.object(sys, 'argv', argv), patch.object(monitor, 'load', return_value=common), \
             patch.object(monitor.subprocess, 'Popen', return_value=HeldProcess()) as launch, \
             patch.object(monitor, 'safe_reconcile') as reconcile, patch.object(monitor, 'absent', return_value=True):
            self.assertEqual(monitor.main(), 0)
            self.assertEqual(launch.call_args.args[0][3], str(controller / 'rolling.py'))
            self.assertEqual(len(checked), 1); self.assertEqual(reconcile.call_count, 1)
        terminal = root / 'fresh-s8-fixture-rolling-parent-positive.terminal.json'
        self.assertTrue(self.b.read(terminal)['rolling_group_absent'])
        # Same immutable source-root convention refuses an unrelated root before Popen.
        argv[argv.index('--source-root') + 1] = str(self.t / 'wrong-source')
        with patch.object(sys, 'argv', argv), patch.object(monitor.subprocess, 'Popen') as launch:
            with self.assertRaises(ValueError): monitor.main()
            launch.assert_not_called()

    def test_real_common_release_gate_with_explicit_mock_route_and_held_state(self):
        common = load('auth_free_common_release', HERE / 'integrated-controller/common.py')
        # Runtime/SDK closure checks receive explicit mock digests, never read private/native bytes.
        selected = self.release['selected_positive_files']
        route_snapshot = {'closure_sha256': {}}
        route_acceptance = {'verdict': 'accepted', 'snapshot_sha256': self.release['route_snapshot']['sha256'],
                            'allowed_modes': ['productive'], 'native_review': self.release['canary_review']}
        proof = {'verdict': 'passed', 'route_snapshot_sha256': self.release['route_snapshot']['sha256'],
                 **{k: True for k in ('inclusive_native_lifetime_verified', 'native_goal_activation_continuation_completion_verified',
                                     'privacy_and_actual_tool_inventory_verified', 'source_capture_and_delivered_range_verified')}}
        objects = {self.release['route_snapshot']['path']: route_snapshot,
                   self.release['config']['path']: {'account_identity': common.ACCOUNT},
                   self.release['route_acceptance']['path']: route_acceptance,
                   self.release['canary_review']['path']: proof,
                   self.release['execution_acceptance']['path']: {},
                   self.release['controller_snapshot']['path']: self.b.read(HERE / 'integrated-controller/SOURCE_FREEZE.json')}
        class MockLedger:
            @contextlib.contextmanager
            def transaction(inner):
                yield self.state
        actual_load = common.load
        def fixture_load(name, path):
            return self.b if name == 'er8_attempt_control_binding' else actual_load(name, path)
        with patch.object(common, 'load', side_effect=fixture_load), patch.object(common, 'ledger_module', return_value=MockLedger()), \
             patch.object(common, 'record', side_effect=lambda x: objects[x['path']]), \
             patch.object(common, 'sha', side_effect=lambda p: selected.get(str(p), self.b.sha(p) if str(p) not in selected else None)), \
             patch.object(common.time, 'time', return_value=NOW):
            self.assertEqual(common.check_release(self.release)['route'], self.release['route'])
            self.state['attempt_reservation_receipts'].clear()
            with self.assertRaises(ValueError): common.check_release(self.release)


if __name__ == '__main__':
    unittest.main(verbosity=2)
