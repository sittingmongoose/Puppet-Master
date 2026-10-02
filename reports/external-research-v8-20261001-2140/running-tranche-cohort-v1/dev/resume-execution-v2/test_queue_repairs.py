"""All process/ledger calls mocked; tests only additive host identity receipts."""
import contextlib
import importlib.util
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
import sys

HERE = Path(__file__).resolve().parent/'integrated-controller'
sys.path.insert(0, str(HERE))
import rolling
import case_supervisor as supervisor


class HeldPopen:
    pid = 700001
    def poll(self): return 126
    def wait(self): return 126


class HostReceiptTests(unittest.TestCase):
    def test_failed_supervisor_identity_available_without_case_directory(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw); run = root/'fresh'; release = root/'release.json'; release.write_text('{}')
            with contextlib.ExitStack() as stack:
                stack.enter_context(patch.object(rolling, 'check_release', return_value={}))
                stack.enter_context(patch.object(rolling, 'QUEUE', ['offline-case-a','offline-case-b','offline-case-c']))
                stack.enter_context(patch.object(rolling, 'CONTROL', {'operator_root': str(root)}))
                stack.enter_context(patch.object(rolling, 'STOP_EPOCH', 9999999999))
                stack.enter_context(patch.object(rolling, 'ledger', return_value={'active_by_family': {'Z': 0}, 'overdue_jobs': [], 'candidate_output_stop': False}))
                launched = stack.enter_context(patch.object(rolling.subprocess, 'Popen', return_value=HeldPopen()))
                self.assertEqual(rolling.run(str(release), str(run)), 126)
                self.assertEqual(launched.call_count, 3)
            launch = json.loads((run/'HOST_LAUNCHES/offline-case-a/CASE_LAUNCHED.json').read_text())
            wait = json.loads((run/'HOST_LAUNCHES/offline-case-a/CASE_HELD_WAIT.json').read_text())
            self.assertFalse((run/'offline-case').exists())
            for key, val in launch.items(): self.assertEqual(wait[key], val)
            self.assertEqual(wait['held_Popen_returncode'], 126)
            self.assertEqual(launch['case_supervisor_pid'], launch['case_supervisor_pgid'])

    def test_failed_stage_identity_available_before_case_hold(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw); release = root/'release.json'; release.write_text('{}')
            args = SimpleNamespace(root_release=str(release), run_root=str(root/'fresh'), case='offline-case',
                case_epoch=1234, case_ns=100, case_deadline_ns=3600*10**9+100, campaign_ns=7200*10**9)
            with contextlib.ExitStack() as stack:
                stack.enter_context(patch.object(supervisor, 'armed'))
                stack.enter_context(patch.object(supervisor, 'check_release', side_effect=lambda release: supervisor.QUEUE.append('offline-case')))
                stack.enter_context(patch.object(supervisor, 'QUEUE', ['original-default-case']))
                stack.enter_context(patch.object(supervisor.subprocess, 'Popen', return_value=HeldPopen()))
                self.assertEqual(supervisor.run(args), 126)
            base = Path(args.run_root)/args.case
            job = args.case+'-research-proposal'
            launch = json.loads((base/'HOST_LAUNCHES'/job/'STAGE_LAUNCHED.json').read_text())
            wait = json.loads((base/'HOST_LAUNCHES'/job/'STAGE_HELD_WAIT.json').read_text())
            for key, val in launch.items(): self.assertEqual(wait[key], val)
            self.assertFalse((base/job).exists())
            self.assertTrue((base/'CASE_HOLD.json').exists())
            self.assertEqual(launch['original_stage_birth_epoch'], args.case_epoch)
            self.assertEqual(wait['held_Popen_returncode'], 126)
            self.assertEqual(launch['stage_actor_pid'], launch['stage_actor_pgid'])


if __name__ == '__main__': unittest.main()
