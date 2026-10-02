"""Small offline metadata/OS fixtures; no research or native/provider credit."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE))
import common as c


class MetadataTests(unittest.TestCase):
    def test_three_original_caps_and_final_artifact(self):
        self.assertEqual([v[1] for v in c.ROLES], [1800, 600, 600])
        self.assertEqual(c.ROLES[-1][2], 'FINAL_PROPOSAL.md')
        self.assertEqual(c.QUEUE[:2], ['V8-BIO-C-Z', 'V8-NB-C-Z'])

    def test_original_case_and_campaign_clip(self):
        n = 10**9
        self.assertEqual(c.deadline(3500*n, 600, n, 9999*n), 3601*n)
        self.assertEqual(c.deadline(3*n, 1800, n, 500*n), 500*n)
        self.assertEqual(c.deadline(3*n, 600, n, 9999*n), 603*n)

    def test_root_canary_and_hold_refused_before_record_access(self):
        for mode, scope in [('CANARY_ONLY', 'CANARY_ONLY'), ('HOLD', 'NATIVE_ACCEPTED'), ('PRODUCTION', 'CANARY_ONLY')]:
            with self.subTest(mode=mode):
                with self.assertRaises(ValueError):
                    c.check_release({'schema': 'er8.dispatcher.root-release.v1',
                        'root_authority': True, 'accepted': True, 'mode': mode, 'qualification_scope': scope})

    def test_public_native_only(self):
        for name in ['private-runtime/receipt.json', 'native.json', 'stdout', 'progress.jsonl']:
            with self.subTest(name=name):
                with self.assertRaises(ValueError):
                    c.native_json(HERE, name)

    def test_only_current_same_case_artifacts(self):
        proposal = {'case_id': 'fixture-A', 'artifacts': [
            {'path': '/synthetic/PROPOSAL.md', 'sha256': 'a'*64},
            {'path': '/synthetic/UNRESOLVED_LEADS.md', 'sha256': 'b'*64},
            {'path': '/synthetic/RESULT.md', 'sha256': 'c'*64}]}
        critic = {'case_id': 'fixture-A', 'artifacts': [
            {'path': '/synthetic/CRITIQUE.md', 'sha256': 'd'*64}]}
        self.assertEqual(set(c.artifacts_for_next('fixture-A', [proposal], 'independent-candidate-critic')),
            {'PROPOSAL.md', 'UNRESOLVED_LEADS.md'})
        self.assertEqual(set(c.artifacts_for_next('fixture-A', [proposal, critic], 'final-correction')),
            {'PROPOSAL.md', 'CRITIQUE.md', 'UNRESOLVED_LEADS.md'})
        with self.assertRaises(ValueError):
            c.artifacts_for_next('fixture-B', [proposal], 'independent-candidate-critic')
        with self.assertRaises(ValueError):
            c.artifacts_for_next('fixture-A', [proposal], 'final-correction')

    def test_original_stage_close_accept_and_each_negative(self):
        complete = {'case': 'fixture', 'job': 'fixture-stage', 'stage_start_monotonic_ns': 10,
            'original_deadline_monotonic_ns': 100, 'lease_release_deferred': True,
            'lease_released_by_actor': False, 'host_groups_absent': True}
        quiet = {'owned_native_quiescent': True, 'inclusive_native_lifetime_established': True,
            'original_deadline_monotonic_ns': 100, 'quiescence_observed_monotonic_ns': 80}
        args = dict(case='fixture', job='fixture-stage', start=10, cutoff=100,
            pid=999999, rc=0, exited=85, now=90, absent=True)
        c.validate_stage_close(complete, quiet, **args)
        for field, value in [('rc', 126), ('absent', False), ('now', 100), ('cutoff', 101), ('exited', 95)]:
            with self.subTest(field=field), self.assertRaises(ValueError):
                c.validate_stage_close(complete, quiet, **{**args, field: value})
        for field in ['lease_release_deferred', 'host_groups_absent']:
            with self.subTest(field=field), self.assertRaises(ValueError):
                c.validate_stage_close({**complete, field: False}, quiet, **args)
        with self.assertRaises(ValueError):
            c.validate_stage_close({**complete, 'lease_released_by_actor': True}, quiet, **args)
        with self.assertRaises(ValueError):
            c.validate_stage_close(complete, {**quiet, 'owned_native_quiescent': False}, **args)

    def test_path_alias_refused(self):
        with tempfile.TemporaryDirectory(dir=HERE/'tests') as temp:
            root = Path(temp)
            (root/'positive.json').write_text('{}')
            (root/'alias.json').symlink_to(root/'positive.json')
            with self.assertRaises(ValueError):
                c.read_json(root/'alias.json')


class OSFixtures(unittest.TestCase):
    def test_accepted_static_gate_stops_synthetic_prep(self):
        with tempfile.TemporaryDirectory(dir=HERE/'tests') as temp:
            marker = Path(temp)/'late.json'
            program = Path(temp)/'fixture.py'
            program.write_text('import time\nfrom pathlib import Path\ntime.sleep(2)\nPath('+repr(str(marker))+').write_text("late")\n')
            start = time.monotonic_ns()
            end = start+150_000_000
            proc = subprocess.Popen([str(c.GATE), '--absolute-ns', str(end), '--',
                c.PYTHON, '-I', '-B', str(program)], start_new_session=True,
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            self.assertNotEqual(proc.wait(timeout=3), 0)
            self.assertLess(time.monotonic_ns()-start, 1_500_000_000)
            self.assertFalse(marker.exists())
            self.assertTrue(c.group_absent(proc.pid))

    def test_actual_held_stage_parent_exit_is_required(self):
        proc = subprocess.Popen([c.PYTHON, '-I', '-B', '-c', 'import time; time.sleep(.15)'],
            start_new_session=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.assertFalse(c.group_absent(proc.pid))
        self.assertEqual(proc.wait(timeout=3), 0)
        self.assertTrue(c.group_absent(proc.pid))


if __name__ == '__main__':
    unittest.main()
