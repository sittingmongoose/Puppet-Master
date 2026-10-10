#!/usr/bin/env python3
"""Root-only UNUSED future D2 overlay after existing v1 guard; no dispatch."""
import argparse
import datetime as dt
import hashlib
import json
import uuid
import re
from pathlib import Path

HERE = Path(__file__).absolute().parent
NAMES = ('request.json', 'freeze.json', 'input-map.json', 'assignment.md')
V1_MARKER = 'invocation-clarification.json'
GUARD_MARKER = 'exact-goal-binding-guard.json'
MARKER = 'exact-activation-capture-v2.json'
RUNS = Path('ER12_RUNTIME/runs')
GUARD = HERE.parent / 'exact-goal-binding-guard-v1' / 'assert-active-goal.py'
ALLOWED_RECORD_PATHS = set()


def fail(message):
    raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encode(obj):
    return (json.dumps(obj, ensure_ascii=False, indent=2) + '\n').encode()


def no_links(path):
    if not path.is_absolute() or any(p.is_symlink() for p in (path, *path.parents)):
        fail('absolute non-symlink path required')


def unused(stage):
    no_links(stage)
    if not stage.is_dir():
        fail('missing stage')
    allowed = set(NAMES) | {'sources', V1_MARKER, GUARD_MARKER, MARKER, 'service-tier-change.json'}
    for p in stage.rglob('*'):
        if p.is_symlink():
            fail('symlink stage member rejected')
    for p in stage.iterdir():
        if p.name.startswith(('.invocation-backup-', '.goal-guard-backup-', '.activation-backup-')) and p.is_dir():
            continue
        if p.name not in allowed:
            fail('dispatched/used/partial stage rejected: ' + p.name)
        if p.name == 'sources' and (not p.is_dir() or any(p.iterdir())):
            fail('source work already present')
    if any(not (stage / n).is_file() for n in (*NAMES, V1_MARKER, GUARD_MARKER)):
        fail('complete clarified prepared stage required')


def records(obj, changed=None):
    if isinstance(obj, dict):
        if 'path' in obj and 'sha256' in obj:
            p = Path(obj['path'])
            no_links(p)
            if not p.is_file():
                fail('nonregular carried input')
            if str(p) not in ALLOWED_RECORD_PATHS:
                fail('unsupported nonmechanical dependency; never read science: ' + str(p))
            data = changed[str(p)] if changed is not None and str(p) in changed else p.read_bytes()
            if changed is None:
                if sha(data) != obj['sha256'] or ('bytes' in obj and len(data) != obj['bytes']):
                    fail('carried hash/size mismatch: ' + str(p))
            elif str(p) in changed:
                obj['sha256'] = sha(data)
                if 'bytes' in obj:
                    obj['bytes'] = len(data)
        for value in obj.values():
            records(value, changed)
    elif isinstance(obj, list):
        for value in obj:
            records(value, changed)


def dependencies(obj):
    found = set()
    if isinstance(obj, dict):
        if 'path' in obj and 'sha256' in obj:
            found.add(obj['path'])
        for value in obj.values():
            found.update(dependencies(value))
    elif isinstance(obj, list):
        for value in obj:
            found.update(dependencies(value))
    return found


def transform(stage):
    global ALLOWED_RECORD_PATHS
    no_links(stage)
    try:
        parts = stage.relative_to(RUNS).parts
    except ValueError:
        fail('future D2 stage path required')
    if len(parts) != 4 or not re.fullmatch(r'D-R2-[0-9]+', parts[0]) or parts[1] not in ('control', 'treatment') or parts[2] != 'stages':
        fail('future D2 stage path required; D1/C2 forbidden')
    ALLOWED_RECORD_PATHS = {str(stage / n) for n in (*NAMES, V1_MARKER, GUARD_MARKER)} | {str(HERE / 'activation-snippet-template.js'), str(GUARD)}
    unused(stage)
    original = {n: (stage / n).read_bytes() for n in NAMES}
    req, freeze, im = (json.loads(original[n]) for n in NAMES[:3])
    marker_bytes = (stage / GUARD_MARKER).read_bytes()
    v1 = json.loads(marker_bytes)
    if v1.get('version') != 'exact-goal-binding-guard-v1' or v1.get('dispatch_performed') is not False:
        fail('existing v1 exact guard marker required')
    if v1.get('stageDir') != str(stage):
        fail('v1 stage path mismatch')
    deadlines = [freeze[k] for k in ('deadline_utc', 'stage_deadline_utc', 'whole_deadline_utc') if k in freeze]
    now = dt.datetime.now(dt.timezone.utc)
    if not deadlines or any(dt.datetime.fromisoformat(x.replace('Z', '+00:00')) <= now for x in deadlines):
        fail('expired stage; never reset clocks')
    if req['args']['target'] != freeze['requested_route']:
        fail('route mismatch')
    if freeze.get('request_sha256') != sha(original['request.json']):
        fail('request hash mismatch')
    if 'assignment_sha256' in freeze and freeze['assignment_sha256'] != sha(original['assignment.md']):
        fail('assignment hash mismatch')
    for obj in (req, freeze, im):
        records(obj)
    if (stage / MARKER).exists():
        out = json.loads((stage / MARKER).read_bytes())
        if out.get('snippet_sha256') != sha((HERE / 'activation-snippet-template.js').read_bytes()) or out.get('guard_sha256') != sha(GUARD.read_bytes()) or out.get('v1_marker_sha256') != sha(marker_bytes) or any(sha(original[n]) != out['updated_sha256'][n] for n in NAMES):
            fail('changed overlay retry bytes; no repair')
        return dict(out, idempotent=True)
    if any(sha(original[n]) != v1['updated_sha256'][n] for n in NAMES):
        fail('clarified bytes changed before guard')
    objective = freeze['native_goal_objective']
    if not isinstance(objective, str) or not 0 < len(objective) < 4000:
        fail('invalid frozen objective')
    pinned = json.loads((HERE / 'dependency-sha256.json').read_bytes())
    if pinned.get(str(GUARD)) != sha(GUARD.read_bytes()):
        fail('pinned unchanged guard mismatch')
    template = (HERE / 'activation-snippet-template.js').read_bytes()
    guard_hash = sha(GUARD.read_bytes())
    snippet = template.decode().replace('__STAGE_DIR_JSON__', json.dumps(str(stage), ensure_ascii=False))
    command = 'Execute the following body in worker functions.exec with native tools available.'
    addition = ('\nEXACT ACTIVATION CAPTURE v2 — COMMON PRE-INPUT MECHANICS\n'
                'This body implements the existing v1 ONE Goal activation instruction; execute it once, not as a second activation after that prose. Before scientific input, execute this body once. Stop on failure/unsupported; no second Goal. '
                'Original substantive assignment, route, deadlines, scope and science remain binding.\n'
                '```javascript\n' + snippet + '\n```\n'
                'Save required stage outputs before completing the same Goal. Source/native provenance/freshness remain UNKNOWN beyond checker.\n')
    changed = {str(stage / 'assignment.md'): original['assignment.md'] + addition.encode()}
    req['args']['task'] += addition
    pending = {'request.json': req, 'input-map.json': im, 'freeze.json': freeze}
    paths = {str(stage / n) for n in NAMES}
    while pending:
        ready = []
        for n, obj in pending.items():
            deps = dependencies(obj) & paths
            if n == 'freeze.json':
                deps |= {str(stage / 'request.json'), str(stage / 'assignment.md')}
            if deps <= changed.keys():
                ready.append(n)
        if not ready:
            fail('unsupported cyclic/self-hashing prepared records')
        for n in ready:
            obj = pending.pop(n)
            records(obj, changed)
            if n == 'freeze.json':
                obj['request_sha256'] = sha(changed[str(stage / 'request.json')])
                if 'assignment_sha256' in obj:
                    obj['assignment_sha256'] = sha(changed[str(stage / 'assignment.md')])
            changed[str(stage / n)] = encode(obj) if obj != json.loads(original[n]) else original[n]
    backup = stage / ('.activation-backup-' + uuid.uuid4().hex)
    unused(stage)
    backup.mkdir()
    for n, data in original.items():
        (backup / n).write_bytes(data)
        (backup / n).chmod(0o444)
    out = {'version': 'exact-activation-capture-v2', 'stageDir': str(stage), 'backupDir': str(backup),
           'command': command, 'args': req['args'], 'root_only_integration': True,
           'dispatch_performed': False, 'idempotent': False, 'v1_marker_sha256': sha(marker_bytes),
           'snippet_sha256': sha(template), 'guard_sha256': guard_hash,
           'original_sha256': {n: sha(b) for n, b in original.items()},
           'updated_sha256': {n: sha(changed[str(stage / n)]) for n in NAMES}}
    try:
        unused(stage)
        if (stage / GUARD_MARKER).read_bytes() != marker_bytes or any((stage / n).read_bytes() != original[n] for n in NAMES):
            fail('prepared bytes changed concurrently')
        for n in NAMES:
            unused(stage)
            (stage / n).write_bytes(changed[str(stage / n)])
        (stage / MARKER).write_bytes(encode(out))
    except Exception:
        for n in NAMES:
            (stage / n).write_bytes(original[n])
        raise
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage-dir', required=True, type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(transform(args.stage_dir), ensure_ascii=False))
    except (ValueError, KeyError, OSError, TypeError, AttributeError) as exc:
        parser.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    main()
