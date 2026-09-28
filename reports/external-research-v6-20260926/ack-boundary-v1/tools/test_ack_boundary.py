"""Bounded offline ack tests; synthetic native-shaped frames, never inference.

The filesystem producer is deterministically suspended with its write handle open.
Only the actual CompletionReader -> CompletionStore connection acknowledges it.
These minimized derivative fixtures prove host interleavings, not native execution.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import shutil
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
FIXTURES = LAB / 'delivery-v2/fixtures'
PINS = {
    'valid': '9d8f35727b840877d37bd2dc774e81455a0319206e41f40e109ce4d2ea40758a',
    'revision': '2a0a251c8c560c2eedd798fff94763390c19b67ff3cfcb9309aa1f0045ae4412',
    'unknown-field': '149191f20e9e6b629cbf872ec08899666b3127e1a6195fa977a49bb4e7c3a2fb',
    'malformed': 'a31a465a3cd85c91c65089a5f132684df92db446748d8f4d1219ec80d5b91a03',
}


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


core = load('ack_store_under_test', HERE / 'completion_store.py')
events = load('ack_events_under_test', HERE / 'native_completion.py')
synthetic = load('ack_synthetic_native_fixtures', HERE.parent / 'fixtures/native_events.py')


def fixture(name='valid'):
    raw = (FIXTURES / (name + '.md')).read_bytes()
    if hashlib.sha256(raw).hexdigest() != PINS[name]:
        raise AssertionError('frozen structural fixture changed: ' + name)
    return raw


class AckBoundaries(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='ack-offline-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.ws, self.archive = self.root / 'ws', self.root / 'archive'
        self.log = self.root / 'native.jsonl'
        self.log.touch()
        self.session = 'synthetic-session'
        self.frames = synthetic.FixtureStream(session_id=self.session, workspace_root=self.ws)
        self.reader = events.CompletionReader(self.log, session_id=self.session, workspace_root=self.ws)
        self.store = core.CompletionStore(self.ws, self.archive, self.reader)
        self.counter = 0
        trace_dir = os.environ.get('ACK_BOUNDARY_TEST_EVIDENCE')
        if trace_dir:
            destination = Path(trace_dir) / (self._testMethodName + '-' + self.root.name)
            self.addCleanup(lambda source=self.root, target=destination: shutil.copytree(source, target))

    def append(self, *frames):
        with self.log.open('ab') as stream:
            for frame in frames:
                stream.write(self.frames.encode(frame))

    def begin(self, path, raw):
        self.counter += 1
        call = 'synthetic-write-' + str(self.counter)
        self.append(self.frames.call(call, path, raw.decode()), self.frames.start(call, path))
        return call

    def finish(self, call, path, raw, *, ok=True):
        self.append(self.frames.terminal(call, path, ok=ok))
        if ok:
            self.append(self.frames.result(call, path, raw.decode()))

    def write(self, path, raw):
        call = self.begin(path, raw)
        path.write_bytes(raw)
        self.finish(call, path, raw)
        return call

    def submit(self, name, raw=None, marker=b'submit\n'):
        if raw is None:
            raw = fixture()
        self.write(self.store.payloads / (name + '.md'), raw)
        self.write(self.store.requests / name, marker)
        return self.store.poll()

    def receipt(self, name):
        return json.loads((self.store.feedback / (name + '.json')).read_text())

    def current(self):
        return (self.archive / 'current.md').read_text()

    def assert_pending(self, name):
        self.assertFalse((self.store.feedback / (name + '.json')).exists())
        self.assertNotIn(name, {a['request'] for a in self.store.state['attempts']})
        self.assertTrue(self.store.state['pending_submissions'])
        self.assertFalse(self.store.summary()['complete'])

    def test_empty_and_partial_marker_stay_pending_for_unbounded_logical_time(self):
        for prefix in (b'', b'sub'):
            with self.subTest(prefix=prefix):
                name = 'new--paused-' + str(len(prefix))
                raw = fixture()
                self.write(self.store.payloads / (name + '.md'), raw)
                path = self.store.requests / name
                call = self.begin(path, b'submit\n')
                # Consumer polls during one producer operation, before positive completion.
                with path.open('wb') as producer:
                    producer.write(prefix)
                    producer.flush()
                    for instant in (0, 1, 10**6, 10**12):
                        with patch('time.monotonic', return_value=instant), patch('time.time', return_value=instant):
                            summary = self.store.poll()
                        self.assert_pending(name)
                        self.assertFalse(summary['protocol_errors'])
                    producer.write(b'submit\n'[len(prefix):])
                    producer.flush()
                self.store.poll()
                self.assert_pending(name)  # Completed-looking bytes alone still prove nothing.
                self.finish(call, path, b'submit\n')
                summary = self.store.poll()
                self.assertEqual(self.receipt(name)['status'], 'VALID_UNVERIFIED')
                self.assertFalse(summary['protocol_errors'])
        self.assertEqual(len(self.store.state['attempts']), 2)
        self.assertEqual(len(self.store.state['native_operations']), 4)

    def test_six_overlapping_markers_independent_and_multiple_revisions(self):
        producers = []
        for index in range(6):
            name = 'new--batch-' + str(index)
            self.write(self.store.payloads / (name + '.md'), fixture())
            path = self.store.requests / name
            call = self.begin(path, b'submit\n')
            producer = path.open('wb')
            producer.write(b'sub' if index % 2 else b'')
            producer.flush()
            self.addCleanup(producer.close)
            producers.append((name, path, call, producer, index % 2))
        self.store.poll()
        self.assertEqual(self.store.state['attempts'], [])
        self.assertEqual(len(self.store.state['native_operations']), 12)
        self.submit('new--independent', fixture().replace(b'OLD_WIDGET_UNITS_2', b'INDEPENDENT_CURRENT'))
        self.assertEqual(self.receipt('new--independent')['finding_id'], 'F0001')
        for index in (4, 1, 5, 0, 3, 2):
            name, path, call, producer, partial = producers[index]
            producer.write(b'mit\n' if partial else b'submit\n')
            producer.close()
            self.store.poll()
            self.assert_pending(name)
            self.finish(call, path, b'submit\n')
            self.store.poll()
        self.submit('F0001--revision', fixture('revision'))
        second = fixture('revision').replace(b'NEW_WIDGET_UNITS_3', b'NEW_WIDGET_UNITS_4')
        summary = self.submit('F0001--revision-again', second)
        self.assertTrue(summary['complete'])
        self.assertFalse(summary['protocol_errors'])
        self.assertEqual(len(self.store.state['attempts']), 9)
        self.assertEqual(len(self.store.state['native_operations']), 18)
        self.assertEqual([a['revision'] for a in self.store.state['attempts'] if a['finding_id'] == 'F0001'], [1, 2, 3])
        self.assertEqual(len(summary['findings']), 7)
        self.assertIn('NEW_WIDGET_UNITS_4', self.current())
        self.assertNotIn('INDEPENDENT_CURRENT', self.current())
        history = json.loads((self.archive / 'history.json').read_text())['attempts']
        self.assertEqual(len(history), 9)
        self.assertIn('INDEPENDENT_CURRENT', json.dumps(history))

    def test_payload_before_marker_completion_order_is_required(self):
        name = 'new--outoforder'
        payload = self.store.payloads / (name + '.md')
        pcall = self.begin(payload, fixture())
        payload.write_bytes(fixture())
        self.write(self.store.requests / name, b'submit\n')
        self.finish(pcall, payload, fixture())
        self.store.poll()
        self.assert_pending(name)
        closed = self.store.close(reason='completed')
        self.assertFalse(closed['complete'])
        self.assertEqual(self.store.state['attempts'], [])

    def test_completed_invalid_bytes_are_snapshotted_and_acknowledged_invalid(self):
        cases = [(fixture(), b''), (fixture(), b'submit'), (b'', b'submit\n'),
                 (fixture('malformed'), b'submit\n'), (fixture('unknown-field'), b'submit\n')]
        for index, (raw, marker) in enumerate(cases):
            name = 'new--invalid-' + str(index)
            summary = self.submit(name, raw, marker)
            receipt = self.receipt(name)
            self.assertEqual(receipt['status'], 'INVALID')
            self.assertTrue(receipt['diagnostics'])
            self.assertFalse(summary['complete'])
            self.assertEqual((self.archive / receipt['snapshot']).read_bytes(), raw)
            attempt = self.store.state['attempts'][-1]
            self.assertEqual((self.archive / attempt['marker_snapshot']).read_bytes(), marker)
        self.assertEqual(len(self.store.state['attempts']), len(cases))

    def test_snapshots_and_persistent_state_exist_before_receipt(self):
        name = 'new--ordered'
        original = core.write_json
        observed = []
        def checked(path, value):
            if path == self.store.feedback / (name + '.json'):
                attempt = self.store.state['attempts'][-1]
                self.assertEqual((self.archive / value['snapshot']).read_bytes(), fixture())
                self.assertEqual((self.archive / attempt['marker_snapshot']).read_bytes(), b'submit\n')
                persistent = json.loads(self.store.state_path.read_text())
                self.assertEqual(persistent['attempts'][-1]['raw_sha256'], value['raw_sha256'])
                observed.append(True)
            return original(path, value)
        with patch.object(core, 'write_json', checked):
            self.submit(name)
        self.assertEqual(observed, [True])

    def test_invalid_latest_withholds_prior_without_affecting_independent(self):
        self.submit('new--alpha')
        self.submit('new--beta', fixture().replace(b'OLD_WIDGET_UNITS_2', b'INDEPENDENT_CURRENT'))
        summary = self.submit('F0001--bad', fixture('unknown-field'))
        self.assertEqual({f['id'] for f in summary['findings']}, {'F0002'})
        self.assertFalse(summary['complete'])
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())
        self.assertIn('INDEPENDENT_CURRENT', self.current())
        self.assertEqual(self.receipt('F0001--bad')['status'], 'INVALID')
        fixed = self.submit('F0001--fixed', fixture('revision'))
        self.assertTrue(fixed['complete'])
        self.assertEqual({f['id'] for f in fixed['findings']}, {'F0001', 'F0002'})

    def test_pending_latest_withholds_prior_without_fabricated_receipt(self):
        self.submit('new--alpha')
        self.submit('new--beta', fixture().replace(b'OLD_WIDGET_UNITS_2', b'INDEPENDENT_CURRENT'))
        name = 'F0001--pending'
        self.write(self.store.payloads / (name + '.md'), fixture('revision'))
        path = self.store.requests / name
        self.begin(path, b'submit\n')
        path.write_bytes(b'sub')
        summary = self.store.poll()
        self.assert_pending(name)
        self.assertEqual({f['id'] for f in summary['findings']}, {'F0002'})
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())
        self.assertIn('INDEPENDENT_CURRENT', self.current())

    def test_true_source_mutation_stays_latched_after_restore(self):
        for kind in ('payload', 'marker'):
            with self.subTest(kind=kind):
                name = 'new--mutation-' + kind
                self.submit(name)
                path = self.store.payloads / (name + '.md') if kind == 'payload' else self.store.requests / name
                original = path.read_bytes()
                path.write_bytes(b'actual postaccept corruption\n')
                summary = self.store.poll()
                self.assertFalse(summary['complete'])
                self.assertTrue(summary['protocol_errors'])
                path.write_bytes(original)
                restored = self.store.poll()
                self.assertTrue(restored['protocol_errors'])
                self.assertNotIn(self.receipt(name)['finding_id'], {f['id'] for f in restored['findings']})

    def test_snapshot_corruption_is_detected_without_reconstruction(self):
        self.submit('new--alpha')
        self.submit('F0001--revision', fixture('revision'))
        attempt = self.store.state['attempts'][0]
        for field in ('snapshot', 'marker_snapshot'):
            snapshot = self.archive / attempt[field]
            snapshot.chmod(0o644)
            snapshot.write_bytes(b'genuine synthetic historical corruption\n')
        summary = self.store.poll()
        self.assertFalse(summary['complete'])
        self.assertTrue(summary['missing_or_corrupt_snapshots'])
        self.assertIn('NEW_WIDGET_UNITS_3', self.current())
        closed = self.store.close()
        self.assertFalse(closed['complete'])
        self.assertEqual((self.archive / attempt['snapshot']).read_bytes(), b'genuine synthetic historical corruption\n')

    def test_current_snapshot_corruption_withholds_current(self):
        self.submit('new--alpha')
        snapshot = self.archive / self.receipt('new--alpha')['snapshot']
        snapshot.chmod(0o644)
        snapshot.write_bytes(b'synthetic corrupt latest snapshot\n')
        summary = self.store.poll()
        self.assertEqual(summary['findings'], [])
        self.assertTrue(summary['missing_or_corrupt_snapshots'])
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())

    def test_idle_polls_do_not_rewrite_five_projections_and_still_detect_mutation(self):
        self.submit('new--alpha')
        original = Path.write_text
        writes = []
        def tracked(path, *args, **kwargs):
            writes.append(str(path))
            return original(path, *args, **kwargs)
        with patch.object(Path, 'write_text', tracked):
            for _ in range(20):
                self.assertTrue(self.store.poll()['complete'])
            self.assertEqual(writes, [])
            (self.store.requests / 'new--alpha').write_bytes(b'changed\n')
            self.assertFalse(self.store.poll()['complete'])
            self.assertTrue(writes)
            writes.clear()
            for _ in range(20):
                self.store.poll()
            self.assertEqual(writes, [])
        self.assertFalse(self.store.close()['complete'])

    def test_failed_native_write_and_missing_terminal_keep_attempts_visible(self):
        for label in ('failed', 'missing-terminal', 'missing-result'):
            name = 'new--' + label
            self.write(self.store.payloads / (name + '.md'), fixture())
            path = self.store.requests / name
            call = self.begin(path, b'submit\n')
            path.write_bytes(b'sub')
            if label == 'failed':
                self.finish(call, path, b'submit\n', ok=False)
            elif label == 'missing-result':
                self.append(self.frames.terminal(call, path))
            self.store.poll()
            self.assert_pending(name)
            pending = self.store.state['pending_submissions'][name]
            self.assertEqual(pending['status'], 'failed' if label == 'failed' else 'pending')
        self.assertEqual(len(self.store.state['native_operations']), 6)
        closed = self.store.close(reason='cap')
        self.assertFalse(closed['complete'])
        self.assertEqual(self.store.state['attempts'], [])
        archived = [p.read_bytes() for p in self.archive.rglob('*') if p.is_file() and p.suffix not in ('.json', '.md')]
        self.assertGreaterEqual(archived.count(b'sub'), 3)
        self.assertEqual(len(self.store.state['native_operations']), 6)
        self.assertFalse(any(self.store.feedback.glob('new--*.json')))
        statuses = {op['call_id']: op['status'] for op in self.store.state['native_finalization']['operations']}
        self.assertEqual(statuses['synthetic-write-2'], 'failed')
        self.assertEqual(statuses['synthetic-write-4'], 'incomplete')
        self.assertEqual(statuses['synthetic-write-6'], 'incomplete')

    def test_cap_and_cancellation_preserve_raw_pending_without_completion(self):
        # Each reason gets an isolated receiver; neither infers terminal success.
        for reason in ('cap', 'cancelled'):
            with self.subTest(reason=reason):
                self.setUp()
                name = 'new--pending'
                raw = b'SYNTHETIC_PARTIAL_PAYLOAD_ONLY\n'
                payload = self.store.payloads / (name + '.md')
                self.begin(payload, fixture())
                payload.write_bytes(raw)
                marker = self.store.requests / name
                self.begin(marker, b'submit\n')
                marker.write_bytes(b'sub')
                self.store.poll()
                self.assert_pending(name)
                closed = self.store.close(reason=reason)
                self.assertFalse(closed['complete'])
                self.assertTrue(self.store.state['closed'])
                self.assertEqual(self.store.state['attempts'], [])
                self.assertEqual(len(self.store.state['native_operations']), 2)
                preserved = [p.read_bytes() for p in self.archive.rglob('*') if p.is_file()]
                self.assertIn(raw, preserved)
                self.assertIn(b'sub', preserved)
                self.assertNotIn(raw.decode().strip(), self.current())
                frozen = self.store.state_path.read_bytes()
                self.finish('synthetic-write-2', marker, b'submit\n')
                with self.assertRaises(core.StructuralError):
                    self.store.poll()
                self.assertEqual(self.store.state_path.read_bytes(), frozen)
                self.assertFalse((self.store.feedback / (name + '.json')).exists())

    def test_duplicate_success_notifications_do_not_duplicate_acknowledgement(self):
        name = 'new--duplicate'
        payload = self.store.payloads / (name + '.md')
        self.write(payload, fixture())
        path = self.store.requests / name
        call = self.write(path, b'submit\n')
        self.store.poll()
        self.append(self.frames.terminal(call, path), self.frames.result(call, path, 'submit\n'))
        summary = self.store.poll()
        self.assertTrue(summary['complete'])
        self.assertEqual(len(self.store.state['attempts']), 1)
        self.assertEqual(len(self.store.state['native_operations']), 2)
        self.assertEqual(self.receipt(name)['sequence'], 1)

    def test_wrong_session_call_and_path_notifications_cannot_commit(self):
        for kind in ('session', 'call', 'path'):
            with self.subTest(kind=kind):
                self.setUp()
                name = 'new--misbound'
                self.write(self.store.payloads / (name + '.md'), fixture())
                path = self.store.requests / name
                call = self.begin(path, b'submit\n')
                path.write_bytes(b'submit\n')
                terminal = self.frames.terminal(call, path)
                if kind == 'session':
                    terminal['stream']['id'] = 'wrong-session'
                elif kind == 'call':
                    terminal['payload']['record']['call_id'] = 'wrong-call'
                self.append(terminal)
                result_path = self.store.requests / 'new--wrongpath' if kind == 'path' else path
                self.append(self.frames.result(call, result_path, 'submit\n'))
                summary = self.store.poll()
                self.assert_pending(name)
                self.assertFalse(summary['complete'])
                self.assertEqual(self.store.state['attempts'], [])
                self.assertTrue(self.reader.fault)
                self.store.close(reason='completed')
                self.assertFalse((self.store.feedback / (name + '.json')).exists())

    def test_reader_partial_lines_are_carried_without_reparsing_old_records(self):
        name = 'new--partial-frame'
        self.write(self.store.payloads / (name + '.md'), fixture())
        path = self.store.requests / name
        call = self.begin(path, b'submit\n')
        path.write_bytes(b'submit\n')
        self.append(self.frames.terminal(call, path))
        self.store.poll()
        self.assert_pending(name)
        line = self.frames.encode(self.frames.result(call, path, 'submit\n'))
        cut = len(line) // 2
        with self.log.open('ab') as stream:
            stream.write(line[:cut])
        self.store.poll()
        parsed = self.reader.lines_parsed
        read = self.reader.bytes_read
        for _ in range(10):
            self.store.poll()
        self.assertEqual(self.reader.lines_parsed, parsed)
        self.assertEqual(self.reader.bytes_read, read)
        self.assert_pending(name)
        with self.log.open('ab') as stream:
            stream.write(line[cut:])
        summary = self.store.poll()
        self.assertTrue(summary['complete'])
        self.assertEqual(self.reader.lines_parsed, parsed + 1)
        self.assertEqual(self.reader.bytes_read, read + len(line) - cut)
        self.assertEqual(self.reader.bytes_read, self.log.stat().st_size)
        self.assertEqual(self.reader.lines_parsed, self.log.read_bytes().count(b'\n'))
        self.assertEqual(len(self.store.state['attempts']), 1)

    def test_unterminated_final_event_is_preserved_and_cannot_complete(self):
        name = 'new--unterminated'
        self.write(self.store.payloads / (name + '.md'), fixture())
        path = self.store.requests / name
        call = self.begin(path, b'submit\n')
        path.write_bytes(b'submit\n')
        self.append(self.frames.terminal(call, path))
        line = self.frames.encode(self.frames.result(call, path, 'submit\n'))
        with self.log.open('ab') as stream:
            stream.write(line[:-1])
        self.store.poll()
        self.assert_pending(name)
        self.store.close(reason='cap')
        self.assertTrue(self.reader.fault)
        self.assertEqual(self.store.state['attempts'], [])
        self.assertEqual(self.log.read_bytes()[-len(line) + 1:], line[:-1])

    def test_actual_msp_binding_feed_connects_receiver_without_inference(self):
        msp = self.root / 'msp.jsonl'
        msp.touch()
        feed = events.MuseCompletionFeed(msp, workspace_root=self.ws)
        self.archive = self.root / 'msp-archive'
        self.store = core.CompletionStore(self.ws, self.archive, feed)
        name = 'new--msp-binding'
        self.write(self.store.payloads / (name + '.md'), fixture())
        self.write(self.store.requests / name, b'submit\n')
        self.store.poll()
        self.assert_pending(name)
        line = self.frames.encode(self.frames.session_start(self.log))
        with msp.open('ab') as stream:
            stream.write(line[:len(line)//2])
        self.store.poll()
        self.assert_pending(name)
        for _ in range(5):
            self.store.poll()
            self.assert_pending(name)
        with msp.open('ab') as stream:
            stream.write(line[len(line)//2:])
        summary = self.store.poll()
        self.assertTrue(summary['complete'])
        self.assertEqual(self.receipt(name)['status'], 'VALID_UNVERIFIED')
        self.assertEqual(len(self.store.state['native_operations']), 2)
        self.assertEqual(feed.poll()['binding']['session_id'], self.session)
        self.assertEqual(feed.poll()['binding']['journal_path'], str(self.log))

    def test_failed_operation_without_visible_file_remains_counted(self):
        name = 'new--failed-no-file'
        payload = self.store.payloads / (name + '.md')
        call = self.begin(payload, fixture())
        self.finish(call, payload, fixture(), ok=False)
        self.store.poll()
        self.assert_pending(name)
        self.assertEqual(len(self.store.state['native_operations']), 1)
        self.assertEqual(self.store.state['pending_submissions'][name]['status'], 'failed')
        self.store.close(reason='completed')
        pending = self.store.state['pending_submissions'][name]
        self.assertIn('unavailable', pending['retained_evidence']['payload'])
        self.assertEqual(self.store.state['attempts'], [])
        self.assertEqual(self.store.state['native_finalization']['native_attempts'], 1)

    def test_close_checks_frozen_projection_integrity(self):
        self.submit('new--alpha')
        (self.archive / 'current.json').write_bytes(b'corrupted synthetic projection\n')
        summary = self.store.close()
        self.assertFalse(summary['complete'])
        self.assertTrue(any('published artifact changed' in error for error in summary['protocol_errors']))

    def test_event_appends_read_only_new_suffix(self):
        name = 'new--incremental-io'
        path = self.store.payloads / (name + '.md')
        call = self.begin(path, fixture())
        path.write_bytes(fixture())
        self.store.poll()
        old_size = self.log.stat().st_size
        self.finish(call, path, fixture())
        new_bytes = self.log.stat().st_size - old_size
        original = Path.open
        reads = []
        class ObservedFile:
            def __init__(wrapped, stream):
                wrapped.stream = stream
            def __enter__(wrapped):
                wrapped.stream.__enter__()
                return wrapped
            def __exit__(wrapped, *args):
                return wrapped.stream.__exit__(*args)
            def __getattr__(wrapped, key):
                return getattr(wrapped.stream, key)
            def read(wrapped, size=-1):
                offset = wrapped.stream.tell()
                raw = wrapped.stream.read(size)
                reads.append((offset, len(raw)))
                return raw
        def observe(path, *args, **kwargs):
            stream = original(path, *args, **kwargs)
            return ObservedFile(stream) if path == self.log and args and args[0] == 'rb' else stream
        with patch.object(Path, 'open', observe):
            self.store.poll()
        self.assertTrue(reads)
        self.assertTrue(all(offset >= old_size for offset, length in reads))
        self.assertEqual(sum(length for offset, length in reads), new_bytes)

    def test_close_verifies_previously_consumed_native_prefix(self):
        self.submit('new--alpha')
        raw = self.log.read_bytes()
        altered = raw.replace(b'fixture-event-1', b'fixture-event-X', 1)
        self.assertEqual(len(raw), len(altered))
        self.log.write_bytes(altered)
        summary = self.store.close()
        self.assertFalse(summary['complete'])
        self.assertTrue(self.reader.fault)
        self.assertTrue(summary['protocol_errors'])

    def test_missing_msp_binding_finalizes_explicitly_incomplete(self):
        msp = self.root / 'unbound-msp.jsonl'
        msp.touch()
        feed = events.MuseCompletionFeed(msp, workspace_root=self.ws)
        self.archive = self.root / 'unbound-archive'
        self.store = core.CompletionStore(self.ws, self.archive, feed)
        self.submit('new--unbound')
        self.assert_pending('new--unbound')
        self.store.close(reason='cap')
        self.assertEqual(self.store.state['attempts'], [])
        self.assertEqual(self.store.state['native_finalization']['status'], 'incomplete')

    def test_late_edit_event_invalidates_even_restored_source_bytes(self):
        name = 'new--late-edit'
        self.submit(name)
        path = self.store.payloads / (name + '.md')
        path.write_bytes(fixture('revision'))
        path.write_bytes(fixture())
        # Adversarial synthetic event only: no qualified native Edit route is claimed.
        self.append(self.frames.edit('synthetic-edit-restoration', path))
        summary = self.store.poll()
        self.assertFalse(summary['complete'])
        self.assertTrue(summary['protocol_errors'])
        self.assertEqual(summary['findings'], [])
        self.assertEqual(len(self.store.state['attempts']), 1)
        self.assertEqual(len(self.store.state['native_operations']), 3)
        self.assertEqual((self.archive / self.receipt(name)['snapshot']).read_bytes(), fixture())

    def attach_host(self):
        host = load('ack_host_receiver_under_test', HERE / 'host_receiver.py')
        native_dir = self.root / 'stub-native-output'
        self.archive = self.root / 'stub-host-archive'
        self.store = host.create_receiver(self.ws, self.archive, native_dir)
        self.assertFalse(native_dir.exists(), 'driver output must not be pre-created by receiver')
        native_dir.mkdir()
        (native_dir / 'muse-msp.jsonl').write_bytes(self.frames.encode(self.frames.session_start(self.log)))
        return host

    def test_host_watcher_stub_process_observes_paused_writer_before_completion(self):
        host = self.attach_host()
        name = 'new--stub-process'
        self.write(self.store.payloads / (name + '.md'), fixture())
        path = self.store.requests / name
        call = self.begin(path, b'submit\n')
        producer = path.open('wb')
        self.addCleanup(producer.close)
        producer.flush()
        class StubProcess:
            done = False
            def poll(stub):
                return 0 if stub.done else None
        process = StubProcess()
        phase = [0]
        def tick():
            if phase[0] == 0:
                self.assert_pending(name)
                producer.write(b'submit\n')
                producer.flush()
            elif phase[0] == 1:
                self.assert_pending(name)
                producer.close()
                self.finish(call, path, b'submit\n')
            else:
                self.assertEqual(self.receipt(name)['status'], 'VALID_UNVERIFIED')
                process.done = True
            phase[0] += 1
        def stop():
            self.fail('normal completed stub must not require writer cancellation')
        with patch('subprocess.Popen', side_effect=AssertionError('offline test must never launch')), patch('time.sleep', side_effect=AssertionError('deterministic tick only')):
            summary = host.watch_process(process, self.store, deadline_epoch=1, stop_and_reap=stop, clock=lambda: 0, tick=tick)
        self.assertEqual(phase[0], 3)
        self.assertTrue(summary['complete'])
        self.assertEqual(self.store.state['close_reason'], 'completed')
        self.assertEqual(len(self.store.state['attempts']), 1)

    def test_host_cap_and_cancel_quiesce_writer_before_pending_snapshot(self):
        for reason in ('cap', 'cancelled'):
            with self.subTest(reason=reason):
                self.setUp()
                host = self.attach_host()
                name = 'new--stub-pending'
                payload = self.store.payloads / (name + '.md')
                self.begin(payload, fixture())
                producer = payload.open('wb')
                producer.write(b'synthetic initial partial')
                producer.flush()
                self.addCleanup(producer.close)
                class StubProcess:
                    done = False
                    def poll(stub):
                        return 0 if stub.done else None
                process = StubProcess()
                stopped = []
                def stop():
                    self.assertFalse(self.store.state['closed'])
                    self.assertFalse((self.archive / 'pending').exists())
                    producer.write(b' + stopped final partial')
                    producer.close()
                    process.done = True
                    stopped.append(True)
                def tick():
                    raise KeyboardInterrupt('synthetic cancellation')
                with patch('subprocess.Popen', side_effect=AssertionError('offline test must never launch')), patch('time.sleep', side_effect=AssertionError('deterministic tick only')):
                    if reason == 'cancelled':
                        with self.assertRaises(KeyboardInterrupt):
                            host.watch_process(process, self.store, deadline_epoch=1, stop_and_reap=stop, clock=lambda: 0, tick=tick)
                    else:
                        host.watch_process(process, self.store, deadline_epoch=0, stop_and_reap=stop, clock=lambda: 1, tick=tick)
                self.assertEqual(stopped, [True])
                self.assertEqual(self.store.state['close_reason'], reason)
                self.assertEqual(self.store.state['attempts'], [])
                self.assert_pending(name)
                captured = self.store.state['pending_submissions'][name]['retained_evidence']['payload']
                self.assertEqual((self.archive / captured['path']).read_bytes(), b'synthetic initial partial + stopped final partial')

    def test_missing_completed_payload_does_not_invent_mutation_on_idle_poll(self):
        name = 'new--missing-completed'
        payload = self.store.payloads / (name + '.md')
        self.write(payload, fixture())
        payload.unlink()
        self.write(self.store.requests / name, b'submit\n')
        self.store.poll()
        receipt = self.receipt(name)
        self.assertEqual(receipt['status'], 'INVALID')
        self.assertIsNone(receipt['snapshot'])
        self.assertIsNone(receipt['raw_sha256'])
        summary = self.store.poll()
        self.assertFalse(summary['protocol_errors'])
        self.assertFalse(self.store.state['attempts'][0].get('invalidated', False))
        payload.write_bytes(fixture())
        self.assertTrue(self.store.poll()['protocol_errors'])

    def test_orphan_payload_name_remains_incomplete_and_raw_is_preserved(self):
        raw = b'SYNTHETIC_ORPHAN_WITHOUT_MD_SUFFIX\n'
        (self.store.payloads / 'orphan.bin').write_bytes(raw)
        summary = self.submit('new--independent')
        self.assertFalse(summary['complete'])
        self.assertEqual(len(summary['findings']), 1)
        closed = self.store.close(reason='cap')
        self.assertFalse(closed['complete'])
        captured = [p.read_bytes() for p in (self.archive / 'pending').rglob('*') if p.is_file()]
        self.assertIn(raw, captured)
        self.assertNotIn(raw.decode().strip(), self.current())
        self.assertEqual(len(self.store.state['attempts']), 1)

    def test_older_pending_revision_does_not_hide_newer_completed_revision(self):
        self.submit('new--alpha')
        name = 'F0001--older-pending'
        self.write(self.store.payloads / (name + '.md'), fixture('revision'))
        marker = self.store.requests / name
        self.begin(marker, b'submit\n')
        marker.write_bytes(b'sub')
        self.store.poll()
        self.assert_pending(name)
        newer = fixture('revision').replace(b'NEW_WIDGET_UNITS_3', b'LATEST_COMPLETED_REVISION')
        summary = self.submit('F0001--newer-valid', newer)
        self.assertFalse(summary['complete'])  # The older native operation is still unresolved.
        self.assertEqual({f['id'] for f in summary['findings']}, {'F0001'})
        self.assertIn('LATEST_COMPLETED_REVISION', self.current())
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())
        self.assert_pending(name)
        self.assertEqual(len(self.store.state['attempts']), 2)

    def test_late_older_valid_completion_does_not_replace_latest_invalid(self):
        self.submit('new--alpha')
        old = 'F0001--older'
        self.write(self.store.payloads / (old + '.md'), fixture('revision'))
        marker = self.store.requests / old
        call = self.begin(marker, b'submit\n')
        marker.write_bytes(b'sub')
        self.store.poll()
        self.submit('F0001--latest-invalid', fixture('unknown-field'))
        invalid_sequence = self.receipt('F0001--latest-invalid')['sequence']
        self.submit('new--independent', fixture().replace(b'OLD_WIDGET_UNITS_2', b'INDEPENDENT_CURRENT'))
        marker.write_bytes(b'submit\n')
        self.finish(call, marker, b'submit\n')
        summary = self.store.poll()
        self.assertEqual(self.receipt(old)['status'], 'VALID_UNVERIFIED')
        self.assertEqual(summary['current_states']['F0001']['status'], 'INVALID')
        self.assertEqual(summary['current_states']['F0001']['latest_attempt'], invalid_sequence)
        self.assertEqual({f['id'] for f in summary['findings']}, {'F0002'})
        self.assertNotIn('NEW_WIDGET_UNITS_3', self.current())
        self.assertNotIn('OLD_WIDGET_UNITS_2', self.current())
        self.assertIn('INDEPENDENT_CURRENT', self.current())
        self.assertEqual(len(self.store.state['attempts']), 4)
        self.assertFalse(summary['protocol_errors'])

    def batched_begin(self, writes):
        # Native assistant_tool_calls_committed carries ordered calls in one frame.
        built = []
        for path, raw in writes:
            self.counter += 1
            call = 'synthetic-write-' + str(self.counter)
            built.append((call, self.frames.call(call, path, raw.decode()), path, raw))
        first = built[0][1]
        first['payload']['event']['tool_calls'] = [item[1]['payload']['event']['tool_calls'][0] for item in built]
        self.frames.sequence = first['sequence']
        for index, (call, frame, path, raw) in enumerate(built):
            self.frames.calls[call]['index'] = index
        self.append(first)
        for call, frame, path, raw in built:
            self.append(self.frames.start(call, path))
            path.write_bytes(raw)
        return [(call, path, raw) for call, frame, path, raw in built]

    def test_same_batch_revisions_use_call_ordinal_not_filename_or_sequence_tie(self):
        self.submit('new--alpha')
        old, latest = 'F0001--z-older-valid', 'F0001--a-latest-invalid'
        payloads = self.batched_begin([
            (self.store.payloads / (old + '.md'), fixture('revision')),
            (self.store.payloads / (latest + '.md'), fixture('unknown-field'))])
        for call, path, raw in payloads:
            self.finish(call, path, raw)
        markers = self.batched_begin([(self.store.requests / old, b'submit\n'),
                                      (self.store.requests / latest, b'submit\n')])
        for call, path, raw in reversed(markers):
            self.finish(call, path, raw)
        summary = self.store.poll()
        by_name = {a['request']: a for a in self.store.state['attempts']}
        older_proof = by_name[old]['completion_proof']['marker']
        latest_proof = by_name[latest]['completion_proof']['marker']
        self.assertEqual(older_proof['call_sequence'], latest_proof['call_sequence'])
        self.assertLess(older_proof['ordinal'], latest_proof['ordinal'])
        self.assertEqual(summary['current_states']['F0001']['latest_attempt'], by_name[latest]['sequence'])
        self.assertEqual(summary['findings'], [])
        self.assertNotIn('NEW_WIDGET_UNITS_3', self.current())
        self.assertFalse(summary['protocol_errors'])
        self.assertEqual(len(self.store.state['attempts']), 3)

    def test_host_nonzero_exit_is_failed_despite_valid_acknowledged_content(self):
        host = self.attach_host()
        self.submit('new--alpha')
        class FailedStubProcess:
            def poll(stub):
                return 7
        summary = host.watch_process(FailedStubProcess(), self.store, deadline_epoch=1,
                                     stop_and_reap=lambda: self.fail('already exited'), clock=lambda: 0,
                                     tick=lambda: self.fail('already exited'))
        self.assertFalse(summary['complete'])
        self.assertEqual(self.store.state['host_exit_code'], 7)
        self.assertEqual(self.store.state['close_reason'], 'failed')
        self.assertEqual(len(summary['findings']), 1)

    def test_host_cap_and_cancel_remain_incomplete_with_all_valid_content(self):
        for reason in ('cap', 'cancelled'):
            with self.subTest(reason=reason):
                self.setUp()
                host = self.attach_host()
                self.submit('new--alpha')
                class RunningStubProcess:
                    done = False
                    def poll(stub):
                        return 0 if stub.done else None
                process = RunningStubProcess()
                def stop():
                    process.done = True
                def cancel():
                    raise KeyboardInterrupt('synthetic all-valid cancellation')
                if reason == 'cap':
                    summary = host.watch_process(process, self.store, deadline_epoch=0,
                                                 stop_and_reap=stop, clock=lambda: 1, tick=cancel)
                else:
                    with self.assertRaises(KeyboardInterrupt):
                        host.watch_process(process, self.store, deadline_epoch=1,
                                           stop_and_reap=stop, clock=lambda: 0, tick=cancel)
                    summary = self.store.summary()
                self.assertFalse(summary['complete'])
                self.assertEqual(self.store.state['close_reason'], reason)
                self.assertEqual(len(summary['findings']), 1)
                self.assertTrue(summary['protocol_errors'])

    def test_host_cleanup_failure_does_not_retry_or_freeze_active_writer(self):
        host = self.attach_host()
        name = 'new--cleanup-failure'
        payload = self.store.payloads / (name + '.md')
        self.begin(payload, fixture())
        raw = b'SYNTHETIC_UNQUIESCED_PARTIAL\n'
        payload.write_bytes(raw)
        class RunningStubProcess:
            def poll(stub):
                return None
        stops = []
        def failed_stop():
            stops.append(True)
            raise RuntimeError('synthetic bounded cleanup failed')
        with self.assertRaisesRegex(RuntimeError, 'synthetic bounded cleanup failed'):
            host.watch_process(RunningStubProcess(), self.store, deadline_epoch=0,
                               stop_and_reap=failed_stop, clock=lambda: 1,
                               tick=lambda: self.fail('cap already reached'))
        self.assertEqual(stops, [True])
        self.assertTrue(self.store.state['host_cleanup_failed'])
        self.assertFalse(self.store.state['closed'])
        self.assertFalse((self.archive / 'pending').exists())
        self.assertEqual(payload.read_bytes(), raw)
        self.assertEqual(self.store.state['attempts'], [])
        self.assert_pending(name)
        self.assertTrue(json.loads(self.store.state_path.read_text())['host_cleanup_failed'])

    def test_cancellation_cleanup_error_after_stop_is_recorded_and_frozen(self):
        host = self.attach_host()
        name = 'new--stopped-cleanup-error'
        payload = self.store.payloads / (name + '.md')
        self.begin(payload, fixture())
        raw = b'SYNTHETIC_STOPPED_AFTER_CLEANUP_ERROR\n'
        payload.write_bytes(raw)
        class RunningStubProcess:
            done = False
            def poll(stub):
                return 0 if stub.done else None
        process = RunningStubProcess()
        stops = []
        def stop_then_raise():
            stops.append(True)
            process.done = True
            raise RuntimeError('synthetic cleanup raised after stop')
        def cancel():
            raise KeyboardInterrupt('synthetic cancellation before cleanup')
        with self.assertRaisesRegex(RuntimeError, 'synthetic cleanup raised after stop'):
            host.watch_process(process, self.store, deadline_epoch=1,
                               stop_and_reap=stop_then_raise, clock=lambda: 0, tick=cancel)
        self.assertEqual(stops, [True])
        self.assertTrue(self.store.state['closed'])
        self.assertEqual(self.store.state['close_reason'], 'cancelled')
        self.assertEqual(self.store.state['host_cleanup_error'], 'RuntimeError')
        self.assertTrue(any('bounded cleanup raised RuntimeError' in error for error in self.store.summary()['protocol_errors']))
        capture = self.store.state['pending_submissions'][name]['retained_evidence']['payload']
        self.assertEqual((self.archive / capture['path']).read_bytes(), raw)
        self.assertEqual(self.store.state['attempts'], [])

    def test_missing_and_empty_bound_journals_finalize_explicitly_incomplete(self):
        for absent in (False, True):
            with self.subTest(absent=absent):
                self.setUp()
                msp = self.root / 'bound-msp.jsonl'
                msp.write_bytes(self.frames.encode(self.frames.session_start(self.log)))
                if absent:
                    self.log.unlink()
                feed = events.MuseCompletionFeed(msp, workspace_root=self.ws)
                self.archive = self.root / 'bound-no-journal-archive'
                self.store = core.CompletionStore(self.ws, self.archive, feed)
                name = 'new--unproven'
                (self.store.payloads / (name + '.md')).write_bytes(fixture())
                (self.store.requests / name).write_bytes(b'submit\n')
                self.store.poll()
                self.assert_pending(name)
                self.store.close(reason='completed')
                final = self.store.state['native_finalization']
                self.assertEqual(final['status'], 'incomplete')
                self.assertTrue(final.get('reason'))
                self.assertEqual(self.store.state['attempts'], [])
                self.assertEqual(final['native_attempts'], 0)


if __name__ == '__main__':
    unittest.main(verbosity=2)
