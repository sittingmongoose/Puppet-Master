import fcntl
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).absolute().parent
spec = importlib.util.spec_from_file_location('holder', HERE / 'root_holder_successor_v2.py')
h = importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)


class SuccessorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='root-holder-v2-', dir=HERE)
        self.base = Path(self.temp.name)
        self.parent = self.base / 'recovery-v1'
        self.parent.mkdir()
        self.paths = {'PARENT': self.parent, 'SOURCE': HERE / 'root_holder_successor_v2.py',
                      'REQUEST': self.parent / 'ROOT_HOLDER_SUCCESSOR_REQUEST_V2.json',
                      'LOCK': self.parent / 'supervisor.lock',
                      'PREDECESSOR_SOURCE': self.parent / 'durable_holder_v1.py',
                      'PREDECESSOR_CLAIM': self.parent / 'SUPERVISOR_DURABLE.json',
                      'CLAIM': self.parent / 'SUPERVISOR_DURABLE_SUCCESSOR_V2.json'}
        self.patcher = patch.multiple(h, **self.paths)
        self.patcher.start()
        self.clock = 1791013020.0
        self.mono = 1000000000
        self.cutoff = 2000000000
        predecessor = {'schema': 'pm.er8.durable-supervisor.v1', 'root_authority': True,
            'pid': h.PREDECESSOR_PID, 'unit': h.PREDECESSOR_UNIT, 'deadline_epoch': h.DEADLINE,
            'acquired_epoch': 1790984828.5959241, 'owner': 'codex-er8-recovery',
            'original_costs_and_births_preserved': True}
        h.PREDECESSOR_SOURCE.write_bytes(b'mock predecessor source\n')
        h.PREDECESSOR_CLAIM.write_text(json.dumps(predecessor))
        self.hashpatch = patch.multiple(h, PREDECESSOR_SOURCE_SHA=h.digest(h.PREDECESSOR_SOURCE.read_bytes()),
                                       PREDECESSOR_CLAIM_SHA=h.digest(h.PREDECESSOR_CLAIM.read_bytes()))
        self.hashpatch.start()
        h.LOCK.touch()
        lockstat = h.LOCK.stat()
        self.request = {'schema': 'pm.er8.root-holder-successor-request.v2', 'root_authority': True,
            'deadline_epoch': h.DEADLINE, 'native_global_cutoff_monotonic_ns': self.cutoff,
            'source_path': str(h.SOURCE), 'source_sha256': h.digest(h.SOURCE.read_bytes()),
            'predecessor_source_path': str(h.PREDECESSOR_SOURCE), 'predecessor_source_sha256': h.PREDECESSOR_SOURCE_SHA,
            'predecessor_claim_path': str(h.PREDECESSOR_CLAIM), 'predecessor_claim_sha256': h.PREDECESSOR_CLAIM_SHA,
            'predecessor_pid': h.PREDECESSOR_PID, 'predecessor_unit': h.PREDECESSOR_UNIT,
            'lock_path': str(h.LOCK), 'lock_device': lockstat.st_dev, 'lock_inode': lockstat.st_ino,
            'successor_claim_path': str(h.CLAIM), 'successor_unit': h.SUCCESSOR_UNIT}
        self.write_request()
        self.timepatch = patch.object(h.time, 'time', side_effect=lambda: self.clock)
        self.monopatch = patch.object(h.time, 'monotonic_ns', side_effect=lambda: self.mono)
        self.sleeppatch = patch.object(h.time, 'sleep', side_effect=self.sleep)
        self.timepatch.start(); self.monopatch.start(); self.sleeppatch.start()
        self.sleeps = []

    def sleep(self, value):
        self.sleeps.append(value)
        self.mono += int(value * 1e9)
        self.clock += value

    def write_request(self):
        h.REQUEST.write_text(json.dumps(self.request))
        self.request_sha = h.digest(h.REQUEST.read_bytes())

    def tearDown(self):
        self.sleeppatch.stop(); self.monopatch.stop(); self.timepatch.stop()
        self.hashpatch.stop(); self.patcher.stop(); self.temp.cleanup()

    def run_holder(self):
        return h.run(str(h.REQUEST), self.request_sha)

    def test_positive_one_acquisition_and_unchanged_cutoffs(self):
        real = h.fcntl.flock
        with patch.object(h.fcntl, 'flock', wraps=real) as observed:
            claim = self.run_holder()
        self.assertEqual(observed.call_count, 1)
        self.assertEqual(claim['deadline_epoch'], h.DEADLINE)
        self.assertEqual(claim['native_global_cutoff_monotonic_ns'], self.cutoff)
        self.assertFalse(claim['predecessor_exit_proven'])
        self.assertFalse(claim['native_case_activation'])
        self.assertEqual(json.loads(h.CLAIM.read_text()), claim)
        self.assertTrue(all(0 <= value <= .2 for value in self.sleeps))
        fd = os.open(h.LOCK, os.O_RDWR)
        try:
            real(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        finally:
            os.close(fd)

    def test_busy_lock_never_claims_or_renews(self):
        fd = os.open(h.LOCK, os.O_RDWR)
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            with self.assertRaisesRegex(ValueError, 'cutoff'):
                self.run_holder()
            self.assertFalse(h.CLAIM.exists())
            self.assertEqual(self.request['deadline_epoch'], h.DEADLINE)
            self.assertEqual(self.request['native_global_cutoff_monotonic_ns'], self.cutoff)
        finally:
            os.close(fd)

    def test_both_expirations_before_acquire(self):
        for epoch, mono in ((h.DEADLINE, 1000000000), (1791013020, self.cutoff)):
            self.clock, self.mono = epoch, mono
            with patch.object(h.fcntl, 'flock') as flock:
                with self.assertRaisesRegex(ValueError, 'cutoff'):
                    self.run_holder()
                flock.assert_not_called()
            self.assertFalse(h.CLAIM.exists())

    def test_claim_collision_preserved(self):
        h.CLAIM.write_text('existing')
        with self.assertRaises(FileExistsError):
            self.run_holder()
        self.assertEqual(h.CLAIM.read_text(), 'existing')

    def test_request_corruption(self):
        h.REQUEST.write_text('{}')
        with self.assertRaisesRegex(ValueError, 'request SHA'):
            self.run_holder()
        self.assertFalse(h.CLAIM.exists())

    def test_source_sha_corruption(self):
        self.request['source_sha256'] = '0' * 64
        self.write_request()
        with self.assertRaisesRegex(ValueError, 'source SHA'):
            self.run_holder()

    def test_predecessor_corruption(self):
        for path in (h.PREDECESSOR_SOURCE, h.PREDECESSOR_CLAIM):
            original = path.read_bytes()
            path.write_bytes(b'corrupt')
            with self.assertRaisesRegex(ValueError, 'predecessor .* SHA'):
                self.run_holder()
            path.write_bytes(original)

    def test_deadline_and_integer_drift(self):
        for key, value in (('deadline_epoch', h.DEADLINE + 1),
                           ('native_global_cutoff_monotonic_ns', float('inf')),
                           ('native_global_cutoff_monotonic_ns', 2**80),
                           ('lock_inode', True), ('root_authority', 1)):
            original = self.request[key]
            self.request[key] = value
            self.write_request()
            with self.assertRaises(ValueError):
                self.run_holder()
            self.request[key] = original
        self.assertFalse(h.CLAIM.exists())

    def test_symlink_inputs_rejected(self):
        for path in (h.REQUEST, h.LOCK, h.PREDECESSOR_SOURCE, h.PREDECESSOR_CLAIM):
            original = path.read_bytes()
            backing = self.base / 'backing'
            backing.write_bytes(original)
            path.unlink(); path.symlink_to(backing)
            with self.assertRaises((OSError, ValueError)):
                self.run_holder()
            path.unlink(); path.write_bytes(original)
            if path == h.LOCK:
                self.request['lock_inode'] = path.stat().st_ino
                self.write_request()
        self.assertFalse(h.CLAIM.exists())

    def test_inode_replacement_rejected(self):
        replacement = self.base / 'replacement'
        replacement.touch()
        replacement.replace(h.LOCK)
        with self.assertRaisesRegex(ValueError, 'lock identity'):
            self.run_holder()

    def test_lock_replacement_during_wait_rejected(self):
        fd = os.open(h.LOCK, os.O_RDWR)
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        def replace(value):
            self.sleep(value)
            replacement = self.base / 'replacement'
            replacement.touch()
            replacement.replace(h.LOCK)
        try:
            with patch.object(h.time, 'sleep', side_effect=replace):
                with self.assertRaisesRegex(ValueError, 'lock identity'):
                    self.run_holder()
            self.assertFalse(h.CLAIM.exists())
        finally:
            os.close(fd)

    def test_claim_symlink_collision_preserved(self):
        backing = self.base / 'backing'
        backing.write_text('untouched')
        h.CLAIM.symlink_to(backing)
        with self.assertRaises(FileExistsError):
            self.run_holder()
        self.assertEqual(backing.read_text(), 'untouched')

    def test_epoch_cutoff_after_acquisition_unchanged(self):
        self.clock = h.DEADLINE - .3
        self.cutoff = 100000000000
        self.request['native_global_cutoff_monotonic_ns'] = self.cutoff
        self.write_request()
        claim = self.run_holder()
        self.assertEqual(claim['deadline_epoch'], h.DEADLINE)
        self.assertEqual(claim['native_global_cutoff_monotonic_ns'], self.cutoff)
        self.assertGreaterEqual(self.clock, h.DEADLINE)
        self.assertLess(self.mono, self.cutoff)

    def test_parent_symlink_rejected(self):
        moved = self.base / 'moved'
        self.parent.rename(moved)
        self.parent.symlink_to(moved, target_is_directory=True)
        with self.assertRaises(OSError):
            self.run_holder()
        self.assertFalse((moved / h.CLAIM.name).exists())

    def test_predecessor_deadline_drift_even_with_matching_hash_rejected(self):
        predecessor = json.loads(h.PREDECESSOR_CLAIM.read_text())
        predecessor['deadline_epoch'] += 1
        h.PREDECESSOR_CLAIM.write_text(json.dumps(predecessor))
        altered_sha = h.digest(h.PREDECESSOR_CLAIM.read_bytes())
        self.request['predecessor_claim_sha256'] = altered_sha
        self.write_request()
        with patch.object(h, 'PREDECESSOR_CLAIM_SHA', altered_sha):
            with self.assertRaisesRegex(ValueError, 'predecessor metadata drift'):
                self.run_holder()
        self.assertFalse(h.CLAIM.exists())

    def test_unknown_key_and_path_ambiguity_rejected(self):
        self.request['extra_authority'] = True
        self.write_request()
        with self.assertRaisesRegex(ValueError, 'keys mismatch'):
            self.run_holder()
        del self.request['extra_authority']
        self.request['lock_path'] = str(self.base / 'foreign-lock')
        self.write_request()
        with self.assertRaisesRegex(ValueError, 'request mismatch: lock_path'):
            self.run_holder()
        with self.assertRaisesRegex(ValueError, 'unexpected request path'):
            h.run(str(self.base / 'foreign-request'), self.request_sha)
        self.assertFalse(h.CLAIM.exists())

    def test_duplicate_request_key_rejected(self):
        raw = json.dumps(self.request)
        h.REQUEST.write_text(raw[:-1] + ', "root_authority": true}')
        self.request_sha = h.digest(h.REQUEST.read_bytes())
        with self.assertRaisesRegex(ValueError, 'duplicate JSON'):
            self.run_holder()

    def test_changed_request_after_acquisition_rejected(self):
        real = h.fcntl.flock
        def changed(fd, flags):
            real(fd, flags)
            h.REQUEST.write_text('{}')
        with patch.object(h.fcntl, 'flock', side_effect=changed):
            with self.assertRaisesRegex(ValueError, 'request SHA'):
                self.run_holder()
        self.assertFalse(h.CLAIM.exists())


if __name__ == '__main__':
    unittest.main(verbosity=2)
