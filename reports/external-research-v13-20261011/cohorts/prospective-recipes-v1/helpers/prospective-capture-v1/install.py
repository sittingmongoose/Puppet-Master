#!/usr/bin/env python3
"""Additive UNUSED-stage API after the existing exact v21 overlay. No native calls."""
import argparse
import datetime as dt
import hashlib
import importlib.util
import json
import uuid
from pathlib import Path

HERE = Path(__file__).absolute().parent
MARKER = 'prospective-capture-v1.json'
PROGRAM = 'native-capture.js'
NAMES = ('request.json', 'freeze.json', 'input-map.json', 'assignment.md')
GUARD_SHA = '4a61deec5eb0ca5eca149f0e1f30c55c3e90b5a6ad0557fc98946d340cae99ed'
ORIGINAL_TEMPLATE_SHA = '3eed7edf2cb7d5cd506daecaab89502d45eb07b64d1006f6ab72b3f7afc6e6f5'
ORIGINAL_OVERLAY_SHA = 'f79d4689649cb520bdd993f228666f72cc60257e5df73b6e7a01c37e7a96380c'


def sha(b):
    return hashlib.sha256(b).hexdigest()


def encode(obj):
    return (json.dumps(obj, ensure_ascii=False, indent=2) + '\n').encode()


def load(path):
    spec = importlib.util.spec_from_file_location('unchanged_v21_overlay', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def loader(program, digest):
    # Execute the exact verified bytes returned by this read, not a second file read.
    py = "import hashlib,sys; from pathlib import Path; p=Path(sys.argv[1]); assert p.is_absolute() and not any(x.is_symlink() for x in (p,*p.parents)); b=p.read_bytes(); assert hashlib.sha256(b).hexdigest()==sys.argv[2], 'program pin mismatch'; sys.stdout.buffer.write(b)"
    q = lambda s: "'" + s.replace("'", "'\\''") + "'"
    cmd = 'python3 -B -c ' + q(py) + ' ' + q(str(program)) + ' ' + q(digest)
    return ('const loaded = await tools.exec_command({cmd: ' + json.dumps(cmd) + ', max_output_tokens: 12000});\n'
            'if (loaded.exit_code !== 0 || loaded.session_id) throw Error("STOP: pinned capture load failed; no activation: " + loaded.output);\n'
            'await new (Object.getPrototypeOf(async function(){}).constructor)("tools", "text", loaded.output)(tools, text);')


def transform(stage):
    stage = Path(stage).absolute()
    # The existing materializer fixes this layout. No case/scientific inputs read.
    root = stage.parents[3]
    old_dir = root / 'mechanics/exact-activation-capture-v2-1'
    overlay = old_dir / 'overlay.py'
    if any(p.is_symlink() for p in (overlay, *overlay.parents)) or sha(overlay.read_bytes()) != ORIGINAL_OVERLAY_SHA:
        raise ValueError('unchanged original overlay pin required before import')
    cap = load(overlay)
    cap.no_links(stage)
    guard = root / 'mechanics/exact-goal-binding-guard-v1/assert-active-goal.py'
    for p in (guard, old_dir / 'activation-snippet-template.js', HERE / 'activation-template.js'):
        cap.no_links(p)
    relocated_template = (old_dir / 'activation-snippet-template.js').read_bytes()
    if sha(guard.read_bytes()) != GUARD_SHA or sha(relocated_template.replace(str(root).encode(), b'ER12_RUNTIME')) != ORIGINAL_TEMPLATE_SHA:
        cap.fail('unchanged v21 template/guard pin mismatch')
    owner = json.loads((old_dir / 'capture-owner.json').read_bytes())
    config = Path(owner['config_path'])
    cap.no_links(config)
    cfg = json.loads(config.read_bytes())
    if (sha(config.read_bytes()) != owner['config_sha256'] or owner['runtime_root'] != str(root / 'run' / owner['run_id'])
            or cfg['runtime_root'] != owner['runtime_root'] or cfg['run_id'] != owner['run_id']
            or cfg['activation_capture_version'] != 'exact-capture-v21'
            or stage.parent != Path(owner['runtime_root']) / 'stages' or stage.name not in owner['stages']):
        cap.fail('fresh caller-owned materializer stage/config required')
    allowed = set(NAMES) | {'sources', cap.V1_MARKER, cap.GUARD_MARKER, cap.MARKER, 'service-tier-change.json', MARKER, PROGRAM}
    for p in stage.rglob('*'):
        if p.is_symlink():
            cap.fail('symlink stage member rejected')
    for p in stage.iterdir():
        if p.is_dir() and p.name.startswith(('.invocation-backup-', '.goal-guard-backup-', '.activation-backup-', '.prospective-backup-')):
            continue
        if p.name not in allowed or (p.name == 'sources' and any(p.iterdir())):
            cap.fail('used/dispatched/partial stage rejected: ' + p.name)
    template = (HERE / 'activation-template.js').read_bytes()
    if (stage / MARKER).exists():
        out = json.loads((stage / MARKER).read_bytes())
        if (out['template_sha256'] != sha(template) or out['guard_sha256'] != GUARD_SHA
                or out['config_sha256'] != owner['config_sha256']
                or any(sha((stage / n).read_bytes()) != out['updated_sha256'][n] for n in NAMES)
                or sha((stage / PROGRAM).read_bytes()) != out['program_sha256']):
            cap.fail('changed prospective prepared bytes; no repair')
        f = json.loads((stage / 'freeze.json').read_bytes())
        deadlines = [f[k] for k in ('deadline_utc', 'stage_deadline_utc', 'whole_deadline_utc') if k in f]
        if not deadlines or any(dt.datetime.fromisoformat(x.replace('Z', '+00:00')) <= dt.datetime.now(dt.timezone.utc) for x in deadlines):
            cap.fail('expired stage; never reset clocks')
        return dict(out, idempotent=True)
    if (stage / PROGRAM).exists():
        cap.fail('partial prospective install; no repair')
    # Reuse the tested original preparation API and every original exact check.
    cap.transform(stage)
    original = {n: (stage / n).read_bytes() for n in NAMES}
    req, freeze, im = (json.loads(original[n]) for n in NAMES[:3])
    old_snippet = (old_dir / 'activation-snippet-template.js').read_text().replace('__STAGE_DIR_JSON__', json.dumps(str(stage), ensure_ascii=False))
    old_addition = ('\nEXACT ACTIVATION CAPTURE v2.1 — COMMON PRE-INPUT MECHANICS\n'
                    'This body implements the existing v1 ONE Goal activation instruction; execute it once, not as a second activation after that prose. Before scientific input, execute this body once. Stop on failure/unsupported; no second Goal. '
                    'Original substantive assignment, route, deadlines, scope and science remain binding.\n'
                    '```javascript\n' + old_snippet + '\n```\n'
                    'Save required stage outputs before completing the same Goal. Source/native provenance/freshness remain UNKNOWN beyond checker.\n')
    if not req['args']['task'].endswith(old_addition) or not original['assignment.md'].endswith(old_addition.encode()):
        cap.fail('exact original v21 suffix required; no prompt guessing')
    # Freeze's request hash depends on the loader, whose program hash depends on freeze.
    # Pin only the invariant freeze identity/time fields in the program; request hashes
    # remain checked here and in the saved prospective marker, avoiding a hash cycle.
    identity = {k: v for k, v in freeze.items() if k in ('native_goal_objective', 'deadline_utc', 'stage_deadline_utc', 'whole_deadline_utc')}
    program = template.decode().replace('__STAGE_DIR_JSON__', json.dumps(str(stage), ensure_ascii=False)).replace('__GUARD_JSON__', json.dumps(str(guard))).replace('__GUARD_SHA_JSON__', json.dumps(GUARD_SHA))
    # Hash the mechanically selected identity/time object; no token normalization.
    program = program.replace("hashlib.sha256(b).hexdigest()==sys.argv[4]", "hashlib.sha256(json.dumps({k:v for k,v in json.loads(b).items() if k in ('native_goal_objective','deadline_utc','stage_deadline_utc','whole_deadline_utc')},ensure_ascii=False,sort_keys=True).encode()).hexdigest()==sys.argv[4]")
    identity_sha = sha(json.dumps(identity, ensure_ascii=False, sort_keys=True).encode())
    program = program.replace('__FREEZE_SHA_JSON__', json.dumps(identity_sha)).encode()
    digest = sha(program)
    addition = ('\nPROSPECTIVE CAPTURE v1 — COMMON PRE-INPUT MECHANICS\n'
                'This loader replaces the v21 inline body and implements the existing ONE fresh native Goal instruction. Execute it exactly once in your own functions.exec before any scientific input; never separately execute the earlier activation prose. Do not retype/rewrite the loaded body, frozen objective, or returned receipt. Stop on load/save/guard/unknown creation failure; preserve diagnostic and attempt; never make a second/replacement Goal or retry activation. The attempt file is metadata, never a native receipt. Original T0, stage/whole caps, topology, route and all scientific obligations remain binding.\n'
                '```javascript\n' + loader(stage / PROGRAM, digest) + '\n```\n'
                'Proceed only after activation_binding_checked=true. Save required outputs before completing this same Goal, and save the complete direct terminal response as native-goal-terminal.json without reconstruction. No model-compliance or native-freshness guarantee is claimed.\n')
    changed = {str(stage / 'assignment.md'): original['assignment.md'][:-len(old_addition.encode())] + addition.encode()}
    req['args']['task'] = req['args']['task'][:-len(old_addition)] + addition
    # Reuse the old overlay's lexical record classifier and dependency ordering.
    pending = {'request.json': req, 'input-map.json': im, 'freeze.json': freeze}
    paths = {str(stage / n) for n in NAMES}
    while pending:
        ready = [n for n, obj in pending.items() if (cap.dependencies(obj) & paths | ({str(stage / 'request.json'), str(stage / 'assignment.md')} if n == 'freeze.json' else set())) <= changed.keys()]
        if not ready:
            cap.fail('unsupported cyclic/self-hashing prepared records')
        for n in ready:
            obj = pending.pop(n)
            cap.records(obj, changed)
            if n == 'freeze.json':
                obj['request_sha256'] = sha(changed[str(stage / 'request.json')])
                if 'assignment_sha256' in obj:
                    obj['assignment_sha256'] = sha(changed[str(stage / 'assignment.md')])
            changed[str(stage / n)] = encode(obj) if obj != json.loads(original[n]) else original[n]
    backup = stage / ('.prospective-backup-' + uuid.uuid4().hex)
    backup.mkdir()
    for n, data in original.items():
        (backup / n).write_bytes(data)
        (backup / n).chmod(0o444)
    out = {'version': 'prospective-capture-v1', 'stageDir': str(stage), 'backupDir': str(backup), 'args': req['args'],
           'dispatch_performed': False, 'root_only_integration': True, 'idempotent': False,
           'template_sha256': sha(template), 'program_sha256': digest, 'program_path': str(stage / PROGRAM),
           'guard_sha256': GUARD_SHA, 'original_template_sha256': ORIGINAL_TEMPLATE_SHA,
           'config_sha256': owner['config_sha256'], 'original_sha256': {n: sha(b) for n,b in original.items()},
           'updated_sha256': {n: sha(changed[str(stage / n)]) for n in NAMES}}
    if any((stage / n).read_bytes() != original[n] for n in NAMES):
        cap.fail('prepared bytes changed concurrently')
    with (stage / PROGRAM).open('xb') as p:
        p.write(program)
    (stage / PROGRAM).chmod(0o444)
    for n in NAMES:
        (stage / n).write_bytes(changed[str(stage / n)])
    with (stage / MARKER).open('xb') as p:
        p.write(encode(out))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--stage-dir', required=True, type=Path)
    a = ap.parse_args()
    try:
        print(json.dumps(transform(a.stage_dir), ensure_ascii=False))
    except (ValueError, OSError, KeyError, TypeError) as exc:
        ap.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    main()
