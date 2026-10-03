"""Independent auth-free isolated reviewer harness; no live paths are operated."""
import hashlib
import io
import json
import os
from pathlib import Path
import sys
import time
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
HERE = Path(__file__).absolute().parent
sys.path.insert(0, str(HERE / 'isolated-copies'))
import test_root_holder_successor_v2 as original
h = original.h
OBSERVATIONS = []


class IndependentTests(original.SuccessorTests):
    def test_lock_inode_replaced_after_flock_before_claim_rejected(self):
        real = h.fcntl.flock
        def replace(fd, flags):
            real(fd, flags)
            replacement = self.base / 'post-flock-lock'
            replacement.touch()
            replacement.replace(h.LOCK)
        with patch.object(h.fcntl, 'flock', side_effect=replace):
            with self.assertRaisesRegex(ValueError, 'lock identity changed'):
                self.run_holder()
        self.assertFalse(h.CLAIM.exists())

    def test_parent_inode_replaced_during_wait_even_same_lock_rejected(self):
        fd = os.open(h.LOCK, os.O_RDWR)
        h.fcntl.flock(fd, h.fcntl.LOCK_EX | h.fcntl.LOCK_NB)
        old = self.base / 'old-parent'
        def replace(value):
            self.sleep(value)
            self.parent.rename(old)
            self.parent.mkdir()
            os.link(old / h.LOCK.name, h.LOCK)
        try:
            with patch.object(h.time, 'sleep', side_effect=replace):
                with self.assertRaisesRegex(ValueError, 'parent replaced'):
                    self.run_holder()
            self.assertFalse((old / h.CLAIM.name).exists())
            self.assertFalse(h.CLAIM.exists())
        finally:
            os.close(fd)

    def test_monotonic_expiry_after_flock_prevents_claim(self):
        real = h.fcntl.flock
        def expire(fd, flags):
            real(fd, flags)
            self.mono = self.cutoff
        with patch.object(h.fcntl, 'flock', side_effect=expire):
            with self.assertRaisesRegex(ValueError, 'cutoff'):
                self.run_holder()
        self.assertFalse(h.CLAIM.exists())

    def test_epoch_expiry_after_flock_prevents_claim(self):
        real = h.fcntl.flock
        def expire(fd, flags):
            real(fd, flags)
            self.clock = h.DEADLINE
        with patch.object(h.fcntl, 'flock', side_effect=expire):
            with self.assertRaisesRegex(ValueError, 'cutoff'):
                self.run_holder()
        self.assertFalse(h.CLAIM.exists())

    def assert_released(self):
        fd = os.open(h.LOCK, os.O_RDWR)
        try:
            h.fcntl.flock(fd, h.fcntl.LOCK_EX | h.fcntl.LOCK_NB)
        finally:
            os.close(fd)

    def test_fsync_failure_leaves_distinct_claim_and_releases_lock(self):
        with patch.object(h.os, 'fsync', side_effect=OSError('synthetic fsync failure')):
            with self.assertRaisesRegex(OSError, 'synthetic fsync'):
                self.run_holder()
        claim = json.loads(h.CLAIM.read_text())
        self.assertFalse(claim['predecessor_exit_proven'])
        self.assertFalse(claim['native_case_activation'])
        self.assert_released()
        saved = h.CLAIM.read_bytes()
        with self.assertRaises(FileExistsError):
            self.run_holder()
        self.assertEqual(h.CLAIM.read_bytes(), saved)

    def test_write_failure_leaves_empty_claim_without_overwrite_and_releases_lock(self):
        with patch.object(h.os, 'write', side_effect=OSError('synthetic write failure')):
            with self.assertRaisesRegex(OSError, 'synthetic write'):
                self.run_holder()
        self.assertTrue(h.CLAIM.exists())
        self.assertEqual(h.CLAIM.read_bytes(), b'')
        self.assert_released()
        with self.assertRaises(FileExistsError):
            self.run_holder()
        self.assertEqual(h.CLAIM.read_bytes(), b'')

    def test_fifo_request_rejected_without_wait_or_claim(self):
        h.REQUEST.unlink()
        os.mkfifo(h.REQUEST)
        with self.assertRaisesRegex(ValueError, 'invalid regular input'):
            self.run_holder()
        self.assertFalse(h.CLAIM.exists())
        self.assertEqual(self.sleeps, [])

    def test_predecessor_byte_mutation_during_wait_rejected(self):
        fd = os.open(h.LOCK, os.O_RDWR)
        h.fcntl.flock(fd, h.fcntl.LOCK_EX | h.fcntl.LOCK_NB)
        def mutate(value):
            self.sleep(value)
            h.PREDECESSOR_CLAIM.write_bytes(b'changed')
            h.fcntl.flock(fd, h.fcntl.LOCK_UN)
        try:
            with patch.object(h.time, 'sleep', side_effect=mutate):
                with self.assertRaisesRegex(ValueError, 'predecessor claim SHA mismatch'):
                    self.run_holder()
            self.assertFalse(h.CLAIM.exists())
        finally:
            os.close(fd)

    def replacement_observation(self, path):
        fd = os.open(h.LOCK, os.O_RDWR)
        h.fcntl.flock(fd, h.fcntl.LOCK_EX | h.fcntl.LOCK_NB)
        before = path.stat()
        saved = path.read_bytes()
        def replace(value):
            self.sleep(value)
            replacement = self.base / 'same-byte-replacement'
            replacement.write_bytes(saved)
            replacement.replace(path)
            h.fcntl.flock(fd, h.fcntl.LOCK_UN)
        try:
            with patch.object(h.time, 'sleep', side_effect=replace):
                claim = self.run_holder()
            after = path.stat()
            self.assertNotEqual((before.st_dev, before.st_ino), (after.st_dev, after.st_ino))
            self.assertEqual(path.read_bytes(), saved)
            self.assertEqual(claim['ownership'], 'exclusive_flock_only')
            self.assertEqual(claim['lock_inode'], self.request['lock_inode'])
            self.assertFalse(claim['predecessor_exit_proven'])
            OBSERVATIONS.append({'input': path.name, 'identical_bytes_replacement_accepted': True,
                                 'old_inode': before.st_ino, 'new_inode': after.st_ino,
                                 'sha256': hashlib.sha256(saved).hexdigest(),
                                 'lock_identity_unchanged': True})
        finally:
            os.close(fd)

    def test_same_byte_predecessor_source_inode_replacement_observation(self):
        self.replacement_observation(h.PREDECESSOR_SOURCE)

    def test_same_byte_predecessor_claim_inode_replacement_observation(self):
        self.replacement_observation(h.PREDECESSOR_CLAIM)

    def test_same_byte_request_inode_replacement_observation(self):
        self.replacement_observation(h.REQUEST)


suite = unittest.TestSuite()
suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(original.SuccessorTests))
independent_names = sorted(name for name in IndependentTests.__dict__ if name.startswith('test_'))
suite.addTests(IndependentTests(name) for name in independent_names)
stream = io.StringIO()
started = time.time()
result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
finished = time.time()
(HERE / 'TEST_OUTPUT.txt').write_text(stream.getvalue())
receipt = {'schema': 'pm.er8.root-holder-successor-independent-tests.v2',
           'started_epoch': started, 'finished_epoch': finished,
           'original_reviewer_deadline_epoch': 1790994597.2604625,
           'before_original_deadline': finished < 1790994597.2604625,
           'original_tests': 18, 'independent_tests': len(independent_names),
           'tests_run': result.testsRun, 'failures': len(result.failures), 'errors': len(result.errors),
           'success': result.wasSuccessful(), 'same_byte_inode_observations': OBSERVATIONS,
           'live_mutex_request_claim_access': False, 'source_original_modified': False,
           'bytecode_disabled': True, 'temporary_files_parent': str(HERE / 'isolated-copies')}
(HERE / 'TEST_RECEIPT.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(stream.getvalue())
print(json.dumps(receipt, indent=2))
raise SystemExit(0 if result.wasSuccessful() else 1)
