"""Synthetic development boundary tests; no case answers or native calls."""
from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location('delivery_store_under_test', HERE / 'delivery_store.py')
core = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(core)
FIXTURES = HERE.parent / 'fixtures'


def fixture(name='valid'):
    return (FIXTURES / (name + '.md')).read_bytes()


class DeliveryBoundaries(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.ws, self.archive = self.root / 'ws', self.root / 'archive'
        self.store = core.Store(self.ws, self.archive)

    def submit(self, name, raw=None, marker=b'submit\n'):
        if raw is not None:
            (self.store.payloads / (name + '.md')).write_bytes(raw)
        (self.store.requests / name).write_bytes(marker)
        summary = self.store.poll()
        return json.loads((self.store.feedback / (name + '.json')).read_text()), summary

    def current(self):
        return (self.archive / 'current.md').read_text()

    def test_archive_and_persistent_state_precede_receipt(self):
        raw = fixture()
        write = core.write_json
        observed = []
        def checked(path, value):
            if path == self.store.feedback / 'new--alpha.json':
                snapshot = self.archive / value['snapshot']
                self.assertEqual(snapshot.read_bytes(), raw)
                self.assertEqual(value['raw_sha256'], hashlib.sha256(raw).hexdigest())
                state = json.loads(self.store.state_path.read_text())
                self.assertEqual(state['attempts'][-1]['raw_sha256'], value['raw_sha256'])
                self.assertTrue((self.archive / 'snapshots/0001.request').exists())
                observed.append(True)
            return write(path, value)
        with patch.object(core, 'write_json', checked):
            receipt, summary = self.submit('new--alpha', raw)
        self.assertEqual(observed, [True])
        self.assertEqual(receipt['status'], 'VALID_UNVERIFIED')
        self.assertTrue(summary['complete'])
        self.assertTrue(receipt['structural_only'])
        self.assertEqual(receipt['semantic_validation'], 'not_performed')

    def test_reject_malformed_unknown_duplicate_missing_and_preserve_raw(self):
        for index, name in enumerate(['malformed', 'unknown-field', 'duplicate-field', 'missing-field'], 1):
            with self.subTest(name=name):
                raw = fixture(name)
                receipt, summary = self.submit('new--' + name, raw)
                self.assertEqual(receipt['status'], 'INVALID')
                self.assertTrue(receipt['diagnostics'])
                self.assertFalse(summary['complete'])
                self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), raw)
                self.assertEqual(receipt['finding_id'], f'F{index:04d}')
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())

    def test_empty_fields_and_revision_reason_required(self):
        raw = fixture().replace(b'## uncertainty\nThe fixture makes no claim about a real widget, source corpus, or runtime.\n', b'## uncertainty\n\n')
        receipt, _ = self.submit('new--empty', raw)
        self.assertEqual(receipt['status'], 'INVALID')
        receipt, _ = self.submit('F0001--reasonless', fixture())
        self.assertEqual(receipt['status'], 'INVALID')
        self.assertTrue(any('change_reason' in x for x in receipt['diagnostics']))

    def test_quote_code_and_typed_proposal_uncertainty_are_verbatim(self):
        raw = fixture()
        finding, _ = core.parse_finding(raw, 'F0001', False)
        parts = {x['type']: x for x in finding['parts']}
        text = raw.decode()
        condition = text.split('## condition\n', 1)[1].split('## implication\n', 1)[0]
        self.assertEqual(parts['condition']['text'], condition)
        self.assertIn('"two units"', parts['source_fit']['text'])
        self.assertIn('C:\\synthetic\\widget.txt', parts['source_fit']['text'])
        receipt, summary = self.submit('new--verbatim', raw)
        self.assertEqual(receipt['status'], 'VALID_UNVERIFIED')
        self.assertTrue(summary['complete'])
        current = self.current()
        projection = json.loads((self.archive / 'current.json').read_text())
        projected = {x['type']: x for x in projection['findings'][0]['parts']}
        for kind, original in parts.items():
            self.assertEqual(projected[kind]['text'], original['text'])
        self.assertIn('\n'.join('> ' + line for line in condition.splitlines()), current)
        self.assertIn('\n'.join('> ' + line for line in parts['source_fit']['text'].splitlines()), current)
        self.assertIn('\n'.join('> ' + line for line in parts['uncertainty']['text'].splitlines()), current)
        self.assertIn('UNEXECUTED', current)
        self.assertNotIn('REVIEWED_VERIFIER_ASSERTION', current)

    def test_host_identity_and_part_identity_survive_revision(self):
        first, _ = self.submit('new--alpha', fixture())
        ids = {x['type']: x['id'] for x in self.store.summary()['findings'][0]['parts']}
        second, summary = self.submit('F0001--revision', fixture('revision'))
        self.assertEqual(first['finding_id'], second['finding_id'])
        self.assertEqual(ids, {x['type']: x['id'] for x in summary['findings'][0]['parts']})
        self.assertTrue(summary['complete'])
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())
        self.assertIn('NEW_WIDGET_UNITS_3', self.current())
        history = json.loads((self.archive / 'history.json').read_text())
        self.assertEqual(len(history['attempts']), 2)
        self.assertIn('OLD_WIDGET_UNITS_2', json.dumps(history))
        self.assertTrue(history['attempts'][1]['change_reason'])

    def test_independent_b_survives_invalid_latest_a_and_correction(self):
        self.submit('new--alpha', fixture())
        b = fixture().replace(b'OLD_WIDGET_UNITS_2', b'SYNTHETIC_B_CURRENT')
        self.submit('new--beta', b)
        bad = fixture('unknown-field').replace(b'OLD_WIDGET_UNITS_2', b'INVALID_A_ONLY')
        invalid, summary = self.submit('F0001--bad', bad)
        self.assertFalse(summary['complete'])
        self.assertEqual({x['id'] for x in summary['findings']}, {'F0002'})
        current = self.current()
        self.assertIn('SYNTHETIC_B_CURRENT', current)
        self.assertNotIn('OLD_WIDGET_UNITS_2', current)
        self.assertNotIn('INVALID_A_ONLY', current)
        self.assertIn('F0001', current)
        self.assertEqual((self.archive / invalid['snapshot']).read_bytes(), bad)
        corrected, summary = self.submit('F0001--fixed', fixture('revision'))
        self.assertEqual(corrected['finding_id'], 'F0001')
        self.assertTrue(summary['complete'])
        self.assertEqual({x['id'] for x in summary['findings']}, {'F0001', 'F0002'})
        self.assertIn('NEW_WIDGET_UNITS_3', self.current())
        history = json.loads((self.archive / 'history.json').read_text())
        self.assertEqual(len(history['attempts']), 4)
        self.assertEqual(history['attempts'][2]['status'], 'INVALID')
        self.assertEqual((self.archive / invalid['snapshot']).read_bytes(), bad)

    def test_host_revision_diff_counts_invalid_and_tracks_typed_removal(self):
        first, initial = self.submit('new--alpha', fixture())
        original_parts = {p['type']: p for p in initial['findings'][0]['parts']}
        invalid, summary = self.submit('F0001--invalid', fixture('unknown-field'))
        self.assertFalse(summary['complete'])
        self.assertEqual(summary['findings'], [])
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())
        replaced_raw = fixture().replace(b'OLD_WIDGET_UNITS_2', b'SYNTHETIC_REPLACED_ASSERTION')
        replaced_raw += b'## change_reason\nSynthetic development revision changes the assertion only.\n'
        replaced, summary = self.submit('F0001--replace', replaced_raw)
        changed = self.store.state['attempts'][-1]['changes']
        self.assertEqual(changed['previous_valid_attempt'], first['sequence'])
        self.assertEqual(changed['added_parts'], [])
        self.assertEqual(changed['removed_parts'], [])
        self.assertEqual(changed['replaced_parts'], ['F0001_ASSERTION'])
        self.assertFalse(changed['title_changed'])
        replaced_parts = {p['type']: p for p in summary['findings'][0]['parts']}
        for kind, original in original_parts.items():
            self.assertEqual(replaced_parts[kind]['id'], original['id'])
            if kind != 'assertion':
                self.assertEqual(replaced_parts[kind], original)
        nonfinding_raw = replaced_raw.replace(b'## assertion\n', b'## non_finding\n')
        nonfinding_raw = nonfinding_raw.replace(b'# Synthetic widget capacity', b'# Synthetic revised widget capacity', 1)
        final, summary = self.submit('F0001--retype', nonfinding_raw)
        changed = self.store.state['attempts'][-1]['changes']
        self.assertEqual(changed['previous_valid_attempt'], replaced['sequence'])
        self.assertEqual(changed['added_parts'], ['F0001_NON_FINDING'])
        self.assertEqual(changed['removed_parts'], ['F0001_ASSERTION'])
        self.assertEqual(changed['replaced_parts'], [])
        self.assertTrue(changed['title_changed'])
        final_parts = {p['type']: p for p in summary['findings'][0]['parts']}
        self.assertNotIn('assertion', final_parts)
        for kind, original in original_parts.items():
            if kind != 'assertion':
                self.assertEqual(final_parts[kind], original)
        self.assertEqual([r['revision'] for r in [first, invalid, replaced, final]], [1, 2, 3, 4])
        self.assertTrue(summary['complete'])
        history = json.loads((self.archive / 'history.json').read_text())['attempts']
        self.assertEqual(len(history), 4)
        self.assertEqual(history[1]['status'], 'INVALID')
        self.assertIsNone(history[1]['changes'])
        self.assertEqual((self.archive / invalid['snapshot']).read_bytes(), fixture('unknown-field'))
        self.assertEqual((self.archive / first['snapshot']).read_bytes(), fixture())

    def test_missing_old_snapshot_blocks_complete_without_reconstruction(self):
        old, _ = self.submit('new--alpha', fixture())
        self.submit('F0001--revision', fixture('revision'))
        missing = self.archive / old['snapshot']
        missing.unlink()
        summary = self.store.publish()
        self.assertFalse(summary['complete'])
        self.assertTrue(summary['missing_or_corrupt_snapshots'])
        self.assertIn('NEW_WIDGET_UNITS_3', self.current())
        reopened = core.Store(self.ws, self.archive)
        self.assertFalse(reopened.summary()['complete'])
        self.assertFalse(missing.exists(), 'host must never reconstruct historical bytes')

    def test_missing_current_snapshot_blocks_current_and_complete(self):
        receipt, _ = self.submit('new--alpha', fixture())
        (self.archive / receipt['snapshot']).unlink()
        summary = self.store.publish()
        self.assertFalse(summary['complete'])
        self.assertEqual(summary['findings'], [])
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())
        self.assertIn('INCOMPLETE_SNAPSHOT', self.current())

    def test_missing_historical_request_snapshot_blocks_complete(self):
        self.submit('new--alpha', fixture())
        self.submit('F0001--revision', fixture('revision'))
        (self.archive / 'snapshots/0001.request').unlink()
        self.assertFalse(self.store.publish()['complete'])

    def test_bad_marker_and_failed_payload_write_are_visible(self):
        receipt, summary = self.submit('new--badmarker', fixture(), marker=b'submit')
        self.assertEqual(receipt['status'], 'INVALID')
        self.assertFalse(summary['complete'])
        self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), fixture())
        self.assertEqual((self.archive / 'snapshots/0001.request').read_bytes(), b'submit')
        receipt, summary = self.submit('new--failedwrite')
        self.assertEqual(receipt['status'], 'INVALID')
        self.assertFalse(summary['complete'])
        self.assertIsNone(receipt['snapshot'])
        self.assertTrue(receipt['diagnostics'])

    def test_invalid_request_name_preserves_available_raw_before_feedback(self):
        raw = fixture().replace(b'OLD_WIDGET_UNITS_2', b'INVALID_REQUEST_RAW_SENTINEL')
        receipt, summary = self.submit('INVALID-NAME', raw)
        self.assertEqual(receipt['status'], 'INVALID')
        self.assertFalse(summary['complete'])
        self.assertTrue(receipt['snapshot'], 'invalid identity must not erase available raw payload')
        self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), raw)
        self.assertNotIn('INVALID_REQUEST_RAW_SENTINEL', self.current())

    def test_unknown_finding_identity_is_invalid_and_preserved(self):
        raw = fixture('revision')
        receipt, summary = self.submit('F9999--unknown', raw)
        self.assertEqual(receipt['status'], 'INVALID')
        self.assertFalse(summary['complete'])
        self.assertTrue(receipt['snapshot'])
        self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), raw)

    def test_acknowledged_payload_mutation_invalidates_current(self):
        receipt, _ = self.submit('new--alpha', fixture())
        (self.store.payloads / 'new--alpha.md').write_bytes(fixture('revision'))
        summary = self.store.poll()
        self.assertFalse(summary['complete'])
        self.assertEqual(summary['findings'], [])
        self.assertTrue(summary['protocol_errors'])
        self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), fixture())

    def test_removed_acknowledged_request_is_visible(self):
        self.submit('new--alpha', fixture())
        (self.store.requests / 'new--alpha').unlink()
        summary = self.store.poll()
        self.assertFalse(summary['complete'])
        self.assertTrue(summary['protocol_errors'])
        self.assertEqual(summary['findings'], [])

    def test_pending_payload_blocks_complete_and_close_preserves_bytes(self):
        self.submit('new--alpha', fixture())
        raw = b'Synthetic development pending record only.\n'
        (self.store.payloads / 'new--pending.md').write_bytes(raw)
        self.assertFalse(self.store.poll()['complete'], 'pending record may not be hidden behind a complete claim')
        closed = self.store.close()
        self.assertFalse(closed['complete'])
        self.assertTrue(closed['protocol_errors'])
        self.assertEqual((self.archive / 'snapshots/unsubmitted-new--pending.md').read_bytes(), raw)
        self.assertNotIn(raw.decode().strip(), self.current())

    def test_oversized_invalid_payload_is_preserved_before_feedback(self):
        raw = fixture() + b'SYNTHETIC_OVERSIZED_RAW_ONLY' * core.MAX_BYTES
        receipt, summary = self.submit('new--oversized', raw)
        self.assertEqual(receipt['status'], 'INVALID')
        self.assertFalse(summary['complete'])
        self.assertTrue(any('exceeds' in x for x in receipt['diagnostics']))
        self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), raw)
        self.assertEqual(receipt['raw_sha256'], hashlib.sha256(raw).hexdigest())
        self.assertNotIn('SYNTHETIC_OVERSIZED_RAW_ONLY', self.current())

    def test_corrupt_current_request_snapshot_blocks_current(self):
        self.submit('new--alpha', fixture())
        marker = self.archive / 'snapshots/0001.request'
        marker.chmod(0o644)
        marker.write_bytes(b'corrupted synthetic marker\n')
        summary = self.store.publish()
        self.assertFalse(summary['complete'])
        self.assertTrue(summary['missing_or_corrupt_snapshots'])
        self.assertEqual(summary['findings'], [])
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())

    def test_reused_attempt_with_changed_bytes_is_not_new_acceptance(self):
        receipt, _ = self.submit('new--alpha', fixture())
        payload = self.store.payloads / 'new--alpha.md'
        payload.write_bytes(fixture('revision'))
        (self.store.requests / 'new--alpha').write_bytes(b'submit again\n')
        summary = self.store.poll()
        self.assertFalse(summary['complete'])
        self.assertTrue(summary['protocol_errors'])
        self.assertEqual(summary['findings'], [])
        self.assertEqual(len(self.store.state['attempts']), 1)
        self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), fixture())
        self.assertNotIn('NEW_WIDGET_UNITS_3', self.current())

    def test_oversized_unsubmitted_payload_survives_close(self):
        self.submit('new--alpha', fixture())
        raw = b'SYNTHETIC_PENDING_OVERSIZED' * core.MAX_BYTES
        (self.store.payloads / 'new--pending.md').write_bytes(raw)
        summary = self.store.close()
        self.assertFalse(summary['complete'])
        self.assertTrue(summary['protocol_errors'])
        self.assertEqual((self.archive / 'snapshots/unsubmitted-new--pending.md').read_bytes(), raw)
        self.assertNotIn('SYNTHETIC_PENDING_OVERSIZED', self.current())

    def test_oversized_marker_preserves_raw_and_invalidates_latest_revision(self):
        self.submit('new--alpha', fixture())
        raw = fixture('revision')
        marker = b'SYNTHETIC_OVERSIZED_MARKER' * core.MAX_BYTES
        receipt, summary = self.submit('F0001--oversizedmarker', raw, marker)
        self.assertEqual(receipt['status'], 'INVALID')
        self.assertEqual(receipt['finding_id'], 'F0001')
        self.assertFalse(summary['complete'])
        self.assertEqual(summary['findings'], [])
        self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), raw)
        self.assertEqual((self.archive / 'snapshots/0002.request').read_bytes(), marker)
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())
        self.assertNotIn('NEW_WIDGET_UNITS_3', self.current())

    def test_nonregular_marker_preserves_available_payload_without_following(self):
        self.submit('new--alpha', fixture())
        name = 'F0001--failedmarker'
        raw = fixture('revision')
        (self.store.payloads / (name + '.md')).write_bytes(raw)
        (self.store.requests / name).mkdir()
        summary = self.store.poll()
        receipt = json.loads((self.store.feedback / (name + '.json')).read_text())
        self.assertEqual(receipt['status'], 'INVALID')
        self.assertEqual(receipt['finding_id'], 'F0001')
        self.assertFalse(summary['complete'])
        self.assertEqual(summary['findings'], [])
        self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), raw)
        self.assertIsNone(self.store.state['attempts'][-1]['marker_sha256'])
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())

    def test_close_freezes_and_rejects_postfreeze_processing(self):
        self.submit('new--alpha', fixture())
        self.store.close()
        frozen = self.store.state_path.read_bytes()
        (self.store.payloads / 'new--late.md').write_bytes(fixture())
        (self.store.requests / 'new--late').write_bytes(b'submit\n')
        with self.assertRaises(core.StructuralError):
            self.store.poll()
        self.assertEqual(self.store.state_path.read_bytes(), frozen)
        self.assertFalse((self.store.feedback / 'new--late.json').exists())

    def test_nonfinding_is_typed_and_projector_bypasses_review_absence(self):
        raw = fixture().replace(b'## assertion\n', b'## non_finding\n')
        with patch.object(core.legacy, 'assemble', side_effect=AssertionError('review assembler called')), \
             patch.object(core.legacy, 'ABSENCE_WORDS', Mock(search=Mock(side_effect=AssertionError('absence matcher called')))), \
             patch.object(core.legacy, '_absence_packet', side_effect=AssertionError('absence validator called')), \
             patch.object(core.legacy, 'project_current', wraps=core.legacy.project_current) as project, \
             patch.object(core.legacy, 'render_current', wraps=core.legacy.render_current) as render:
            receipt, summary = self.submit('new--nonfinding', raw)
        self.assertTrue(project.called)
        self.assertTrue(render.called)
        self.assertTrue(summary['complete'])
        self.assertEqual(receipt['status'], 'VALID_UNVERIFIED')
        self.assertIn('non_finding', {x['type'] for x in summary['findings'][0]['parts']})
        self.assertIn('UNEXECUTED', self.current())


if __name__ == '__main__':
    unittest.main()
