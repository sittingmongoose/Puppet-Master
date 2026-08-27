from __future__ import annotations

import base64 as _base64
import collections.abc as _abc
import fcntl as _fcntl
import hashlib as _hashlib
import json as _json
import os as _os
import pathlib as _pathlib
import re as _re
import stat as _stat
from typing import Any as _Any

__all__ = ['begin_run']

_INSTRUCTION = b'TEST-TAKER TRANSPORT: Answer the frozen packet below directly in your first final response. Do not use tools, files, browsing, network, memory, delegation, or other agents.\n\n'
_HEX = _re.compile('[0-9a-f]{64}')
_UUID = _re.compile('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
_NAME = _re.compile('[A-Za-z0-9][A-Za-z0-9_.-]{0,191}')
_TRANSPORT = 'HOST_BOUND_RAW_CODEX_CLI_TRANSACTION_V1'
_ROWS = ('packet.txt', 'cli_stdin.txt', 'attempt.json', 'host_spawn_request.json', 'host_capture_frame.json', 'host_capture_result.json', 'completion.json')
_ROUTES = ({'slot': 'slot-alpha', 'model': 'gpt-5.4-mini', 'reasoning_effort': 'xhigh'}, {'slot': 'slot-bravo', 'model': 'gpt-5.4-mini', 'reasoning_effort': 'medium'}, {'slot': 'slot-charlie', 'model': 'gpt-5.6-luna', 'reasoning_effort': 'medium'})
_ROLES = ('APPEND_ONLY_EVIDENCE_RECORDER', 'IMMUTABLE_SEMANTIC_BUNDLE', 'OFFLINE_VERIFIER', 'PROCESS_RUNNER')
_SHARED = (
    {'role': 'OPERATING_CONTRACT_GENERAL_SCOPE', 'successor_root_relative_path': 'r9_goal_operating_contract_v1.json', 'sha256': '764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd', 'bytes': 7024},
    {'role': 'CODEX_CLI_TRANSPORT_USER_ADJUDICATION', 'successor_root_relative_path': 'r9_control_plane_stabilization_v1/r9_codex_cli_transport_user_adjudication_v2.json', 'sha256': 'd10e90ab5d7d325c243352f758f5adc7c2ca6f71c3853779cb61e3643a54a7eb', 'bytes': 10393},
)
_RUN_FIELDS = set('schema_id run_id run_kind mode scenario created_utc component_identity component_provenance shared_authorities shared_authority_count routes schedule route_count cells_per_route cell_count planned_call_count stage_count required_clean_stage_artifact_count regression_family_count regression_variant_count global_fault_count semantic_counterfactual_count transport_kind session_reuse retry_count relaunch_count best_of replacement_count public_commands custody seal_epoch seal_protocol_schema_id seal_scratch_name host_capture_frame_schema_id host_capture_result_schema_id host_transaction_derivation external_host_binding_required component_qualification_credit sequential_run_policy'.split())
_ATTEMPT_FIELDS = set('schema_id run_id run_kind mode row_id slot cell index ordinal nonce invocation_id task_name logical_task_path transport_kind session_reuse model reasoning_effort causal_inputs packet_sha256 packet_bytes message_sha256 message_bytes attempt retry_count relaunch_count best_of replacement_result no_retry no_relaunch admission_state'.split())
_REQUEST_FIELDS = set('schema_id run_id run_kind mode row_id slot cell index ordinal nonce invocation_id task_name logical_task_path transport_kind session_reuse model reasoning_effort packet_sha256 packet_bytes message_sha256 message_bytes attempt_sha256 attempt_bytes'.split())
_COMPLETION_FIELDS = set('schema_id run_id row_id attempt_sha256 attempt_bytes host_spawn_request_sha256 host_spawn_request_bytes host_capture_frame_sha256 host_capture_frame_bytes host_capture_result_sha256 host_capture_result_bytes consumer_result status cli_thread_id lifecycle_digest component_qualification_credit external_gate_eligible attempt retry_count relaunch_count best_of replacement_result session_reuse completion_is_last_row_write'.split())
_FRAME_FIELDS = set('schema_id host_transaction_id spawn_request executable launch process captures'.split())
_RESULT_FIELDS = set('schema_id host_transaction_id frame_sha256 frame_bytes process_disposition cli_thread_id lifecycle_digest lifecycle_status final activity stderr_sha256 stderr_bytes qualification_credit'.split())
_STAGE_FIELDS = set('schema_id run_id slot stage index rule finalization_row_id finalization_ordinal causal_inputs artifact_payload_utf8 artifact_payload_sha256 artifact_payload_bytes artifact_storage_sha256 artifact_storage_bytes'.split())
_ARTIFACTS = (
    ('a00', 'seal_intent.json', 'pw-r9-seal-recipe-a00-v2'),
    ('a01', 'seal_plan.json', 'pw-r9-seal-recipe-a01-v2'),
    ('a02', 'terminals/slot-alpha.json', 'pw-r9-seal-recipe-a02-v2'),
    ('a03', 'cursors/000.json', 'pw-r9-seal-recipe-a03-v2'),
    ('a04', 'terminals/slot-bravo.json', 'pw-r9-seal-recipe-a04-v2'),
    ('a05', 'cursors/001.json', 'pw-r9-seal-recipe-a05-v2'),
    ('a06', 'terminals/slot-charlie.json', 'pw-r9-seal-recipe-a06-v2'),
    ('a07', 'cursors/002.json', 'pw-r9-seal-recipe-a07-v2'),
    ('a08', 'matrix_terminal.json', 'pw-r9-seal-recipe-a08-v2'),
    ('a09', 'cursors/003.json', 'pw-r9-seal-recipe-a09-v2'),
    ('a10', 'accounting.json', 'pw-r9-seal-recipe-a10-v2'),
)
_LIVE: dict[object, '_RunSession'] = {}


class _Invalid(RuntimeError):
    pass


def _canon(value):
    try:
        return _json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise _Invalid(f'not canonical JSON: {exc}') from exc


def _sha(data):
    return _hashlib.sha256(data).hexdigest()


def _pairs(rows):
    value = {}
    for key, item in rows:
        if key in value:
            raise _Invalid(f'duplicate JSON key: {key}')
        value[key] = item
    return value


def _mapping(value, label):
    if not isinstance(value, _abc.Mapping):
        raise _Invalid(f'{label} must be a mapping')
    result = dict(value)
    if any(not isinstance(key, str) for key in result):
        raise _Invalid(f'{label} has a non-text key')
    _canon(result)
    return result


def _integer(value, label, minimum=0):
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise _Invalid(f'{label} must be an integer at least {minimum}')
    return value


def _name(value, label):
    if not isinstance(value, str) or not _NAME.fullmatch(value) or value in {'.', '..'} or '/' in value or '\\' in value:
        raise _Invalid(f'{label} is not a confined name')
    return value


def _digest(value, label):
    if not isinstance(value, str) or not _HEX.fullmatch(value):
        raise _Invalid(f'{label} is not lowercase SHA-256')
    return value


def _uuid(value, label='cli_thread_id'):
    if not isinstance(value, str) or not _UUID.fullmatch(value):
        raise _Invalid(f'{label} is not a lowercase UUID')
    return value


def _root(path):
    if not isinstance(path, _pathlib.Path):
        raise _Invalid('run_root must be pathlib.Path')
    value = path if path.is_absolute() else _pathlib.Path.cwd() / path
    if '..' in value.parts:
        raise _Invalid('run_root parent traversal')
    current = _pathlib.Path(value.anchor)
    for part in value.parts[1:]:
        current /= part
        try:
            info = _os.lstat(current)
        except FileNotFoundError:
            continue
        if _stat.S_ISLNK(info.st_mode):
            raise _Invalid(f'symlink ancestor: {current}')
    return _pathlib.Path(_os.path.abspath(_os.fspath(value)))


def _lstat(path, label):
    try:
        info = _os.lstat(path)
    except FileNotFoundError as exc:
        raise _Invalid(f'{label}: absent') from exc
    if _stat.S_ISLNK(info.st_mode):
        raise _Invalid(f'{label}: symbolic link forbidden')
    return info


def _read_file(path, label, mode=0o444, links=1):
    before = _lstat(path, label)
    if not _stat.S_ISREG(before.st_mode) or _stat.S_IMODE(before.st_mode) != mode or before.st_uid != _os.geteuid() or before.st_nlink != links:
        raise _Invalid(f'{label}: file custody mismatch')
    fd = _os.open(path, _os.O_RDONLY | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0))
    chunks = []
    try:
        opened = _os.fstat(fd)
        if (opened.st_dev, opened.st_ino, opened.st_mode, opened.st_uid, opened.st_nlink, opened.st_size) != (before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_nlink, before.st_size):
            raise _Invalid(f'{label}: reopen identity mismatch')
        while True:
            part = _os.read(fd, 1024 * 1024)
            if not part:
                break
            chunks.append(part)
        after = _os.fstat(fd)
        if (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_nlink, after.st_size) != (opened.st_dev, opened.st_ino, opened.st_mode, opened.st_uid, opened.st_nlink, opened.st_size):
            raise _Invalid(f'{label}: unstable read')
    finally:
        _os.close(fd)
    data = b''.join(chunks)
    if len(data) != before.st_size:
        raise _Invalid(f'{label}: short read')
    return data


def _json_storage(data, label):
    if not data or not data.endswith(b'\n') or data.endswith(b'\n\n') or b'\r' in data:
        raise _Invalid(f'{label}: not canonical one-LF storage')
    try:
        value = _json.loads(data[:-1].decode('utf-8'), object_pairs_hook=_pairs, parse_constant=lambda item: (_ for _ in ()).throw(_Invalid(item)))
    except (UnicodeDecodeError, _json.JSONDecodeError, _Invalid) as exc:
        raise _Invalid(f'{label}: invalid JSON: {exc}') from exc
    if not isinstance(value, dict) or data != _canon(value) + b'\n':
        raise _Invalid(f'{label}: not a canonical object')
    return value


def _component(value):
    item = _mapping(value, 'component_identity')
    if set(item) != {'schema_id', 'part_count', 'aggregate_file_bytes', 'rows_sha256', 'rows_bytes', 'parts'} or item.get('schema_id') != 'pw-r9-four-part-component-identity-v1' or item.get('part_count') != 4:
        raise _Invalid('component identity shape mismatch')
    parts = item.get('parts')
    if not isinstance(parts, list) or len(parts) != 4:
        raise _Invalid('component parts mismatch')
    normalized = []
    for role, raw in zip(_ROLES, parts):
        part = _mapping(raw, 'component part')
        if set(part) != {'role', 'sha256', 'bytes'} or part.get('role') != role:
            raise _Invalid('component role mismatch')
        _digest(part.get('sha256'), 'component sha256')
        _integer(part.get('bytes'), 'component bytes', 1)
        normalized.append(part)
    rows = _canon(normalized)
    if item.get('aggregate_file_bytes') != sum(part['bytes'] for part in normalized) or item.get('rows_sha256') != _sha(rows) or item.get('rows_bytes') != len(rows):
        raise _Invalid('component aggregate mismatch')


def _validate_run(root, run):
    if set(run) != _RUN_FIELDS or run.get('schema_id') != 'pw-r9-run-v7' or run.get('run_id') != root.name:
        raise _Invalid('run v7 exact fields/schema mismatch')
    _name(run.get('run_id'), 'run_id')
    if run.get('run_kind') not in {'simulate', 'run-canary', 'run-matrix'} or run.get('mode') != ('synthetic' if run['run_kind'] == 'simulate' else 'actual'):
        raise _Invalid('run kind/mode mismatch')
    fixed = {'shared_authority_count': 2, 'transport_kind': _TRANSPORT, 'session_reuse': False, 'retry_count': 0, 'relaunch_count': 0, 'best_of': False, 'replacement_count': 0, 'public_commands': ['simulate', 'run-canary', 'run-matrix', 'reopen'], 'host_capture_frame_schema_id': 'pw-r9-host-capture-frame-v1', 'host_capture_result_schema_id': 'pw-r9-host-capture-result-v1', 'host_transaction_derivation': 'SHA256_PREFIX_PLUS_CANONICAL_HOST_SPAWN_REQUEST_BYTES_NO_LF', 'external_host_binding_required': {'actual': True, 'synthetic': False}, 'component_qualification_credit': 0, 'sequential_run_policy': 'FRESH_EVIDENCE_ROOT_NO_ACTUAL_CONCURRENCY', 'seal_protocol_schema_id': 'pw-r9-seal-transaction-catalog-v2'}
    if any(run.get(key) != expected for key, expected in fixed.items()) or run.get('shared_authorities') != list(_SHARED):
        raise _Invalid('run fixed fields mismatch')
    _component(run.get('component_identity'))
    epoch = _sha(_canon([run['run_id'], 'pw-r9-v8-seal-epoch-v1']))
    if run.get('seal_epoch') != epoch or run.get('seal_scratch_name') != f'seal-staging-{epoch}':
        raise _Invalid('seal identity mismatch')
    routes = run.get('routes')
    if routes != list(_ROUTES) or run.get('route_count') != 3:
        raise _Invalid('route roster mismatch')
    schedule = run.get('schedule')
    count = 3 if run['run_kind'] == 'run-canary' else 291
    if not isinstance(schedule, list) or len(schedule) != count or run.get('planned_call_count') != count:
        raise _Invalid('schedule count mismatch')
    seen = set()
    for index, raw in enumerate(schedule):
        row = _mapping(raw, 'schedule row')
        if set(row) != {'row_id', 'ordinal', 'slot', 'cell', 'index', 'nonce', 'invocation_id', 'task_name', 'logical_task_path'}:
            raise _Invalid('schedule row exact fields mismatch')
        if row.get('row_id') != f'row-{index:03d}' or row.get('ordinal') != index or row.get('index') != index or row.get('slot') not in {x['slot'] for x in _ROUTES}:
            raise _Invalid('schedule order mismatch')
        nonce = _digest(row.get('nonce'), 'schedule nonce')
        task = f'r9_{nonce}'
        values = (nonce, f'r9-invocation:{nonce}', task, f'/root/{task}')
        if (row.get('invocation_id'), row.get('task_name'), row.get('logical_task_path')) != values[1:] or any(value in seen for value in values):
            raise _Invalid('schedule identity mismatch')
        seen.update(values)


def _blob(value, label, optional=False):
    item = _mapping(value, label)
    if optional:
        if set(item) != {'state', 'base64', 'sha256', 'bytes'} or item.get('state') not in {'ABSENT', 'PRESENT'}:
            raise _Invalid(f'{label}: optional blob shape mismatch')
        if item['state'] == 'ABSENT' and item != {'state': 'ABSENT', 'base64': None, 'sha256': None, 'bytes': 0}:
            raise _Invalid(f'{label}: absent blob mismatch')
        if item['state'] == 'ABSENT':
            return b''
    elif set(item) != {'base64', 'sha256', 'bytes'}:
        raise _Invalid(f'{label}: blob shape mismatch')
    try:
        data = _base64.b64decode(item.get('base64'), validate=True)
    except Exception as exc:
        raise _Invalid(f'{label}: invalid base64') from exc
    if item.get('sha256') != _sha(data) or item.get('bytes') != len(data):
        raise _Invalid(f'{label}: blob identity mismatch')
    return data


def _inventory_root(schema, rows):
    data = _canon(rows)
    return {'schema_id': schema, 'sha256': _sha(data), 'bytes': len(data), 'count': len(rows)}


class _RunSession:
    __slots__ = ('_root', '_scratch', '_run', '_run_bytes', '_lock_fd', '_root_id', '_lock_id', '_pid', '_token', '_state')

    def __init__(self, root, scratch, run, run_bytes, lock_fd):
        self._root = root
        self._scratch = scratch
        self._run = run
        self._run_bytes = run_bytes
        self._lock_fd = lock_fd
        root_stat = _lstat(root, 'run root')
        lock_stat = _lstat(root / 'seal.lock', 'seal lock')
        self._root_id = (root_stat.st_dev, root_stat.st_ino)
        self._lock_id = (lock_stat.st_dev, lock_stat.st_ino)
        self._pid = _os.getpid()
        self._token = object()
        self._state = 'LIVE'
        _LIVE[self._token] = self

    def __copy__(self):
        raise _Invalid('live run session is not copyable')

    def __deepcopy__(self, memo):
        raise _Invalid('live run session is not copyable')

    def __reduce__(self):
        raise _Invalid('live run session is not serializable')

    def __reduce_ex__(self, protocol):
        raise _Invalid('live run session is not serializable')

    def __getstate__(self):
        raise _Invalid('live run session is not serializable')

    def __del__(self):
        try:
            self._revoke('FAILED')
        except Exception:
            pass

    def _guard(self, sealing=False):
        required = {'SEALING'} if sealing else {'LIVE'}
        if self._state not in required or _os.getpid() != self._pid or _LIVE.get(self._token) is not self:
            raise _Invalid('live session capability rejected')
        if self._lock_fd < 0 or not (_fcntl.fcntl(self._lock_fd, _fcntl.F_GETFD) & _fcntl.FD_CLOEXEC):
            raise _Invalid('CLOEXEC lease rejected')
        root_stat = _lstat(self._root, 'guarded run root')
        lock_stat = _lstat(self._root / 'seal.lock', 'guarded seal lock')
        opened = _os.fstat(self._lock_fd)
        if (root_stat.st_dev, root_stat.st_ino) != self._root_id or (lock_stat.st_dev, lock_stat.st_ino) != self._lock_id or (opened.st_dev, opened.st_ino) != self._lock_id or _stat.S_IMODE(lock_stat.st_mode) != 0o600 or lock_stat.st_uid != _os.geteuid() or lock_stat.st_nlink != 1:
            raise _Invalid('session root/lock identity rejected')
        if _read_file(self._root / 'run.json', 'guarded run manifest') != self._run_bytes:
            raise _Invalid('run identity changed')
        probe = _os.open(self._root / 'seal.lock', _os.O_RDONLY | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0))
        try:
            try:
                _fcntl.flock(probe, _fcntl.LOCK_EX | _fcntl.LOCK_NB)
            except BlockingIOError:
                pass
            else:
                _fcntl.flock(probe, _fcntl.LOCK_UN)
                raise _Invalid('retained exclusive lock lost')
        finally:
            _os.close(probe)

    def _revoke(self, state='FAILED'):
        if getattr(self, '_state', 'CLOSED') in {'CLOSED', 'FAILED'}:
            return
        self._state = state
        token = getattr(self, '_token', None)
        if token is not None and _LIVE.get(token) is self:
            del _LIVE[token]
        fd = getattr(self, '_lock_fd', -1)
        self._lock_fd = -1
        if fd >= 0:
            _os.close(fd)

    def _mutate(self, call, *args, sealing=False, **kwargs):
        self._guard(sealing)
        return call(*args, **kwargs)

    def _sync_dir(self, path, sealing=False):
        self._guard(sealing)
        fd = _os.open(path, _os.O_RDONLY | getattr(_os, 'O_DIRECTORY', 0) | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0))
        try:
            self._guard(sealing)
            _os.fsync(fd)
        finally:
            _os.close(fd)

    def _mkdir(self, path, mode=0o755, sealing=False):
        self._mutate(_os.mkdir, path, mode, sealing=sealing)
        self._guard(sealing)
        fd = _os.open(path, _os.O_RDONLY | getattr(_os, 'O_DIRECTORY', 0) | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0))
        try:
            self._mutate(_os.fchmod, fd, mode, sealing=sealing)
            self._guard(sealing)
            _os.fsync(fd)
        finally:
            _os.close(fd)
        self._sync_dir(path.parent, sealing)

    def _write(self, path, data, sealing=False):
        flags = _os.O_CREAT | _os.O_EXCL | _os.O_WRONLY | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0)
        self._guard(sealing)
        fd = _os.open(path, flags, 0o444)
        try:
            self._mutate(_os.fchmod, fd, 0o444, sealing=sealing)
            view = memoryview(data)
            while view:
                self._guard(sealing)
                count = _os.write(fd, view)
                if count <= 0:
                    raise _Invalid('short evidence write')
                view = view[count:]
            self._guard(sealing)
            _os.fsync(fd)
        finally:
            _os.close(fd)
        self._sync_dir(path.parent, sealing)
        if _read_file(path, f'reopened {path.name}') != data:
            raise _Invalid('durable reopen mismatch')
        return (_sha(data), len(data))

    def _write_json(self, path, value, sealing=False):
        return self._write(path, _canon(value) + b'\n', sealing)

    def _row(self, row_id):
        row_id = _name(row_id, 'row_id')
        matches = [dict(row) for row in self._run['schedule'] if row.get('row_id') == row_id]
        if len(matches) != 1:
            raise _Invalid('row_id is not uniquely scheduled')
        return matches[0], self._root / 'rows' / row_id

    def _route(self, slot):
        matches = [dict(route) for route in self._run['routes'] if route.get('slot') == slot]
        if len(matches) != 1:
            raise _Invalid('route is not uniquely declared')
        return matches[0]

    def _fail(self):
        self._revoke('FAILED')

    def write_row_artifact(self, row_id: str, packet: bytes, cli_stdin: bytes, attempt: _abc.Mapping[str, _Any]):
        self._guard()
        try:
            row, directory = self._row(row_id)
            if not isinstance(packet, bytes) or not packet or not packet.endswith(b'\n') or packet.endswith(b'\n\n') or b'\r' in packet or not isinstance(cli_stdin, bytes) or cli_stdin != _INSTRUCTION + packet[:-1]:
                raise _Invalid('packet/CLI stdin mismatch')
            packet.decode('utf-8'); cli_stdin.decode('utf-8')
            value = _mapping(attempt, 'attempt')
            route = self._route(row['slot'])
            fixed = {'schema_id': 'pw-r9-attempt-v6', 'run_id': self._run['run_id'], 'run_kind': self._run['run_kind'], 'mode': self._run['mode'], 'row_id': row_id, 'slot': row['slot'], 'cell': row['cell'], 'index': row['index'], 'ordinal': row['ordinal'], 'nonce': row['nonce'], 'invocation_id': row['invocation_id'], 'task_name': row['task_name'], 'logical_task_path': row['logical_task_path'], 'transport_kind': _TRANSPORT, 'session_reuse': False, 'model': route['model'], 'reasoning_effort': route['reasoning_effort'], 'packet_sha256': _sha(packet), 'packet_bytes': len(packet), 'message_sha256': _sha(cli_stdin), 'message_bytes': len(cli_stdin), 'attempt': 1, 'retry_count': 0, 'relaunch_count': 0, 'best_of': False, 'replacement_result': False, 'no_retry': True, 'no_relaunch': True, 'admission_state': 'FUSED_BEFORE_HOST_REQUEST'}
            if set(value) != _ATTEMPT_FIELDS or any(value.get(key) != expected for key, expected in fixed.items()) or not isinstance(value.get('causal_inputs'), list):
                raise _Invalid('attempt v6 mismatch')
            self._validate_causal(value['causal_inputs'])
            attempt_storage = _canon(value) + b'\n'
            request = {key: value[key] for key in ('run_id', 'run_kind', 'mode', 'row_id', 'slot', 'cell', 'index', 'ordinal', 'nonce', 'invocation_id', 'task_name', 'logical_task_path', 'transport_kind', 'session_reuse', 'model', 'reasoning_effort', 'packet_sha256', 'packet_bytes', 'message_sha256', 'message_bytes')}
            request['schema_id'] = 'pw-r9-host-spawn-request-v1'
            request['attempt_sha256'] = _sha(attempt_storage)
            request['attempt_bytes'] = len(attempt_storage)
            if set(request) != _REQUEST_FIELDS:
                raise _Invalid('host spawn request construction mismatch')
            request_bytes = _canon(request)
            transaction_id = 'r9-host-tx:' + _sha(b'PW_R9_HOST_TRANSACTION_V1\0' + request_bytes)
            self._mkdir(directory)
            self._write(directory / 'packet.txt', packet)
            self._write(directory / 'cli_stdin.txt', cli_stdin)
            self._write(directory / 'attempt.json', attempt_storage)
            self._write(directory / 'host_spawn_request.json', request_bytes + b'\n')
            return {'host_spawn_request': request, 'host_transaction_id': transaction_id}
        except Exception:
            self._fail()
            raise

    def _validate_causal(self, values):
        normalized = []
        for raw in values:
            item = _mapping(raw, 'causal input')
            if set(item) != {'kind', 'id', 'path', 'sha256', 'bytes'} or item.get('kind') not in {'PASS_CELL', 'STAGE_ARTIFACT'}:
                raise _Invalid('causal input shape mismatch')
            path = item.get('path')
            if not isinstance(path, str) or not path or '\\' in path:
                raise _Invalid('causal path mismatch')
            pure = _pathlib.PurePosixPath(path)
            if pure.is_absolute() or any(part in {'', '.', '..'} for part in pure.parts):
                raise _Invalid('causal path escapes run')
            data = _read_file(self._root.joinpath(*pure.parts), 'causal input')
            if item.get('sha256') != _sha(data) or item.get('bytes') != len(data):
                raise _Invalid('causal input identity mismatch')
            normalized.append(item)
        if normalized != sorted(normalized, key=lambda item: (item['kind'], item['id'], item['path'])) or len({item['path'] for item in normalized}) != len(normalized):
            raise _Invalid('causal inputs not sorted/unique')

    def _request(self, directory):
        data = _read_file(directory / 'host_spawn_request.json', 'host spawn request')
        value = _json_storage(data, 'host spawn request')
        if set(value) != _REQUEST_FIELDS or value.get('schema_id') != 'pw-r9-host-spawn-request-v1':
            raise _Invalid('host spawn request shape mismatch')
        return data, value, 'r9-host-tx:' + _sha(b'PW_R9_HOST_TRANSACTION_V1\0' + data[:-1])

    def _validate_frame(self, raw, request_storage, request, transaction_id):
        frame = _json_storage(raw, 'host capture frame')
        if self._run['mode'] == 'synthetic':
            if set(frame) != {'schema_id', 'synthetic_transaction_id', 'scenario_id', 'spawn_request', 'synthetic_events'} or frame.get('schema_id') != 'pw-r9-synthetic-host-capture-frame-v1' or not isinstance(frame.get('synthetic_events'), list):
                raise _Invalid('synthetic host frame mismatch')
            return frame
        if set(frame) != _FRAME_FIELDS or frame.get('schema_id') != 'pw-r9-host-capture-frame-v1' or frame.get('host_transaction_id') != transaction_id:
            raise _Invalid('host capture frame identity mismatch')
        spawn = _mapping(frame.get('spawn_request'), 'frame spawn request')
        if set(spawn) != {'schema_id', 'base64', 'sha256', 'bytes'} or spawn.get('schema_id') != 'pw-r9-host-spawn-request-v1':
            raise _Invalid('frame spawn request shape mismatch')
        try:
            embedded = _base64.b64decode(spawn.get('base64'), validate=True)
        except Exception as exc:
            raise _Invalid('frame spawn request base64 mismatch') from exc
        if embedded != request_storage[:-1] or spawn.get('sha256') != _sha(embedded) or spawn.get('bytes') != len(embedded):
            raise _Invalid('frame spawn request identity mismatch')
        executable = _mapping(frame.get('executable'), 'frame executable')
        if set(executable) != {'resolved_path', 'sha256', 'bytes', 'version'}:
            raise _Invalid('frame executable shape mismatch')
        _digest(executable.get('sha256'), 'executable sha256'); _integer(executable.get('bytes'), 'executable bytes', 1)
        launch = _mapping(frame.get('launch'), 'frame launch')
        if set(launch) != {'argv', 'cwd', 'stdin', 'stdin_write_count', 'stdin_closed', 'start_new_session', 'attempted_utc', 'attempted_monotonic_ns'} or launch.get('stdin_write_count') != 1 or launch.get('stdin_closed') is not True or launch.get('start_new_session') is not True:
            raise _Invalid('frame launch shape mismatch')
        stdin = _blob(launch.get('stdin'), 'frame stdin')
        cli_stdin = _read_file((self._root / 'rows' / request['row_id'] / 'cli_stdin.txt'), 'bound CLI stdin')
        if stdin != cli_stdin:
            raise _Invalid('frame stdin mismatch')
        process = _mapping(frame.get('process'), 'frame process')
        if set(process) != {'state', 'pid', 'process_group_id', 'started_utc', 'started_monotonic_ns', 'ended_utc', 'ended_monotonic_ns', 'returncode', 'timed_out', 'drain_timed_out', 'signal_events', 'residual_group'} or not isinstance(process.get('signal_events'), list):
            raise _Invalid('frame process shape mismatch')
        residual = _mapping(process.get('residual_group'), 'residual group')
        if set(residual) != {'state', 'process_group_id', 'member_pids', 'checked_utc', 'checked_monotonic_ns'} or residual.get('state') not in {'ABSENT', 'PRESENT', 'UNKNOWN'}:
            raise _Invalid('residual group mismatch')
        for index, raw_signal in enumerate(process['signal_events'], 1):
            signal = _mapping(raw_signal, 'signal event')
            if set(signal) != {'sequence', 'signal', 'source', 'attempted_utc', 'attempted_monotonic_ns', 'result'} or signal.get('sequence') != index:
                raise _Invalid('signal event mismatch')
        captures = _mapping(frame.get('captures'), 'frame captures')
        if set(captures) != {'stdout_jsonl', 'stderr', 'output_last_message'}:
            raise _Invalid('frame captures shape mismatch')
        _blob(captures.get('stdout_jsonl'), 'stdout_jsonl')
        _blob(captures.get('stderr'), 'stderr')
        _blob(captures.get('output_last_message'), 'output_last_message', True)
        return frame

    def write_host_capture_frame(self, row_id: str, raw_frame: bytes):
        self._guard()
        try:
            row, directory = self._row(row_id)
            if not isinstance(raw_frame, bytes) or [path.name for path in sorted(directory.iterdir(), key=lambda x: x.name)] != sorted(_ROWS[:4]):
                raise _Invalid('host frame prefix mismatch')
            request_storage, request, transaction_id = self._request(directory)
            identity = self._write(directory / 'host_capture_frame.json', raw_frame)
            self._validate_frame(raw_frame, request_storage, request, transaction_id)
            return {'sha256': identity[0], 'bytes': identity[1], 'host_transaction_id': transaction_id}
        except Exception:
            self._fail()
            raise

    def _activity(self, value):
        item = _mapping(value, 'activity')
        if set(item) != {'tool_calls', 'file_accesses', 'browsing', 'network_accesses', 'delegations', 'memory_accesses', 'followup_turns', 'nonterminal_messages', 'observation_basis'} or item.get('observation_basis') != 'ROOT_VISIBLE_CODEX_EXEC_JSONL_V0_148_0' or not isinstance(item.get('nonterminal_messages'), list):
            raise _Invalid('activity shape mismatch')
        for key in ('tool_calls', 'file_accesses', 'browsing', 'network_accesses', 'delegations', 'memory_accesses', 'followup_turns'):
            _integer(item.get(key), f'activity {key}')
        return item

    def _validate_result(self, value, frame_storage, frame, transaction_id):
        item = _mapping(value, 'host capture result')
        if set(item) != _RESULT_FIELDS or item.get('schema_id') != 'pw-r9-host-capture-result-v1' or item.get('host_transaction_id') != transaction_id or item.get('frame_sha256') != _sha(frame_storage) or item.get('frame_bytes') != len(frame_storage) or item.get('process_disposition') not in {'VALID_RC0', 'INVALID_PROCESS', 'INVALID_TIMEOUT', 'INVALID_DRAIN_TIMEOUT', 'INVALID_RESIDUAL_GROUP'} or item.get('qualification_credit') != 0:
            raise _Invalid('host capture result identity mismatch')
        thread = item.get('cli_thread_id')
        if thread is not None:
            _uuid(thread)
        _digest(item.get('lifecycle_digest'), 'lifecycle digest')
        self._activity(item.get('activity'))
        final = item.get('final')
        if final is not None:
            final = _mapping(final, 'capture final')
            if set(final) != {'raw_utf8', 'raw_sha256', 'raw_bytes', 'normalized_utf8', 'normalized_sha256', 'normalized_bytes', 'output_last_message_sha256', 'output_last_message_bytes'} or not isinstance(final.get('raw_utf8'), str) or not isinstance(final.get('normalized_utf8'), str):
                raise _Invalid('capture final shape mismatch')
            raw = final['raw_utf8'].encode('utf-8'); normalized = final['normalized_utf8'].encode('utf-8')
            if final.get('raw_sha256') != _sha(raw) or final.get('raw_bytes') != len(raw) or final.get('normalized_sha256') != _sha(normalized) or final.get('normalized_bytes') != len(normalized):
                raise _Invalid('capture final identity mismatch')
        if self._run['mode'] == 'actual':
            stderr = _blob(frame['captures']['stderr'], 'frame stderr')
            if item.get('stderr_sha256') != _sha(stderr) or item.get('stderr_bytes') != len(stderr):
                raise _Invalid('capture stderr identity mismatch')
        return item

    def write_host_capture_result(self, row_id: str, result: _abc.Mapping[str, _Any]):
        self._guard()
        try:
            row, directory = self._row(row_id)
            if [path.name for path in sorted(directory.iterdir(), key=lambda x: x.name)] != sorted(_ROWS[:5]):
                raise _Invalid('host result prefix mismatch')
            request_storage, request, transaction_id = self._request(directory)
            frame_storage = _read_file(directory / 'host_capture_frame.json', 'host capture frame')
            frame = self._validate_frame(frame_storage, request_storage, request, transaction_id)
            value = self._validate_result(result, frame_storage, frame, transaction_id)
            return self._write_json(directory / 'host_capture_result.json', value)
        except Exception:
            self._fail()
            raise

    def _consumer(self, value, result, transaction_id):
        item = _mapping(value, 'consumer result')
        if set(item) != {'schema_id', 'transport', 'result', 'score'} or item.get('schema_id') != 'pw-r9-consumer-result-v3':
            raise _Invalid('consumer result v3 mismatch')
        transport = _mapping(item.get('transport'), 'consumer transport')
        if set(transport) != {'host_transaction_id', 'transport_kind', 'cli_thread_id', 'lifecycle_digest', 'process_disposition', 'activity', 'prohibited_activity'} or transport.get('host_transaction_id') != transaction_id or transport.get('transport_kind') != _TRANSPORT or transport.get('cli_thread_id') != result.get('cli_thread_id') or transport.get('lifecycle_digest') != result.get('lifecycle_digest') or transport.get('process_disposition') != result.get('process_disposition') or transport.get('activity') != result.get('activity') or not isinstance(transport.get('prohibited_activity'), bool):
            raise _Invalid('consumer transport mismatch')
        projected = _mapping(item.get('result'), 'consumer projection')
        if set(projected) != {'normalization', 'raw_final_sha256', 'raw_final_bytes', 'normalized_utf8', 'normalized_sha256', 'normalized_bytes', 'returncode'} or not isinstance(projected.get('normalized_utf8'), str):
            raise _Invalid('consumer projection shape mismatch')
        normalized = projected['normalized_utf8'].encode('utf-8')
        if projected.get('normalized_sha256') != _sha(normalized) or projected.get('normalized_bytes') != len(normalized):
            raise _Invalid('consumer normalized identity mismatch')
        score = _mapping(item.get('score'), 'consumer score')
        if set(score) != {'rule', 'verdict', 'reason', 'expected_sha256', 'expected_bytes', 'actual_sha256', 'actual_bytes', 'returncode'} or score.get('actual_sha256') != projected.get('normalized_sha256') or score.get('actual_bytes') != projected.get('normalized_bytes') or score.get('returncode') != projected.get('returncode'):
            raise _Invalid('consumer score mismatch')
        _digest(score.get('expected_sha256'), 'expected sha256'); _integer(score.get('expected_bytes'), 'expected bytes')
        return item

    def _completion(self, directory, value):
        attempt = _read_file(directory / 'attempt.json', 'attempt')
        request = _read_file(directory / 'host_spawn_request.json', 'host spawn request')
        frame = _read_file(directory / 'host_capture_frame.json', 'host frame')
        result_storage = _read_file(directory / 'host_capture_result.json', 'host result')
        request_value = _json_storage(request, 'host request')
        transaction_id = 'r9-host-tx:' + _sha(b'PW_R9_HOST_TRANSACTION_V1\0' + request[:-1])
        frame_value = self._validate_frame(frame, request, request_value, transaction_id)
        result = self._validate_result(_json_storage(result_storage, 'host result'), frame, frame_value, transaction_id)
        fixed = {'schema_id': 'pw-r9-completion-v6', 'run_id': self._run['run_id'], 'row_id': directory.name, 'attempt_sha256': _sha(attempt), 'attempt_bytes': len(attempt), 'host_spawn_request_sha256': _sha(request), 'host_spawn_request_bytes': len(request), 'host_capture_frame_sha256': _sha(frame), 'host_capture_frame_bytes': len(frame), 'host_capture_result_sha256': _sha(result_storage), 'host_capture_result_bytes': len(result_storage), 'cli_thread_id': result.get('cli_thread_id'), 'lifecycle_digest': result.get('lifecycle_digest'), 'component_qualification_credit': 0, 'attempt': 1, 'retry_count': 0, 'relaunch_count': 0, 'best_of': False, 'replacement_result': False, 'session_reuse': False, 'completion_is_last_row_write': True}
        if set(value) != _COMPLETION_FIELDS or any(value.get(key) != expected for key, expected in fixed.items()) or value.get('status') not in {'PASS', 'FAIL'} or not isinstance(value.get('external_gate_eligible'), bool):
            raise _Invalid('completion v6 mismatch')
        self._consumer(value.get('consumer_result'), result, transaction_id)
        return result

    def write_completion(self, row_id: str, completion: _abc.Mapping[str, _Any]):
        self._guard()
        try:
            row, directory = self._row(row_id)
            if [path.name for path in sorted(directory.iterdir(), key=lambda x: x.name)] != sorted(_ROWS[:6]):
                raise _Invalid('completion prefix mismatch')
            value = _mapping(completion, 'completion')
            self._completion(directory, value)
            return self._write_json(directory / 'completion.json', value)
        except Exception:
            self._fail()
            raise

    def write_stage_artifact(self, stage: _abc.Mapping[str, _Any]):
        self._guard()
        try:
            value = _mapping(stage, 'stage')
            if set(value) != _STAGE_FIELDS or value.get('schema_id') != 'pw-r9-stage-artifact-v1' or value.get('run_id') != self._run['run_id']:
                raise _Invalid('stage shape mismatch')
            slot = _name(value.get('slot'), 'stage slot'); name = _name(value.get('stage'), 'stage name')
            self._route(slot); self._validate_causal(value.get('causal_inputs'))
            payload = value.get('artifact_payload_utf8')
            if not isinstance(payload, str):
                raise _Invalid('stage payload mismatch')
            raw = payload.encode('utf-8'); storage = raw + b'\n'
            if value.get('artifact_payload_sha256') != _sha(raw) or value.get('artifact_payload_bytes') != len(raw) or value.get('artifact_storage_sha256') != _sha(storage) or value.get('artifact_storage_bytes') != len(storage):
                raise _Invalid('stage payload identity mismatch')
            directory = self._root / 'artifacts' / slot
            try:
                _lstat(directory, 'artifact slot')
            except _Invalid:
                self._mkdir(directory)
            return self._write_json(directory / f'{name}.json', value)
        except Exception:
            self._fail()
            raise

    def _row_entries(self, directory):
        info = _lstat(directory, 'row directory')
        if not _stat.S_ISDIR(info.st_mode):
            raise _Invalid('row entry not directory')
        return sorted(path.name for path in directory.iterdir())

    def _seal_values(self, cause):
        run_id = self._run['run_id']; run_identity = {'sha256': _sha(self._run_bytes), 'bytes': len(self._run_bytes)}
        states = {}; frame_refs = []; result_refs = []; completion_refs = []
        for row in self._run['schedule']:
            directory = self._root / 'rows' / row['row_id']
            if not directory.exists():
                states[row['row_id']] = {'kind': 'MISSING'}; continue
            try:
                entries = self._row_entries(directory)
                if entries == sorted(_ROWS):
                    storage = _read_file(directory / 'completion.json', 'completion'); value = _json_storage(storage, 'completion'); result = self._completion(directory, value)
                    states[row['row_id']] = {'kind': 'COMPLETE', 'status': value['status'], 'completion': {'sha256': _sha(storage), 'bytes': len(storage)}}
                    completion_refs.append({'row_id': row['row_id'], 'sha256': _sha(storage), 'bytes': len(storage)})
                elif entries == sorted(_ROWS[:5]):
                    states[row['row_id']] = {'kind': 'HOST_CAPTURE_FAILURE'}
                elif entries == sorted(_ROWS[:6]):
                    request_storage, request, transaction_id = self._request(directory); frame_storage = _read_file(directory / 'host_capture_frame.json', 'frame'); frame = self._validate_frame(frame_storage, request_storage, request, transaction_id); result_storage = _read_file(directory / 'host_capture_result.json', 'result'); self._validate_result(_json_storage(result_storage, 'result'), frame_storage, frame, transaction_id); states[row['row_id']] = {'kind': 'DERIVED_RESULT_FAILURE'}
                else:
                    raise _Invalid('illegal row prefix')
                if 'host_capture_frame.json' in entries:
                    data = _read_file(directory / 'host_capture_frame.json', 'frame inventory'); frame_refs.append({'row_id': row['row_id'], 'sha256': _sha(data), 'bytes': len(data)})
                if 'host_capture_result.json' in entries:
                    data = _read_file(directory / 'host_capture_result.json', 'result inventory'); result_refs.append({'row_id': row['row_id'], 'sha256': _sha(data), 'bytes': len(data)})
            except _Invalid as exc:
                states[row['row_id']] = {'kind': 'INVALID', 'reason': str(exc)}
        stage_refs = []
        for slot_dir in sorted((self._root / 'artifacts').iterdir(), key=lambda path: path.name):
            for path in sorted(slot_dir.iterdir(), key=lambda item: item.name):
                data = _read_file(path, 'stage inventory'); stage_refs.append({'slot': slot_dir.name, 'stage': path.stem, 'sha256': _sha(data), 'bytes': len(data)})
        frame_root = _inventory_root('pw-r9-host-capture-frame-inventory-root-v1', frame_refs)
        result_root = _inventory_root('pw-r9-host-capture-result-inventory-root-v1', result_refs)
        completion_root = _inventory_root('pw-r9-completion-inventory-root-v1', completion_refs)
        stage_root = _inventory_root('pw-r9-stage-inventory-root-v1', stage_refs)
        paths = []; completed_total = pass_total = fail_total = invalid_total = 0
        for route in self._run['routes']:
            rows = [row for row in self._run['schedule'] if row['slot'] == route['slot']]; completed = []; invalid = []; missing = []; aborted = []; ineligible = []; stopped = []
            for row in rows:
                state = states[row['row_id']]
                if state['kind'] == 'COMPLETE':
                    completed.append({'row_id': row['row_id'], 'ordinal': row['ordinal'], 'cell': row['cell'], 'index': row['index'], 'status': state['status'], 'completion_sha256': state['completion']['sha256'], 'completion_bytes': state['completion']['bytes']})
                elif state['kind'] == 'MISSING':
                    if cause and cause['kind'] == 'STOPPED_AFTER_DRAIN': stopped.append(row['ordinal'])
                    else: aborted.append(row['ordinal'])
                else:
                    invalid.append({'ordinal': row['ordinal'], 'reason': state.get('reason', state['kind'])})
            passed = sum(item['status'] == 'PASS' for item in completed); failed = sum(item['status'] == 'FAIL' for item in completed)
            completed_total += len(completed); pass_total += passed; fail_total += failed; invalid_total += len(invalid)
            status = 'CONTROLLER_INVALID' if invalid else ('VALID_SUBJECT_FAIL' if failed else ('STOPPED_AFTER_DRAIN' if stopped else ('PASS' if len(completed) == len(rows) else 'CONTROLLER_ABORTED')))
            completion_bytes = _canon(completed)
            paths.append({'schema_id': 'pw-r9-path-terminal-v5', 'run_id': run_id, 'run_sha256': run_identity['sha256'], 'run_bytes': run_identity['bytes'], 'slot': route['slot'], 'status': status, 'scheduled_rows': len(rows), 'completed_rows': len(completed), 'pass_rows': passed, 'subject_fail_rows': failed, 'invalid_rows': invalid, 'ineligible_after_subject_fail_ordinals': ineligible, 'stopped_after_signal_ordinals': stopped, 'controller_aborted_ordinals': aborted, 'missing_ordinals': missing, 'stage_artifacts': [item for item in stage_refs if item['slot'] == route['slot']], 'stage_artifact_count': sum(item['slot'] == route['slot'] for item in stage_refs), 'completion_inventory_sha256': _sha(completion_bytes), 'completion_inventory_bytes': len(completion_bytes), 'host_capture_frame_inventory_root': frame_root, 'host_capture_result_inventory_root': result_root, 'host_capture_frame_count': len(frame_refs), 'host_capture_result_count': len(result_refs), 'component_qualification_credit': 0, 'external_gate_eligible': False})
        matrix_status = 'CONTROLLER_INVALID' if invalid_total or (cause and cause['kind'] == 'CONTROLLER_INVALID') else ('VALID_SUBJECT_FAIL' if fail_total else ('PASS' if completed_total == len(self._run['schedule']) else 'STOPPED_AFTER_DRAIN'))
        matrix = {'schema_id': 'pw-r9-matrix-terminal-v5', 'run_id': run_id, 'run_sha256': run_identity['sha256'], 'run_bytes': run_identity['bytes'], 'status': matrix_status, 'path_terminals': [], 'path_terminal_count': 3, 'scheduled_rows': len(self._run['schedule']), 'completed_rows': completed_total, 'pass_rows': pass_total, 'subject_fail_rows': fail_total, 'invalid_rows': invalid_total, 'stage_artifact_count': len(stage_refs), 'host_capture_frame_inventory_root': frame_root, 'host_capture_result_inventory_root': result_root, 'host_capture_frame_count': len(frame_refs), 'host_capture_result_count': len(result_refs), 'component_qualification_credit': 0, 'external_gate_eligible': matrix_status == 'PASS'}
        row_refs = []
        for directory in sorted((self._root / 'rows').iterdir(), key=lambda path: path.name):
            for path in sorted(directory.iterdir(), key=lambda item: item.name):
                data = _read_file(path, 'row inventory'); row_refs.append({'path': path.relative_to(self._root).as_posix(), 'sha256': _sha(data), 'bytes': len(data)})
        accounting_base = {'schema_id': 'pw-r9-accounting-v5', 'run_id': run_id, 'run_sha256': run_identity['sha256'], 'run_bytes': run_identity['bytes'], 'row_inventory_root': _inventory_root('pw-r9-row-inventory-root-v1', row_refs), 'completion_inventory_root': completion_root, 'stage_inventory_root': stage_root, 'host_capture_frame_inventory_root': frame_root, 'host_capture_result_inventory_root': result_root, 'scheduled_rows': len(self._run['schedule']), 'completed_rows': completed_total, 'host_capture_frame_count': len(frame_refs), 'host_capture_result_count': len(result_refs), 'unique_host_transaction_id_count': len(frame_refs), 'unique_cli_thread_id_count': sum(states[row['row_id']]['kind'] == 'COMPLETE' for row in self._run['schedule']), 'retry_count': 0, 'relaunch_count': 0, 'replacement_count': 0, 'session_reuse_count': 0, 'component_qualification_credit': 0, 'external_qualification_credit': 0, 'external_gate_eligible': matrix_status == 'PASS', 'accounting_is_last_run_root_write': True}
        return paths, matrix, accounting_base

    def _source_identity(self):
        rows = []
        for relative in ('run.json', 'rows', 'artifacts'):
            start = self._root / relative
            if start.is_dir():
                for current, directories, files in _os.walk(start):
                    base = _pathlib.Path(current); rows.append({'path': base.relative_to(self._root).as_posix(), 'kind': 'directory', 'mode': _stat.S_IMODE(_lstat(base, 'source directory').st_mode), 'sha256': None, 'bytes': None})
                    for name in sorted(files):
                        path = base / name; data = _read_file(path, 'source file'); rows.append({'path': path.relative_to(self._root).as_posix(), 'kind': 'file', 'mode': 0o444, 'sha256': _sha(data), 'bytes': len(data)})
            else:
                data = _read_file(start, 'source run'); rows.append({'path': relative, 'kind': 'file', 'mode': 0o444, 'sha256': _sha(data), 'bytes': len(data)})
        rows.sort(key=lambda item: item['path'].encode())
        data = _canon({'schema_id': 'pw-r9-seal-source-projection-v1', 'entries': rows})
        return {'schema_id': 'pw-r9-seal-source-projection-v1', 'sha256': _sha(data), 'bytes': len(data), 'count': len(rows)}

    def _publish(self, relative, storage):
        stage = self._scratch / (relative[0:3] + '.stage')
        final = self._root.joinpath(*_pathlib.PurePosixPath(relative[4:]).parts)
        if stage.exists() or final.exists() or stage.is_symlink() or final.is_symlink():
            raise _Invalid('monolithic seal requires absent stage/final')
        self._write(stage, storage, True)
        source_fd = _os.open(self._scratch, _os.O_RDONLY | getattr(_os, 'O_DIRECTORY', 0) | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0))
        target_fd = _os.open(final.parent, _os.O_RDONLY | getattr(_os, 'O_DIRECTORY', 0) | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0))
        try:
            self._guard(True); _os.link(stage.name, final.name, src_dir_fd=source_fd, dst_dir_fd=target_fd, follow_symlinks=False)
            self._guard(True); _os.fsync(target_fd)
            self._guard(True); _os.unlink(stage.name, dir_fd=source_fd)
            self._guard(True); _os.fsync(source_fd)
        finally:
            _os.close(target_fd); _os.close(source_fd)
        if _read_file(final, f'published {final.name}') != storage:
            raise _Invalid('published artifact mismatch')

    def seal(self, cause: _abc.Mapping[str, _Any] | None):
        self._guard()
        self._state = 'SEALING'
        try:
            if cause is None:
                cause_value = None
            else:
                cause_value = _mapping(cause, 'cause')
                if set(cause_value) != {'kind', 'detail'} or cause_value.get('kind') not in {'CONTROLLER_INVALID', 'STOPPED_AFTER_DRAIN'} or not isinstance(cause_value.get('detail'), str) or not cause_value['detail']:
                    raise _Invalid('seal cause mismatch')
            self._guard(True)
            paths, matrix, accounting = self._seal_values(cause_value)
            source = self._source_identity(); lock_data = _read_file(self._root / 'seal.lock', 'seal lock', 0o600)
            component = _canon(self._run['component_identity']); shared = _canon(self._run['shared_authorities']); refs = []; storages = []
            payload0 = {'cause': cause_value, 'run_identity': {'sha256': _sha(self._run_bytes), 'bytes': len(self._run_bytes)}, 'component_identity': {'value': self._run['component_identity'], 'sha256': _sha(component), 'bytes': len(component)}, 'shared_authorities_identity': {'value': self._run['shared_authorities'], 'sha256': _sha(shared), 'bytes': len(shared)}, 'source_projection': source, 'lock_identity': {'path': 'seal.lock', 'sha256': _sha(lock_data), 'bytes': len(lock_data)}, 'planned_rows': len(self._run['schedule']), 'source_stage_artifact_count': sum(path.is_file() for path in (self._root / 'artifacts').glob('*/*.json')), 'seal_invocation': 'ONE_SESSION_SEAL_CALL'}
            payloads = [payload0, None, {'path_terminal': paths[0]}, None, {'path_terminal': paths[1]}, None, {'path_terminal': paths[2]}, None, None, None, None]
            for index, (artifact_id, path, recipe) in enumerate(_ARTIFACTS):
                if index == 1:
                    payloads[index] = {'entries': [{'artifact_id': aid, 'path': apath, 'recipe_id': arecipe, 'dependency_artifact_ids': [x[0] for x in _ARTIFACTS[:i]]} for i, (aid, apath, arecipe) in enumerate(_ARTIFACTS[2:], 2)], 'entry_count': 9, 'catalog_id': 'pw-r9-seal-transaction-catalog-v2'}
                elif index in {3, 5, 7}:
                    payloads[index] = {'schema_id': 'pw-r9-seal-cursor-v1', 'published_artifact': refs[-1], 'durable_prefix': list(refs), 'next_artifact_id': _ARTIFACTS[index + 1][0]}
                elif index == 8:
                    matrix['path_terminals'] = [refs[2], refs[4], refs[6]]; payloads[index] = {'matrix_terminal': matrix}
                elif index == 9:
                    payloads[index] = {'schema_id': 'pw-r9-seal-cursor-v1', 'published_artifact': refs[-1], 'durable_prefix': list(refs), 'accounting_required': True, 'next_artifact_id': 'a10'}
                elif index == 10:
                    accounting['matrix_terminal_sha256'] = refs[8]['sha256']; accounting['matrix_terminal_bytes'] = refs[8]['bytes']; payloads[index] = {'accounting': accounting}
                envelope = {'schema_id': 'pw-r9-seal-artifact-envelope-v1', 'artifact_id': artifact_id, 'artifact_index': index, 'run_id': self._run['run_id'], 'seal_epoch': self._run['seal_epoch'], 'recipe_id': recipe, 'dependencies': list(refs), 'payload': payloads[index]}
                storage = _canon(envelope) + b'\n'; storages.append(storage)
                self._publish(artifact_id + ':' + path, storage)
                refs.append({'artifact_id': artifact_id, 'path': path, 'sha256': _sha(storage), 'bytes': len(storage)})
            self._guard(True)
            if list(self._scratch.iterdir()):
                raise _Invalid('seal scratch not empty after accounting')
            self._mutate(_os.rmdir, self._scratch, sealing=True)
            self._sync_dir(self._root.parent, True)
            self._guard(True)
            result = dict(accounting)
            self._revoke('CLOSED')
            return result
        except Exception:
            self._fail()
            raise


def begin_run(run_root: _pathlib.Path, run: _abc.Mapping[str, _Any]):
    root = _root(run_root)
    parent = root.parent
    parent_stat = _lstat(parent, 'run parent')
    if not _stat.S_ISDIR(parent_stat.st_mode):
        raise _Invalid('run parent is not a directory')
    try:
        _os.lstat(root)
    except FileNotFoundError:
        pass
    else:
        raise _Invalid('run root must be absent')
    value = _mapping(run, 'run')
    _validate_run(root, value)
    scratch = parent / value['seal_scratch_name']
    try:
        _os.lstat(scratch)
    except FileNotFoundError:
        pass
    else:
        raise _Invalid('seal scratch sibling must be absent')
    run_bytes = _canon(value) + b'\n'
    _os.mkdir(scratch, 0o700); _os.chmod(scratch, 0o700, follow_symlinks=False)
    _os.mkdir(root, 0o755)
    for name in ('rows', 'artifacts', 'terminals', 'cursors'):
        _os.mkdir(root / name, 0o755)
    run_fd = _os.open(root / 'run.json', _os.O_CREAT | _os.O_EXCL | _os.O_WRONLY | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0), 0o444)
    try:
        _os.fchmod(run_fd, 0o444); view = memoryview(run_bytes)
        while view:
            count = _os.write(run_fd, view)
            if count <= 0: raise _Invalid('short run manifest write')
            view = view[count:]
        _os.fsync(run_fd)
    finally:
        _os.close(run_fd)
    lock_value = {'schema_id': 'pw-r9-seal-lock-v1', 'run_id': value['run_id'], 'seal_epoch': value['seal_epoch']}; lock_bytes = _canon(lock_value) + b'\n'
    lock_fd = _os.open(root / 'seal.lock', _os.O_CREAT | _os.O_EXCL | _os.O_RDWR | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0), 0o600)
    try:
        _os.fchmod(lock_fd, 0o600); view = memoryview(lock_bytes)
        while view:
            count = _os.write(lock_fd, view)
            if count <= 0: raise _Invalid('short seal lock write')
            view = view[count:]
        _os.fsync(lock_fd); _fcntl.flock(lock_fd, _fcntl.LOCK_EX | _fcntl.LOCK_NB)
        for directory in (scratch, root, root / 'rows', root / 'artifacts', root / 'terminals', root / 'cursors', parent):
            fd = _os.open(directory, _os.O_RDONLY | getattr(_os, 'O_DIRECTORY', 0) | getattr(_os, 'O_NOFOLLOW', 0) | getattr(_os, 'O_CLOEXEC', 0))
            try: _os.fsync(fd)
            finally: _os.close(fd)
        if _read_file(root / 'run.json', 'created run') != run_bytes or _read_file(root / 'seal.lock', 'created lock', 0o600) != lock_bytes:
            raise _Invalid('bootstrap durable reopen mismatch')
        return _RunSession(root, scratch, value, run_bytes, lock_fd)
    except Exception:
        _os.close(lock_fd)
        raise
