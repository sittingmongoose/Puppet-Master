"""Offline four-submission audit tests. Never launch a native Goal or provider."""
import importlib.util
import json
from pathlib import Path
import sys
import unittest

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
FOUR = HERE.parent


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


prior = load('four_offline_prior_harness', LAB / 'muse-result-v2/tools/test_audit_check.py')
audit = load('four_offline_audit', HERE / 'audit_check.py')


class FourAuditChecks(unittest.TestCase):
    setUp = prior.AuditChecks.setUp
    put = prior.AuditChecks.put
    poll_and_publish = prior.AuditChecks.poll_and_publish
    submit = prior.AuditChecks.submit
    receipt_reads = prior.AuditChecks.receipt_reads

    def setUp(self):
        prior.AuditChecks.setUp(self)
        for number in range(2, 7):
            (self.ws / 'inputs' / (str(number).zfill(2) + '.md')).unlink()
        for name in ('01.md', '07.md', 'revision-1.md', 'revision-2.md'):
            (self.ws / 'inputs' / name).write_bytes((FOUR / 'inputs/templates' / name).read_bytes())
        task = FOUR / 'inputs/task.txt'
        if task.exists():
            (self.ws / 'task.txt').write_bytes(task.read_bytes())
            (self.root / 'launch-objective.txt').write_text(task.read_text().strip())
        manifest = FOUR / 'input-manifest.json'
        if manifest.exists():
            (self.root / 'input-manifest.json').write_bytes(manifest.read_bytes())
        self.overlap = True
        self.recorded_at = 2

    def append(self, *frames):
        with self.log.open('ab') as out:
            for frame in frames:
                frame['recorded_at'] = self.recorded_at
                out.write(self.stream.encode(frame))

    def operations(self, paths_and_bytes, read=False):
        if self.overlap or read or len(paths_and_bytes) < 2:
            return prior.AuditChecks.operations(self, paths_and_bytes, read=read)
        # Keep a single committed batch, then serialize start/terminal/result.
        calls, operations = [], []
        for index, (path, content) in enumerate(paths_and_bytes):
            self.counter += 1
            cid = 'synthetic-audit-call-' + str(self.counter)
            frame = self.stream.call(cid, path, content.decode())
            self.stream.sequence -= 1
            call = frame['payload']['event']['tool_calls'][0]
            self.stream.calls[cid]['index'] = index
            calls.append(call)
            operations.append((cid, path, content))
        batch = self.stream._frame({'kind': 'run', 'run_id': 'synthetic-run',
            'event': {'kind': 'assistant_tool_calls_committed', 'tool_calls': calls}})
        self.append(batch)
        for cid, path, content in operations:
            self.append(self.stream.start(cid, path))
            path.write_bytes(content)
            self.append(self.stream.terminal(cid, path))
            self.append(self.stream.result(cid, path, content.decode()))

    def complete_fixture(self, *, independent_first=False, initial_reads=True,
                         premature_initial_reads=False, revisions=(1, 2),
                         revision_reads=True, premature_revision_read=False,
                         final_status=True, extra=None):
        initials = [('new--batch-01', 'inputs/01.md'),
                    ('new--independent', 'inputs/07.md')]
        if independent_first:
            initials.reverse()
        self.operations([(self.store.payloads / (name + '.md'), (self.ws / template).read_bytes())
                         for name, template in initials])
        self.operations([(self.store.requests / name, b'submit\n') for name, _ in initials])
        if premature_initial_reads:
            self.recorded_at = 0
            self.operations([(self.store.feedback / (name + '.json'), b'synthetic early read')
                             for name, _ in initials], read=True)
            self.recorded_at = 2
        self.poll_and_publish()
        if initial_reads:
            self.receipt_reads([name for name, _ in initials])
        target = next(a['finding_id'] for a in self.store.state['attempts']
                      if a['request'] == 'new--batch-01')
        for number in revisions:
            name = target + '--revision-' + str(number)
            if premature_revision_read and number == 1:
                self.operations([(self.store.payloads / (name + '.md'),
                                  (self.ws / 'inputs/revision-1.md').read_bytes())])
                self.operations([(self.store.requests / name, b'submit\n')])
                self.recorded_at = 0
                self.operations([(self.store.feedback / (name + '.json'), b'synthetic early read')], read=True)
                self.recorded_at = 2
                self.poll_and_publish()
            else:
                template_number = 2 if number == 3 else number
                self.submit(name, 'inputs/revision-' + str(template_number) + '.md')
            if revision_reads and not (premature_revision_read and number == 1):
                self.receipt_reads([name])
        if extra == 'invalid':
            self.operations([(self.store.payloads / 'new--invalid.md', b'invalid finding\n')])
            self.operations([(self.store.requests / 'new--invalid', b'submit\n')])
            self.poll_and_publish()
        elif extra == 'valid':
            self.submit('new--extra', 'inputs/07.md')
        if final_status:
            self.operations([(self.ws / 'feedback/status.json', b'synthetic status read')], read=True)
            self.store.poll()
        self.store.close()
        self.store.state['native_finalization']['binding'] = {
            'session_id': self.reader.session_id, 'journal_path': str(self.log)}
        self.put(self.store.state_path, self.store.state)
        (self.root / 'receipt-order.jsonl').write_text(
            ''.join(json.dumps(p) + '\n' for p in self.publications))
        self.put(self.root / 'native/receipt.json', {
            'session_id': self.reader.session_id, 'goal_ack': {'status': 'accepted'},
            'fresh_session': True, 'stop_reason': 'goal_complete',
            'goal_status_final': 'complete', 'model_id': 'muse-spark-1.3-contributor',
            'effort_effective': 'max', 'caps': {'seconds': 300, 'responses': 48},
            'native_responses': 1})
        self.put(self.root / 'host-receipt.json', {
            'process_exit': 0, 'error': None, 'inputs_unchanged': True,
            'structurally_complete': True,
            'idle_publication': {'polls': 1, 'publication_delta': 0,
                                 'projection_bytes_unchanged': True}})
        return target

    def report(self):
        return audit.Audit(self.root).run()

    def test_valid_plain_and_dynamic_target_identity(self):
        target = self.complete_fixture(independent_first=True)
        self.assertEqual(target, 'F0002')
        result = self.report()
        self.assertEqual(result['status'], 'pass', json.dumps(result, indent=2))
        self.assertEqual(result['checks']['allocation_and_acknowledgements']['acknowledged'], 4)
        self.assertEqual(result['checks']['template_snapshots_receipts']['snapshot_count'], 8)
        self.assertEqual(result['checks']['native_completion_proofs']['native_writes'], 8)

    def test_valid_annotated_results(self):
        self.annotated = True
        self.complete_fixture()
        result = self.report()
        self.assertEqual(result['status'], 'pass', json.dumps(result, indent=2))

    def test_valid_initial_batch_without_overlap(self):
        self.overlap = False
        self.complete_fixture()
        result = self.report()
        self.assertEqual(result['status'], 'pass', json.dumps(result, indent=2))

    def test_missing_second_revision_cannot_pass(self):
        self.complete_fixture(revisions=(1,))
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_wrong_revision_name_cannot_pass(self):
        self.complete_fixture(revisions=(1, 3))
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_wrong_revision_bytes_cannot_pass(self):
        self.complete_fixture()
        path = self.ws / 'inputs/revision-2.md'
        path.write_bytes(path.read_bytes().replace(b'OLD_WIDGET_UNITS_2', b'WRONG_WIDGET_UNITS', 1))
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_packet_hash_drift_cannot_pass(self):
        self.complete_fixture()
        path = self.ws / 'task.txt'
        path.write_bytes(path.read_bytes() + b'\nDRIFT\n')
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_missing_initial_receipt_reads_cannot_pass(self):
        self.complete_fixture(initial_reads=False)
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_premature_initial_receipt_reads_cannot_pass(self):
        self.complete_fixture(initial_reads=False, premature_initial_reads=True)
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_missing_revision_receipt_reads_cannot_pass(self):
        self.complete_fixture(revision_reads=False)
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_premature_revision_receipt_read_cannot_pass(self):
        self.complete_fixture(premature_revision_read=True)
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_extra_valid_attempt_cannot_pass(self):
        self.complete_fixture(extra='valid')
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_invalid_attempt_cannot_pass(self):
        self.complete_fixture(extra='invalid')
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_duplicate_native_write_cannot_pass(self):
        self.complete_fixture()
        path = self.store.payloads / 'new--batch-01.md'
        self.operations([(path, path.read_bytes())])
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_four_valid_records_with_protocol_fault_cannot_pass(self):
        self.complete_fixture()
        self.store.state['protocol_errors'].append('synthetic protocol fault after four records')
        self.put(self.store.state_path, self.store.state)
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_missing_final_status_read_cannot_pass(self):
        self.complete_fixture(final_status=False)
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_corrupt_current_or_history_cannot_pass(self):
        self.complete_fixture()
        for path in (self.store.archive / 'current.json', self.store.archive / 'history.json'):
            original = path.read_bytes()
            path.write_text('{}\n')
            self.assertNotEqual(self.report()['status'], 'pass')
            path.write_bytes(original)

    def test_independent_mutation_cannot_pass(self):
        self.complete_fixture()
        path = self.store.payloads / 'new--independent.md'
        path.write_bytes(path.read_bytes() + b'corruption\n')
        self.assertNotEqual(self.report()['status'], 'pass')

    def test_goal_cap_or_missing_completion_cannot_pass(self):
        self.complete_fixture()
        path = self.root / 'native/receipt.json'
        baseline = json.loads(path.read_text())
        for change in ({'stop_reason': 'time_cap'}, {'goal_status_final': 'capped'},
                       {'goal_status_final': None}, {'native_responses': 49}):
            self.put(path, {**baseline, **change})
            self.assertNotEqual(self.report()['status'], 'pass', change)


if __name__ == '__main__':
    unittest.main()
