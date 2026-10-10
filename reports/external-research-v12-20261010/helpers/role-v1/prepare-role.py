#!/usr/bin/env python3
"""ER12 role-v1 freezer only. Root reserves capacity and dispatches; no tool calls here."""
from __future__ import annotations
import argparse, copy, datetime as dt, hashlib, json, re, sys, uuid
from pathlib import Path

BASE = Path('ER12_RUNTIME')
UTC = dt.timezone.utc
ROUTES = {
    'codex_authorized': {'providerInstanceId': 'AUTHORIZED_CODEX_PROVIDER_ID', 'model': 'gpt-6-luna', 'options': {'reasoningEffort': 'max', 'serviceTier': 'priority'}},
    'muse_code': {'providerInstanceId': 'muse', 'model': 'muse-spark-1.3-contributor', 'options': {'reasoningEffort': 'max'}},
    'zcode': {'providerInstanceId': 'zcode', 'model': r'builtin:zai-coding-plan\GLM-5.3-Flash', 'options': {'mode': 'yolo', 'thought': 'max'}},
}

def now():
    return dt.datetime.now(UTC)

def iso(t):
    return t.astimezone(UTC).isoformat(timespec='microseconds')

def parse_time(s):
    t = dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
    if t.tzinfo is None:
        fail('absolute UTC time must have a timezone')
    return t.astimezone(UTC)

def digest_bytes(b):
    return hashlib.sha256(b).hexdigest()

def digest(p):
    return digest_bytes(p.read_bytes())

def read_json(p):
    return json.loads(p.read_text())

def put_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + '.tmp')
    tmp.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    tmp.replace(path)

def fail(msg):
    raise SystemExit(msg)

def validate_fixture(fixture_path, slot, arm):
    f = read_json(fixture_path)
    if f.get('schema') != 'er12-role-fixture-v1' or f.get('slot_id') != slot:
        fail('fixture schema/slot mismatch')
    if (f.get('whole_arm_seconds'), f.get('investigation_seconds_max'), f.get('writing_reserve_seconds')) != (900, 600, 300):
        fail('fixture must retain frozen 900/600/300 time contract')
    provider = f[arm]['provider']
    if provider not in ROUTES or (arm == 'control' and provider != 'codex_authorized'):
        fail('unsupported or unauthorized fixture provider')
    files = []
    seen = set()
    for item in f['input_files']:
        rel = Path(item['path'])
        if rel.is_absolute() or '..' in rel.parts or str(rel) in seen:
            fail('unsafe/duplicate fixture input path')
        seen.add(str(rel))
        p = fixture_path.parent / rel
        if not p.is_file() or not p.resolve().is_relative_to(fixture_path.parent.resolve()) or digest(p) != item['sha256']:
            fail(f'fixture input hash mismatch: {p}')
        files.append((rel, p, item['sha256']))
    if f.get('assignment') not in seen:
        fail('fixture assignment must be an exact listed input')
    return f, files, copy.deepcopy(ROUTES[provider])

def check_hashes(freeze):
    for item in freeze['frozen_inputs']:
        p = Path(item['path'])
        if not p.is_file() or digest(p) != item['sha256'] or p.stat().st_size != item['bytes']:
            fail(f'frozen input changed; preserve artifacts: {p}')

def verify_saved(stage, target):
    req = read_json(stage / 'request.json')
    freeze = read_json(stage / 'freeze.json')
    check_hashes(freeze)
    args = req['args']
    if args['target'] != target or freeze['requested_route'] != target:
        fail('saved route differs from exact authorized fixture route')
    if req.get('clientRequestId', args['clientRequestId']) != args['clientRequestId']:
        fail('saved clientRequestId mismatch')
    im = read_json(stage / 'input-map.json')
    start = parse_time(freeze['prepared_at_utc'])
    deadline = parse_time(freeze['deadline_utc'])
    if (deadline - start).total_seconds() != 900 or im['deadline_utc'] != freeze['deadline_utc'] or (im['whole_arm_seconds'], im['writing_reserve_s']) != (900, 300):
        fail('saved absolute envelope/reserve mismatch')
    if len(freeze['native_goal_objective']) >= 4000:
        fail('saved native objective must be under 4000 characters')
    if freeze.get('request_sha256') and digest(stage / 'request.json') != freeze['request_sha256']:
        fail('saved request changed; preserve artifacts')
    dispatch = stage / 'dispatch.json'
    # Existing accepted work is observational only, even after its deadline.
    if dispatch.exists():
        return {'alreadyDispatched': True, 'dispatch': read_json(dispatch), 'args': args, 'stageDir': str(stage), 'expired': now() >= deadline}
    if now() >= deadline:
        fail('deadline expired; no redispatch and no reset clock')
    return {'alreadyDispatched': False, 'args': args, 'stageDir': str(stage), 'retry': True}

def prepare(slot, arm, fixture_path, runtime_root=None, started_at=None):
    f, files, target = validate_fixture(fixture_path, slot, arm)
    root = (runtime_root or BASE / 'runs' / slot).resolve()
    if not root.is_absolute() or any(x.lower() in {'.git', 'plans', 'concepts'} for x in root.parts) or root == Path('/'):
        fail('dedicated absolute experiment runtime required')
    stage = root / arm / 'stages' / 'role'
    if (stage / 'request.json').exists():
        im = read_json(stage / 'input-map.json')
        saved_fixture = Path(im['fixture'])
        if digest(saved_fixture) != digest(fixture_path):
            fail('retry fixture differs from original; retain original request/deadline')
        for rel, _, sha in files:
            if digest(saved_fixture.parent / rel) != sha:
                fail('retry shared inputs differ from exact fixture')
        return verify_saved(stage, target)
    # Never repurpose or repair an original already-started arm.
    if stage.exists() and any(stage.iterdir()):
        fail('partial/existing stage without request; preserve and stop')
    if started_at is None:
        fail('new preparation requires --started-at-utc: root envelope origin before setup/startup')
    start = parse_time(started_at)
    deadline = start + dt.timedelta(seconds=900)
    if start > now() or now() >= deadline - dt.timedelta(seconds=300):
        fail('future origin or investigation allowance exhausted; do not reset clock')
    shared = root / 'inputs'
    if shared.resolve().is_relative_to(fixture_path.parent.resolve()) or fixture_path.parent.resolve().is_relative_to(shared.resolve()):
        fail('shared input copy must be separate from source fixture')
    manifest_path = shared / 'manifest.json'
    expected = {'fixture_sha256': digest(fixture_path), 'input_files': f['input_files']}
    if manifest_path.exists() and read_json(manifest_path) != expected:
        fail('shared fixture differs; preserve shared copy')
    for rel, src, sha in files + [(Path('fixture.json'), fixture_path, digest(fixture_path))]:
        dest = shared / rel
        if dest.exists() and digest(dest) != sha:
            fail(f'shared input differs: {dest}')
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            dest.write_bytes(src.read_bytes())
        if digest(dest) != sha:
            fail('source changed while copying')
    if not manifest_path.exists():
        put_json(manifest_path, expected)
    stage.mkdir(parents=True, exist_ok=True)
    (stage / 'sources').mkdir(exist_ok=True)
    assignment = stage / 'assignment.md'
    objective = f'ER12 {slot}/{arm}: execute {assignment}; save the complete bounded role output and source map before completing this actual native Goal.'
    if len(objective) >= 4000:
        fail('native objective must be under 4000 characters')
    im = {'common_assignment': str(shared / f['assignment']), 'fixture': str(shared / 'fixture.json'),
          'corpus': str(shared / 'corpus') if any(rel.parts[0] == 'corpus' for rel, _, _ in files) else None,
          'allowed_write_root': str(stage), 'deadline_utc': iso(deadline), 'whole_arm_seconds': 900,
          'writing_reserve_s': 300, 'role_scope': f['role']}
    # Verbatim frozen wrapper; only slot/arm, paths, objective and absolute deadline vary.
    template_dir = BASE / 'runs' / 'B-DISC-M-01' / 'control' / 'stages' / 'role'
    template_freeze = read_json(template_dir / 'freeze.json')
    if digest(template_dir / 'assignment.md') != 'c86d210c2c2752cbe7dfdd196a81e8680e02f44ec16cda14a863b849fd435f47':
        fail('original wrapper version changed; preserve and stop')
    wrapper = (template_dir / 'assignment.md').read_text()
    wrapper = wrapper.replace(template_freeze['native_goal_objective'], objective).replace(str(template_dir), str(stage)).replace('B-DISC-M-01/control', f'{slot}/{arm}').replace(template_freeze['deadline_utc'], iso(deadline))
    put_json(stage / 'input-map.json', im)
    assignment.write_text(wrapper)
    task = f'Execute exactly {assignment} and input-map.json. Create a real native Goal referring to this assignment; save complete role science before native completion. No nested helpers, other arms, account changes or parent history.'
    request_id = f'er12-{slot}-{arm}-role-v1'
    args = {'clientRequestId': request_id, 'title': f'ER12 {slot} {arm} role', 'role': 'research', 'mode': 'async',
            'runtimeMode': 'full-access', 'interactionMode': 'default', 'target': target, 'task': task}
    req = {'requested_at_utc': iso(start), 'clientRequestId': request_id, 'args': args}
    frozen_paths = [assignment, stage / 'input-map.json', shared / 'fixture.json', manifest_path] + [shared / rel for rel, _, _ in files]
    put_json(stage / 'request.json', req)
    put_json(stage / 'freeze.json', {'native_goal_objective': objective, 'prepared_at_utc': iso(start),
        'frozen_at_utc': iso(now()), 'deadline_utc': iso(deadline), 'writing_start_utc': iso(deadline - dt.timedelta(seconds=300)),
        'frozen_inputs': [{'path': str(p), 'sha256': digest(p), 'bytes': p.stat().st_size} for p in frozen_paths],
        'request_sha256': digest(stage / 'request.json'), 'requested_route': target, 'protocol': 'role-v1; advisory leaf controls',
        'time_contract': '900 seconds absolute including setup/startup/tools/retries/writing/delivery; final 300 seconds writing',
        'native_goal_status': 'UNKNOWN until directly observed'})
    return verify_saved(stage, target) | {'retry': False}

def structured(raw):
    obj = raw.get('structuredContent', {}) if isinstance(raw, dict) else {}
    if not obj and isinstance(raw, dict):
        for item in raw.get('content', []):
            if item.get('type') == 'text':
                try:
                    obj = json.loads(item['text'])
                except (ValueError, TypeError):
                    pass
                break
    return obj or raw

def record_response(stage, raw, status=False):
    if stage.resolve().is_relative_to((BASE / 'runs' / 'B-DISC-M-01').resolve()) or stage.resolve().is_relative_to((BASE / 'runs' / 'B-APPL-G-01').resolve()):
        fail('original started runs are read-only in this helper; root retains original recording path')
    req = read_json(stage / 'request.json')
    obj = structured(raw)
    entry = {'captured_at_utc': iso(now()), 'requested_at_utc': req['requested_at_utc'],
             'clientRequestId': req['args']['clientRequestId'], 'args': req['args'], 'raw_response': raw, 'returned': obj}
    # Keep every raw attempt (including uncertainty/conflicts); never overwrite first dispatch.
    attempts = stage / 'records'
    attempts.mkdir(exist_ok=True)
    p = attempts / f'{"status" if status else "dispatch"}-{now().strftime("%Y%m%dT%H%M%S%f")}-{uuid.uuid4().hex}.json'
    put_json(p, entry)
    if status:
        dispatched = read_json(stage / 'dispatch.json')['returned']
        if not isinstance(obj, dict) or obj.get('taskId') != dispatched.get('taskId'):
            fail(f'status taskId mismatch; raw saved at {p}')
        put_json(stage / 'status.json', entry)
    elif isinstance(obj, dict) and obj.get('taskId'):
        dest = stage / 'dispatch.json'
        if dest.exists() and read_json(dest)['returned'].get('taskId') != obj['taskId']:
            fail(f'conflicting taskId; preserve first dispatch and raw attempt at {p}')
        if not dest.exists():
            put_json(dest, entry)
    return entry

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('action', choices=['prepare', 'record', 'record-status'])
    ap.add_argument('--slot', required=True)
    ap.add_argument('--arm', choices=['control', 'treatment'], required=True)
    ap.add_argument('--fixture', type=Path)
    ap.add_argument('--runtime-root', type=Path, help='Dedicated slot root; defaults to existing campaign runs/<slot>')
    ap.add_argument('--started-at-utc', help='Root-fixed envelope origin BEFORE setup; retries ignore new origins')
    ap.add_argument('--json-file', type=Path, help='Exact raw dispatch/status JSON; no tool call is performed')
    a = ap.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,63}', a.slot):
        fail('invalid slot')
    fixture = (a.fixture or BASE / 'frozen-inputs' / a.slot / 'fixture.json').resolve()
    if a.runtime_root and not a.runtime_root.is_absolute():
        fail('runtime-root must be absolute')
    if a.action == 'prepare':
        out = prepare(a.slot, a.arm, fixture, a.runtime_root, a.started_at_utc)
    else:
        if not a.json_file:
            fail('record action requires --json-file')
        stage = (a.runtime_root or BASE / 'runs' / a.slot) / a.arm / 'stages' / 'role'
        out = record_response(stage, read_json(a.json_file), a.action == 'record-status')
    print(json.dumps(out, ensure_ascii=False))

if __name__ == '__main__':
    main()
