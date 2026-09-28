import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

import prep_plan
import research_store


class PreparationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def pair(self):
        arms = []
        for slot, kind in zip(prep_plan.PAIRS['EVAL-001'], ['authored_current', 'host_current']):
            path = self.root / (slot + '.md')
            path.write_text('# Current\nA synthetic current proposition.\n')
            arms.append({'slot': slot, 'native_outcome': 'goal_complete',
                         'structural_complete': True, 'lineage_pass': True,
                         'report_kind': kind, 'current_path': str(path),
                         'current_sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
        return {'assignment_id': 'EVAL-001', 'arms': arms}

    def test_complete_original_pair_eligible_but_not_authorized(self):
        self.assertTrue(prep_plan.check_pair_eligibility(self.pair(), 'EVAL-001'))
        self.assertFalse(hasattr(prep_plan, 'dispatch'))

    def test_any_failed_or_diagnostic_arm_skips_pair(self):
        for key, value in [('native_outcome', 'cap_stop'), ('native_outcome', 'harness_failure'),
                           ('structural_complete', False), ('lineage_pass', False),
                           ('report_kind', 'diagnostic_only')]:
            with self.subTest(key=key, value=value):
                pair = self.pair()
                pair['arms'][1][key] = value
                self.assertFalse(prep_plan.check_pair_eligibility(pair))

    def test_exact_original_pair_no_replacements_or_cross_app(self):
        pair = self.pair()
        self.assertFalse(prep_plan.check_pair_eligibility(pair, 'EVAL-002'))
        pair['arms'][1] = copy.deepcopy(pair['arms'][0])
        self.assertFalse(prep_plan.check_pair_eligibility(pair))

    def test_carrier_kind_and_effective_control_capacity_bound(self):
        pair = self.pair()
        pair['arms'][0]['report_kind'] = 'host_current'
        self.assertFalse(prep_plan.check_pair_eligibility(pair))
        pair = self.pair()
        raw = b'x' * (prep_plan.CONTROL_FILE_BYTES + 1)
        Path(pair['arms'][0]['current_path']).write_bytes(raw)
        pair['arms'][0]['current_sha256'] = hashlib.sha256(raw).hexdigest()
        self.assertFalse(prep_plan.check_pair_eligibility(pair))

    def test_retained_inventory_counts_all_files_and_bytes(self):
        output = self.root / 'out'
        output.mkdir()
        for name in ['observations.md', 'draft.md']:
            (output / name).write_text('Synthetic content.\n')
        self.assertTrue(prep_plan.check_output_inventory(output, 'control')['complete'])
        for i in range(9):
            (output / f'history{i}.md').write_bytes(b'x' * prep_plan.CONTROL_FILE_BYTES)
        result = prep_plan.check_output_inventory(output, 'control')
        self.assertFalse(result['complete'])
        self.assertIn('retained byte capacity exceeded', result['errors'])
        self.assertEqual(len(result['files']), 11)

    def test_file_count_invalid_paths_and_required_control_artifacts(self):
        output = self.root / 'out'
        output.mkdir()
        self.assertFalse(prep_plan.check_output_inventory(output, 'control')['complete'])
        for i in range(129):
            (output / f'scratch{i}.md').write_text('x')
        result = prep_plan.check_output_inventory(output, 'maintained')
        self.assertFalse(result['complete'])
        self.assertIn('retained file-count capacity exceeded', result['errors'])
        self.assertTrue(any('undeclared maintained output' in e for e in result['errors']))

    def test_inventory_does_not_trim_oversized_payload(self):
        output = self.root / 'out'
        (output / 'submissions').mkdir(parents=True)
        payload = output / 'submissions/new--large.md'
        raw = b'x' * 32769
        payload.write_bytes(raw)
        self.assertFalse(prep_plan.check_output_inventory(output, 'maintained')['complete'])
        self.assertEqual(payload.read_bytes(), raw)
        pair = self.pair()
        pair['arms'][0]['slot'] = 'I2-M-replacement'
        self.assertFalse(prep_plan.check_pair_eligibility(pair))

    def test_report_missing_empty_changed_or_not_utf8_refuses(self):
        for raw in [b'', b' ', b'changed', b'\xff']:
            pair = self.pair()
            path = Path(pair['arms'][0]['current_path'])
            path.write_bytes(raw)
            if raw != b'changed':
                pair['arms'][0]['current_sha256'] = hashlib.sha256(raw).hexdigest()
            self.assertFalse(prep_plan.check_pair_eligibility(pair))
        pair = self.pair()
        Path(pair['arms'][0]['current_path']).unlink()
        self.assertFalse(prep_plan.check_pair_eligibility(pair))

    def test_malformed_metadata_truthy_flags_and_unknown_fields_refuse(self):
        for value in [None, {}, [], {'assignment_id': 'EVAL-001', 'arms': []}]:
            self.assertFalse(prep_plan.check_pair_eligibility(value))
        for key, value in [('structural_complete', 1), ('lineage_pass', 'yes'), ('extra', True)]:
            pair = self.pair()
            pair['arms'][0][key] = value
            self.assertFalse(prep_plan.check_pair_eligibility(pair))

    def test_caps_and_prompts_match_proposal_without_spending_increase(self):
        root = Path(__file__).resolve().parents[1]
        proposal = json.loads((root / 'proposal.json').read_text())
        limits = proposal['limits']
        self.assertEqual((limits['candidate_assignments'], limits['candidate_seconds_each'],
                          limits['candidate_responses_each']), (4, 1800, 160))
        self.assertEqual((limits['evaluation_assignments'], limits['evaluation_seconds_each'],
                          limits['evaluation_responses_each']), (2, 2700, 160))
        self.assertEqual(limits['model_seconds_total'], 4 * 1800 + 2 * 2700)
        self.assertEqual(limits['phase_wall_seconds'], prep_plan.PHASE_SECONDS)
        self.assertEqual(proposal['capacities']['maintained_attempts_total_including_invalid_and_revisions'], research_store.MAX_ATTEMPTS)
        self.assertEqual(proposal['capacities']['maintained_payload_bytes'], research_store.MAX_BYTES)
        common = (root / 'prompts/common.txt').read_bytes()
        for name in ['investigator-control.txt', 'investigator-maintained.txt']:
            self.assertTrue((root / 'prompts' / name).read_bytes().startswith(common))
        for name, checksum in proposal['prompt_hashes'].items():
            self.assertEqual(hashlib.sha256((root / 'prompts' / name).read_bytes()).hexdigest(), checksum)
        self.assertFalse(proposal['launch_enabled'])
        self.assertEqual(proposal['authorized_schedules'], [])

    def raw(self):
        return (Path(__file__).resolve().parents[2] / 'delivery-v2/fixtures/valid.md').read_bytes()

    def test_capacity_isolated_from_frozen_D1_module(self):
        spec = importlib.util.spec_from_file_location('unaltered_D1', research_store.SOURCE)
        original = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(original)
        configured = research_store.frozen_module()
        self.assertEqual((original.MAX_ATTEMPTS, original.MAX_BYTES), (16, 16384))
        self.assertEqual((configured.MAX_ATTEMPTS, configured.MAX_BYTES), (64, 32768))
        raw = self.raw() + b' ' * (20000 - len(self.raw()))
        configured.parse_finding(raw, 'F0001', False)
        with self.assertRaises(original.StructuralError):
            original.parse_finding(raw, 'F0001', False)

    def test_32KiB_boundary_and_oversized_raw_preserved(self):
        store = research_store.create_store(self.root / 'ws', self.root / 'archive')
        raw = self.raw() + b' ' * (32768 - len(self.raw()))
        (store.payloads / 'new--valid.md').write_bytes(raw)
        (store.requests / 'new--valid').write_bytes(b'submit\n')
        store.poll()
        self.assertEqual(store.state['attempts'][0]['status'], 'VALID_UNVERIFIED')
        raw += b' '
        (store.payloads / 'new--oversized.md').write_bytes(raw)
        (store.requests / 'new--oversized').write_bytes(b'submit\n')
        store.close()
        self.assertEqual(store.state['attempts'][1]['status'], 'INVALID')
        self.assertEqual((store.archive / 'snapshots/0002.md').read_bytes(), raw)
        self.assertFalse(store.summary()['complete'])

    def test_attempt_cap_counts_invalid_revisions_and_surviving_overflow(self):
        store = research_store.create_store(self.root / 'ws', self.root / 'archive')
        raw = self.raw()
        for i in range(65):
            name = 'new--first' if i == 0 else f'F0001--revision{i:02d}'
            payload = raw if i == 0 else raw + b'\n## change_reason\nSynthetic revision.\n'
            if i == 1:
                payload += b'## unknown\nRetain invalid bytes.\n'
            (store.payloads / (name + '.md')).write_bytes(payload)
            (store.requests / name).write_bytes(b'submit\n')
            store.poll()
        counts = research_store.attempt_counts(store)
        self.assertEqual((counts['acknowledged'], counts['initial_attempts'], counts['revision_attempts'], counts['invalid_attempts']), (64, 1, 63, 1))
        self.assertEqual(counts['observed_unique_attempt_paths'], 65)
        self.assertEqual(counts['unacknowledged_paths'], ['F0001--revision64'])
        self.assertFalse(store.summary()['complete'])
        store.close()
        self.assertTrue((store.archive / 'snapshots/unsubmitted-F0001--revision64.md').exists())


if __name__ == '__main__':
    unittest.main()
