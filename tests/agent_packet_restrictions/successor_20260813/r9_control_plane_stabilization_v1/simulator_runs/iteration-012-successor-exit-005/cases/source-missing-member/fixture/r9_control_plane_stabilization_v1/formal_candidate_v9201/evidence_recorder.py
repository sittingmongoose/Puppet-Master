from __future__ import annotations
import base64 as _base64
import collections.abc as _abc
import hashlib as _hashlib
import json as _json
import os as _os
import pathlib as _pathlib
import re as _re
import stat as _stat
from typing import Any as _Any
__all__ = ['create_run', 'admit_row', 'record_spawn', 'record_raw', 'record_completion', 'record_stage', 'seal_run']
_INSTRUCTION = b'TEST-TAKER TRANSPORT: Answer the frozen packet below directly in your first final response. Do not use tools, files, browsing, network, memory, delegation, or other agents.\n\n'
_MAX_EVENT = 4 * 1024 * 1024
_HEX = _re.compile('[0-9a-f]{64}')
_NAME = _re.compile('[A-Za-z0-9][A-Za-z0-9_.-]{0,191}')
_TOKEN = _re.compile('[A-Z][A-Z0-9_]{0,127}')
_COMPONENT_ROLES = ('APPEND_ONLY_EVIDENCE_RECORDER', 'IMMUTABLE_SEMANTIC_BUNDLE', 'OFFLINE_VERIFIER', 'PROCESS_RUNNER')
_ROUTES = ({'slot': 'slot-alpha', 'model': 'gpt-5.4-mini', 'reasoning_effort': 'xhigh'}, {'slot': 'slot-bravo', 'model': 'gpt-5.4-mini', 'reasoning_effort': 'medium'}, {'slot': 'slot-charlie', 'model': 'gpt-5.6-luna', 'reasoning_effort': 'medium'})
_SPAWN_REQUEST_FIELDS = {'schema_id', 'run_id', 'run_kind', 'mode', 'slot', 'cell', 'index', 'ordinal', 'nonce', 'invocation_id', 'task_name', 'expected_canonical_task_path', 'agent_type', 'fork_turns', 'model', 'reasoning_effort', 'packet_sha256', 'packet_bytes', 'message_utf8', 'message_sha256', 'message_bytes', 'attempt_sha256', 'attempt_bytes'}
_SPAWN_EVENT_FIELDS = {'schema_id', 'invocation_id', 'spawn_request_sha256', 'tool_result', 'returned_identity_kind', 'returned_canonical_task_path'}
_TERMINAL_EVENT_FIELDS = {'schema_id', 'invocation_id', 'returned_canonical_task_path', 'message_type', 'final_utf8', 'observed_activity', 'terminal_status'}
_FAILURE_FIELDS = {'schema_id', 'invocation_id', 'phase', 'failure_type', 'detail'}
_ROW_FILES = ('provider_input.txt', 'spawn_message.txt', 'attempt.json', 'spawn_receipt.json', 'raw_result.json', 'completion.json')
_TOP = {'run.json', 'rows', 'artifacts', 'terminals'}

class _Invalid(RuntimeError):
    pass

def _canon(A):
    try:
        return _json.dumps(A, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise _Invalid(f'not canonical-JSON-able: {exc}') from exc

def _sha(A):
    return _hashlib.sha256(A).hexdigest()

def _pairs(A):
    C = {}
    for B, D in A:
        if B in C:
            raise _Invalid(f'duplicate JSON key: {B}')
        C[B] = D
    return C

def _mapping(D, B):
    if not isinstance(D, _abc.Mapping):
        raise _Invalid(f'{B} must be a mapping')
    C = dict(D)
    if any((not isinstance(A, str) for A in C)):
        raise _Invalid(f'{B} has a non-text key')
    _canon(C)
    return C

def _integer(C, A, B=0):
    if isinstance(C, bool) or not isinstance(C, int) or C < B:
        raise _Invalid(f'{A} must be an integer at least {B}')
    return C

def _name(B, A):
    if not isinstance(B, str) or not _NAME.fullmatch(B) or B in {'.', '..'} or ('/' in B) or ('\\' in B):
        raise _Invalid(f'{A} is not a confined name')
    return B

def _digest(B, A):
    if not isinstance(B, str) or not _HEX.fullmatch(B):
        raise _Invalid(f'{A} is not a lowercase SHA-256')
    return B

def _root(A):
    if not isinstance(A, _pathlib.Path):
        raise _Invalid('run_root must be path')
    B = A if A.is_absolute() else _pathlib.Path.cwd() / A
    if '..' in B.parts:
        raise _Invalid('run_root parent trave')
    C = _pathlib.Path(B.anchor)
    for D in B.parts[1:]:
        C /= D
        try:
            E = _os.lstat(C)
        except FileNotFoundError:
            continue
        if _stat.S_ISLNK(E.st_mode):
            raise _Invalid(f'symlink ancestor: {C}')
    return _pathlib.Path(_os.path.abspath(_os.fspath(B)))

def _lstat(C, B):
    try:
        A = _os.lstat(C)
    except FileNotFoundError as exc:
        raise _Invalid(f'{B}: absent') from exc
    if _stat.S_ISLNK(A.st_mode):
        raise _Invalid(f'{B}: symbolic link forbidden')
    return A

def _directory(B, A):
    if not _stat.S_ISDIR(_lstat(B, A).st_mode):
        raise _Invalid(f'{A}: not a directory')

def _sync_dir(C):
    B = _os.O_RDONLY | getattr(_os, 'O_DIRECTORY', 0) | getattr(_os, 'O_NOFOLLOW', 0)
    A = _os.open(C, B)
    try:
        if not _stat.S_ISDIR(_os.fstat(A).st_mode):
            raise _Invalid(f'directory reopen changed type: {C}')
        _os.fsync(A)
    finally:
        _os.close(A)

def _mkdir(A):
    _directory(A.parent, f'parent of {A.name}')
    try:
        _os.mkdir(A, 493)
    except FileExistsError as exc:
        raise _Invalid(f'create-only directory exists: {A}') from exc
    _os.chmod(A, 493, follow_symlinks=False)
    _directory(A, f'created directory {A.name}')
    _sync_dir(A)
    _sync_dir(A.parent)

def _read(I, G):
    F = _lstat(I, G)
    if not _stat.S_ISREG(F.st_mode):
        raise _Invalid(f'{G}: not a regular file')
    if _stat.S_IMODE(F.st_mode) != 292:
        raise _Invalid(f'{G}: mode is not 0444')
    E = _os.O_RDONLY | getattr(_os, 'O_NOFOLLOW', 0)
    D = _os.open(I, E)
    B = []
    try:
        H = _os.fstat(D)
        if not _stat.S_ISREG(H.st_mode) or (H.st_dev, H.st_ino) != (F.st_dev, F.st_ino):
            raise _Invalid(f'{G}: reopen identity mismatch')
        while True:
            A = _os.read(D, 1024 * 1024)
            if not A:
                break
            B.append(A)
    finally:
        _os.close(D)
    C = b''.join(B)
    if len(C) != F.st_size:
        raise _Invalid(f'{G}: reopen size mismatch')
    return C

def _write(D, E):
    _directory(D.parent, f'parent of {D.name}')
    C = _os.O_WRONLY | _os.O_CREAT | _os.O_EXCL | getattr(_os, 'O_NOFOLLOW', 0)
    B = _os.open(D, C, 292)
    try:
        _os.fchmod(B, 292)
        F = memoryview(E)
        while F:
            A = _os.write(B, F)
            if A <= 0:
                raise _Invalid(f'short write: {D}')
            F = F[A:]
        _os.fsync(B)
    finally:
        _os.close(B)
    _sync_dir(D.parent)
    if _read(D, f'reopened {D.name}') != E:
        raise _Invalid(f'exact reopen mismatch: {D}')
    return (_sha(E), len(E))

def _write_json(A, B):
    return _write(A, _canon(B) + b'\n')

def _read_json(D, C):
    E = _read(D, C)
    if not E or not E.endswith(b'\n') or E.endswith(b'\n\n') or (b'\r' in E):
        raise _Invalid(f'{C}: not canonical one-LF JSON storage')
    try:
        F = _json.loads(E[:-1].decode('utf-8'), object_pairs_hook=_pairs, parse_constant=lambda B: (A for A in ()).throw(_Invalid(B)))
    except (UnicodeDecodeError, _json.JSONDecodeError, _Invalid) as exc:
        raise _Invalid(f'{C}: invalid JSON: {exc}') from exc
    if not isinstance(F, dict) or E != _canon(F) + b'\n':
        raise _Invalid(f'{C}: not a canonical object')
    return (E, F)

def _entries(C, B):
    _directory(C, B)
    D = list(C.iterdir())
    for A in D:
        _lstat(A, f'{B}/{A.name}')
    return sorted(D, key=lambda A: A.name)

def _identity(A):
    return {'sha256': _sha(A), 'bytes': len(A)}

def _component_identity(H):
    B = _mapping(H, 'component_identity')
    if set(B) != {'schema_id', 'part_count', 'aggregate_file_bytes', 'rows_sha256', 'rows_bytes', 'parts'} or B.get('schema_id') != 'pw-r9-four-part-component-identity-v1':
        raise _Invalid('component identity sh')
    if B.get('part_count') != 4:
        raise _Invalid('component identity pa')
    D = B.get('parts')
    if not isinstance(D, list) or len(D) != 4:
        raise _Invalid('component identity pa')
    F = []
    for A, E in zip(_COMPONENT_ROLES, D):
        C = _mapping(E, 'component part')
        if set(C) != {'role', 'sha256', 'bytes'} or C.get('role') != A:
            raise _Invalid('component role order ')
        _digest(C.get('sha256'), 'component sha256')
        _integer(C.get('bytes'), 'component bytes', 1)
        F.append(C)
    G = _canon(F)
    if B.get('aggregate_file_bytes') != sum((C['bytes'] for C in F)) or B.get('rows_sha256') != _sha(G) or B.get('rows_bytes') != len(G):
        raise _Invalid('component aggregate/r')

def _validate_run(K, Q):
    if set(Q) != set('schema_id run_id run_kind mode scenario created_utc component_identity component_provenance shared_authorities routes schedule route_count cells_per_route cell_count planned_call_count stage_count required_clean_stage_artifact_count regression_family_count regression_variant_count global_fault_count semantic_counterfactual_count retry_count best_of replacement_count custody'.split()):
        raise _Invalid('run fields mismatch')
    if Q.get('schema_id') != 'pw-r9-run-v4' or Q.get('run_id') != K.name:
        raise _Invalid('run schema or run_id ')
    _name(Q.get('run_id'), 'run_id')
    if Q.get('run_kind') not in {'simulate', 'run-canary', 'run-matrix'}:
        raise _Invalid('run_kind mismatch')
    B = 'synthetic' if Q['run_kind'] == 'simulate' else 'actual'
    if Q.get('mode') != B:
        raise _Invalid('run mode mismatch')
    if Q.get('retry_count') != 0 or Q.get('best_of') is not False or Q.get('replacement_count') != 0:
        raise _Invalid('run once-only fields ')
    _component_identity(Q.get('component_identity'))
    M = Q.get('routes')
    if not isinstance(M, list) or len(M) != 3 or Q.get('route_count') != 3:
        raise _Invalid('run routes mismatch')
    T = []
    for J, V in zip(M, _ROUTES):
        L = _mapping(J, 'route')
        if set(L) != {'slot', 'model', 'reasoning_effort'} or L != V:
            raise _Invalid('route roster mismatch')
        S = _name(L.get('slot'), 'route slot')
        E = L.get('model')
        A = L.get('reasoning_effort')
        if not isinstance(E, str) or not E or (not isinstance(A, str)) or (not A):
            raise _Invalid('route model/effort mi')
        T.append(S)
    if len(set(T)) != 3:
        raise _Invalid('route slots are not u')
    R = Q.get('schedule')
    V = 3 if Q['run_kind'] == 'run-canary' else 291
    if not isinstance(R, list) or len(R) != V or Q.get('planned_call_count') != V:
        raise _Invalid('run schedule/count mi')
    P = set()
    C = set()
    W = set()
    X = set()
    for I, J in enumerate(R):
        N = _mapping(J, 'schedule row')
        if set(N) != {'row_id', 'ordinal', 'slot', 'cell', 'index', 'nonce', 'invocation_id', 'task_name', 'expected_canonical_task_path'}:
            raise _Invalid('schedule row shape mi')
        O = _name(N.get('row_id'), 'schedule row_id')
        if O in P:
            raise _Invalid('duplicate schedule ro')
        P.add(O)
        if N.get('slot') not in T:
            raise _Invalid('schedule slot absent ')
        _name(N.get('cell'), 'schedule cell')
        Y = _integer(N.get('index'), 'schedule index')
        G = _integer(N.get('ordinal'), 'schedule ordinal')
        if G != I or Y != I or G in W or (Y in X):
            raise _Invalid('schedule order mismatch')
        W.add(G)
        X.add(Y)
        F = N.get('nonce')
        if not isinstance(F, str) or not _HEX.fullmatch(F):
            raise _Invalid('schedule nonce mismatch')
        D = f'r9-invocation:{F}'
        U = f'r9_{F}'
        H = f'/root/{U}'
        if N.get('invocation_id') != D or N.get('task_name') != U or N.get('expected_canonical_task_path') != H:
            raise _Invalid('schedule invocation/t')
        for V in (F, D, H):
            if V in C:
                raise _Invalid('schedule identity is ')
            C.add(V)

def _load_run(A):
    _directory(A, 'run root')
    C, B = _read_json(A / 'run.json', 'run')
    _validate_run(A, B)
    return (C, B)

def _unsealed(A):
    if (A / 'matrix_terminal.json').exists() or (A / 'accounting.json').exists():
        raise _Invalid('sealed run is immutable')
    if _entries(A / 'terminals', 'terminals'):
        raise _Invalid('partial or complete t')

def _schedule_row(D, C):
    B = [dict(A) for A in D['schedule'] if A.get('row_id') == C]
    if len(B) != 1:
        raise _Invalid('row_id is not exactly')
    return B[0]

def _route(C, D):
    B = [dict(A) for A in C['routes'] if A.get('slot') == D]
    if len(B) != 1:
        raise _Invalid('route not uniquely de')
    return B[0]

def _relative(E, F, B):
    if not isinstance(F, str) or not F or '\\' in F:
        raise _Invalid(f'{B}: invalid relative path')
    D = _pathlib.PurePosixPath(F)
    if D.is_absolute() or any((C in {'', '.', '..'} for C in D.parts)):
        raise _Invalid(f'{B}: path escapes run root')
    A = E.joinpath(*D.parts)
    if _os.path.commonpath((str(E), str(A))) != str(E):
        raise _Invalid(f'{B}: path escapes run root')
    return A

def _validate_bindings(I, R, K, V=None):
    if not isinstance(K, list):
        raise _Invalid('causal_inputs must be')
    V=(set(),{}) if V is None else V
    W,X=V
    H = []
    for G in K:
        B = _mapping(G, 'causal input')
        if set(B) != {'kind', 'id', 'path', 'sha256', 'bytes'}:
            raise _Invalid('causal input shape mi')
        if B.get('kind') not in {'PASS_CELL', 'STAGE_ARTIFACT'}:
            raise _Invalid('causal input kind mis')
        _name(B.get('id'), 'causal input id')
        E = _relative(I, B.get('path'), 'causal input')
        P = B['path']
        if P in W:
            raise _Invalid('causal dependency cycle')
        W.add(P)
        try:
            J = _read(E, 'causal input')
            if B.get('sha256') != _sha(J) or B.get('bytes') != len(J):
                raise _Invalid('causal input storage ')
            U=(B['kind'],B['id'],P,B['sha256'],B['bytes'])
            N = _pathlib.PurePosixPath(P).parts
            if B['kind'] == 'PASS_CELL':
                if len(N) != 3 or N[0] != 'rows' or N[2] != 'completion.json':
                    raise _Invalid('PASS_CELL path mismatch')
                O = _name(N[1], 'causal row_id')
                M = _schedule_row(R, O)
                if B['id'] != M['cell']:
                    raise _Invalid('PASS_CELL id mismatch')
                if _row_inventory(E.parent) != sorted(_ROW_FILES):
                    raise _Invalid('PASS_CELL inventory')
                if U not in X:
                    A, F = _completion(I, R, O, V)
                    if A != J or F.get('status') != 'PASS':
                        raise _Invalid('PASS_CELL chain mismatch')
                    X[U]=1
            else:
                if len(N) != 3 or N[0] != 'artifacts' or (not N[2].endswith('.json')):
                    raise _Invalid('STAGE_ARTIFACT path m')
                O = _name(N[1], 'causal stage slot')
                Q = _name(N[2][:-5], 'causal stage id')
                if B['id'] != Q:
                    raise _Invalid('STAGE_ARTIFACT id mis')
                if U not in X:
                    A, F = _read_json(E, 'causal stage')
                    S, T = _stage_value(I, R, F, V)
                    if A != J or S != O or T != Q:
                        raise _Invalid('STAGE_ARTIFACT chain ')
                    X[U]=1
        finally:
            W.remove(P)
        H.append(B)
    C = sorted(H, key=lambda D: (D['kind'], D['id'], D['path']))
    if H != C or len({D['path'] for D in H}) != len(H):
        raise _Invalid('causal inputs are not')
    return H

def _attempt(G, K, J, E, D, A, V=None):
    I = _schedule_row(K, J)
    H = _route(K, I['slot'])
    F = {'schema_id', 'run_id', 'run_kind', 'mode', 'row_id', 'slot', 'cell', 'index', 'ordinal', 'nonce', 'invocation_id', 'task_name', 'expected_canonical_task_path', 'agent_type', 'fork_turns', 'model', 'reasoning_effort', 'causal_inputs', 'packet_sha256', 'packet_bytes', 'message_sha256', 'message_bytes', 'attempt', 'retry_count', 'best_of', 'replacement_result', 'no_retry', 'no_relaunch', 'admission_state'}
    if set(A) != F:
        raise _Invalid('attempt exact fields ')
    B = {'schema_id': 'pw-r9-attempt-v4', 'run_id': G.name, 'run_kind': K['run_kind'], 'mode': K['mode'], 'row_id': J, 'slot': I['slot'], 'cell': I['cell'], 'index': I['index'], 'ordinal': I['ordinal'], 'nonce': I['nonce'], 'invocation_id': I['invocation_id'], 'task_name': I['task_name'], 'expected_canonical_task_path': I['expected_canonical_task_path'], 'agent_type': 'default', 'fork_turns': 'none', 'model': H['model'], 'reasoning_effort': H.get('reasoning_effort', H.get('thinking')), 'packet_sha256': _sha(E), 'packet_bytes': len(E), 'message_sha256': _sha(D), 'message_bytes': len(D), 'attempt': 1, 'retry_count': 0, 'best_of': False, 'replacement_result': False, 'no_retry': True, 'no_relaunch': True, 'admission_state': 'FUSED_BEFORE_SPAWN'}
    if any((A.get(C) != L for C, L in B.items())):
        raise _Invalid('attempt identity/fuse')
    _validate_bindings(G, K, A['causal_inputs'], V)

def _spawn_request(F, A, D, C, B):
    E = {'schema_id': 'pw-r9-subagent-spawn-request-v1', 'run_id': A['run_id'], 'run_kind': A['run_kind'], 'mode': A['mode'], 'slot': A['slot'], 'cell': A['cell'], 'index': A['index'], 'ordinal': A['ordinal'], 'nonce': A['nonce'], 'invocation_id': A['invocation_id'], 'task_name': A['task_name'], 'expected_canonical_task_path': A['expected_canonical_task_path'], 'agent_type': A['agent_type'], 'fork_turns': A['fork_turns'], 'model': A['model'], 'reasoning_effort': A['reasoning_effort'], 'packet_sha256': _sha(D), 'packet_bytes': len(D), 'message_utf8': C.decode('utf-8'), 'message_sha256': _sha(C), 'message_bytes': len(C), 'attempt_sha256': _sha(B), 'attempt_bytes': len(B)}
    if set(E) != _SPAWN_REQUEST_FIELDS or E['run_id'] != F['run_id']:
        raise _Invalid('spawn request constru')
    return E

def _base_row(G, J, I, V=None):
    H = G / 'rows' / I
    _directory(H, f'row {I}')
    D = _read(H / 'provider_input.txt', 'provider input')
    C = _read(H / 'spawn_message.txt', 'spawn message')
    B, A = _read_json(H / 'attempt.json', 'attempt')
    if not D or not D.endswith(b'\n') or D.endswith(b'\n\n') or (b'\r' in D):
        raise _Invalid('provider input is not')
    try:
        D.decode('utf-8')
        C.decode('utf-8')
    except UnicodeDecodeError as exc:
        raise _Invalid('provider input or spa') from exc
    if C != _INSTRUCTION + D[:-1] or len(_INSTRUCTION) != 174:
        raise _Invalid('spawn message instruc')
    _attempt(G, J, I, D, C, A, V)
    E = _spawn_request(J, A, D, C, B)
    F = _canon(E)
    return (H, D, C, B, A, F, E)

def _capture(F, D, E, B, A, C):
    G = {'schema_id': F, 'run_id': D.name, 'row_id': E, 'capture_ordinal': 1, 'capture_status': 'DURABLE_BEFORE_CONSUMER', C: True, 'root_event_base64': _base64.b64encode(B).decode('ascii'), 'root_event_sha256': _sha(B), 'root_event_bytes': len(B)}
    G.update(A)
    return G

def _event_line(B, D):
    if not B or not B.endswith(b'\n') or b'\r' in B or (b'\n' in B[:-1]):
        raise _Invalid(f'{D}: not exactly one received line including LF')
    try:
        E = _json.loads(B[:-1].decode('utf-8'), object_pairs_hook=_pairs, parse_constant=lambda C: (A for A in ()).throw(_Invalid(C)))
    except (UnicodeDecodeError, _json.JSONDecodeError, _Invalid) as exc:
        raise _Invalid(f'{D}: malformed captured event: {exc}') from exc
    if not isinstance(E, dict) or _canon(E) != B[:-1]:
        raise _Invalid(f'{D}: captured event is not a canonical object line')
    return E

def _failure(A, B, C):
    if A.get('schema_id') != 'pw-r9-subagent-transport-failure-event-v1':
        return False
    if set(A) != _FAILURE_FIELDS or A.get('invocation_id') != B or A.get('phase') != C or (not isinstance(A.get('failure_type'), str)) or (not _TOKEN.fullmatch(A['failure_type'])) or (not isinstance(A.get('detail'), str)) or (not A['detail']):
        raise _Invalid(f'{C}: malformed typed transport failure')
    A['detail'].encode('utf-8')
    return True

def _spawn_event(A, C):
    if _failure(A, C['invocation_id'], 'SPAWN_ATTEMPT'):
        return 'SPAWN_ATTEMPT_FAILURE'
    B = C['expected_canonical_task_path']
    if set(A) != _SPAWN_EVENT_FIELDS or A.get('schema_id') != 'pw-r9-subagent-spawn-receipt-event-v1' or A.get('invocation_id') != C['invocation_id'] or (A.get('spawn_request_sha256') != _sha(_canon(C))) or (A.get('tool_result') != {'task_name': B}) or (A.get('returned_identity_kind') != 'canonical_task_path') or (A.get('returned_canonical_task_path') != B):
        raise _Invalid('spawn receipt/request')
    return 'SPAWNED'

def _terminal_event(A, B):
    if _failure(A, B['invocation_id'], 'TERMINAL_DRAIN'):
        return 'TERMINAL_DRAIN_FAILURE'
    if set(A) != _TERMINAL_EVENT_FIELDS or A.get('schema_id') != 'pw-r9-subagent-terminal-delivery-event-v1' or A.get('invocation_id') != B['invocation_id'] or (A.get('returned_canonical_task_path') != B['expected_canonical_task_path']) or (A.get('message_type') != 'FINAL_ANSWER') or (A.get('terminal_status') != 'FINAL_RETURNED') or (not isinstance(A.get('final_utf8'), str)) or (not isinstance(A.get('observed_activity'), dict)):
        raise _Invalid('terminal delivery ide')
    A['final_utf8'].encode('utf-8')
    return 'FINAL_RETURNED'

def _decode_capture(F, E, C, D, B):
    if F.get('schema_id') != E or F.get('run_id') != C.name or F.get('row_id') != D or (F.get('capture_ordinal') != 1) or (F.get('capture_status') != 'DURABLE_BEFORE_CONSUMER') or (F.get(B) is not True) or (not isinstance(F.get('root_event_base64'), str)):
        raise _Invalid('captured root-event e')
    try:
        A = _base64.b64decode(F['root_event_base64'], validate=True)
    except (ValueError, _base64.binascii.Error) as exc:
        raise _Invalid('captured root-event b') from exc
    if F.get('root_event_sha256') != _sha(A) or F.get('root_event_bytes') != len(A):
        raise _Invalid('captured root-event i')
    if len(A) > _MAX_EVENT:
        raise _Invalid('captured root event e')
    return A

def _spawn_record(I, L, K, V=None):
    J, A, A, B, A, H, G = _base_row(I, L, K, V)
    M, F = _read_json(J / 'spawn_receipt.json', 'spawn record')
    C = _decode_capture(F, 'pw-r9-spawn-record-v1', I, K, 'first_spawn_only')
    D = {'attempt_sha256': _sha(B), 'attempt_bytes': len(B), 'spawn_request_sha256': _sha(H), 'spawn_request_bytes': len(H)}
    if any((F.get(E) != N for E, N in D.items())):
        raise _Invalid('spawn record causal b')
    return (M, F, G, _spawn_event(_event_line(C, 'spawn event'), G))

def _raw_record(I, L, K, V=None):
    J, A, A, B, A, H, G = _base_row(I, L, K, V)
    N, A, A, M = _spawn_record(I, L, K, V)
    if M != 'SPAWNED':
        raise _Invalid('terminal capture foll')
    O, F = _read_json(J / 'raw_result.json', 'raw root event')
    C = _decode_capture(F, 'pw-r9-raw-root-event-v1', I, K, 'first_terminal_only')
    D = {'attempt_sha256': _sha(B), 'attempt_bytes': len(B), 'spawn_request_sha256': _sha(H), 'spawn_request_bytes': len(H), 'spawn_record_sha256': _sha(N), 'spawn_record_bytes': len(N)}
    if any((F.get(E) != P for E, P in D.items())):
        raise _Invalid('raw root-event causal')
    return (O, F, G, _terminal_event(_event_line(C, 'terminal event'), G))

def _completion(H, K, J, V=None):
    I, A, A, B, A, A, A = _base_row(H, K, J, V)
    M, A, A, L = _spawn_record(H, K, J, V)
    G, A, A, F = _raw_record(H, K, J, V)
    if L != 'SPAWNED' or F != 'FINAL_RETURNED':
        raise _Invalid('completion follows a ')
    N, O = _read_json(I / 'completion.json', 'completion')
    D = {'schema_id': 'pw-r9-completion-v4', 'run_id': H.name, 'row_id': J, 'attempt_sha256': _sha(B), 'attempt_bytes': len(B), 'spawn_record_sha256': _sha(M), 'spawn_record_bytes': len(M), 'raw_result_sha256': _sha(G), 'raw_result_bytes': len(G), 'attempt': 1, 'retry_count': 0, 'best_of': False, 'replacement_result': False, 'completion_is_last_row_write': True}
    if any((O.get(E) != C for E, C in D.items())):
        raise _Invalid('completion causal/fix')
    if O.get('status') not in {'PASS', 'FAIL'} or 'consumer_result' not in O:
        raise _Invalid('completion status or ')
    _canon(O['consumer_result'])
    return (N, O)

def _binding(D, C, B, A):
    E = _read(C, f'binding {B}/{A}')
    return {'kind': B, 'id': A, 'path': C.relative_to(D).as_posix(), 'sha256': _sha(E), 'bytes': len(E)}

def create_run(run_root: _pathlib.Path, run: _abc.Mapping[str, _Any]) -> tuple[str, int]:
    B = _root(run_root)
    _directory(B.parent, 'run parent')
    if B.exists() or B.is_symlink():
        raise _Invalid('run root already exis')
    C = _mapping(run, 'run')
    _validate_run(B, C)
    _mkdir(B)
    for A in ('rows', 'artifacts', 'terminals'):
        _mkdir(B / A)
    return _write_json(B / 'run.json', C)

def admit_row(run_root: _pathlib.Path, row_id: str, provider_input: bytes, spawn_message: bytes, attempt: _abc.Mapping[str, _Any]) -> bytes:
    D = _root(run_root)
    A, F = _load_run(D)
    _unsealed(D)
    row_id = _name(row_id, 'row_id')
    if not isinstance(provider_input, bytes) or not isinstance(spawn_message, bytes):
        raise _Invalid('provider_input and sp')
    if not provider_input or not provider_input.endswith(b'\n') or provider_input.endswith(b'\n\n') or (b'\r' in provider_input):
        raise _Invalid('provider_input must b')
    try:
        provider_input.decode('utf-8')
        spawn_message.decode('utf-8')
    except UnicodeDecodeError as exc:
        raise _Invalid('provider_input or spa') from exc
    if spawn_message != _INSTRUCTION + provider_input[:-1]:
        raise _Invalid('spawn_message is not ')
    G = _mapping(attempt, 'attempt')
    _attempt(D, F, row_id, provider_input, spawn_message, G)
    E = D / 'rows' / row_id
    _mkdir(E)
    _write(E / 'provider_input.txt', provider_input)
    _write(E / 'spawn_message.txt', spawn_message)
    B = _write_json(E / 'attempt.json', G)
    C = _read_json(E / 'attempt.json', 'attempt fuse')
    if B != (_sha(C[0]), len(C[0])) or C[1] != G:
        raise _Invalid('attempt fuse durabili')
    return _canon(_spawn_request(F, G, provider_input, spawn_message, C[0]))

def record_spawn(run_root: _pathlib.Path, row_id: str, raw_event: bytes) -> tuple[str, int]:
    I = _root(run_root)
    A, K = _load_run(I)
    _unsealed(I)
    row_id = _name(row_id, 'row_id')
    if not isinstance(raw_event, bytes):
        raise _Invalid('raw_event must be bytes')
    J, A, A, B, A, H, G = _base_row(I, K, row_id)
    if [D.name for D in _entries(J, 'row')] != sorted(_ROW_FILES[:3]):
        raise _Invalid('spawn capture is not ')
    F = _capture('pw-r9-spawn-record-v1', I, row_id, raw_event, {'attempt_sha256': _sha(B), 'attempt_bytes': len(B), 'spawn_request_sha256': _sha(H), 'spawn_request_bytes': len(H)}, 'first_spawn_only')
    C = _write_json(J / 'spawn_receipt.json', F)
    if len(raw_event) > _MAX_EVENT:
        raise _Invalid('captured spawn root e')
    E = _spawn_event(_event_line(raw_event, 'spawn event'), G)
    if E != 'SPAWNED':
        raise _Invalid('typed SPAWN_ATTEMPT failure captured durably')
    return C

def record_raw(run_root: _pathlib.Path, row_id: str, raw_event: bytes) -> tuple[str, int]:
    I = _root(run_root)
    A, K = _load_run(I)
    _unsealed(I)
    row_id = _name(row_id, 'row_id')
    if not isinstance(raw_event, bytes):
        raise _Invalid('raw_event must be bytes')
    J, A, A, B, A, H, G = _base_row(I, K, row_id)
    if [D.name for D in _entries(J, 'row')] != sorted(_ROW_FILES[:4]):
        raise _Invalid('terminal capture is n')
    M, A, A, L = _spawn_record(I, K, row_id)
    if L != 'SPAWNED':
        raise _Invalid('terminal event cannot')
    F = _capture('pw-r9-raw-root-event-v1', I, row_id, raw_event, {'attempt_sha256': _sha(B), 'attempt_bytes': len(B), 'spawn_request_sha256': _sha(H), 'spawn_request_bytes': len(H), 'spawn_record_sha256': _sha(M), 'spawn_record_bytes': len(M)}, 'first_terminal_only')
    C = _write_json(J / 'raw_result.json', F)
    if len(raw_event) > _MAX_EVENT:
        raise _Invalid('captured terminal roo')
    E = _terminal_event(_event_line(raw_event, 'terminal event'), G)
    if E != 'FINAL_RETURNED':
        raise _Invalid('typed TERMINAL_DRAIN failure captured durably')
    return C

def record_completion(run_root: _pathlib.Path, row_id: str, completion: _abc.Mapping[str, _Any]) -> tuple[str, int]:
    K = _root(run_root)
    A, M = _load_run(K)
    _unsealed(K)
    row_id = _name(row_id, 'row_id')
    L, A, A, B, A, A, A = _base_row(K, M, row_id)
    if [F.name for F in _entries(L, 'row')] != sorted(_ROW_FILES[:5]):
        raise _Invalid('completion is not the')
    O, A, A, N = _spawn_record(K, M, row_id)
    I, A, A, H = _raw_record(K, M, row_id)
    if N != 'SPAWNED' or H != 'FINAL_RETURNED':
        raise _Invalid('completion follows un')
    P = _mapping(completion, 'completion')
    D = {'schema_id': 'pw-r9-completion-v4', 'run_id': K.name, 'row_id': row_id, 'attempt_sha256': _sha(B), 'attempt_bytes': len(B), 'spawn_record_sha256': _sha(O), 'spawn_record_bytes': len(O), 'raw_result_sha256': _sha(I), 'raw_result_bytes': len(I), 'attempt': 1, 'retry_count': 0, 'best_of': False, 'replacement_result': False, 'completion_is_last_row_write': True}
    if any((P.get(G) != C for G, C in D.items())):
        raise _Invalid('completion supplied b')
    if P.get('status') not in {'PASS', 'FAIL'} or 'consumer_result' not in P:
        raise _Invalid('completion requires P')
    _canon(P['consumer_result'])
    E = _write_json(L / 'completion.json', P)
    J = _completion(K, M, row_id)
    if E != (_sha(J[0]), len(J[0])):
        raise _Invalid('completion exact reop')
    return E

def _stage_value(B, C, G, V=None):
    if set(G) != set('schema_id run_id slot stage index rule finalization_row_id finalization_ordinal causal_inputs artifact_payload_utf8 artifact_payload_sha256 artifact_payload_bytes artifact_storage_sha256 artifact_storage_bytes'.split()):
        raise _Invalid('stage fields mismatch')
    if G.get('schema_id') != 'pw-r9-stage-artifact-v1' or G.get('run_id') != B.name:
        raise _Invalid('stage schema/run bind')
    D = _name(G.get('slot'), 'stage slot')
    F = _name(G.get('stage'), 'stage id')
    _integer(G.get('index'), 'stage index')
    H = _integer(G.get('finalization_ordinal'), 'finalization ordinal')
    I = _name(G.get('finalization_row_id'), 'finalization row_id')
    if _schedule_row(C, I).get('ordinal') != H:
        raise _Invalid('stage finalization mi')
    if not isinstance(G.get('artifact_payload_utf8'), str):
        raise _Invalid('stage payload not text')
    try:
        J = G['artifact_payload_utf8'].encode('utf-8')
    except UnicodeEncodeError as exc:
        raise _Invalid('stage artifact payloa') from exc
    K = J + b'\n'
    if G.get('artifact_payload_sha256') != _sha(J) or G.get('artifact_payload_bytes') != len(J) or G.get('artifact_storage_sha256') != _sha(K) or (G.get('artifact_storage_bytes') != len(K)):
        raise _Invalid('stage payload binding')
    _route(C, D)
    _validate_bindings(B, C, G.get('causal_inputs'), V)
    return (D, F)

def record_stage(run_root: _pathlib.Path, stage: _abc.Mapping[str, _Any]) -> tuple[str, int]:
    B = _root(run_root)
    A, C = _load_run(B)
    _unsealed(B)
    G = _mapping(stage, 'stage')
    D, F = _stage_value(B, C, G)
    E = B / 'artifacts' / D
    if not E.exists() and (not E.is_symlink()):
        _mkdir(E)
    else:
        _directory(E, 'artifact slot')
    return _write_json(E / f'{F}.json', G)

def _row_inventory(B):
    return [A.name for A in _entries(B, f'row {B.name}')]

def _cause(B):
    if B is None:
        return None
    A = _mapping(B, 'cause')
    if set(A) != {'kind', 'detail'} or A.get('kind') not in {'CONTROLLER_INVALID', 'STOPPED_AFTER_DRAIN'} or (not isinstance(A.get('detail'), str)) or (not A['detail']):
        raise _Invalid('terminal cause mismatch')
    A['detail'].encode('utf-8')
    return A

def seal_run(run_root: _pathlib.Path, cause: _abc.Mapping[str, _Any] | None) -> _abc.Mapping[str, _Any]:
    AI = _root(run_root)
    AQ, AO = _load_run(AI)
    BD = _cause(cause)
    if {T.name for T in _entries(AI, 'run root')} != _TOP:
        raise _Invalid('unsealed run top-leve')
    _unsealed(AI)
    AP = _identity(AQ)
    AR = {T['row_id'] for T in AO['schedule']}
    AM = _entries(AI / 'rows', 'rows')
    BL = [T.name for T in AM if T.name not in AR]
    AN = {}
    F = H = G = K = 0
    AU = BE = 0
    Q = len(BL)
    for AK in AO['schedule']:
        AL = AK['row_id']
        AB = AI / 'rows' / AL
        if not AB.exists() and (not AB.is_symlink()):
            AN[AL] = {'kind': 'MISSING'}
            continue
        try:
            Y = _row_inventory(AB)
        except _Invalid as exc:
            AN[AL] = {'kind': 'INVALID', 'reason': str(exc)}
            Q += 1
            continue
        F += int('attempt.json' in Y)
        H += int('spawn_receipt.json' in Y)
        G += int('raw_result.json' in Y)
        K += int('completion.json' in Y)
        try:
            if Y == sorted(_ROW_FILES):
                BA, BN = _completion(AI, AO, AL)
                AN[AL] = {'kind': 'COMPLETE', 'status': BN['status'], 'completion': _identity(BA)}
            elif Y == sorted(_ROW_FILES[:4]):
                A, A, A, Z = _spawn_record(AI, AO, AL)
                if Z != 'SPAWN_ATTEMPT_FAILURE':
                    raise _Invalid('four-file prefix is n')
                AU += 1
                AN[AL] = {'kind': 'SPAWN_FAILURE'}
                Q += 1
            elif Y == sorted(_ROW_FILES[:5]):
                A, A, A, AV = _spawn_record(AI, AO, AL)
                A, A, A, AF = _raw_record(AI, AO, AL)
                if AV != 'SPAWNED' or AF != 'TERMINAL_DRAIN_FAILURE':
                    raise _Invalid('five-file prefix is n')
                BE += 1
                AN[AL] = {'kind': 'TERMINAL_FAILURE'}
                Q += 1
            else:
                raise _Invalid('row is neither comple')
        except _Invalid as exc:
            AN[AL] = {'kind': 'INVALID', 'reason': str(exc)}
            Q += 1
    E = {AJ['slot']: [] for AJ in AO['routes']}
    P = []
    for T in _entries(AI / 'artifacts', 'artifacts'):
        if T.name not in E:
            P.append({'slot': T.name, 'stage': '*'})
            continue
        try:
            _directory(T, f'artifact slot {T.name}')
            for AB in _entries(T, f'artifact slot {T.name}'):
                if AB.suffix != '.json':
                    raise _Invalid('artifact path is not ')
                BA, BN = _read_json(AB, 'stage artifact')
                BO, BP = _stage_value(AI, AO, BN)
                if BO != T.name or f'{BP}.json' != AB.name:
                    raise _Invalid('stage artifact identi')
                E[T.name].append({'stage': BP, 'sha256': _sha(BA), 'bytes': len(BA)})
        except _Invalid:
            P.append({'slot': T.name, 'stage': T.name})
    for AH in E.values():
        AH.sort(key=lambda BN: BN['stage'])
        if len({T['stage'] for T in AH}) != len(AH):
            P.append({'slot': '*', 'stage': 'DUPLICATE'})
    M = bool(Q or P or AU or BE)
    AD = []
    AC = []
    BJ = BG = BH = BK = 0
    BF = BI = 0
    BM = 0
    for AJ in AO['routes']:
        AT = AJ['slot']
        AS = [T for T in AO['schedule'] if T['slot'] == AT]
        J = []
        R = []
        O = []
        AZ = []
        B = []
        X = []
        BC = False
        for AK in AS:
            AX = AN[AK['row_id']]
            if AX['kind'] == 'COMPLETE':
                if BC:
                    R.append({'ordinal': AK['ordinal'], 'reason': 'POST_SUBJECT_FAIL_DISPATCH'})
                    M = True
                    continue
                J.append({'row_id': AK['row_id'], 'ordinal': AK['ordinal'], 'cell': AK['cell'], 'index': AK['index'], 'status': AX['status'], 'completion_sha256': AX['completion']['sha256'], 'completion_bytes': AX['completion']['bytes']})
                BM += 1
                if AX['status'] == 'FAIL':
                    BC = True
                continue
            if AX['kind'] == 'MISSING':
                if BC:
                    O.append(AK['ordinal'])
                elif BD and BD['kind'] == 'STOPPED_AFTER_DRAIN' and (not M):
                    AZ.append(AK['ordinal'])
                elif M or (BD and BD['kind'] == 'CONTROLLER_INVALID'):
                    B.append(AK['ordinal'])
                else:
                    X.append(AK['ordinal'])
                    M = True
                continue
            R.append({'ordinal': AK['ordinal'], 'reason': AX.get('reason', AX['kind'])})
            M = True
        AA = sum((T['status'] == 'PASS' for T in J))
        L = sum((T['status'] == 'FAIL' for T in J))
        BJ += AA
        BG += L
        BH += len(O)
        BK += len(AZ)
        BF += len(B)
        BI += len(X)
        AW = E[AT]
        if R or X:
            AY = 'CONTROLLER_INVALID'
        elif B:
            AY = 'CONTROLLER_ABORTED'
        elif AZ:
            AY = 'STOPPED_AFTER_DRAIN'
        elif L:
            AY = 'VALID_SUBJECT_FAIL'
        elif len(J) == len(AS):
            AY = 'PASS'
        else:
            AY = 'CONTROLLER_INVALID'
        S = _canon(J)
        AG = {'schema_id': 'pw-r9-path-terminal-v3', 'run_id': AI.name, 'run_sha256': AP['sha256'], 'run_bytes': AP['bytes'], 'slot': AT, 'status': AY, 'scheduled_rows': len(AS), 'completed_rows': len(J), 'pass_rows': AA, 'subject_fail_rows': L, 'invalid_rows': R, 'ineligible_after_subject_fail_ordinals': O, 'stopped_after_signal_ordinals': AZ, 'controller_aborted_ordinals': B, 'missing_ordinals': X, 'stage_artifacts': AW, 'stage_artifact_count': len(AW), 'completion_inventory_sha256': _sha(S), 'completion_inventory_bytes': len(S)}
        BB = _write_json(AI / 'terminals' / f'{AT}.json', AG)
        AD.append(AG)
        AC.append({'slot': AT, 'sha256': BB[0], 'bytes': BB[1]})
    AE = len(AO['schedule'])
    D = sum((len(U) for U in E.values()))
    N = AE == 291
    I = N and BJ == 291 and (BG == 0) and (Q == 0) and (not P) and (BH == 0) and (BK == 0) and (BF == 0) and (BI == 0) and (D == 54)
    if M or (BD and BD['kind'] == 'CONTROLLER_INVALID'):
        AY = 'CONTROLLER_INVALID'
    elif BD and BD['kind'] == 'STOPPED_AFTER_DRAIN':
        AY = 'STOPPED_AFTER_DRAIN'
    elif BG:
        AY = 'VALID_SUBJECT_FAIL'
    elif N and I or (not N and BM == AE and (BJ == AE)):
        AY = 'PASS'
    else:
        AY = 'CONTROLLER_INVALID'
    V = {'schema_id': 'pw-r9-matrix-terminal-v3', 'run_id': AI.name, 'run_sha256': AP['sha256'], 'run_bytes': AP['bytes'], 'status': AY, 'cause': BD, 'scheduled_rows': AE, 'completed_rows': BM, 'pass_rows': BJ, 'subject_fail_rows': BG, 'invalid_rows': Q, 'ineligible_rows': BH, 'stopped_rows': BK, 'controller_aborted_rows': BF, 'missing_rows': BI, 'stage_artifact_count': D, 'invalid_stage_artifact_count': len(P), 'required_clean_stage_artifacts': 54 if N else 0, 'spawn_failure_prefix_count': AU, 'terminal_failure_prefix_count': BE, 'clean_matrix': I, 'path_terminals': AC, 'retry_count': 0, 'best_of': False, 'replacement_count': 0}
    W = _write_json(AI / 'matrix_terminal.json', V)
    C = {'schema_id': 'pw-r9-accounting-v3', 'run_id': AI.name, 'run_sha256': AP['sha256'], 'run_bytes': AP['bytes'], 'status': AY, 'matrix_terminal_sha256': W[0], 'matrix_terminal_bytes': W[1], 'planned_calls': AE, 'attempts': F, 'captured_spawn_records': H, 'captured_raw_results': G, 'valid_completions': BM, 'pass_rows': BJ, 'subject_fail_rows': BG, 'spawn_failure_prefix_count': AU, 'terminal_failure_prefix_count': BE, 'ineligible_rows': BH, 'stopped_rows': BK, 'controller_aborted_rows': BF, 'invalid_rows': Q, 'missing_rows': BI, 'stage_artifact_count': D, 'invalid_stage_artifact_count': len(P), 'unknown_or_uncaptured_dispatches': max(0, F - H), 'unknown_or_uncaptured_terminal_deliveries': max(0, H - G), 'retry_count': 0, 'best_of': False, 'replacement_count': 0, 'accounting_is_last_run_write': True}
    _write_json(AI / 'accounting.json', C)
    return C
