#!/usr/bin/env python3
"""Root-only unused-stage overlay after stdSpec + clarifySpec; no dispatch."""
import argparse
import datetime as dt
import hashlib
import json
import shlex
import uuid
from pathlib import Path

HERE = Path(__file__).absolute().parent
NAMES = ('request.json', 'freeze.json', 'input-map.json', 'assignment.md')
V1_MARKER = 'invocation-clarification.json'
MARKER = 'exact-goal-binding-guard.json'


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
    allowed = set(NAMES) | {'sources', V1_MARKER, MARKER, 'service-tier-change.json'}
    for p in stage.rglob('*'):
        if p.is_symlink():
            fail('symlink stage member rejected')
    for p in stage.iterdir():
        if p.name.startswith(('.invocation-backup-', '.goal-guard-backup-')) and p.is_dir():
            continue
        if p.name not in allowed:
            fail('dispatched/used/partial stage rejected: ' + p.name)
        if p.name == 'sources' and (not p.is_dir() or any(p.iterdir())):
            fail('source work already present')
    if any(not (stage / n).is_file() for n in (*NAMES, V1_MARKER)):
        fail('complete clarified prepared stage required')


def records(obj, changed=None):
    if isinstance(obj, dict):
        if 'path' in obj and 'sha256' in obj:
            p = Path(obj['path'])
            no_links(p)
            if not p.is_file():
                fail('nonregular carried input')
            data = changed.get(str(p), p.read_bytes()) if changed is not None else p.read_bytes()
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
    unused(stage)
    original = {n: (stage / n).read_bytes() for n in NAMES}
    req, freeze, im = (json.loads(original[n]) for n in NAMES[:3])
    marker_bytes = (stage / V1_MARKER).read_bytes()
    v1 = json.loads(marker_bytes)
    if v1.get('version') != 'invocation-clarification-v1' or v1.get('dispatch_performed') is not False:
        fail('existing v1 clarification marker required')
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
        if out.get('v1_marker_sha256') != sha(marker_bytes) or any(sha(original[n]) != out['updated_sha256'][n] for n in NAMES):
            fail('changed overlay retry bytes; no repair')
        return dict(out, idempotent=True)
    if any(sha(original[n]) != v1['updated_sha256'][n] for n in NAMES):
        fail('clarified bytes changed before guard')
    objective = freeze['native_goal_objective']
    if not isinstance(objective, str) or not objective:
        fail('invalid frozen objective')
    command = shlex.join(['python3', str(HERE / 'assert-active-goal.py'), '--stage-dir', str(stage), '--json', '<EXACT unmodified complete fresh native create_goal/get_goal response JSON>'])
    addition = ('\nROOT EXACT GOAL BINDING GUARD v1 — PRE-INPUT\n'
                'Before ANY case/source reading or inference, activate ONE actual native Goal with this EXACT frozen objective: '
                + json.dumps(objective, ensure_ascii=False)
                + '\nImmediately pass its EXACT unmodified COMPLETE fresh native create_goal response (or an immediately obtained native get_goal response) as ONE --json argument to:\n'
                + command
                + '\nThe quoted response slot is runtime native data, never literal placeholder JSON. Use structured argv or correct shell quoting; preserve every response field. If activation is unavailable or the gate fails, STOP before any case/source reading or inference. Preserve the exact diagnostic and original failure; never create a second/replacement Goal or repair the objective. Save before completing the SAME Goal. Original route, deadlines, scope, science and lifecycle remain binding. Response provenance/freshness cannot be independently proved by this checker. This is common symmetric future mechanics, not technique or source assistance.\n')
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
    backup = stage / ('.goal-guard-backup-' + uuid.uuid4().hex)
    unused(stage)
    backup.mkdir()
    for n, data in original.items():
        (backup / n).write_bytes(data)
        (backup / n).chmod(0o444)
    out = {'version': 'exact-goal-binding-guard-v1', 'stageDir': str(stage), 'backupDir': str(backup),
           'command': command, 'args': req['args'], 'root_only_integration': True,
           'dispatch_performed': False, 'idempotent': False, 'v1_marker_sha256': sha(marker_bytes),
           'original_sha256': {n: sha(b) for n, b in original.items()},
           'updated_sha256': {n: sha(changed[str(stage / n)]) for n in NAMES}}
    try:
        unused(stage)
        if (stage / V1_MARKER).read_bytes() != marker_bytes or any((stage / n).read_bytes() != original[n] for n in NAMES):
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
