"""Independent, bounded, auth-free source review. Output tree only."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parent
AUTHOR = ROOT.parent / 'attempt-control-binding-v1'
LAB = ROOT.parents[1]
DEADLINE = 1791002756.7884085
audit_events = {'blocked': 0}


def audit(event, args):
    forbidden = False
    if event == 'open' and isinstance(args[0], (str, bytes)):
        raw = str(args[0])
        forbidden = any(token in raw for token in (
            '/private-runtime/', '/jobs/', '/auth/', '/credentials/',
            '/.local/opt/zcode/', 'evaluation-scope', 'native.json',
            '/ledger.json', '/state.json', '/live-ledger',
            '/PROPOSAL.md', '/CRITIQUE.md', '/FINAL_PROPOSAL.md'))
    if event == 'exec':
        name = str(getattr(args[0], 'co_filename', ''))
        forbidden = any(token in name for token in (
            'ledger_attempt_reservations_v1.py', 'ledger_resume.py',
            'ledger_helper_concurrency_v2.py', 'ledger_overlay.py', 'slot_ledger.py'))
    if event in ('subprocess.Popen', 'os.kill', 'os.killpg', 'socket.connect'):
        forbidden = True
    if forbidden:
        audit_events['blocked'] += 1
        raise RuntimeError('Review attempted prohibited runtime/auth/ledger action: ' + event)


sys.addaudithook(audit)
spec = importlib.util.spec_from_file_location('frozen_author_fixtures', AUTHOR / 'test_control_binding.py')
fixtures = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fixtures)


class IndependentTests(fixtures.BindingTests):
    # Import only the author's pure binder/setup. Author tests are run separately.
    def test_independent_control_delta_is_minimal(self):
        old = self.b.read(LAB / 'dev/prospective-timing-v3/recovery-control.json')
        new = self.b.read(AUTHOR / 'recovery-control.json')
        self.assertEqual({k: v for k, v in new.items() if k not in ('ledger', 'default_queue', 'positive_binding_files')},
                         {k: v for k, v in old.items() if k not in ('ledger', 'default_queue', 'positive_binding_files')})
        self.assertEqual(new['default_queue'], [])
        self.assertEqual(new['ledger']['sha256'], '9bd4b17fe406cd20680c0c8eef16f96a6a45db727d977f1ba2cc42641c82d577')

    def test_independent_snapshot_preserves_all_inherited_pins(self):
        old = self.b.read(LAB / 'dev/prospective-timing-v3/integrated-controller/SOURCE_FREEZE.json')
        new = self.b.read(AUTHOR / 'integrated-controller/SOURCE_FREEZE.json')
        for path, digest in old['closure_sha256'].items():
            self.assertEqual(new['closure_sha256'].get(path), digest)
        self.assertEqual(new['previous_controller'], self.b.ref(LAB / 'dev/prospective-timing-v3/integrated-controller/SOURCE_FREEZE.json'))
        self.assertFalse(new['accepted']); self.assertFalse(new['root_authority'])

    def test_independent_all_63_subsets_exact_arms_jobs_and_original_caps(self):
        closure = self.b.read(self.b.DECLARATION)
        ids = [p['logical_pair_id'] for p in closure['pairs']]
        for mask in range(1, 64):
            selected = [p for i, p in enumerate(closure['pairs']) if mask & (1 << i)]
            data = self.b.source_interface([p['logical_pair_id'] for p in selected][::-1])
            fields = data['fields_for_root_release_after_separate_acceptance']
            self.assertEqual(data['pairs'], selected)
            self.assertEqual(fields['case_queue'], [a['new_attempt_case_id'] for p in selected for a in p['arms']])
            self.assertEqual(fields['allowed_jobs'], [j for p in selected for a in p['arms'] for j in a['new_jobs']])
            self.assertEqual(fields['planning_input_sha256'], self.interface['fields_for_root_release_after_separate_acceptance']['planning_input_sha256'])
            self.assertFalse(data['accepted']); self.assertFalse(data['root_authority'])

    def test_independent_missing_quiet_cannot_be_inferred_from_absent_state(self):
        original = self.b.read(self.b.QUIET)
        for key in ('scheduler_absent', 'native_quiescent', 'parents_absent', 'actors_absent', 'permits_settled', 'predecessor_release'):
            q = copy.deepcopy(original); q.pop(key)
            fixtures.write(self.b.QUIET, q)
            release = copy.deepcopy(self.release)
            release['attempt_control_binding']['v7_quiet'] = self.b.ref(self.b.QUIET)
            with self.subTest(key=key), self.assertRaises(ValueError):
                self.b.validate_release(release, fixtures.NOW)
        self.b.QUIET.unlink()
        with self.assertRaises(ValueError): self.b.validate_release(self.release, fixtures.NOW)

    def test_independent_root_and_review_snapshot_control_pins(self):
        for path, key in ((self.b.ACCEPTANCE, 'controller_snapshot'), (self.b.ACCEPTANCE, 'control'),
                          (self.b.BINDING_REVIEW, 'controller_snapshot'), (self.b.BINDING_REVIEW, 'control')):
            original = self.b.read(path)
            wrong = copy.deepcopy(original); wrong[key]['sha256'] = '0' * 64
            fixtures.write(path, wrong)
            release = copy.deepcopy(self.release)
            accepted = self.b.read(self.b.ACCEPTANCE)
            if path == self.b.BINDING_REVIEW:
                accepted['independent_review'] = self.b.ref(path)
                fixtures.write(self.b.ACCEPTANCE, accepted)
                release['controller_acceptance'] = accepted['independent_review']
            release['attempt_control_binding']['source_acceptance'] = self.b.ref(self.b.ACCEPTANCE)
            with self.subTest(path=path, key=key), self.assertRaises(ValueError):
                self.b.validate_release(release, fixtures.NOW)
            fixtures.write(path, original)

    def test_independent_exact_binding_fields_and_source_inventory(self):
        r = copy.deepcopy(self.release); r['attempt_control_binding']['extra'] = True
        with self.assertRaises(ValueError): self.b.validate_release(r, fixtures.NOW)
        for path in self.b.read(AUTHOR / 'integrated-controller/SOURCE_FREEZE.json')['closure_sha256']:
            r = copy.deepcopy(self.release); r['selected_positive_files'].pop(path)
            with self.subTest(path=path), self.assertRaises(ValueError): self.b.validate_release(r, fixtures.NOW)

    def test_independent_receipt_request_pins_caps_and_identity(self):
        for key in ('receipt_id', 'root_authority', 'pairs', 'declaration_closure', 'predecessor_release', 'caps'):
            state = copy.deepcopy(self.state)
            state['attempt_reservation_receipts']['fixture-only-append']['request'][key] = None
            before = copy.deepcopy(state)
            with self.subTest(key=key), self.assertRaises(ValueError): self.b.validate_ledger_binding(self.release, state)
            self.assertEqual(state, before)
        for key in ('native_starts_with_commitments', 'occupied_seconds_with_commitments', 'recorded_epoch'):
            for value in (True, float('nan'), float('inf')):
                state = copy.deepcopy(self.state)
                state['attempt_reservation_receipts']['fixture-only-append'][key] = value
                with self.subTest(key=key, value=value), self.assertRaises(ValueError):
                    self.b.validate_ledger_binding(self.release, state)

    def test_independent_every_arm_lineage_token_required(self):
        for case, row in self.state['attempt_lineage_by_case'].items():
            for key in row:
                state = copy.deepcopy(self.state)
                state['attempt_lineage_by_case'][case].pop(key)
                before = copy.deepcopy(state)
                with self.subTest(case=case, key=key), self.assertRaises(ValueError):
                    self.b.validate_ledger_binding(self.release, state)
                self.assertEqual(state, before)

    def test_independent_old_births_costs_promises_output_survive_readonly_binding(self):
        state = copy.deepcopy(self.state)
        state.update(old_births={'original': 1790905209}, old_costs={'spent': 12345},
                     output_accounting={'unknown': True, 'warning': 1200000, 'stop': 1500000},
                     old_commitments={'future_starts': 29, 'occupied_seconds': 98765},
                     slots={'Z': 2}, account='existing-authorized-zcode-account-v8-A', model='GLM5.3FlashMax')
        state['reservation_by_case']['old-case'] = {'native_starts': 3, 'occupied_seconds': 5400, 'completed': False}
        before = copy.deepcopy(state)
        self.b.validate_ledger_binding(self.release, state)
        self.assertEqual(state, before)


if __name__ == '__main__':
    import time
    if time.time() >= DEADLINE: raise RuntimeError('fixed original review deadline expired')
    suite = unittest.TestSuite()
    suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(fixtures.BindingTests))
    own_names = [n for n in IndependentTests.__dict__ if n.startswith('test_independent_')]
    suite.addTests(IndependentTests(n) for n in own_names)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if audit_events['blocked']: raise RuntimeError('Prohibited operation attempted')
    if time.time() >= DEADLINE: raise RuntimeError('review exceeded original 600s inclusive deadline')
    print(json.dumps({'tests_run': result.testsRun, 'author_tests': 14, 'independent_additional_tests': len(own_names),
                      'success': result.wasSuccessful(), 'blocked_prohibited_operations': audit_events['blocked'],
                      'native_launches': 0, 'live_ledger_imports_reads_transactions': 0, 'private_sdk_auth_reads': 0}))
    sys.exit(0 if result.wasSuccessful() else 1)
