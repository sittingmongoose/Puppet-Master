"""Mechanical/synthetic tests only; no live GET, candidate or provider calls."""
import hashlib
import http.client
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


server = load('capture_server_tests', HERE / 'tool_server.py')
boundary = load('capture_boundary_tests', HERE / 'boundary.py')


class FakeSocket:
    def __init__(self): self.closed = False
    def close(self): self.closed = True


class FakeResponse:
    def __init__(self, raw=b'public source\n', status=200, headers=None, incomplete=False):
        self.raw, self.status = raw, status
        self.headers = headers or {}
        self.incomplete = incomplete
        self.read_sizes = []
    def getheader(self, name, default=None): return self.headers.get(name, default)
    def read(self, n):
        self.read_sizes.append(n)
        if self.incomplete: raise http.client.IncompleteRead(self.raw, 100)
        return self.raw[:n]


class SyntheticNetwork:
    def __init__(self, responses, resolver=None):
        self.responses = iter(responses)
        self.addresses, self.sni, self.requests, self.hosts = [], [], [], []
        self.sockets = []
        self.resolver = resolver or (lambda host: ['93.184.216.34'])
    def resolve(self, host, port, type):
        if port != 443: raise AssertionError('alternate port')
        return [(2, type, 6, '', (ip, 443)) for ip in self.resolver(host)]
    def connect(self, target, timeout):
        self.addresses.append((target, timeout))
        sock = FakeSocket(); self.sockets.append(sock); return sock
    def context(self):
        network = self
        class Context:
            def wrap_socket(self, sock, server_hostname):
                network.sni.append(server_hostname); return sock
        return Context()
    def connection(self, host, timeout, context):
        self.hosts.append(host)
        network = self
        class Connection:
            _context = context
            sock = None
            def request(self, method, target, headers): network.requests.append((method, target, headers))
            def getresponse(self): return next(network.responses)
            def close(self):
                if self.sock: self.sock.close()
        return Connection()
    def __enter__(self):
        self.patches = [patch.object(server.socket, 'getaddrinfo', self.resolve),
                        patch.object(server.socket, 'create_connection', self.connect),
                        patch.object(server.ssl, 'create_default_context', self.context),
                        patch.object(server.http.client, 'HTTPSConnection', self.connection)]
        for item in self.patches: item.start()
        return self
    def __exit__(self, *args):
        for item in reversed(self.patches): item.stop()


class CaptureTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='v8-capture-test-')
        self.root = Path(self.tmp.name)
        for name in ('inputs', 'out', 'public_captures', 'operation_receipts'):
            (self.root / name).mkdir()
        (self.root / 'TASK.md').write_text('Synthetic task only.\n')
        self.old_root = server.ROOT
        server.ROOT = str(self.root)
        self.env = patch.dict(os.environ, {'PM_PUBLIC_GET': '1', 'HTTPS_PROXY': 'https://invalid-proxy.example:1234'})
        self.env.start()
    def tearDown(self):
        self.env.stop(); server.ROOT = self.old_root; self.tmp.cleanup()

    def test_immutable_public_body_version_status_and_actual_url(self):
        raw = 'Public α source\n'.encode()
        response = FakeResponse(raw, 200, {'ETag': '"v3"', 'Last-Modified': 'Fri, 02 Oct 2026 00:00:00 GMT', 'Content-Type': 'text/plain'})
        with SyntheticNetwork([response]) as net:
            value = server.perform('public_https_get', {'url': 'https://primary.example/spec?v=3'})
        self.assertEqual(net.addresses, [(('93.184.216.34', 443), 10)])
        self.assertEqual(net.sni, ['primary.example'])
        self.assertEqual(net.requests, [('GET', '/spec?v=3', {'User-Agent': 'PM-research-boundary/2'})])
        self.assertTrue(all(sock.closed for sock in net.sockets))
        self.assertEqual(response.read_sizes, [524289])
        self.assertEqual(value['actual_url'], 'https://primary.example/spec?v=3')
        self.assertEqual(value['source_version'], 'sha256:' + hashlib.sha256(raw).hexdigest())
        self.assertEqual(value['status'], 200)
        self.assertEqual(value['utf8_bytes'], len(raw))
        self.assertEqual(value['etag'], '"v3"')
        self.assertTrue(value['body_complete']); self.assertFalse(value['truncated'])
        self.assertEqual((self.root / value['capture_path']).read_bytes(), raw)
        metadata = json.loads((self.root / 'public_captures' / (value['capture_id'] + '.json')).read_text())
        self.assertEqual(metadata['sha256'], hashlib.sha256(raw).hexdigest())
        self.assertEqual(value['delivery']['range_sha256'], hashlib.sha256(raw).hexdigest())
        self.assertEqual(value['llm_read'], 'UNOBSERVED')
        with self.assertRaises(ValueError): server.perform('write_file', {'path': value['capture_path'], 'text': 'replacement'})
        with self.assertRaises(ValueError): server.read_raw('public_captures/' + value['capture_id'] + '.json')

    def test_repeat_capture_is_content_addressed_without_overwrite(self):
        raw = b'same public bytes\n'
        with SyntheticNetwork([FakeResponse(raw), FakeResponse(raw)]):
            first = server.fetch('https://primary.example/a')
            before = (self.root / first['capture_path']).stat().st_mtime_ns
            second = server.fetch('https://primary.example/b')
        self.assertEqual(first['capture_path'], second['capture_path'])
        self.assertNotEqual(first['capture_id'], second['capture_id'])
        self.assertEqual(before, (self.root / first['capture_path']).stat().st_mtime_ns)
        self.assertEqual(len(list((self.root / 'public_captures').glob('*.body'))), 1)
        self.assertEqual(len(list((self.root / 'public_captures').glob('*.json'))), 2)

    def test_bounded_prefix_is_explicitly_incomplete(self):
        raw = b'x' * (server.MAX_BYTES + 100)
        with SyntheticNetwork([FakeResponse(raw)]): value = server.fetch('https://primary.example/large')
        self.assertFalse(value['body_complete']); self.assertTrue(value['truncated'])
        self.assertEqual(value['captured_bytes'], server.MAX_BYTES)
        self.assertEqual(value['response_bytes_observed'], server.MAX_BYTES + 1)
        self.assertEqual((self.root / value['capture_path']).read_bytes(), raw[:server.MAX_BYTES])
        self.assertEqual(value['delivery']['range_bytes'], server.FIRST_RANGE_BYTES)
        self.assertTrue(value['delivery']['additional_source_bytes_remain'])

    def test_incomplete_http_body_and_non_utf8_do_not_claim_completeness(self):
        with SyntheticNetwork([FakeResponse(b'partial', incomplete=True)]): partial = server.fetch('https://primary.example/incomplete')
        self.assertFalse(partial['body_complete']); self.assertTrue(partial['incomplete_http_body'])
        with SyntheticNetwork([FakeResponse(b'\xffbinary', 404)]): binary = server.fetch('https://primary.example/404')
        self.assertEqual(binary['status'], 404); self.assertFalse(binary['utf8_valid'])
        self.assertIsNone(binary['utf8_bytes'])
        self.assertIn('replacement', binary['delivery']['text_decoding'])
        with SyntheticNetwork([FakeResponse(b'short', headers={'Content-Length': '100'})]):
            short = server.fetch('https://primary.example/short')
        self.assertFalse(short['body_complete']); self.assertTrue(short['incomplete_http_body'])

    def test_byte_ranges_have_source_raw_and_transmitted_hashes(self):
        raw = 'aαbγc\n'.encode()
        (self.root / 'inputs' / 'sample.txt').write_bytes(raw)
        value = server.perform('read_file', {'path': 'inputs/sample.txt', 'byte_start': 1, 'byte_count': 2})
        self.assertEqual(value['text'], 'α')
        self.assertEqual(value['sha256'], hashlib.sha256(raw).hexdigest())
        self.assertEqual(value['range_sha256'], hashlib.sha256(raw[1:3]).hexdigest())
        self.assertEqual(value['transmitted_text_sha256'], hashlib.sha256('α'.encode()).hexdigest())
        self.assertEqual(value['byte_end_exclusive'], 3)
        split = server.perform('read_file', {'path': 'inputs/sample.txt', 'byte_start': 2, 'byte_count': 1})
        self.assertIn('replacement', split['text_decoding'])
        self.assertNotEqual(split['range_sha256'], split['transmitted_text_sha256'])
        for args in ({'byte_start': -1}, {'byte_count': 65537}, {'byte_start': True}, {'byte_count': 0}, {'byte_start': 0, 'line_start': 1}):
            with self.assertRaises(ValueError): server.perform('read_file', {'path': 'inputs/sample.txt', **args})

    def test_line_delivery_is_bounded_and_truncation_visible(self):
        (self.root / 'inputs' / 'many.txt').write_text(('x' * 100 + '\n') * 2000)
        value = server.perform('read_file', {'path': 'inputs/many.txt'})
        self.assertTrue(value['delivery_truncated'])
        self.assertLessEqual(value['transmitted_text_utf8_bytes'], 65536)
        self.assertEqual(hashlib.sha256(value['text'].encode()).hexdigest(), value['transmitted_text_sha256'])
        self.assertLess(value['line_end_inclusive'], value['total_lines'])
        raw = (self.root / 'inputs' / 'many.txt').read_bytes()
        self.assertEqual(hashlib.sha256(raw[value['source_byte_start']:value['source_byte_end_exclusive']]).hexdigest(), value['source_range_sha256'])

    def test_private_paths_traversal_symlink_hardlink_and_capture_corruption_denied(self):
        outside = self.root / 'synthetic-key.txt'; outside.write_text('SYNTHETIC TEST CANARY ONLY')
        (self.root / 'inputs' / 'symlink').symlink_to(outside)
        os.link(outside, self.root / 'inputs' / 'hardlink')
        for path in ('../synthetic-key.txt', '/etc/passwd', 'operation_receipts/events.jsonl', 'synthetic-key.txt', 'inputs/../synthetic-key.txt', 'inputs/symlink', 'inputs/hardlink', 'public_captures/../../secret', 'inputs//file'):
            with self.assertRaises((ValueError, OSError)): server.read_raw(path)
        named = self.root / 'public_captures' / ('0' * 64 + '.body'); named.write_bytes(b'wrong hash')
        with self.assertRaises(ValueError): server.read_raw('public_captures/' + named.name)
        result = server.write_raw('out/immutable.txt', b'first')
        with self.assertRaises(FileExistsError): server.write_raw('out/immutable.txt', b'next')
        self.assertEqual((self.root / result['path']).read_bytes(), b'first')

    def test_network_denies_private_mixed_multicast_credentials_and_alt_ports(self):
        for ipset in (['127.0.0.1'], ['10.0.0.2'], ['169.254.169.254'], ['::1'], ['fe80::1'], ['224.0.0.1'], ['93.184.216.34', '10.0.0.1']):
            with SyntheticNetwork([], resolver=lambda _, values=ipset: values) as net:
                with self.assertRaises(ValueError): server.fetch('https://primary.example/source')
                self.assertEqual(net.addresses, [])
        for url in ('http://primary.example/source', 'https://u:p@primary.example/', 'https://@primary.example/', 'https://primary.example:8443/', 'https://primary.example/#frag', 'https://primary.example/\r\nsecret'):
            with SyntheticNetwork([]) as net:
                with self.assertRaises(ValueError): server.fetch(url)
                self.assertEqual(net.addresses, [])
        with patch.dict(os.environ, {'PM_PUBLIC_GET': '0'}):
            with self.assertRaises(ValueError): server.fetch('https://primary.example/source')
        for key in ('headers', 'proxy', 'body', 'credentials'):
            with self.assertRaises(ValueError): server.perform('public_https_get', {'url': 'https://primary.example/', key: 'forbidden'})

    def test_private_redirect_is_denied_before_second_connection(self):
        resolver = lambda host: ['127.0.0.1'] if host == 'private.example' else ['93.184.216.34']
        with SyntheticNetwork([FakeResponse(status=302, headers={'Location': 'https://private.example/secret'})], resolver) as net:
            with self.assertRaises(ValueError): server.fetch('https://primary.example/start')
        self.assertEqual(len(net.addresses), 1)
        self.assertEqual(list((self.root / 'public_captures').iterdir()), [])

    def test_public_redirect_actual_url_is_recorded_and_pinned(self):
        resolver = lambda host: ['1.1.1.1'] if host == 'other.example' else ['93.184.216.34']
        with SyntheticNetwork([FakeResponse(status=302, headers={'Location': 'https://other.example/v2'}), FakeResponse(b'version two')], resolver) as net:
            value = server.fetch('https://primary.example/v1')
        self.assertEqual(value['actual_url'], 'https://other.example/v2')
        self.assertEqual(value['requested_url'], 'https://primary.example/v1')
        self.assertEqual(value['redirects'], [{'url': 'https://primary.example/v1', 'status': 302}])
        self.assertEqual(net.addresses[1][0], ('1.1.1.1', 443))
        self.assertEqual(net.sni, ['primary.example', 'other.example'])

    def test_receipts_are_append_only_and_not_readable_or_writable_by_tools(self):
        server.receipt({'operation_id': 'one', 'stage': 'operation-started'})
        first = (self.root / 'operation_receipts' / 'events.jsonl').read_bytes()
        server.receipt({'operation_id': 'two', 'stage': 'prepared-result'})
        full = (self.root / 'operation_receipts' / 'events.jsonl').read_bytes()
        self.assertTrue(full.startswith(first)); self.assertEqual(len(full.splitlines()), 2)
        with self.assertRaises(ValueError): server.perform('read_file', {'path': 'operation_receipts/events.jsonl'})
        with self.assertRaises(ValueError): server.perform('write_file', {'path': 'operation_receipts/events.jsonl', 'text': 'overwrite'})

    def test_mechanical_uses_only_enumerated_case_scopes(self):
        (self.root / 'inputs' / 'source.txt').write_bytes(b'exact public case input\n')
        result = server.perform('mechanical', {'operation': 'cache_source', 'source': 'inputs/source.txt', 'output': 'out/copy.txt'})
        self.assertEqual(server.read_raw('out/copy.txt'), server.read_raw('inputs/source.txt'))
        self.assertEqual(result['source_sha256'], result['sha256'])
        with self.assertRaises(ValueError): server.perform('mechanical', {'operation': 'python', 'source': 'inputs/source.txt', 'output': 'out/eval.txt'})
        with self.assertRaises(ValueError): server.perform('mechanical', {'operation': 'cache_source', 'source': '/etc/passwd', 'output': 'out/host.txt'})

    def test_boundary_only_new_case_mounts_and_same_tool_names(self):
        cmd = boundary.command(self.root, True)
        self.assertIn(str(HERE / 'tool_server.py'), cmd)
        self.assertIn('/work/public_captures', cmd); self.assertIn('/work/operation_receipts', cmd)
        self.assertNotIn('/home', cmd)
        self.assertEqual(boundary.allowlist(True), ['mcp__pm_boundary__read_file', 'mcp__pm_boundary__write_file', 'mcp__pm_boundary__mechanical', 'mcp__pm_boundary__public_https_get'])
        self.assertEqual({tool['name'] for tool in server.TOOLS} - {'public_https_get'}, {'read_file', 'write_file', 'mechanical'})

    def test_actual_namespace_rpc_receipts_bind_bytes_and_failure_cost(self):
        (self.root / 'inputs' / 'source.txt').write_bytes(b'namespace-public-fixture\n')
        requests = [{'jsonrpc': '2.0', 'id': 1, 'method': 'initialize'},
                    {'jsonrpc': '2.0', 'id': 2, 'method': 'tools/list'},
                    {'jsonrpc': '2.0', 'id': 3, 'method': 'tools/call', 'params': {'name': 'read_file', 'arguments': {'path': 'inputs/source.txt', 'byte_start': 2, 'byte_count': 6}}},
                    {'jsonrpc': '2.0', 'id': 4, 'method': 'tools/call', 'params': {'name': 'read_file', 'arguments': {'path': '/outside/synthetic-key.txt'}}}]
        input_bytes = b''.join(json.dumps(req).encode() + b'\n' for req in requests)
        proc = subprocess.run(boundary.command(self.root, False), input=input_bytes, capture_output=True, timeout=20)
        self.assertEqual(proc.returncode, 0, proc.stderr.decode())
        envelopes = proc.stdout.splitlines(keepends=True)
        self.assertEqual(len(envelopes), 4)
        read = json.loads(envelopes[2]); read_value = json.loads(read['result']['content'][0]['text'])
        self.assertEqual(read_value['text'], 'mespac')
        self.assertTrue(json.loads(envelopes[3])['result']['isError'])
        events = [json.loads(line) for line in (self.root / 'operation_receipts' / 'events.jsonl').read_bytes().splitlines()]
        self.assertEqual([e['stage'] for e in events], ['operation-started', 'prepared-result', 'stdout-flushed'] * 2)
        for position, envelope in ((1, envelopes[2]), (4, envelopes[3])):
            self.assertEqual(events[position]['rpc_envelope_sha256'], hashlib.sha256(envelope).hexdigest())
            self.assertEqual(events[position]['rpc_envelope_bytes'], len(envelope))
            self.assertGreaterEqual(events[position]['elapsed_seconds'], 0)
            self.assertEqual(events[position]['llm_read'], 'UNOBSERVED')
        self.assertTrue(events[4]['is_error'])
        self.assertNotIn('/outside/synthetic-key.txt', (self.root / 'operation_receipts' / 'events.jsonl').read_text())
        self.assertNotIn('synthetic-key', proc.stdout.decode())


if __name__ == '__main__': unittest.main(verbosity=2)
