"""Mechanical tests only. Simulated receipts never count as native campaign evidence."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
import bind_seeded as b
import exact_assembly as e
import prepare as p

LAB = Path(__file__).resolve().parents[2]


class FrozenExposureTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.files = {}
        self.origins = []
        artifacts = []
        for role in ['proposal', 'enrichment', 'source_catalog', 'witness_catalog', 'lead_inventory']:
            path = self.root / (role + ('.json' if role.endswith('catalog') or role == 'lead_inventory' else '.md'))
            path.write_text('CANDIDATE_PROPOSAL_SENTINEL_' + role if path.suffix == '.md' else '{}')
            item = {'path': str(path), 'sha256': p.sha(path), 'origin_job_id': 'SIMULATED_TEST_ONLY_seed'}
            self.files[role] = item
            artifacts.append({'path': str(path), 'sha256': item['sha256'], 'relative_path': path.name, 'bytes': path.stat().st_size})
        native = self.root / 'SIMULATED_TEST_ONLY_origin.json'
        p.put(native, {'simulation': True, 'job_id': 'SIMULATED_TEST_ONLY_seed', 'operational_complete': True,
                       'native_goal_starts': 1, 'artifacts': artifacts})
        (self.root / 'public_captures').mkdir()
        raw = self.root / 'public_captures/raw-primary-source.txt'
        raw.write_text('RAW_PUBLIC_CONTEXT_SENTINEL; no proposal answer.\n')
        capture = self.root / 'SIMULATED_TEST_ONLY_capture.json'
        p.put(capture, {'simulation': True, 'url': 'https://example.invalid/mechanical-test', 'body_sha256': p.sha(raw)})
        admission = self.root / 'SIMULATED_TEST_ONLY_admission.json'
        self.seed = {'schema': 'er9.authentic-candidate-seed.v1', 'simulation': True,
                     'candidate_files': self.files,
                     'origin_freezes': [{'path': str(native), 'sha256': p.sha(native), 'actual_family': 'Luna',
                                        'actual_model': 'SIMULATED_TEST_ONLY', 'actual_effort': 'max'}],
                     'public_source_files': [{'kind': 'PUBLIC_PRIMARY_CAPTURE', 'path': str(raw), 'sha256': p.sha(raw),
                                              'url': 'https://example.invalid/mechanical-test', 'version_or_commit': 'TEST_ONLY',
                                              'capture_receipt': {'path': str(capture), 'sha256': p.sha(capture)}}],
                     'cold_cost_references': ['SIMULATED_TEST_ONLY_NOT_ACCOUNTING'],
                     'fixture_admission_receipt': {'path': str(admission), 'sha256': None}}
        p.put(admission, {'simulation': True, 'status': 'SUITABLE_FROZEN_INPUT', 'pair_ids': ['D-V04-A'],
                          'input_content_digest': b.content_digest(self.seed)})
        self.seed['fixture_admission_receipt']['sha256'] = p.sha(admission)
        self.seed_path = self.root / 'seed.json'
        p.put(self.seed_path, self.seed)
        self.plan_path = LAB / 'dev/diagnostic-runner/seeded/plans/D-V04-A.json'

    def tearDown(self):
        self.tmp.cleanup()

    def bind(self, stage, prior=None):
        return b.bind(LAB, {'path': str(self.plan_path), 'sha256': p.sha(self.plan_path)},
                      {'path': str(self.seed_path), 'sha256': p.sha(self.seed_path)},
                      'treatment', stage, prior or {}, self.root / 'prepared')

    def test_source_first_physically_withholds_all_candidate_prose(self):
        ref = self.bind('source_first_record')
        request = json.loads(Path(ref['path']).read_text())
        spec = json.loads(Path(request['stage_jobs'][0]['stage_json']).read_text())
        inputs = Path(spec['workspace']) / 'inputs'
        body = '\n'.join(x.read_text() for x in inputs.rglob('*') if x.is_file())
        self.assertNotIn('CANDIDATE_PROPOSAL_SENTINEL', body)
        self.assertIn('RAW_PUBLIC_CONTEXT_SENTINEL', body)
        self.assertTrue((inputs / 'source_context/index.json').exists())
        self.assertIsNone(spec['max_responses'])
        self.assertFalse((inputs / 'seed').exists())

    def test_second_phase_requires_exact_first_record_freeze(self):
        with self.assertRaises(ValueError):
            self.bind('compare_final')

    def test_second_phase_releases_proposal_after_record(self):
        record = self.root / 'record.md'
        record.write_text('SIMULATED_SOURCE_FIRST_RECORD')
        receipt = self.root / 'SIMULATED_TEST_ONLY_record_freeze.json'
        job_id = 'D-V04-A-treatment-source_first_record-a001'
        p.put(receipt, {'simulation': True, 'job_id': job_id, 'pair_id': 'D-V04-A', 'arm': 'treatment',
                        'operational_complete': True, 'native_goal_starts': 1,
                        'artifacts': [{'path': str(record), 'sha256': p.sha(record), 'relative_path': 'evidence/record.md'}]})
        ref = self.bind('compare_final', {job_id: {'path': str(receipt), 'sha256': p.sha(receipt)}})
        request = json.loads(Path(ref['path']).read_text())
        spec = json.loads(Path(request['stage_jobs'][0]['stage_json']).read_text())
        inputs = Path(spec['workspace']) / 'inputs'
        self.assertIn('CANDIDATE_PROPOSAL_SENTINEL', (inputs / 'seed/proposal.md').read_text())
        self.assertEqual((inputs / 'prior' / job_id / 'evidence/record.md').read_text(), 'SIMULATED_SOURCE_FIRST_RECORD')

    def test_parallel_peer_cannot_be_injected_early(self):
        with self.assertRaises(ValueError):
            b.predecessor_sources({'prerequisite_job_ids': []}, {'unlisted-peer': {}}, 'pair', 'treatment')

    def test_seed_artifact_drift_fails_before_packet(self):
        Path(self.files['proposal']['path']).write_text('changed')
        with self.assertRaises(ValueError):
            self.bind('source_first_record')
        self.assertFalse((self.root / 'prepared').exists())

    def test_sol_seed_denied(self):
        seed = copy.deepcopy(self.seed)
        seed['origin_freezes'][0]['actual_family'] = 'Sol'
        with self.assertRaises(ValueError):
            b.verify_seed(seed, 'D-V04-A', 'D-V04-A')

    def test_alias_input_denied(self):
        target = self.root / 'alias'
        target.symlink_to(self.seed_path)
        with self.assertRaises(ValueError):
            p.regular(target)


class ExactPatchTests(unittest.TestCase):
    def test_exact_repair_preserves_unaffected_text(self):
        result, n = e.apply_exact('alpha\nbeta\ngamma\n', '--- proposal.md\n+++ proposal.md\n@@ -1,3 +1,3 @@\n alpha\n-beta\n+delta\n gamma\n')
        self.assertEqual(result, 'alpha\ndelta\ngamma\n')
        self.assertEqual(n, 1)

    def test_boundary_insert(self):
        result, _ = e.apply_exact('alpha\n', '--- proposal.md\n+++ proposal.md\n@@ -0,0 +1 @@\n+first\n')
        self.assertEqual(result, 'first\nalpha\n')

    def test_context_error_fails(self):
        with self.assertRaises(ValueError):
            e.apply_exact('alpha\n', '--- proposal.md\n+++ proposal.md\n@@ -1 +1 @@\n-beta\n+delta\n')

    def test_arbitrary_target_fails(self):
        with self.assertRaises(ValueError):
            e.apply_exact('alpha\n', '--- ../../private\n+++ ../../private\n@@ -1 +1 @@\n-alpha\n+delta\n')

    def test_second_file_fails(self):
        with self.assertRaises(ValueError):
            e.apply_exact('alpha\n', '--- proposal.md\n+++ proposal.md\n@@ -1 +1 @@\n-alpha\n+delta\n--- another\n+++ another\n')

    def test_no_newline_preserved(self):
        result, _ = e.apply_exact('alpha', '--- proposal.md\n+++ proposal.md\n@@ -1 +1 @@\n-alpha\n\\ No newline at end of file\n+delta\n\\ No newline at end of file\n')
        self.assertEqual(result, 'delta')


if __name__ == '__main__':
    unittest.main()
