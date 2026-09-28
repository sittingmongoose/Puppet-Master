"""Isolated synthetic audit regression; never invoke native/provider machinery."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


audit = load('successor_audit_under_test', HERE / 'audit_check.py')
core = load('successor_audit_fixture_store', LAB / 'ack-boundary-v1/tools/completion_store.py')
fixture = load('successor_audit_fixture_frames', LAB / 'ack-boundary-v1/fixtures/native_events.py')


class AuditChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='muse-result-audit-offline-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.ws = self.root / 'ws'
        (self.ws / 'inputs').mkdir(parents=True)
        (self.root / 'native').mkdir()
        self.log = self.root / 'native/muse-session.jsonl'
        self.log.touch()
        native = load('successor_audit_fixture_reader', HERE / 'native_completion.py')
        self.reader = native.CompletionReader(self.log, session_id='synthetic-audit-session', workspace_root=self.ws)
        self.stream = fixture.FixtureStream(self.ws, session_id=self.reader.session_id)
        self.store = core.CompletionStore(self.ws, self.root / 'store', self.reader)
        self.counter = 0
        self.publications = []
        self.annotated = False
        original = (LAB / 'delivery-v2/fixtures/valid.md').read_bytes()
        revision = (LAB / 'delivery-v2/fixtures/revision.md').read_bytes()
        for i in range(1, 8):
            label = ('batch-' + str(i).zfill(2) if i < 7 else 'independent').encode()
            (self.ws / ('inputs/' + str(i).zfill(2) + '.md')).write_bytes(
                original.replace(b'# Synthetic widget capacity', b'# Synthetic widget capacity ' + label, 1))
        (self.ws / 'inputs/revision-1.md').write_bytes(
            revision.replace(b'# Synthetic widget capacity', b'# Synthetic widget capacity batch-01', 1))
        (self.ws / 'inputs/revision-2.md').write_bytes(
            (self.ws / 'inputs/01.md').read_bytes() + b'\n## change_reason\nRestore the original synthetic value as an explicit revision.\n')
        (self.ws / 'task.txt').write_text('SYNTHETIC OFFLINE AUDIT FIXTURE ONLY\n')

    def put(self, path, value):
        path.write_text(json.dumps(value) + '\n')

    def append(self, *frames):
        with self.log.open('ab') as out:
            for frame in frames:
                frame['recorded_at'] = 2  # Synthetic epoch-us; publication is epoch-ns 1.
                out.write(self.stream.encode(frame))

    def operations(self, paths_and_bytes, read=False):
        calls, operations = [], []
        for index, (path, content) in enumerate(paths_and_bytes):
            self.counter += 1
            cid = 'synthetic-audit-call-' + str(self.counter)
            frame = self.stream.call(cid, path, content.decode())
            self.stream.sequence -= 1  # Only the combined batch is journaled.
            call = frame['payload']['event']['tool_calls'][0]
            self.stream.calls[cid]['index'] = index
            if read:
                call['name'] = self.stream.calls[cid]['tool_name'] = 'read_file'
                call['args'] = json.dumps({'path': str(path)})
            calls.append(call)
            operations.append((cid, path, content))
        batch = self.stream._frame({'kind': 'run', 'run_id': 'synthetic-run',
                                   'event': {'kind': 'assistant_tool_calls_committed', 'tool_calls': calls}})
        self.append(batch)
        # All starts precede all terminals, giving deliberately synthetic overlap.
        for cid, path, content in operations:
            self.append(self.stream.start(cid, path))
            if not read:
                path.write_bytes(content)
        for cid, path, content in operations:
            self.append(self.stream.terminal(cid, path))
        for cid, path, content in operations:
            text = None
            if self.annotated and not read:
                text = (f'wrote {len(content)} bytes to {path}; note: near-duplicate sibling '
                        'synthetic-sibling.md exists in this directory — verify this new file is intended')
            self.append(self.stream.result(cid, path, content.decode(), text=text))

    def poll_and_publish(self):
        before = len(self.store.state['attempts'])
        self.store.poll()
        for a in self.store.state['attempts'][before:]:
            receipt = self.store.feedback / (a['request'] + '.json')
            self.publications.append({'kind': 'receipt_published',
                **{k: a[k] for k in ('request', 'sequence', 'finding_id', 'revision', 'status')},
                'receipt_sha256': audit.original.digest(receipt.read_bytes()),
                'snapshot_sha256': a['raw_sha256'], 'marker_snapshot_sha256': a['marker_sha256'],
                'snapshots_and_state_precede_receipt': True, 'receipt_published_epoch_ns': 1})

    def submit(self, name, template):
        self.operations([(self.store.payloads / (name + '.md'), (self.ws / template).read_bytes())])
        self.operations([(self.store.requests / name, b'submit\n')])
        self.poll_and_publish()

    def receipt_reads(self, names):
        self.operations([(self.store.feedback / (n + '.json'), b'synthetic receipt read') for n in names], read=True)
        self.store.poll()

    def complete_fixture(self):
        names = ['new--batch-' + str(i).zfill(2) for i in range(1, 7)]
        self.operations([(self.store.payloads / (n + '.md'), (self.ws / ('inputs/' + str(i).zfill(2) + '.md')).read_bytes())
                         for i, n in enumerate(names, 1)])
        self.operations([(self.store.requests / n, b'submit\n') for n in names])
        self.poll_and_publish()
        self.submit('new--independent', 'inputs/07.md')
        names.append('new--independent')
        self.receipt_reads(names)
        fid = self.store.state['attempts'][0]['finding_id']
        for i in (1, 2):
            name = fid + '--revision-' + str(i)
            self.submit(name, 'inputs/revision-' + str(i) + '.md')
            self.receipt_reads([name])
        self.operations([(self.ws / 'feedback/status.json', b'synthetic status read')], read=True)
        self.store.poll()
        self.store.close()
        # The fixture explicitly supplies the trusted binding; no native launch.
        self.store.state['native_finalization']['binding'] = {
            'session_id': self.reader.session_id, 'journal_path': str(self.log)}
        self.put(self.store.state_path, self.store.state)
        (self.root / 'receipt-order.jsonl').write_text(''.join(json.dumps(p) + '\n' for p in self.publications))
        self.put(self.root / 'native/receipt.json', {
            'session_id': self.reader.session_id, 'goal_ack': {'status': 'accepted'},
            'fresh_session': True, 'stop_reason': 'goal_complete', 'model_id': 'muse-spark-1.3-contributor',
            'effort_effective': 'max', 'caps': {'seconds': 300, 'responses': 48}, 'native_responses': 1})
        self.put(self.root / 'host-receipt.json', {
            'process_exit': 0, 'error': None, 'inputs_unchanged': True, 'structurally_complete': True,
            'idle_publication': {'polls': 1, 'publication_delta': 0, 'projection_bytes_unchanged': True}})

    def assert_no_cascade(self, report):
        self.assertNotIn('AttributeError', json.dumps(report))
        self.assertNotIn('KeyError', json.dumps(report))

    def test_zero_ack_is_failed_with_dependents_not_reached(self):
        self.store.state.update(protocol_errors=['SYNTHETIC adapter result fault'], native_stream_status='fault',
                                native_finalization={'fault': 'SYNTHETIC root result variant'})
        self.put(self.store.state_path, self.store.state)
        report = audit.Audit(self.root).run()
        self.assertEqual(report['status'], 'fail')
        allocation = report['checks']['allocation_and_acknowledgements']
        self.assertEqual(allocation['acknowledged'], 0)
        self.assertEqual(allocation['protocol_errors'], ['SYNTHETIC adapter result fault'])
        for name in audit.Audit.DEPENDENCIES:
            self.assertIn(report['checks'][name]['status'], ('not_reached', 'unavailable'))
        self.assert_no_cascade(report)

    def test_partial_acknowledgements_are_not_independent_failures(self):
        self.submit('new--batch-01', 'inputs/01.md')
        report = audit.Audit(self.root).run()
        self.assertEqual(report['status'], 'fail')
        self.assertEqual(report['checks']['allocation_and_acknowledgements']['acknowledged'], 1)
        self.assertEqual(report['checks']['marker_overlap']['status'], 'not_reached')
        self.assert_no_cascade(report)

    def test_incomplete_record_stops_at_allocation(self):
        self.store.state['attempts'] = [{'request': 'new--batch-01'}]
        self.put(self.store.state_path, self.store.state)
        report = audit.Audit(self.root).run()
        self.assertEqual(report['status'], 'fail')
        self.assert_no_cascade(report)

    def test_missing_state_reports_one_allocation_failure(self):
        self.store.state_path.unlink()
        report = audit.Audit(self.root).run()
        self.assertEqual(report['status'], 'fail')
        self.assertEqual(report['checks']['current_and_history']['status'], 'not_reached')
        self.assert_no_cascade(report)

    def test_missing_source_pins_does_not_cascade(self):
        with patch.object(audit.original, 'PINS', {'nonexistent-frozen-source.py': 'not-a-hash'}):
            report = audit.Audit(self.root).run()
        self.assertEqual(report['status'], 'fail')
        self.assertEqual(report['checks']['native_completion_proofs']['status'], 'not_reached')
        self.assert_no_cascade(report)

    def test_plain_populated_synthetic_fixture_exercises_inherited_checks(self):
        self.complete_fixture()
        report = audit.Audit(self.root).run()
        self.assertEqual(report['status'], 'pass', json.dumps(report, indent=2))
        self.assertEqual(report['checks']['native_completion_proofs']['native_writes'], 18)
        for name in ('fidelity', 'lineage', 'native_proof', 'batching', 'overlap', 'receipt_order',
                     'goal_scope', 'prescribed_order', 'idle'):
            self.assertIs(getattr(audit.Audit, name), getattr(audit.original.Audit, name))
        self.assert_no_cascade(report)

    def test_annotated_populated_fixture_uses_successor_proof_reader(self):
        self.annotated = True
        self.complete_fixture()
        report = audit.Audit(self.root).run()
        self.assertEqual(report['status'], 'pass', json.dumps(report, indent=2))
        source = report['checks']['source_pins']
        self.assertEqual(source['successor_reader_path'], str(HERE / 'native_completion.py'))
        self.assert_no_cascade(report)

    def test_unavailable_required_evidence_never_aggregates_to_pass(self):
        with patch.object(audit.original.Audit, 'run', return_value={'status': 'pass'}):
            checker = audit.Audit(self.root)
            checker.checks = {'required': {'status': 'unavailable'}}
            self.assertEqual(checker.run()['status'], 'inconclusive')


if __name__ == '__main__':
    unittest.main()
