"""D1 host integration tests: real store/classifier, mocked native Popen only."""
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

import run_delivery_check as runner

sys.path.insert(0, str(runner.LAB / "tools/r1b"))
import run_r1b


def finding(marker, nonfinding=False, revision=False, invalid=False):
    text = f"# Synthetic delivery\n## {'non_finding' if nonfinding else 'assertion'}\n{marker}\n"
    text += '## source_fit\nHe said "blue", then typed C:\\demo\\alpha.\n'
    text += '## condition\n```text\n## condition\n  units = 3\n```\n'
    text += '## implication\nSynthetic consequence only.\n## validation_proposal\nUNEXECUTED test proposal.\n'
    text += '## uncertainty\nNo runtime claim.\n## plan_fit\nTEST_ONLY.\n'
    if revision:
        text += '## change_reason\nSynthetic revision.\n'
    if invalid:
        text += '## snapshots_note\nDeliberately unknown field.\n'
    return text.encode()


class FakeProcess:
    def __init__(self, rc):
        self.returncode = rc
        self.pid = 123456789

    def poll(self):
        return self.returncode

    def wait(self, timeout=None):
        return self.returncode


class DeliveryLaunchTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'd1'
        self.calls = []
        self.stores = []
        self.rc = 0
        self.receipt = {'stop_reason': 'goal_complete'}
        self.exercise = True
        self.malformed = False
        real_store = runner.Store
        def store(ws, archive):
            value = real_store(ws, archive)
            self.stores.append(value)
            return value
        self.addCleanup(patch.stopall)
        self.freeze = patch.object(runner, 'verify_freeze').start()
        patch.object(runner, 'Store', side_effect=store).start()
        self.popen = patch.object(runner.subprocess, 'Popen', side_effect=self.fake_popen).start()
        self.copy = patch.object(run_r1b, 'copy_native_logs', wraps=run_r1b.copy_native_logs).start()

    def fake_popen(self, argv, **kwargs):
        self.calls.append((argv, kwargs))
        store = self.stores[-1]
        if self.exercise:
            for name, raw in [('new--alpha', finding('ALPHA_V1')),
                              ('new--red', finding('Synthetic bounded silence', nonfinding=True)),
                              ('F0001--invalid', finding('ALPHA_PENDING', revision=True, invalid=True)),
                              ('F0001--fixed', finding('ALPHA_V2', revision=True))]:
                (store.payloads / (name + '.md')).write_bytes(raw)
                (store.requests / name).write_bytes(b'submit\n')
                store.poll()
        out = Path(argv[argv.index('--out') + 1])
        out.mkdir()
        (out / 'receipt.json').write_text('{' if self.malformed else json.dumps(self.receipt))
        return FakeProcess(self.rc)

    def run_slot(self, app='muse', authorized=True):
        return runner.run_one(app, self.root, user_authorized=authorized, frozen_sha='synthetic-host-pin')

    def write_state(self, **updates):
        self.root.mkdir(exist_ok=True)
        state = {'phase_started_epoch': runner.time.time(), 'dispatched': [], 'terminal': [], 'stopped': False}
        state.update(updates)
        (self.root / 'dispatch-state.json').write_text(json.dumps(state))

    def test_unauthorized_refuses_before_freeze_or_dispatch(self):
        for unauthorized in [False, None, 1, 'approved']:
            with self.subTest(unauthorized=unauthorized), self.assertRaises(PermissionError):
                self.run_slot(authorized=unauthorized)
        self.freeze.assert_not_called()
        self.popen.assert_not_called()

    def test_out_of_order_refuses_before_dispatch(self):
        with self.assertRaises(PermissionError):
            self.run_slot('zcode')
        self.popen.assert_not_called()

    def test_expired_phase_refuses_before_dispatch(self):
        self.write_state(phase_started_epoch=runner.time.time() - 901)
        with self.assertRaises(PermissionError):
            self.run_slot()
        self.popen.assert_not_called()

    def test_dangling_dispatch_cannot_retry_or_overlap(self):
        self.write_state(dispatched=['muse'], terminal=[])
        for app in ['muse', 'zcode']:
            with self.subTest(app=app), self.assertRaises(PermissionError):
                self.run_slot(app)
        self.popen.assert_not_called()

    def test_two_slots_max_exact_pinned_native_route_and_caps(self):
        first = self.run_slot()
        self.assertTrue(first['structural_checks_passed'])
        with self.assertRaises(PermissionError):
            self.run_slot()
        second = self.run_slot('zcode')
        self.assertTrue(second['structural_checks_passed'])
        with self.assertRaises(PermissionError):
            self.run_slot('muse')
        self.assertEqual(len(self.calls), 2)
        for (argv, kwargs), app in zip(self.calls, ['muse', 'zcode']):
            self.assertEqual(Path(argv[1]), runner.LAB / 'tools/r1b/run_goal_r1b.py')
            self.assertEqual(hashlib.sha256(Path(argv[1]).read_bytes()).hexdigest(), runner.DRIVER_SHA)
            self.assertEqual(argv[argv.index('--app') + 1], app)
            self.assertEqual(argv[argv.index('--max-seconds') + 1], '300')
            self.assertEqual(argv[argv.index('--max-responses') + 1], '48')
            self.assertTrue(kwargs['start_new_session'])
            self.assertEqual(kwargs['cwd'], runner.LAB)
            self.assertEqual(Path(argv[argv.index('--workspace') + 1]), self.root / app / 'ws')
        argv = self.calls[1][0]
        self.assertIn('--zcode-tools', argv)
        self.assertEqual(argv[argv.index('--zcode-tools') + 1:], ['Read', 'Write', 'Edit'])
        self.assertEqual(self.copy.call_count, 2)
        self.assertEqual(self.copy.call_args_list[0].args, ('muse', self.receipt, self.root / 'muse/native'))
        self.assertEqual(second['formal_evaluator_calls'], 0)
        self.assertEqual(second['semantic_grade'], 'not_performed')

    def test_nonzero_native_exit_dominates_success_shaped_receipt(self):
        self.rc = -9
        result = self.run_slot()
        self.assertEqual(result['outcome'], 'harness_failure')
        self.assertFalse(result['structural_checks_passed'])
        with self.assertRaises(PermissionError):
            self.run_slot('zcode')
        self.assertEqual(len(self.calls), 1)

    def test_driver_error_dominates_goal_complete_and_stops(self):
        self.receipt = {'stop_reason': 'goal_complete', 'driver_error': 'synthetic transport error'}
        result = self.run_slot()
        self.assertEqual(result['outcome'], 'harness_failure')
        with self.assertRaises(PermissionError):
            self.run_slot('zcode')
        self.assertEqual(len(self.calls), 1)

    def test_quota_stops_schedule(self):
        self.receipt = {'stop_reason': 'goal_usage_limited'}
        result = self.run_slot()
        self.assertEqual(result['outcome'], 'quota_stop')
        with self.assertRaises(PermissionError):
            self.run_slot('zcode')

    def test_cap_retains_failure_and_allows_only_original_second_slot(self):
        self.receipt = {'stop_reason': 'cap_seconds'}
        first = self.run_slot()
        self.assertEqual(first['outcome'], 'cap_stop')
        self.assertFalse(first['structural_checks_passed'])
        self.run_slot('zcode')
        self.assertEqual(len(self.calls), 2)
        with self.assertRaises(PermissionError):
            self.run_slot('zcode')

    def test_goal_complete_without_submissions_cannot_pass_structurally(self):
        self.exercise = False
        result = self.run_slot()
        self.assertEqual(result['outcome'], 'goal_complete')
        self.assertFalse(result['structural_checks_passed'])
        self.assertFalse(result['checks']['four_attempts'])

    def test_malformed_native_receipt_is_visible_terminal_failure(self):
        self.malformed = True
        result = self.run_slot()
        self.assertEqual(result['outcome'], 'harness_failure')
        self.assertFalse(result['structural_checks_passed'])
        self.assertTrue((self.root / 'muse/result.json').is_file())
        state = json.loads((self.root / 'dispatch-state.json').read_text())
        self.assertEqual(state['terminal'], ['muse'])
        self.assertTrue(state['stopped'])

    def test_structural_check_exception_is_visible_terminal_failure(self):
        with patch.object(runner, 'structural_checks', side_effect=ValueError('synthetic broken feedback')):
            result = self.run_slot()
        self.assertEqual(result['outcome'], 'harness_failure')
        self.assertTrue((self.root / 'muse/result.json').exists())
        self.assertTrue(json.loads((self.root / 'dispatch-state.json').read_text())['stopped'])

    def test_bad_freeze_pin_refuses_before_dispatch(self):
        self.freeze.side_effect = ValueError('synthetic freeze mismatch')
        with self.assertRaises(ValueError):
            self.run_slot()
        self.popen.assert_not_called()

    def test_process_start_exception_consumes_and_closes_schedule(self):
        self.popen.side_effect = OSError('synthetic launch failure')
        result = self.run_slot()
        self.assertEqual(result['outcome'], 'harness_failure')
        with self.assertRaises(PermissionError):
            self.run_slot('muse')
        with self.assertRaises(PermissionError):
            self.run_slot('zcode')
        self.assertEqual(self.popen.call_count, 1)

    def test_native_log_copy_exception_is_visible_terminal_failure(self):
        self.copy.side_effect = OSError('synthetic copy failure')
        result = self.run_slot()
        self.assertEqual(result['outcome'], 'harness_failure')
        self.assertFalse(result['structural_checks_passed'])
        self.assertTrue(json.loads((self.root / 'dispatch-state.json').read_text())['stopped'])

    def test_process_group_disappearance_during_cleanup_is_terminal_failure(self):
        class ActiveProcess(FakeProcess):
            def wait(self, timeout=None):
                self.returncode = -15
                return self.returncode
        def active(argv, **kwargs):
            self.fake_popen(argv, **kwargs)
            return ActiveProcess(None)
        self.popen.side_effect = active
        with patch.object(runner.time, 'monotonic', side_effect=[0, 391, 392]), \
             patch.object(runner.os, 'killpg', side_effect=ProcessLookupError('synthetic exited group')):
            result = self.run_slot()
        self.assertEqual(result['outcome'], 'harness_failure')
        self.assertTrue((self.root / 'muse/result.json').exists())
        self.assertTrue(json.loads((self.root / 'dispatch-state.json').read_text())['stopped'])


if __name__ == '__main__':
    unittest.main()
