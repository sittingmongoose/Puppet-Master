#!/usr/bin/env python3
"""Root-only post-prepare mechanics overlay. No tools, dispatch, scheduling or Goals."""
import argparse
import copy
import datetime as dt
import hashlib
import json
import shlex
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = HERE.parents[1]
NAMES = ('request.json', 'freeze.json', 'input-map.json', 'assignment.md')
MARKER = 'invocation-clarification.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encode(obj):
    return (json.dumps(obj, ensure_ascii=False, indent=2) + '\n').encode()


def load(path):
    return json.loads(path.read_bytes())


def fail(message):
    raise ValueError(message)


def assert_unused(stage):
    if any(p.is_symlink() for p in (stage, *stage.parents)):
        fail('symlink stage ancestry rejected')
    if not stage.is_dir() or (stage / 'dispatch.json').exists():
        fail('missing stage or dispatch present; no transformation')
    allowed = set(NAMES) | {'sources', MARKER}
    for p in stage.iterdir():
        if p.is_symlink():
            fail('symlink stage member rejected')
        if p.name.startswith('.invocation-backup-') and p.is_dir():
            continue
        if p.name not in allowed:
            fail('used/partial stage member rejected: ' + p.name)
        if p.name == 'sources' and (not p.is_dir() or any(p.iterdir())):
            fail('source work already present')
    if any(not (stage / n).is_file() for n in NAMES):
        fail('complete prepared request/freeze/input-map/assignment required')


def update_records(obj, changed):
    if isinstance(obj, dict):
        path = obj.get('path')
        if path in changed and 'sha256' in obj:
            obj['sha256'] = sha(changed[path])
            if 'bytes' in obj:
                obj['bytes'] = len(changed[path])
        for value in obj.values():
            update_records(value, changed)
    elif isinstance(obj, list):
        for value in obj:
            update_records(value, changed)


def verify_records(obj):
    if isinstance(obj, dict):
        if 'path' in obj and 'sha256' in obj:
            p = Path(obj['path'])
            if not p.is_absolute() or p.is_symlink() or not p.is_file():
                fail('nonregular carried input: ' + str(p))
            data = p.read_bytes()
            if sha(data) != obj['sha256'] or ('bytes' in obj and len(data) != obj['bytes']):
                fail('carried input hash/size mismatch: ' + str(p))
        for v in obj.values():
            verify_records(v)
    elif isinstance(obj, list):
        for v in obj:
            verify_records(v)


def transform(stage):
    stage = stage.expanduser().absolute()
    assert_unused(stage)
    pins = load(HERE / 'helper-pins.json')
    for path, digest in pins.items():
        if sha(Path(path).read_bytes()) != digest:
            fail('pinned helper changed: ' + path)
    original = {n: (stage / n).read_bytes() for n in NAMES}
    req, freeze, im = (json.loads(original[n]) for n in NAMES[:3])
    for obj in (freeze, im):
        verify_records(obj)
    if freeze.get('request_sha256') and freeze['request_sha256'] != sha(original['request.json']):
        fail('request hash mismatch')
    if req['args']['target'] != freeze['requested_route']:
        fail('route mismatch')
    deadlines = [freeze[k] for k in ('deadline_utc', 'stage_deadline_utc', 'whole_deadline_utc') if k in freeze]
    if not deadlines or any(dt.datetime.fromisoformat(x.replace('Z', '+00:00')) <= dt.datetime.now(dt.timezone.utc) for x in deadlines):
        fail('expired/historical stage rejected; never reset clocks')
    if (stage / MARKER).exists():
        out = load(stage / MARKER)
        if any(sha(original[n]) != out['updated_sha256'][n] for n in NAMES):
            fail('transformed bytes changed; no repair')
        return dict(out, idempotent=True)
    objective = freeze['native_goal_objective']
    if not isinstance(objective, str) or not objective or len(objective) >= 4000:
        fail('invalid exact native objective')
    commands = []
    stage_name = stage.name
    if freeze.get('protocol', '').startswith('role-v2;'):
        if stage_name != 'role':
            fail('role-v2 stage mismatch')
        config = None
        addition = ('\nROOT MECHANICS CLARIFICATION v1\nBefore common assignment/corpus reads or any source/case inference, activate exactly ONE actual exposed native Goal with this exact objective string: '
                    + json.dumps(objective, ensure_ascii=False)
                    + '\nConfirm activation and preserve the exact unmodified native activation response. No second Goal. If unavailable or unsupported, stop before inference and preserve the exact diagnostic; no simulated receipt. Save deliverables before completing that same Goal and preserve its exact native completion response. Original deadline, writing reserve, scope and route remain binding.\n')
    elif 'ER12 A2 ' in original['assignment.md'].decode() or 'ER12 A7 ' in original['assignment.md'].decode():
        text = original['assignment.md'].decode()
        topology = 'A2' if 'ER12 A2 ' in text else 'A7' if 'ER12 A7 ' in text else None
        if not topology or stage_name not in ({'investigator', 'critic'} if topology == 'A2' else {'investigator', 'critic-finalizer'}):
            fail('unsupported topology/stage')
        config = BASE / 'configs' / (im['run_id'] + '.json')
        if not config.is_file():
            fail('exact config path missing')
        helper = BASE / 'helpers/topology-v1/prepare.py'
        def command(action, native=False, notification=False):
            argv = ['python3', str(helper), action, '--config', str(config), '--stage', stage_name]
            if notification:
                argv += ['--notification-sha256', '<exact SHA-256 delivered by root>']
            if native:
                argv += ['--json', '<exact fresh active native get_goal response JSON>']
            commands.append({'action': action, 'argv_template': argv, 'shell_template': shlex.join(argv), 'requires_fresh_active_native_response': native})
        if stage_name == 'investigator':
            command('freeze-investigator', True)
            command('confirm-frozen-active', True)
            if topology == 'A2':
                command('author-intake', True, True)
                command('seal-final', True)
        else:
            command('check-input')
            if topology == 'A7':
                command('freeze-review')
                command('seal-final', True)
        addition = ('\nROOT MECHANICS CLARIFICATION v1\nThese fully expanded helper invocations resolve the abbreviated calls above. Stage directory: ' + str(stage)
                    + '\nConfig: ' + str(config) + '\nExact existing native Goal objective: ' + json.dumps(objective, ensure_ascii=False)
                    + '\nFor EACH --json invocation call actual native get_goal immediately beforehand and pass its exact complete unmodified response as ONE JSON argument. It must report active and match the exact original objective/identity; never reuse an earlier observation, author receipts, or create a replacement/second Goal. Placeholders below denote runtime native data, never literal JSON or synthetic data. Use structured subprocess argv or correct shell quoting for the exact JSON.\n'
                    + '\n'.join(c['shell_template'] for c in commands)
                    + '\nOrder: freeze-investigator after all investigation outputs; confirm-frozen-active immediately after freeze with a NEW native observation. A2 author-intake only after root notification, using its exact delivered notification hash; seal-final after all complete retained final outputs and before completion of the SAME Goal. A7 investigator confirms active after freeze, then completes normally; A7 critic-finalizer runs check-input before checks/final writing, freeze-review before final.md exists, seal-final after complete final outputs and before native completion. Critic check-input precedes checks. Only applicable commands listed above are executable for this stage. Preserve exact native activation/completion receipts. Deadlines, budgets, scope, write roots, Goal identity, route and service Tier are unchanged.\n')
    else:
        config = None
        addition = ('\nROOT MECHANICS CLARIFICATION v1\nBefore any case/source input or inference, activate exactly ONE actual exposed native Goal with this exact immutable objective: ' + json.dumps(objective, ensure_ascii=False) + '\nNo case input is needed for activation. Preserve exact native activation/completion responses, stop before inference if activation is unsupported, and never create a second/replacement Goal. All original lifecycle, deadlines, scope and routes remain binding. No topology actions apply to this stage.\n')
    changed = {str(stage / 'assignment.md'): original['assignment.md'] + addition.encode()}
    if any(item.get('path') == str(stage / 'input-map.json') for item in im.get('frozen_inputs', [])):
        fail('unsupported self-hashing input map')
    update_records(im, changed)
    changed[str(stage / 'input-map.json')] = encode(im) if im != json.loads(original['input-map.json']) else original['input-map.json']
    req['args']['task'] += ('\nBefore any case/source input or inference, activate exactly ONE actual exposed native Goal using this exact immutable freeze.native_goal_objective string: ' + json.dumps(objective, ensure_ascii=False) + '\nNo case input is needed for activation. Preserve the exact native activation response; if unsupported, stop before inference and preserve the exact diagnostic. No second or replacement Goal. Original Goal lifecycle and scope remain binding. Follow the appended ROOT MECHANICS CLARIFICATION v1 in the assignment.\n')
    changed[str(stage / 'request.json')] = encode(req)
    update_records(freeze, changed)
    freeze['request_sha256'] = sha(changed[str(stage / 'request.json')])
    if 'assignment_sha256' in freeze:
        freeze['assignment_sha256'] = sha(changed[str(stage / 'assignment.md')])
    changed[str(stage / 'freeze.json')] = encode(freeze)
    backup = stage / ('.invocation-backup-' + uuid.uuid4().hex)
    assert_unused(stage)
    backup.mkdir()
    for n, data in original.items():
        (backup / n).write_bytes(data)
        (backup / n).chmod(0o444)
    out = {'version': 'invocation-clarification-v1', 'stageDir': str(stage), 'backupDir': str(backup),
           'args': req['args'], 'config': str(config) if config else None, 'commands': commands,
           'original_sha256': {n: sha(data) for n, data in original.items()},
           'updated_sha256': {n: sha(changed[str(stage / n)]) for n in NAMES}, 'helper_pins': pins,
           'root_only_integration': True, 'dispatch_performed': False, 'idempotent': False}
    try:
        assert_unused(stage)
        for n in NAMES:
            if (stage / n).read_bytes() != original[n]:
                fail('prepared bytes changed concurrently')
        for n in NAMES:
            if (stage / 'dispatch.json').exists():
                fail('dispatch appeared concurrently')
            tmp = stage / (n + '.clarification-tmp')
            tmp.write_bytes(changed[str(stage / n)])
            tmp.replace(stage / n)
        (stage / MARKER).write_bytes(encode(out))
    except Exception:
        # Root must own the unused stage exclusively; preserve backup on failure.
        for n in NAMES:
            (stage / n).write_bytes(original[n])
            (stage / (n + '.clarification-tmp')).unlink(missing_ok=True)
        raise
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage-dir', required=True, type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(transform(args.stage_dir), ensure_ascii=False))
    except (ValueError, KeyError, OSError) as exc:
        parser.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    main()
