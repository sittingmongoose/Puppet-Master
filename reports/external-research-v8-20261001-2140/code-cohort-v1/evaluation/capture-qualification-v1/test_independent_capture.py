"""Independent offline v8 capture review. Synthetic fixtures only; no network/provider."""
import hashlib
import http.client
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

OWN = Path(__file__).resolve().parent
DEV = OWN.parents[1] / 'dev/source-capture-v1'

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value

server = load('independent_capture_server', DEV / 'tool_server.py')
boundary = load('independent_capture_boundary', DEV / 'boundary.py')

class SyntheticSocket:
    def __init__(self): self.closed = False
    def close(self): self.closed = True

class WireSocket:
    def __init__(self, wire): self.wire = wire
    def makefile(self, *args): return io.BytesIO(self.wire)

class OfflineNetwork:
    def __init__(self, wire, ips=None, tls_error=False):
        self.wire, self.ips, self.tls_error = wire, ips or ['93.184.216.34'], tls_error
        self.connections, self.requests, self.sni, self.sockets = [], [], [], []
    def dns(self, host, port, type):
        return [(2, type, 6, '', (ip, port)) for ip in self.ips]
    def tcp(self, target, timeout):
        self.connections.append(target)
        sock = SyntheticSocket(); self.sockets.append(sock); return sock
    def context(self):
        owner = self
        class Context:
            def wrap_socket(self, sock, server_hostname):
                owner.sni.append(server_hostname)
                if owner.tls_error: raise server.ssl.SSLCertVerificationError('synthetic certificate denial')
                return sock
        return Context()
    def connection(self, host, timeout, context):
        owner = self
        class Connection:
            _context = context
            sock = None
            def request(self, method, target, headers): owner.requests.append((method, target, headers))
            def getresponse(self):
                response = http.client.HTTPResponse(WireSocket(owner.wire))
                response.begin()
                return response
            def close(self):
                if self.sock: self.sock.close()
        return Connection()
    def __enter__(self):
        self.patches = [patch.object(server.socket, 'getaddrinfo', self.dns),
                        patch.object(server.socket, 'create_connection', self.tcp),
                        patch.object(server.ssl, 'create_default_context', self.context),
                        patch.object(server.http.client, 'HTTPSConnection', self.connection)]
        for item in self.patches: item.start()
        return self
    def __exit__(self, *args):
        for item in reversed(self.patches): item.stop()

class IndependentCaptureTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='synthetic-', dir=OWN)
        self.base = Path(self.tmp.name)
        self.root = self.base / 'case'; self.root.mkdir()
        for name in ('inputs', 'out', 'public_captures', 'operation_receipts'):
            (self.root / name).mkdir()
        (self.root / 'TASK.md').write_text('Synthetic public fixture task.\n')
        (self.root / 'inputs/source.txt').write_text('public source α\r\nsecond\u2028third\n')
        self.old_root = server.ROOT; server.ROOT = str(self.root)
        self.env = patch.dict(os.environ, {'PM_PUBLIC_GET': '1', 'HTTPS_PROXY': 'https://synthetic.invalid:9999', 'SYNTHETIC_AUTH': 'SYNTHETIC_AUTH_ONLY'})
        self.env.start()
    def tearDown(self):
        self.env.stop(); server.ROOT = self.old_root; self.tmp.cleanup()
    def rpc(self, calls, public=False):
        requests = [{'jsonrpc': '2.0', 'id': n, 'method': 'tools/call', 'params': {'name': name, 'arguments': args}}
                    for n, (name, args) in enumerate(calls, 1)]
        raw = b''.join(json.dumps(r).encode() + b'\n' for r in requests)
        return subprocess.run(boundary.command(self.root, public), input=raw, capture_output=True, timeout=20)
    def events(self):
        return [json.loads(line) for line in (self.root / 'operation_receipts/events.jsonl').read_bytes().splitlines()]

    def test_exact_frozen_pins(self):
        expected = {'binding.json': '8dea681e5a43fa54cec4a8ae76e37fcd9c6db878e73576ef5611e76e0313ff99',
                    'tool_server.py': '9c25c1faaf7c4557aaeb22b0977061914a9fbba1a04d87d2a3a29851daa29846',
                    'boundary.py': '2a6753253806a8a9fd5a990eef5f367f2ff6d8767f9e5215eb3e79a73d64152b',
                    'test_source_capture.py': 'a2e661f064dff5efb21c61461106d9473995e76c14133a8ff4abdec5a5aaf808',
                    'README.md': 'f92dfad615d6c60bca9b989e5147cfd5e1eb506acb23d35d44ba99cded81a5a7'}
        for name, sha in expected.items(): self.assertEqual(hashlib.sha256((DEV / name).read_bytes()).hexdigest(), sha)

    def test_real_namespace_denies_synthetic_private_sibling_receipt_and_evaluator_paths(self):
        secret = 'SYNTHETIC_PRIVATE_CANARY_ONLY'
        hidden = self.base / 'private-evaluator.txt'; hidden.write_text(secret)
        sibling = self.base / 'sibling-case'; sibling.mkdir(); (sibling / 'answer.txt').write_text(secret)
        (self.root / 'inputs/symlink').symlink_to(hidden)
        os.link(hidden, self.root / 'inputs/hardlink')
        paths = [str(hidden), str(sibling / 'answer.txt'), '../private-evaluator.txt', 'inputs/symlink',
                 'inputs/hardlink', 'operation_receipts/events.jsonl', '/home/synthetic-auth', '/proc/self/environ']
        proc = self.rpc([('read_file', {'path': p}) for p in paths] +
                        [('write_file', {'path': 'public_captures/' + '0' * 64 + '.body', 'text': 'forbidden'}),
                         ('mechanical', {'operation': 'python', 'source': 'inputs/source.txt', 'output': 'out/a'})])
        self.assertEqual(proc.returncode, 0)
        self.assertEqual(len(proc.stdout.splitlines()), len(paths) + 2)
        self.assertTrue(all(json.loads(row)['result']['isError'] for row in proc.stdout.splitlines()))
        events = self.events(); self.assertEqual(len(events), 3 * (len(paths) + 2))
        self.assertNotIn(secret, proc.stdout.decode()); self.assertNotIn(secret, json.dumps(events))
        self.assertNotIn(str(hidden), json.dumps(events)); self.assertNotIn(str(sibling), json.dumps(events))
        self.assertNotIn('SYNTHETIC_AUTH_ONLY', proc.stdout.decode())

    def test_real_namespace_results_and_failures_bind_exact_envelopes(self):
        calls = [('read_file', {'path': 'inputs/source.txt', 'byte_start': 1, 'byte_count': 4}),
                 ('write_file', {'path': 'out/one.txt', 'text': 'first'}),
                 ('write_file', {'path': 'out/one.txt', 'text': 'overwrite'}),
                 ('public_https_get', {'url': 'https://synthetic.invalid/'})]
        proc = self.rpc(calls, public=False); self.assertEqual(proc.returncode, 0)
        events = self.events(); envelopes = proc.stdout.splitlines(keepends=True)
        self.assertEqual([e['stage'] for e in events], ['operation-started', 'prepared-result', 'stdout-flushed'] * 4)
        for n, envelope in enumerate(envelopes):
            start, prepared, flushed = events[n * 3:n * 3 + 3]
            self.assertEqual(start['operation_id'], prepared['operation_id']); self.assertEqual(prepared['operation_id'], flushed['operation_id'])
            for event in (prepared, flushed):
                self.assertEqual(event['rpc_envelope_sha256'], hashlib.sha256(envelope).hexdigest())
                self.assertEqual(event['rpc_envelope_bytes'], len(envelope))
                self.assertGreaterEqual(event['elapsed_seconds'], 0)
                self.assertEqual(event['semantic_acquisition'], 'UNKNOWN'); self.assertEqual(event['llm_read'], 'UNOBSERVED')
        self.assertEqual((self.root / 'out/one.txt').read_text(), 'first')
        self.assertTrue(events[7]['is_error']); self.assertTrue(events[10]['is_error'])

    def test_receipt_capacity_prevents_unrecorded_response_in_real_namespace(self):
        log = self.root / 'operation_receipts/events.jsonl'
        with log.open('wb') as file: file.truncate(server.MAX_OUTPUT - 500)
        proc = self.rpc([('read_file', {'path': 'inputs/source.txt'})])
        self.assertEqual(proc.returncode, 2); self.assertEqual(proc.stdout, b'')
        self.assertGreater(log.stat().st_size, server.MAX_OUTPUT - 500)
        self.assertLessEqual(log.stat().st_size, server.MAX_OUTPUT)

    def test_no_stdout_flush_witness_on_broken_transport(self):
        saved = []
        request = {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call', 'params': {'name': 'read_file', 'arguments': {'path': 'inputs/source.txt'}}}
        class Input: buffer = io.BytesIO(json.dumps(request).encode() + b'\n')
        class BrokenBuffer:
            def write(self, raw): raise BrokenPipeError('synthetic')
            def flush(self): raise AssertionError('flush must not occur')
        class Output: buffer = BrokenBuffer()
        with patch.object(server, 'receipt', saved.append), patch.object(server.resource, 'setrlimit'), patch.object(server.sys, 'stdin', Input()), patch.object(server.sys, 'stdout', Output()):
            result = server.main()
        self.assertEqual(result, 2)
        self.assertEqual([e['stage'] for e in saved], ['operation-started', 'prepared-result'])

    def test_wire_http_complete_chunked_and_short_content_length(self):
        for wire, expected, complete in [
            (b'HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nhello\r\n0\r\n\r\n', b'hello', True),
            (b'HTTP/1.1 200 OK\r\nContent-Length: 20\r\n\r\nshort', b'short', False)]:
            with OfflineNetwork(wire) as network: value = server.fetch('https://primary.example/source')
            self.assertEqual((self.root / value['capture_path']).read_bytes(), expected)
            self.assertEqual(value['body_complete'], complete)
            self.assertEqual(value['incomplete_http_body'], not complete)
            self.assertEqual(network.connections, [('93.184.216.34', 443)])
            self.assertEqual(network.sni, ['primary.example']); self.assertTrue(all(s.closed for s in network.sockets))

    def test_tls_failure_and_non_global_ipv6_fail_before_capture(self):
        wire = b'HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nok'
        with OfflineNetwork(wire, tls_error=True) as network:
            with self.assertRaises(server.ssl.SSLCertVerificationError): server.fetch('https://primary.example/')
        self.assertEqual(network.requests, []); self.assertTrue(all(s.closed for s in network.sockets))
        for ips in (['::ffff:127.0.0.1'], ['100.64.0.1'], ['2001:db8::1'], ['ff02::1'], ['93.184.216.34', 'fc00::1']):
            with OfflineNetwork(wire, ips=ips) as network:
                with self.assertRaises(ValueError): server.fetch('https://primary.example/')
            self.assertEqual(network.connections, [])
        self.assertEqual(list((self.root / 'public_captures').iterdir()), [])

    def test_metadata_privacy_capture_recheck_and_no_replacement_write(self):
        raw = b'captured synthetic public body'
        capture = server.persist_capture(raw, {'body_complete': True})
        body = self.root / capture['capture_path']
        with self.assertRaises(ValueError): server.read_raw('public_captures/' + capture['capture_id'] + '.json')
        with self.assertRaises(ValueError): server.write_raw(capture['capture_path'], b'replacement')
        body.write_bytes(b'tampered by synthetic trusted host')
        with self.assertRaises(ValueError): server.read_raw(capture['capture_path'])
        with self.assertRaises(ValueError): server.perform('mechanical', {'operation': 'cache_source', 'source': capture['capture_path'], 'output': 'out/copy'})

    def test_source_and_transmitted_hashes_for_invalid_utf8_and_long_line(self):
        raw = b'\xff' * 100; (self.root / 'inputs/binary').write_bytes(raw)
        value = server.perform('read_file', {'path': 'inputs/binary', 'byte_count': 100})
        self.assertEqual(value['range_sha256'], hashlib.sha256(raw).hexdigest())
        self.assertEqual(value['transmitted_text_utf8_bytes'], 300)
        self.assertEqual(value['transmitted_text_sha256'], hashlib.sha256(value['text'].encode()).hexdigest())
        self.assertFalse(value['complete_source_delivered'])
        (self.root / 'inputs/long-line').write_bytes(b'x' * 65536 + b'\n')
        value = server.perform('read_file', {'path': 'inputs/long-line'})
        self.assertTrue(value['delivery_truncated']); self.assertEqual(value['text'], '')
        self.assertEqual(value['source_range_bytes'], 0)

    def test_unicode_line_ranges_bind_original_line_terminators(self):
        raw = (self.root / 'inputs/source.txt').read_bytes()
        value = server.perform('read_file', {'path': 'inputs/source.txt', 'line_start': 2, 'line_count': 1})
        original = raw[value['source_byte_start']:value['source_byte_end_exclusive']]
        self.assertEqual(original, 'second\u2028'.encode())
        self.assertEqual(value['source_range_sha256'], hashlib.sha256(original).hexdigest())
        self.assertEqual(value['transmitted_text_sha256'], hashlib.sha256(b'2: second').hexdigest())

    def test_admission_rejects_unsafe_new_store_and_clears_host_environment(self):
        cmd = boundary.command(self.root, True)
        self.assertIn('--clearenv', cmd); self.assertNotIn('SYNTHETIC_AUTH', cmd)
        self.assertNotIn(str(self.base / 'private-evaluator.txt'), cmd)
        (self.root / 'public_captures').rmdir(); (self.root / 'public_captures').symlink_to(self.base, target_is_directory=True)
        with self.assertRaises(ValueError): boundary.command(self.root, True)

    def test_capture_and_receipt_capacity_fail_closed_directly(self):
        with patch.object(server, 'MAX_OUTPUT', 8):
            with self.assertRaises(ValueError): server.persist_capture(b'body', {'body_complete': True})
            with self.assertRaises(ValueError): server.receipt({'stage': 'synthetic'})
        self.assertEqual(list((self.root / 'public_captures').iterdir()), [])
        self.assertEqual((self.root / 'operation_receipts/events.jsonl').stat().st_size, 0)

if __name__ == '__main__': unittest.main(verbosity=2)
