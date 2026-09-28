"""Offline successor result regressions through the unchanged frozen Store.

Synthetic envelopes only; no native/provider/account/candidate/evaluator calls.
The original 36 interleaving tests are imported and inherited, never copied.
All Store instances use fresh temporary workspaces, never captured originals.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
FROZEN = LAB / 'ack-boundary-v1'
PINS = {
    'tools/test_ack_boundary.py': 'bac64cc0f47cfde8c30245d47f9fa5325fd1ecf98ffd0997daf8faa6a4f2db06',
    'fixtures/native_events.py': '8423ffabb9b2ded62d6b1b60933e8606b2957339cfe5102c7f2e21f856823328',
    'tools/completion_store.py': 'a1e460bd38afa2fab09d28442a7b59d2ac295aaee8921f9c127b57946c20f909',
    'tools/host_receiver.py': '3edefb29c495a642dc70748dd0a07b43cccc1493a74caee3ab7c4a855347d283',
}
for relative, digest in PINS.items():
    if hashlib.sha256((FROZEN / relative).read_bytes()).hexdigest() != digest:
        raise RuntimeError('frozen test/integration source changed: ' + relative)


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


original = load('native_results_original_tests', FROZEN / 'tools/test_ack_boundary.py')
successor = load('native_results_successor_reader', HERE / 'native_completion.py')
original.events = successor


class NativeResults(original.AckBoundaries):
    """Same fixture builder, reader-to-Store harness and all 36 frozen tests."""

    def setUp(self):
        # The frozen host uses normal imports. Bind its isolated import context
        # to the successor Feed and the *original* CompletionStore module.
        imports = patch.dict(sys.modules, {
            'native_completion': successor, 'completion_store': original.core})
        imports.start()
        self.addCleanup(imports.stop)
        super().setUp()
        self.assertIsInstance(self.reader, successor.CompletionReader)
        self.assertIs(type(self.store), original.core.CompletionStore)

    @staticmethod
    def annotation(kind):
        sibling = 'new--sibling.md' if kind == 'payload' else 'new--sibling'
        return ('; note: near-duplicate sibling ' + sibling
                + ' exists in this directory — verify this new file is intended')

    def result_pair(self, target=None, transform=lambda text: text, *,
                    failed=False, missing=False, outcome=None, result_fields=None,
                    edit_result=None, edit_terminal=None):
        name = 'new--result-boundary'
        calls = {}
        texts = {}
        for kind, path, raw in (
                ('payload', self.store.payloads / (name + '.md'), original.fixture()),
                ('marker', self.store.requests / name, b'submit\n')):
            call = self.begin(path, raw)
            calls[kind] = call
            path.write_bytes(raw)
            terminal = self.frames.terminal(
                call, path, ok=not (kind == target and failed),
                outcome=outcome if kind == target else None)
            if edit_terminal is not None and kind == target:
                edit_terminal(terminal['payload']['record'])
            self.append(terminal)
            text = f'wrote {len(raw)} bytes to {path}'
            if kind == target:
                text = transform(text)
            texts[kind] = text
            if not (kind == target and missing):
                frame = self.frames.result(call, path, raw.decode(), text=text)
                if result_fields is not None and kind == target:
                    result = frame['payload']['event']['results'][0]
                    result.update(result_fields)
                if edit_result is not None and kind == target:
                    edit_result(frame['payload']['event']['results'][0])
                self.append(frame)
        return name, calls, texts, self.store.poll()

    def no_success(self, name, summary):
        self.assertFalse(summary['complete'])
        self.assertEqual(summary['findings'], [])
        self.assertEqual(self.store.state['attempts'], [])
        self.assertFalse((self.store.feedback / (name + '.json')).exists())
        self.assertFalse(list((self.archive / 'snapshots').iterdir()))

    def interpretation(self, call):
        return self.reader.operations[call]['result_interpretation']

    def test_result_plain_success_for_both_write_roles(self):
        name, calls, texts, summary = self.result_pair()
        self.assertTrue(summary['complete'])
        self.assertEqual(self.receipt(name)['status'], 'VALID_UNVERIFIED')
        self.assertEqual(len(self.store.state['attempts']), 1)
        for kind, call in calls.items():
            interpreted = self.interpretation(call)
            self.assertEqual(interpreted['status'], 'recognized')
            self.assertEqual(interpreted['form'], 'plain')
            self.assertEqual(interpreted['raw_text'], texts[kind])
            self.assertIsNone(interpreted['advisory_text'])
            operation = self.reader.operations[call]
            self.assertEqual(interpreted['completion'], {
                'path': operation['path'], 'utf8_bytes': operation['content_bytes']})

    def test_result_annotation_works_on_payload_and_marker_separately(self):
        for kind in ('payload', 'marker'):
            with self.subTest(kind=kind):
                self.setUp()
                advisory = self.annotation(kind)
                name, calls, texts, summary = self.result_pair(
                    kind, lambda text: text + advisory)
                self.assertTrue(summary['complete'])
                self.assertEqual(self.receipt(name)['status'], 'VALID_UNVERIFIED')
                interpreted = self.interpretation(calls[kind])
                self.assertEqual(interpreted['status'], 'recognized')
                self.assertEqual(interpreted['form'], 'near_duplicate_sibling')
                self.assertEqual(interpreted['raw_text'], texts[kind])
                self.assertEqual(interpreted['advisory_text'], advisory)
                self.assertEqual((self.archive / self.receipt(name)['snapshot']).read_bytes(),
                                 original.fixture())
                self.assertEqual((self.archive / self.store.state['attempts'][0]['marker_snapshot']).read_bytes(),
                                 b'submit\n')

    def test_result_annotation_on_both_roles_retained_verbatim_through_close(self):
        # Override only result text, leaving every original fixture lifecycle
        # and the unchanged Store's snapshot-before-ack path in use.
        original_result = self.frames.result
        expected = {}
        def annotated(call, path=None, content=None, **kwargs):
            frame = original_result(call, path, content, **kwargs)
            kind = 'payload' if Path(path).parent == self.store.payloads else 'marker'
            result = frame['payload']['event']['results'][0]
            result['text'] += self.annotation(kind)
            expected[call] = result['text']
            return frame
        with patch.object(self.frames, 'result', annotated):
            summary = self.submit('new--both-annotated')
        self.assertTrue(summary['complete'])
        receipt_path = self.store.feedback / 'new--both-annotated.json'
        receipt_bytes = receipt_path.read_bytes()
        self.store.close()
        disk = json.loads(self.store.state_path.read_text())
        for operation in disk['native_operations']:
            kind = 'payload' if Path(operation['path']).parent == self.store.payloads else 'marker'
            interpreted = operation['result_interpretation']
            self.assertEqual(interpreted['raw_text'], expected[operation['call_id']])
            self.assertEqual(interpreted['advisory_text'], self.annotation(kind))
            in_proof = disk['attempts'][0]['completion_proof'][kind]['result_interpretation']
            self.assertEqual(in_proof, interpreted)
        self.assertEqual(receipt_path.read_bytes(), receipt_bytes)
        self.assertEqual(len(disk['attempts']), 1)

    def test_result_recognized_count_path_and_prefix_lookalikes_fault(self):
        variants = {
            'wrongcount': lambda text: text.replace('wrote ', 'wrote 9', 1),
            'wrongpath': lambda text: text.rsplit('/', 1)[0] + '/wrong-name',
            'pathprefixlookalike': lambda text: text + '.other',
        }
        for kind in ('payload', 'marker'):
            for label, transform in variants.items():
                for annotation in (False, True):
                    with self.subTest(kind=kind, variant=label, annotation=annotation):
                        self.setUp()
                        def changed(text):
                            return transform(text) + (self.annotation(kind) if annotation else '')
                        name, calls, texts, summary = self.result_pair(kind, changed)
                        self.no_success(name, summary)
                        self.assertTrue(self.reader.fault)
                        self.assertEqual(self.reader.proof_for(self.reader.operations[calls[kind]]['path'])['status'], 'fault')
                        interpreted = self.interpretation(calls[kind])
                        self.assertEqual(interpreted['status'], 'mismatch')
                        self.assertEqual(interpreted['raw_text'], texts[kind])

    def test_result_arbitrary_suffix_error_and_unknown_shapes_are_unrecognized(self):
        variants = {
            'arbitrarysuffix': lambda text: text + '; anything at all',
            'error_suffix': lambda text: text + '; error: write failed',
            'conflicting_suffix': lambda text: text + '; status: failed',
            'different_advisory': lambda text: text + '; note: another kind of warning',
            'trailing_after_advisory': lambda text: text + self.annotation('payload') + '; extra',
            'sibling_path': lambda text: text + self.annotation('payload').replace('new--sibling.md', 'other/new--sibling.md'),
            'advisory_wrong_punctuation': lambda text: text + self.annotation('payload').replace(' — ', ' - '),
            'missing_boundary': lambda text: text + ' note: near-duplicate sibling sibling exists in this directory — verify this new file is intended',
            'leading_prose': lambda text: 'success: ' + text,
            'embedded_success': lambda text: 'error then ' + text,
            'trailing_newline': lambda text: text + '\n',
            'unknown_prose': lambda text: 'Write completed normally',
            'non_string': lambda text: {'message': text},
        }
        for kind in ('payload', 'marker'):
            for label, transform in variants.items():
                with self.subTest(kind=kind, variant=label):
                    self.setUp()
                    name, calls, texts, summary = self.result_pair(kind, transform)
                    self.no_success(name, summary)
                    self.assertIsNone(self.reader.fault)
                    operation = self.reader.operations[calls[kind]]
                    self.assertEqual(operation['status'], 'unrecognized')
                    interpreted = self.interpretation(calls[kind])
                    self.assertEqual(interpreted['status'], 'unrecognized')
                    self.assertEqual(interpreted['raw_text'], texts[kind])
                    self.assertIsNone(interpreted['completion'])
                    self.assertEqual(self.reader.pair_proof(
                        self.store.payloads / (name + '.md'), self.store.requests / name)['status'], 'unrecognized')
                    closed = self.store.close()
                    self.assertFalse(closed['complete'])
                    self.assertEqual(self.store.state['native_finalization']['status'], 'incomplete')

    def test_result_missing_text_is_unrecognized_and_retained(self):
        for kind in ('payload', 'marker'):
            with self.subTest(kind=kind):
                self.setUp()
                name, calls, texts, summary = self.result_pair(kind, result_fields={'text': None})
                self.no_success(name, summary)
                self.assertIsNone(self.reader.fault)
                self.assertEqual(self.interpretation(calls[kind])['status'], 'unrecognized')
                self.assertIsNone(self.interpretation(calls[kind])['raw_text'])

    def test_result_extra_status_error_and_unknown_fields_are_not_success(self):
        for kind in ('payload', 'marker'):
            for fields in ({'status': 'failed'}, {'error': 'synthetic failure'},
                           {'ok': True}, {'advisory': 'separate invented field'},
                           {'completion': {'path': '/invented'}}):
                with self.subTest(kind=kind, fields=fields):
                    self.setUp()
                    name, calls, texts, summary = self.result_pair(
                        kind, lambda text: text + self.annotation(kind), result_fields=fields)
                    self.no_success(name, summary)
                    self.assertIsNone(self.reader.fault)
                    operation = self.reader.operations[calls[kind]]
                    self.assertEqual(operation['status'], 'unrecognized')
                    self.assertEqual(self.interpretation(calls[kind])['status'], 'unrecognized')
                    self.assertEqual(operation['native_result'], {
                        'tool_call_id': calls[kind], 'tool_call_index': 0,
                        'text': texts[kind], **fields})
                    self.assertFalse(self.store.close()['complete'])
                    self.assertEqual(self.store.state['native_finalization']['status'], 'incomplete')

    def test_result_missing_or_wrong_correlation_identity_faults(self):
        edits = {
            'missing_call': lambda result: result.pop('tool_call_id'),
            'wrong_call': lambda result: result.update(tool_call_id='never-called'),
            'missing_index': lambda result: result.pop('tool_call_index'),
            'wrong_index': lambda result: result.update(tool_call_index=42),
        }
        for kind in ('payload', 'marker'):
            for label, edit in edits.items():
                with self.subTest(kind=kind, edit=label):
                    self.setUp()
                    name, calls, texts, summary = self.result_pair(
                        kind, lambda text: text + self.annotation(kind), edit_result=edit)
                    self.no_success(name, summary)
                    self.assertTrue(self.reader.fault)

    def test_result_annotated_snapshot_and_state_exist_before_ack(self):
        name = 'new--annotated-order'
        seen = []
        real_write_json = original.core.write_json
        def observe(path, value):
            if Path(path).name == name + '.json':
                attempt = self.store.state['attempts'][0]
                disk = json.loads(self.store.state_path.read_text())
                self.assertEqual(disk['attempts'][0], attempt)
                for kind, field, expected in (
                        ('payload', 'snapshot', original.fixture()),
                        ('marker', 'marker_snapshot', b'submit\n')):
                    self.assertEqual((self.archive / attempt[field]).read_bytes(), expected)
                    interpreted = attempt['completion_proof'][kind]['result_interpretation']
                    self.assertEqual(interpreted['status'], 'recognized')
                    self.assertEqual(interpreted['advisory_text'], self.annotation(kind))
                self.assertFalse(Path(path).exists())
                seen.append(True)
            return real_write_json(path, value)
        real_result = self.frames.result
        def annotate(call, path=None, content=None, **kwargs):
            frame = real_result(call, path, content, **kwargs)
            kind = 'payload' if Path(path).parent == self.store.payloads else 'marker'
            frame['payload']['event']['results'][0]['text'] += self.annotation(kind)
            return frame
        with patch.object(original.core, 'write_json', observe), patch.object(self.frames, 'result', annotate):
            summary = self.submit(name)
        self.assertTrue(summary['complete'])
        self.assertEqual(seen, [True])

    def test_result_annotation_cannot_override_terminal_effect_task_identity(self):
        edits = {
            'effect': lambda record: record.update(effect_id='never-started-effect'),
            'task': lambda record: record.update(task_id='never-started-task'),
            'task_stream': lambda record: record.update(task_stream={'kind': 'task', 'id': 'never-started-task'}),
        }
        for kind in ('payload', 'marker'):
            for label, edit in edits.items():
                with self.subTest(kind=kind, identity=label):
                    self.setUp()
                    name, calls, texts, summary = self.result_pair(
                        kind, lambda text: text + self.annotation(kind), edit_terminal=edit)
                    self.no_success(name, summary)
                    self.assertTrue(self.reader.fault)

    def test_result_failed_terminal_cannot_be_blessed_by_either_success_form(self):
        for kind in ('payload', 'marker'):
            for annotation in (False, True):
                with self.subTest(kind=kind, annotation=annotation):
                    self.setUp()
                    name, calls, texts, summary = self.result_pair(
                        kind, lambda text: text + (self.annotation(kind) if annotation else ''), failed=True)
                    self.no_success(name, summary)
                    self.assertEqual(self.reader.operations[calls[kind]]['status'], 'failed')
                    self.assertEqual(self.interpretation(calls[kind])['status'], 'recognized')
                    self.assertEqual(self.interpretation(calls[kind])['raw_text'], texts[kind])

    def test_result_contradictory_terminal_status_remains_failed(self):
        for kind in ('payload', 'marker'):
            with self.subTest(kind=kind):
                self.setUp()
                outcome = {'kind': 'completed', 'output_ref_count': 1,
                           'task_completion': {'kind': 'failed'}}
                name, calls, texts, summary = self.result_pair(
                    kind, lambda text: text + self.annotation(kind), outcome=outcome)
                self.no_success(name, summary)
                self.assertEqual(self.reader.operations[calls[kind]]['status'], 'failed')

    def test_result_missing_result_event_keeps_both_roles_pending(self):
        for kind in ('payload', 'marker'):
            with self.subTest(kind=kind):
                self.setUp()
                name, calls, texts, summary = self.result_pair(kind, missing=True)
                self.no_success(name, summary)
                self.assertEqual(self.reader.operations[calls[kind]]['status'], 'pending')
                self.assertFalse(self.store.close()['complete'])
                self.assertEqual(self.store.state['native_finalization']['status'], 'incomplete')

    def test_result_success_prose_cannot_bless_actual_bytes_mismatch(self):
        for kind in ('payload', 'marker'):
            with self.subTest(kind=kind):
                self.setUp()
                name = 'new--bytes-mismatch'
                paths = {'payload': self.store.payloads / (name + '.md'),
                         'marker': self.store.requests / name}
                expected = {'payload': original.fixture(), 'marker': b'submit\n'}
                changed = b'X' + expected[kind][1:]  # Same length, different hash.
                for role in ('payload', 'marker'):
                    path, raw = paths[role], expected[role]
                    call = self.begin(path, raw)
                    path.write_bytes(changed if role == kind else raw)
                    self.append(self.frames.terminal(call, path))
                    self.append(self.frames.result(call, path, raw.decode(), text=(
                        f'wrote {len(raw)} bytes to {path}' + self.annotation(role))))
                summary = self.store.poll()
                self.assertFalse(summary['complete'])
                self.assertEqual(summary['findings'], [])
                self.assertIsNone(self.reader.fault)
                self.assertEqual(self.receipt(name)['status'], 'INVALID')
                self.assertIn(kind + ' bytes differ from completed native Write arguments',
                              self.receipt(name)['diagnostics'])
                attempt = self.store.state['attempts'][0]
                snapshot = attempt['snapshot' if kind == 'payload' else 'marker_snapshot']
                self.assertEqual((self.archive / snapshot).read_bytes(), changed)

    def test_result_annotation_does_not_hide_true_mutation_after_ack(self):
        for kind in ('payload', 'marker'):
            with self.subTest(kind=kind):
                self.setUp()
                name, calls, texts, summary = self.result_pair(
                    kind, lambda text: text + self.annotation(kind))
                self.assertTrue(summary['complete'])
                path = Path(self.reader.operations[calls[kind]]['path'])
                before = path.read_bytes()
                path.write_bytes(b'X' + before[1:])
                self.assertTrue(self.store.poll()['protocol_errors'])
                path.write_bytes(before)
                restored = self.store.poll()
                self.assertFalse(restored['complete'])
                self.assertEqual(restored['findings'], [])
                self.assertTrue(self.store.state['attempts'][0]['invalidated'])

    def test_result_identical_annotated_duplicates_do_not_duplicate_receipts(self):
        for kind in ('payload', 'marker'):
            with self.subTest(kind=kind):
                self.setUp()
                name, calls, texts, summary = self.result_pair(
                    kind, lambda text: text + self.annotation(kind))
                self.assertTrue(summary['complete'])
                call = calls[kind]
                path = Path(self.reader.operations[call]['path'])
                self.append(self.frames.terminal(call, path), self.frames.result(call, path, text=texts[kind]))
                again = self.store.poll()
                self.assertTrue(again['complete'])
                self.assertEqual(len(self.store.state['attempts']), 1)
                self.assertEqual(len(list(self.store.feedback.glob('new--*.json'))), 1)
                self.assertEqual(len(list((self.archive / 'snapshots').iterdir())), 2)

    def test_result_conflicting_annotation_notification_faults_and_withholds(self):
        for kind in ('payload', 'marker'):
            with self.subTest(kind=kind):
                self.setUp()
                name, calls, texts, summary = self.result_pair(
                    kind, lambda text: text + self.annotation(kind))
                self.assertTrue(summary['complete'])
                call = calls[kind]
                path = Path(self.reader.operations[call]['path'])
                changed = texts[kind].replace('new--sibling', 'new--other-sibling')
                self.append(self.frames.result(call, path, text=changed))
                faulted = self.store.poll()
                self.assertTrue(self.reader.fault)
                self.assertIn('conflicting native result', self.reader.fault)
                self.assertFalse(faulted['complete'])
                self.assertEqual(faulted['findings'], [])
                self.assertEqual(len(self.store.state['attempts']), 1)
                self.assertTrue(self.store.state['attempts'][0]['invalidated'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
