"""Pinned repair2 mechanical API plus case-owned public capture/operation evidence.

No native/provider execution, caller headers, arbitrary host paths, or evaluator data.
"""
import datetime
import fcntl
import hashlib
import http.client
import importlib.util
import ipaddress
import json
import os
from pathlib import PurePosixPath
import re
import resource
import signal
import socket
import ssl
import stat
import sys
import time
from urllib.parse import urlsplit, urljoin
import uuid

MAX_BYTES = 524288
MAX_OUTPUT = 16777216
MAX_TEXT_BYTES = 65536
FIRST_RANGE_BYTES = 32768
ROOT = '/work'
SERVER_VERSION = 'er9-source-capture-v1.4-bundle'
BODY_NAME = re.compile(r'^[0-9a-f]{64}\.body$')


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def encoded(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def components(path, write=False):
    if not isinstance(path, str) or not path or '\x00' in path or '\\' in path:
        raise ValueError('invalid relative path')
    p = PurePosixPath(path)
    if p.is_absolute() or '..' in p.parts or path != str(p):
        raise ValueError('path traversal/noncanonical path denied')
    if write:
        if p.parts[0] != 'out':
            raise ValueError('write namespace denied')
    elif p.parts[0] == 'public_captures':
        if len(p.parts) != 2 or not BODY_NAME.fullmatch(p.parts[1]):
            raise ValueError('content-addressed public body only')
    elif p.parts[0] not in ('inputs', 'out', 'TASK.md'):
        raise ValueError('read namespace denied')
    return p.parts


def parent_fd(path, write=False):
    parts = components(path, write)
    fd = os.open(ROOT, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        for part in parts[:-1]:
            if write:
                try: os.mkdir(part, mode=0o700, dir_fd=fd)
                except FileExistsError: pass
            new = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd); fd = new
        return fd, parts[-1]
    except BaseException:
        os.close(fd)
        raise


def fd_bytes(fd, cap=MAX_BYTES):
    meta = os.fstat(fd)
    if not stat.S_ISREG(meta.st_mode) or meta.st_nlink != 1 or meta.st_size > cap:
        raise ValueError('special/hardlinked/oversized input denied')
    raw = b''
    while len(raw) <= cap:
        piece = os.read(fd, min(65536, cap + 1 - len(raw)))
        if not piece: break
        raw += piece
    after = os.fstat(fd)
    if len(raw) > cap or len(raw) != meta.st_size or after.st_mtime_ns != meta.st_mtime_ns or after.st_size != meta.st_size:
        raise ValueError('input cap or unstable input')
    return raw


def read_raw(path):
    parent, name = parent_fd(path)
    try: fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent)
    finally: os.close(parent)
    try: raw = fd_bytes(fd)
    finally: os.close(fd)
    if path.startswith('public_captures/') and name != digest(raw) + '.body':
        raise ValueError('public capture content address mismatch')
    return raw


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        written = os.write(fd, view)
        if written <= 0: raise OSError('zero write')
        view = view[written:]
    os.fsync(fd)


def write_raw(path, raw):
    if len(raw) > MAX_BYTES: raise ValueError('write cap exceeded')
    total, count = 0, 0
    for base, dirs, names in os.walk(ROOT + '/out', followlinks=False):
        for name in names:
            meta = os.lstat(os.path.join(base, name))
            total += meta.st_size; count += 1
    if total + len(raw) > MAX_OUTPUT or count >= 128:
        raise ValueError('aggregate output growth/file cap exceeded')
    parent, name = parent_fd(path, True)
    try:
        fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=parent)
        try: write_all(fd, raw)
        finally: os.close(fd)
        os.fsync(parent)
    finally: os.close(parent)
    return {'path': path, 'bytes': len(raw), 'sha256': digest(raw)}


def store_fd(namespace):
    # Only these two constant stores are reachable here; caller paths never enter.
    if namespace not in ('public_captures', 'operation_receipts'):
        raise ValueError('store not enumerated')
    root = os.open(ROOT, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try: return os.open(namespace, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=root)
    finally: os.close(root)


def immutable_at(parent, name, raw, allow_existing=False):
    try:
        fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=parent)
    except FileExistsError:
        if not allow_existing: raise
        fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent)
        try:
            if fd_bytes(fd) != raw: raise ValueError('immutable content mismatch')
        finally: os.close(fd)
        return
    try: write_all(fd, raw)
    finally: os.close(fd)
    os.fsync(parent)


def persist_capture(raw, metadata):
    sha = digest(raw)
    name = sha + '.body'
    capture_id = uuid.uuid4().hex
    value = {**metadata, 'capture_id': capture_id,
             'capture_path': 'public_captures/' + name,
             'captured_bytes': len(raw), 'sha256': sha,
             'source_version': 'sha256:' + sha,
             'capture_format': 'exact-http-response-body-bytes',
             'captured_utc': utc_now()}
    metadata_raw = encoded(value) + b'\n'
    fd = store_fd('public_captures')
    try:
        names = os.listdir(fd)
        body_count, total = 0, 0
        for item in names:
            meta = os.stat(item, dir_fd=fd, follow_symlinks=False)
            if not stat.S_ISREG(meta.st_mode) or meta.st_nlink != 1:
                raise ValueError('unsafe capture store entry')
            total += meta.st_size
            if item.endswith('.body'): body_count += 1
        if total + len(raw) + len(metadata_raw) > MAX_OUTPUT or body_count >= 128 or len(names) >= 384:
            raise ValueError('aggregate capture cap exceeded')
        immutable_at(fd, name, raw, allow_existing=True)
        immutable_at(fd, capture_id + '.json', metadata_raw)
        return value
    finally: os.close(fd)


def receipt(value):
    fd = store_fd('operation_receipts')
    try:
        log = os.open('events.jsonl', os.O_WRONLY | os.O_APPEND | os.O_CREAT | os.O_NOFOLLOW | os.O_NONBLOCK, 0o600, dir_fd=fd)
        try:
            fcntl.flock(log, fcntl.LOCK_EX)
            meta = os.fstat(log)
            raw = encoded({'schema': 'pm.v8.operation-receipt.v1', 'utc': utc_now(),
                           'server_version': SERVER_VERSION, **value}) + b'\n'
            if not stat.S_ISREG(meta.st_mode) or meta.st_nlink != 1 or meta.st_size + len(raw) > MAX_OUTPUT:
                raise ValueError('unsafe/oversized receipt store')
            write_all(log, raw)
        finally: os.close(log)
        os.fsync(fd)
    finally: os.close(fd)


def public_url(url):
    if not isinstance(url, str) or not url or len(url.encode('utf-8')) > 8192 or any(ord(c) <= 32 or ord(c) == 127 for c in url):
        raise ValueError('bounded URL required')
    p = urlsplit(url)
    if p.scheme != 'https' or not p.hostname or '@' in p.netloc or p.port not in (None, 443) or p.fragment:
        raise ValueError('public HTTPS URL without credentials/alternate port required')
    ips = sorted({a[4][0] for a in socket.getaddrinfo(p.hostname, 443, type=socket.SOCK_STREAM)})
    if not ips or any(not ipaddress.ip_address(ip).is_global or ipaddress.ip_address(ip).is_multicast for ip in ips):
        raise ValueError('private/loopback/linklocal/multicast address denied')
    return p, ips[0]


def byte_result(path, raw, start, count):
    if type(start) is not int or type(count) is not int or not 0 <= start <= MAX_BYTES or not 1 <= count <= MAX_TEXT_BYTES:
        raise ValueError('bounded byte range required')
    part = raw[start:start + count]
    try:
        text = part.decode('utf-8')
        decoding = 'utf-8-exact'
    except UnicodeDecodeError:
        text = part.decode('utf-8', errors='replace')
        decoding = 'utf-8-replacement; range bytes remain authoritative'
    text_raw = text.encode('utf-8')
    return {'path': path, 'sha256': digest(raw), 'bytes': len(raw),
            'byte_start': min(start, len(raw)), 'requested_byte_start': start,
            'requested_byte_count': count, 'byte_end_exclusive': min(start + count, len(raw)),
            'range_bytes': len(part), 'range_sha256': digest(part),
            'text': text, 'text_decoding': decoding,
            'transmitted_text_utf8_bytes': len(text_raw), 'transmitted_text_sha256': digest(text_raw),
            'complete_source_delivered': start == 0 and len(part) == len(raw) and decoding == 'utf-8-exact',
            'additional_source_bytes_remain': start + len(part) < len(raw)}


def safe_header(response, name):
    value = response.getheader(name)
    return value[:1024] if isinstance(value, str) else None


def fetch(url):
    if os.environ.get('PM_PUBLIC_GET') != '1':
        raise ValueError('public fetching not admitted by this task source policy')
    requested_url = url
    redirects = []
    for _ in range(4):
        p, ip = public_url(url)
        conn = http.client.HTTPSConnection(p.hostname, timeout=10, context=ssl.create_default_context())
        raw_socket = socket.create_connection((ip, 443), timeout=10)
        try:
            # Checked address is pinned; TLS authenticates the original hostname.
            conn.sock = conn._context.wrap_socket(raw_socket, server_hostname=p.hostname)
            conn.request('GET', (p.path or '/') + ('?' + p.query if p.query else ''),
                         headers={'User-Agent': 'PM-research-boundary/2'})
            response = conn.getresponse()
            if response.status in (301, 302, 303, 307, 308):
                # Redirect target is checked and pinned afresh before any connection.
                redirects.append({'url': url, 'status': response.status})
                url = urljoin(url, response.getheader('Location', ''))
                continue
            incomplete = False
            try: observed = response.read(MAX_BYTES + 1)
            except http.client.IncompleteRead as exc:
                observed = exc.partial[:MAX_BYTES + 1]
                incomplete = True
            length_header = safe_header(response, 'Content-Length')
            if length_header is not None and length_header.isdecimal() and len(observed) < int(length_header):
                incomplete = True
            if getattr(response, 'length', None) not in (None, 0):
                incomplete = True
            truncated = len(observed) > MAX_BYTES
            raw = observed[:MAX_BYTES]
            try: raw.decode('utf-8'); utf8_valid = True
            except UnicodeDecodeError: utf8_valid = False
            captured = persist_capture(raw, {
                'requested_url': requested_url, 'url': url, 'actual_url': url,
                'status': response.status, 'public_pinned_ip': ip,
                'redirects': redirects, 'response_bytes_observed': len(observed),
                'body_complete': not truncated and not incomplete,
                'truncated': truncated, 'incomplete_http_body': incomplete,
                'utf8_valid': utf8_valid, 'utf8_bytes': len(raw) if utf8_valid else None,
                'content_type': safe_header(response, 'Content-Type'),
                'etag': safe_header(response, 'ETag'),
                'last_modified': safe_header(response, 'Last-Modified'),
                'content_length_header': length_header,
                'content_encoding': safe_header(response, 'Content-Encoding'),
                'acquisition_disposition': 'PUBLIC_RESPONSE_CAPTURED; semantic acquisition UNKNOWN',
                'llm_read': 'UNOBSERVED'})
            return {**captured, 'delivery': byte_result(captured['capture_path'], raw, 0, FIRST_RANGE_BYTES)}
        finally:
            conn.close()
            raw_socket.close()
    raise ValueError('redirect cap exceeded')


def delivery_carrier():
    path=os.environ.get('PM_BUNDLE_PROFILE')
    if not path:return None,None
    spec=importlib.util.spec_from_file_location('operator_bundle_carrier','/runtime/bundle_carrier.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module,module.load_profile(path,os.environ.get('PM_BUNDLE_PROFILE_SHA256'))

def perform(name, args, operation_context=None):
    if not isinstance(args, dict): raise ValueError('object arguments required')
    if name == 'read_file':
        if set(args) - {'path', 'line_start', 'line_count', 'byte_start', 'byte_count'}:
            raise ValueError('unknown read argument')
        if ('byte_start' in args or 'byte_count' in args) and ('line_start' in args or 'line_count' in args):
            raise ValueError('choose one range kind')
        raw = read_raw(args['path'])
        if 'byte_start' in args or 'byte_count' in args:
            return byte_result(args['path'], raw, args.get('byte_start', 0), args.get('byte_count', FIRST_RANGE_BYTES))
        start, count = args.get('line_start', 1), args.get('line_count', 4096)
        if type(start) is not int or type(count) is not int or not 1 <= start <= 100000 or not 1 <= count <= 4096:
            raise ValueError('bounded positive line range required')
        lines = raw.decode('utf-8').splitlines()
        source_pieces = raw.decode('utf-8').splitlines(keepends=True)
        source_offsets = [0]
        for piece in source_pieces:
            source_offsets.append(source_offsets[-1] + len(piece.encode('utf-8')))
        selected = []
        selected_bytes = 0
        end_line = start - 1
        truncated = False
        for n, line in enumerate(lines, 1):
            if not start <= n < start + count: continue
            value = (('\n' if selected else '') + f'{n}: {line}').encode('utf-8')
            if selected_bytes + len(value) > MAX_TEXT_BYTES:
                truncated = True
                break
            selected.append(value); selected_bytes += len(value); end_line = n
        text = b''.join(selected).decode('utf-8')
        source_start = source_offsets[min(start - 1, len(source_pieces))]
        source_end = source_offsets[min(max(end_line, start - 1), len(source_pieces))]
        source_range = raw[source_start:source_end]
        return {'path': args['path'], 'sha256': digest(raw), 'bytes': len(raw),
                'total_lines': len(lines), 'line_start': start, 'requested_line_count': count,
                'line_end_inclusive': end_line, 'text': text, 'delivery_truncated': truncated,
                'source_byte_start': source_start, 'source_byte_end_exclusive': source_end,
                'source_range_bytes': len(source_range), 'source_range_sha256': digest(source_range),
                'transmitted_text_utf8_bytes': selected_bytes, 'transmitted_text_sha256': digest(text.encode('utf-8'))}
    if name == 'write_file':
        if set(args) != {'path', 'text'} or not isinstance(args['text'], str): raise ValueError('path/text required')
        carrier,profile=delivery_carrier()
        if profile is not None:
            if args['path']==profile['bundle_path']:
                deadline=int(os.environ['PM_BUNDLE_DEADLINE_NS'])
                context={**(operation_context or {}),'operator_profile_sha256':os.environ.get('PM_BUNDLE_PROFILE_SHA256')}
                return carrier.commit(args['text'].encode('utf-8'),profile,read_raw,parent_fd,ROOT,context,deadline)
            if args['path'] in profile['allowed_outputs'].values():raise ValueError('opted-in canonical files require one native-endorsed bundle')
            if args['path'].startswith(profile['commit_dir']+'/') and not os.path.isdir(ROOT+'/'+profile['commit_dir']):raise ValueError('fresh final directory reserved for atomic bundle')
        return write_raw(args['path'], args['text'].encode('utf-8'))
    if name == 'public_https_get':
        if set(args) != {'url'}: raise ValueError('URL only; no headers/body/proxy')
        return fetch(args['url'])
    if name == 'mechanical':
        if set(args) != {'operation', 'source', 'output'}: raise ValueError('fixed operation/source/output required')
        raw = read_raw(args['source'])
        operation = args['operation']
        if operation == 'line_map':
            value = {'source': args['source'], 'source_sha256': digest(raw), 'lines': [
                {'line': n, 'text': line} for n, line in enumerate(raw.decode('utf-8').splitlines(), 1)]}
            output = (json.dumps(value, ensure_ascii=False) + '\n').encode()
        elif operation == 'render_sections':
            value = json.loads(raw)
            if not isinstance(value, list) or not value or any(not isinstance(x, dict) or set(x) != {'id', 'body'} or not isinstance(x['body'], str) for x in value):
                raise ValueError('whole id/body sections required')
            output = ('\n\n'.join(x['body'] for x in value) + '\n').encode()
        elif operation == 'cache_source':
            output = raw
        else: raise ValueError('operation not enumerated')
        result = write_raw(args['output'], output)
        return {**result, 'operation': operation, 'source_sha256': digest(raw)}
    raise ValueError('tool not admitted')


def tool(name, properties, required):
    return {'name': name,
            'description': 'Bounded ' + name + '; case-owned inputs/public captures/out only; no execution. Public capture evidence does not establish semantic understanding.',
            'inputSchema': {'type': 'object', 'properties': properties, 'required': required, 'additionalProperties': False}}


STR = {'type': 'string'}
TOOLS = [tool('read_file', {'path': STR, 'line_start': {'type': 'integer'}, 'line_count': {'type': 'integer'},
                          'byte_start': {'type': 'integer'}, 'byte_count': {'type': 'integer'}}, ['path']),
         tool('write_file', {'path': STR, 'text': STR}, ['path', 'text']),
         tool('mechanical', {'operation': {'enum': ['line_map', 'render_sections', 'cache_source']}, 'source': STR, 'output': STR}, ['operation', 'source', 'output'])]
if os.environ.get('PM_PUBLIC_GET') == '1':
    TOOLS.append(tool('public_https_get', {'url': STR}, ['url']))


def main():
    resource.setrlimit(resource.RLIMIT_FSIZE, (MAX_OUTPUT, MAX_OUTPUT))
    resource.setrlimit(resource.RLIMIT_NOFILE, (128, 128))
    while True:
        raw = sys.stdin.buffer.readline(MAX_BYTES * 2 + 1)
        if not raw: break
        if len(raw) > MAX_BYTES * 2 or not raw.endswith(b'\n'): return 2
        try: request = json.loads(raw)
        except (ValueError, UnicodeError): return 2
        if not isinstance(request, dict): return 2
        if 'id' not in request: continue
        operation_id = None
        started = time.monotonic()
        tool_name = None
        args_hash = None
        try:
            method = request['method']
            if method == 'initialize':
                result = {'protocolVersion': '2024-11-05', 'capabilities': {'tools': {}}, 'serverInfo': {'name': 'pm_boundary', 'version': SERVER_VERSION}}
            elif method == 'tools/list': result = {'tools': TOOLS}
            elif method == 'ping': result = {}
            elif method == 'tools/call':
                operation_id = uuid.uuid4().hex
                resource.setrlimit(resource.RLIMIT_CPU, (60, 60))
                signal.signal(signal.SIGALRM, lambda *_: (_ for _ in ()).throw(TimeoutError('operation cap')))
                signal.alarm(15)
                tool_name = request['params']['name']
                args = request['params'].get('arguments', {})
                args_hash = digest(encoded(args))
                receipt({'operation_id': operation_id, 'stage': 'operation-started',
                         'tool': tool_name if tool_name in ('read_file', 'write_file', 'mechanical', 'public_https_get') else 'UNADMITTED',
                         'argument_sha256': args_hash})
                value = {**perform(tool_name, args, {'operation_id':operation_id,'argument_sha256':args_hash}), 'operation_id': operation_id}
                text = json.dumps(value, ensure_ascii=False)
                if len(text.encode()) > MAX_BYTES * 2: raise ValueError('result cap exceeded')
                result = {'content': [{'type': 'text', 'text': text}], 'isError': False}
            else: raise ValueError('MCP method not admitted')
        except Exception as exc:
            result = {'content': [{'type': 'text', 'text': 'boundary failure: ' + type(exc).__name__}], 'isError': True}
        finally:
            signal.alarm(0)
        envelope = json.dumps({'jsonrpc': '2.0', 'id': request['id'], 'result': result}, ensure_ascii=False).encode('utf-8') + b'\n'
        if operation_id:
            try:
                summary = {'operation_id': operation_id, 'tool': tool_name if tool_name in ('read_file', 'write_file', 'mechanical', 'public_https_get') else 'UNADMITTED',
                           'argument_sha256': args_hash, 'is_error': result.get('isError', False),
                           'elapsed_seconds': time.monotonic() - started,
                           'rpc_envelope_bytes': len(envelope), 'rpc_envelope_sha256': digest(envelope),
                           'semantic_acquisition': 'UNKNOWN', 'llm_read': 'UNOBSERVED'}
                if not result.get('isError', False):
                    summary['source_evidence'] = {key: value[key] for key in ('path', 'operation', 'source_sha256', 'capture_id', 'capture_path', 'sha256', 'bytes', 'captured_bytes', 'actual_url', 'source_version', 'status', 'body_complete', 'truncated', 'range_sha256', 'range_bytes', 'byte_start', 'byte_end_exclusive', 'transmitted_text_sha256', 'transmitted_text_utf8_bytes', 'complete_source_delivered', 'additional_source_bytes_remain', 'text_decoding', 'line_start', 'line_end_inclusive', 'delivery_truncated', 'source_byte_start', 'source_byte_end_exclusive', 'source_range_bytes', 'source_range_sha256') if key in value}
                    if 'delivery' in value:
                        summary['delivery_evidence'] = {key: value['delivery'][key] for key in ('sha256', 'range_sha256', 'range_bytes', 'byte_start', 'byte_end_exclusive', 'transmitted_text_sha256', 'transmitted_text_utf8_bytes')}
                receipt({**summary, 'stage': 'prepared-result'})
            except Exception: return 2  # No unrecorded tool response crosses the boundary.
        try:
            sys.stdout.buffer.write(envelope)
            sys.stdout.buffer.flush()
        except (BrokenPipeError, OSError): return 2
        if operation_id:
            try:
                receipt({**summary, 'stage': 'stdout-flushed',
                         'transport_witness_scope': 'tool-server stdout flush only; frontend receipt/model consumption unobserved'})
            except Exception: return 2


if __name__ == '__main__': sys.exit(main() or 0)
