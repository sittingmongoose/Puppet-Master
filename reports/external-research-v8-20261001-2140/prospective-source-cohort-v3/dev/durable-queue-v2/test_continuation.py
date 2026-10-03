"""Auth-free synthetic unit tests. Never import ledger/native/provider dependencies."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('continuation', Path(__file__).with_name('continuation.py'))
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)


class FakeMetadata:
    def __init__(self):
        self.clock = 100
        self.current = {'LoadState': 'loaded', 'ActiveState': 'inactive', 'SubState': 'dead', 'MainPID': '0'}
        self.next = {'Id': c.NEXT_UNIT, 'LoadState': 'not-found', 'MainPID': '0'}
        self.terminal_present = True
        self.ledger_active = False
        self.root_live = True
        self.starts = []
        self.validations = 0
        self.platform_unknown = False

    def remaining(self):
        return self.clock

    def root_positive(self):
        c.require(self.root_live, 'positive_current_root_holder_required')

    def unit(self, name):
        return dict(self.current if name == c.CURRENT_UNIT else self.next)

    def terminal(self):
        c.require(self.terminal_present, 'missing_actual_terminal')
        return {'held_returncode': 126, 'failures_preserved': True}

    def quiet(self):
        c.require(not self.ledger_active, 'active_ledger_or_pending_permit')
        return {'jobs': {}}

    def frozen_validation(self):
        self.validations += 1

    def next_positive(self, unit):
        c.require(unit.get('ActiveState') == 'active' and unit.get('MainPID') == '42',
                  'next_unit_not_positive_active')

    def start(self, argv):
        self.starts.append(argv)
        if self.platform_unknown:
            raise c.Hold('platform_result_UNKNOWN')
        self.next = {'Id': c.NEXT_UNIT, 'LoadState': 'loaded', 'ActiveState': 'active',
                     'SubState': 'running', 'MainPID': '42', 'ControlGroup': '/synthetic/' + c.NEXT_UNIT}


class ContinuationTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.root = Path(self.directory.name)
        self.intent = self.root / 'LAUNCH_INTENT.json'
        self.binding = {'path': '/synthetic/root.json', 'sha256': 'f' * 64}
        self.io = FakeMetadata()

    def tearDown(self):
        self.directory.cleanup()

    def advance(self):
        return c.advance(self.io, self.intent, self.binding)

    def denied(self, reason):
        with self.assertRaisesRegex(c.Hold, reason):
            self.advance()
        self.assertEqual(self.io.starts, [])
        self.assertFalse(self.intent.exists())

    def test_live_current_unit_prevents_launch(self):
        self.io.current.update(ActiveState='active', SubState='running', MainPID='9')
        self.denied('current_unit_not_inactive')

    def test_missing_terminal_prevents_launch_even_when_inactive(self):
        self.io.terminal_present = False
        self.denied('missing_actual_terminal')

    def test_active_ledger_prevents_launch(self):
        self.io.ledger_active = True
        self.denied('active_ledger_or_pending_permit')

    def test_exact_completed_quiet_starts_once_then_adopts(self):
        state, meta = self.advance()
        self.assertEqual(state, 'START_SUBMITTED')
        self.assertEqual(len(self.io.starts), 1)
        argv = self.io.starts[0]
        self.assertIn('--property=KillMode=control-group', argv)
        self.assertIn('--property=Restart=no', argv)
        self.assertIn('--property=RuntimeMaxSec=90', argv)
        self.assertEqual(argv[-len(c.monitor_argv()):], c.monitor_argv())
        intent = c.read(self.intent)
        self.assertEqual(intent['launch_outcome'], 'UNKNOWN')
        self.assertTrue(intent['terminal']['failures_preserved'])
        self.assertEqual(self.advance()[0], 'ADOPTED_EXACT_ACTIVE')
        self.assertEqual(len(self.io.starts), 1)

    def test_existing_ambiguous_intent_never_duplicates_even_if_unit_missing(self):
        c.save(self.intent, {'binding': {**c.identity(), 'root_request': self.binding}}, exclusive=True)
        with self.assertRaisesRegex(c.Hold, 'next_unit_not_positive_active'):
            self.advance()
        self.assertEqual(self.io.starts, [])
        self.assertEqual(self.io.validations, 0)

    def test_existing_foreign_intent_holds(self):
        c.save(self.intent, {'binding': {}}, exclusive=True)
        with self.assertRaisesRegex(c.Hold, 'existing_intent_binding_UNKNOWN'):
            self.advance()
        self.assertEqual(self.io.starts, [])

    def test_deadline_exhaustion_prevents_launch(self):
        self.io.clock = 0
        self.denied('global_deadline_exhausted')
        self.assertEqual(c.run(self.io, self.root, self.binding), 126)
        self.assertEqual(c.read(self.root / 'CONTINUATION.json')['state'], 'HOLD_GLOBAL_BOUND')

    def test_missing_positive_root_holder_prevents_launch(self):
        self.io.root_live = False
        self.denied('positive_current_root_holder_required')

    def test_platform_unknown_keeps_intent_and_never_retries(self):
        self.io.platform_unknown = True
        with self.assertRaisesRegex(c.Hold, 'platform_result_UNKNOWN'):
            self.advance()
        self.assertTrue(self.intent.exists())
        with self.assertRaisesRegex(c.Hold, 'next_unit_not_positive_active'):
            self.advance()
        self.assertEqual(len(self.io.starts), 1)

    def test_terminal_records_cannot_infer_exit_from_missing_process(self):
        native = c.NativeMetadata()
        pid = 12345
        rows = {
            c.PREFIX.with_suffix('.launch.json'): {'held_rolling_pid': pid, 'held_rolling_pgid': pid,
                                                  'root_release_sha256': c.CURRENT_SHA},
            c.PREFIX.with_suffix('.held-exit.json'): {'held_rolling_pid': pid, 'held_rolling_pgid': pid,
                 'root_release_sha256': c.CURRENT_SHA, 'held_Popen_returncode': None,
                 'actual_exit_observed_monotonic_ns': 1, 'rolling_group_absent': True},
            c.PREFIX.with_suffix('.terminal.json'): {'held_rolling_pid': pid, 'held_Popen_returncode': None,
                 'actual_exit_observed_monotonic_ns': 1, 'rolling_group_absent': True},
        }
        with patch.object(c, 'read', side_effect=lambda path: rows[path]), patch.object(c.os, 'killpg') as kill:
            with self.assertRaisesRegex(c.Hold, 'actual_held_terminal_groups_absent_required'):
                native.terminal()
            kill.assert_not_called()

    def test_positive_terminal_failure_126_remains_preserved(self):
        native = c.NativeMetadata()
        pid = 12345
        rows = {
            c.PREFIX.with_suffix('.launch.json'): {'held_rolling_pid': pid, 'held_rolling_pgid': pid,
                                                  'root_release_sha256': c.CURRENT_SHA},
            c.PREFIX.with_suffix('.held-exit.json'): {'held_rolling_pid': pid, 'held_rolling_pgid': pid,
                 'root_release_sha256': c.CURRENT_SHA, 'held_Popen_returncode': 126,
                 'actual_exit_observed_monotonic_ns': 1, 'rolling_group_absent': True},
            c.PREFIX.with_suffix('.terminal.json'): {'held_rolling_pid': pid, 'held_Popen_returncode': 126,
                 'actual_exit_observed_monotonic_ns': 1, 'rolling_group_absent': True},
        }
        with patch.object(c, 'read', side_effect=lambda path: rows[path]), \
             patch.object(c, 'sha', return_value='a' * 64), \
             patch.object(c.time, 'monotonic_ns', return_value=2), \
             patch.object(c.os, 'killpg', side_effect=ProcessLookupError):
            self.assertEqual(native.terminal()['held_returncode'], 126)

    def test_lease_quiet_requires_positive_receipt(self):
        native = c.NativeMetadata()
        state = {'deadline_epoch': c.GLOBAL_DEADLINE, 'closed': False, 'jobs': {
                 'synthetic-job': {'case': 'synthetic-case', 'released_epoch': 1,
                                  'launch_pending': None, 'quiescence': {}}}}
        with patch.object(native, 'state', return_value=state), \
             patch.object(c, 'read', side_effect=lambda path: {'case_queue': [], 'allowed_jobs': []} if path == c.NEXT_RELEASE else {'case_queue': ['synthetic-case']}):
            with self.assertRaisesRegex(c.Hold, 'current_candidate_lease_quiet_required'):
                native.quiet()

    def test_positive_root_holder_requires_actual_main_pid(self):
        native = c.NativeMetadata()
        claim = {'root_authority': True, 'owner': 'codex-er8-recovery', 'unit': c.ROOT_UNIT,
                 'pid': 12345, 'deadline_epoch': c.GLOBAL_DEADLINE}
        with patch.object(c, 'pin'), patch.object(c, 'read', return_value=claim), \
             patch.object(native, 'unit', return_value={'LoadState': 'loaded', 'ActiveState': 'active',
                                                      'SubState': 'running', 'MainPID': '54321'}), \
             patch.object(native, 'positive_process') as process:
            with self.assertRaisesRegex(c.Hold, 'positive_current_root_holder_required'):
                native.root_positive()
            process.assert_not_called()


if __name__ == '__main__':
    unittest.main()
