"""Offline accounting checks; no inference or native dispatch."""
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import report_check as report

LAB = Path(__file__).resolve().parents[2]


class CompactReportTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / 'run'
        self.result = Path(self.tmp.name) / 'result'
        (self.root / 'native').mkdir(parents=True)
        (self.root / 'store').mkdir()
        self.put('phase-terminal.json', {'state': 'closed', 'start_epoch': 100.0,
                                         'execution_terminal_seconds_from_go': 200,
                                         'execution_terminal_within_whole_ceiling': True})
        self.put('host-receipt.json', {'error': None, 'driver_and_receiver_seconds': 190})
        self.put('native/receipt.json', {'goal_status_final': 'complete', 'stop_reason': 'goal_complete',
                                         'elapsed_seconds': 195, 'native_responses': 1})
        self.put('audit.stdout', {'status': 'pass', 'checks': {
            'allocation_and_acknowledgements': {'status': 'pass', 'errors': [], 'expected_count': 4},
            'template_snapshots_receipts': {'status': 'pass', 'errors': [], 'snapshot_count': 8,
                                            'snapshot_sha256': {'snapshots/0001.md': 'a' * 64}},
            'native_batches': {'status': 'observed', 'groups': {'payload': {'call_sequences': [1]}, 'marker': {'call_sequences': [2]}}, 'initial_batches_observed': True},
            'marker_overlap': {'status': 'observed', 'overlapping_pairs': [['a', 'b']]},
            'current_and_history': {'status': 'pass', 'target_finding_id': 'F0001', 'independent_finding_id': 'F0002', 'current_finding_count': 2, 'revision_change_reasons': ['private text']}}})
        self.put('store/state.json', {'attempts': [{'status': 'VALID_UNVERIFIED', 'snapshot': f'{n}.md', 'marker_snapshot': f'{n}.request'} for n in range(4)]})

    def put(self, rel, value):
        (self.root / rel).write_text(json.dumps(value) + '\n')

    def test_missing_usage_components_are_unknown(self):
        (self.root / 'native/muse-msp.jsonl').write_text(json.dumps({'method': 'session/tokenUsage', 'params': {'usage': {'inputTokens': 12}}}) + '\n')
        result = json.loads(report.prepare(self.root, self.result).read_text())
        usage = result['usage']
        self.assertEqual(usage['reported_completed_parent_tokens']['inputTokens'], 12)
        self.assertEqual(usage['reported_completed_parent_tokens']['outputTokens'], 'unknown')
        self.assertFalse(usage['per_component_coverage']['outputTokens']['complete'])
        self.assertEqual(usage['whole_run_total_tokens'], 'unknown')
        self.assertEqual(result['execution_result'], 'PASS')
        structural = json.loads((self.result / 'structural-audit.json').read_text())
        self.assertEqual(structural['required_count_status'], 'pass')
        self.assertEqual(structural['matching_snapshot_count'], 8)
        self.assertEqual(structural['checks']['native_batches']['initial_batches_observed'], True)
        self.assertNotIn('revision_change_reasons', structural['checks']['current_and_history'])

    def test_publication_boundaries_and_separate_confirmations(self):
        report.prepare(self.root, self.result)
        with patch.object(report.time, 'time', return_value=490.0):
            first = json.loads(report.confirm(self.root, self.result, 'remote-result-commit', 'result').read_text())
        self.assertEqual(first['whole_check_result'], 'PASS')
        self.assertEqual(first['go_to_confirmed_publication_seconds'], 390)
        with patch.object(report.time, 'time', return_value=490.001):
            later = json.loads(report.confirm(self.root, self.result, 'remote-confirmation-commit', 'confirmation_record').read_text())
        self.assertEqual(later['whole_check_result'], 'FAIL_OR_INCOMPLETE')
        self.assertEqual(later['first_result_publication']['observed_confirmation_epoch'], 490.0)
        self.assertTrue((self.root / 'confirmation-record-publication.json').is_file())
        self.assertFalse((self.result / 'confirmation-record-publication.json').exists())

    def test_late_first_publication_fails(self):
        report.prepare(self.root, self.result)
        with patch.object(report.time, 'time', return_value=490.001):
            first = json.loads(report.confirm(self.root, self.result, 'late-result-commit', 'result').read_text())
        self.assertEqual(first['whole_check_result'], 'FAIL_OR_INCOMPLETE')

    def test_cap_or_missing_count_cannot_pass(self):
        self.put('native/receipt.json', {'goal_status_final': 'active', 'stop_reason': 'cap_seconds', 'native_responses': 1})
        self.put('store/state.json', {'attempts': [{'status': 'VALID_UNVERIFIED', 'snapshot': 'one.md', 'marker_snapshot': 'one.request'}]})
        result = json.loads(report.prepare(self.root, self.result).read_text())
        self.assertEqual(result['execution_result'], 'FAIL_OR_INCOMPLETE')
        self.assertEqual(result['structural_audit']['required_count_status'], 'fail_or_incomplete')

    def test_partial_telemetry_is_reported_unknown(self):
        (self.root / 'native/muse-msp.jsonl').write_text('{"method":"session/tokenUsage"}\n{"partial"')
        (self.root / 'native/muse-session.jsonl').write_text('{"payload":{}}\n{"partial"')
        result = json.loads(report.prepare(self.root, self.result).read_text())
        self.assertEqual(result['usage']['status'], 'unavailable')
        self.assertEqual(result['usage']['parse_error_type'], 'JSONDecodeError')
        self.assertEqual(result['native_internal_retries']['status'], 'unavailable')
        self.assertEqual(result['native_internal_retries']['parse_error_type'], 'JSONDecodeError')
        self.assertEqual(len([e for e in result['raw_evidence'] if e['path'].endswith(('muse-msp.jsonl', 'muse-session.jsonl'))]), 2)

    def test_existing_a2_task_id_retry_intervals(self):
        journal = LAB / 'a2-m-20260929/native/muse-session.jsonl'
        if not journal.is_file():
            self.skipTest('private A2 journal unavailable in portable checkout')
        values = report.retry_accounting(journal)
        self.assertEqual(values['completed_count'], 3)
        self.assertEqual(values['completed_wait_seconds'], 180.023499)
        self.assertEqual(values['interrupted_count'], 1)
        self.assertEqual([v['observed_seconds'] for v in values['waits'] if v['end_kind'] == 'cancelled'], [13.905108])


if __name__ == '__main__':
    unittest.main()
