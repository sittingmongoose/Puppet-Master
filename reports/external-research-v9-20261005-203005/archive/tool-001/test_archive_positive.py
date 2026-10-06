"""Meaningful isolation checks: drift, symlinks, bounds, and additive conflicts."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from archive_positive import materialize

class ArchiveBoundaryTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.source = self.root / 'source'
        self.source.mkdir()
        self.body = self.source / 'exact.body'
        self.body.write_bytes(b'public evidence')
        self.selection = self.root / 'selection.json'
        spec = {'schema': 'er9.exact-positive-archive-selection.v1', 'coverage': 'TEST_PARTIAL',
                'files': [{'path': str(self.body), 'sha256': hashlib.sha256(self.body.read_bytes()).hexdigest(), 'bytes': self.body.stat().st_size}]}
        self.selection.write_text(json.dumps(spec))
        self.pin = hashlib.sha256(self.selection.read_bytes()).hexdigest()
        self.archive = self.root / 'archive'

    def run_archive(self):
        return materialize(self.selection, self.pin, self.source, self.archive)

    def test_idempotent(self):
        self.assertEqual(self.run_archive(), self.run_archive())

    def test_source_drift_fails_before_write(self):
        self.body.write_bytes(b'changed')
        with self.assertRaises(ValueError): self.run_archive()
        self.assertFalse(self.archive.exists())

    def test_source_symlink_rejected(self):
        self.body.unlink()
        original = self.root / 'outside.body'
        original.write_bytes(b'public evidence')
        self.body.symlink_to(original)
        with self.assertRaises(ValueError): self.run_archive()

    def test_outside_source_root_rejected(self):
        with self.assertRaises(ValueError):
            materialize(self.selection, self.pin, self.source / 'different', self.archive)
        self.assertFalse(self.archive.exists())

    def test_source_size_bound(self):
        with self.body.open('wb') as stream:
            stream.truncate(16 * 1024 * 1024 + 1)
        with self.assertRaises(ValueError): self.run_archive()
        self.assertFalse(self.archive.exists())

    def test_archive_conflict_preserved(self):
        result = self.run_archive()
        target = Path(result['manifest_path']).parent / 'files' / 'exact.body'
        target.chmod(0o644)
        target.write_bytes(b'prior original')
        with self.assertRaises(ValueError): self.run_archive()
        self.assertEqual(target.read_bytes(), b'prior original')

if __name__ == '__main__':
    unittest.main()
