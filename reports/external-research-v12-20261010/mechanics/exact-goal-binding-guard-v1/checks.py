#!/usr/bin/env python3
"""Bounded synthetic checks only; all fixtures are owned and deleted afterward."""
import copy
import datetime as dt
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path
sys.dont_write_bytecode = True
HERE = Path(__file__).absolute().parent
spec = importlib.util.spec_from_file_location('overlay', HERE / 'overlay.py')
overlay = importlib.util.module_from_spec(spec)
spec.loader.exec_module(overlay)
SCRATCH = HERE / 'synthetic-scratch'
RESULTS = []


def record(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': overlay.sha(data), 'bytes': len(data)}


def fixture(name, request_in_map=False):
    stage = SCRATCH / name
    stage.mkdir()
    (stage / 'sources').mkdir()
    (stage / 'assignment.md').write_text('SYNTHETIC assignment; no source payload.\nROOT MECHANICS CLARIFICATION v1\n')
    req = {'args': {'target': {'provider': 'synthetic', 'model': 'synthetic'},
                    'task': 'SYNTHETIC first short task.\nROOT MECHANICS CLARIFICATION v1\n'},
           'assignment_record': record(stage / 'assignment.md')}
    (stage / 'request.json').write_bytes(overlay.encode(req))
    im = {'frozen_inputs': [record(stage / 'assignment.md')]}
    if request_in_map:
        im['frozen_inputs'].append(record(stage / 'request.json'))
    (stage / 'input-map.json').write_bytes(overlay.encode(im))
    future = (dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=1)).isoformat()
    freeze = {'native_goal_objective': 'SYNTHETIC C-R1-01/treatment objective; keep / verbatim.',
              'requested_route': req['args']['target'], 'deadline_utc': future,
              'stage_deadline_utc': future, 'whole_deadline_utc': future,
              'request_sha256': overlay.sha((stage / 'request.json').read_bytes()),
              'assignment_sha256': overlay.sha((stage / 'assignment.md').read_bytes()),
              'frozen_inputs': [record(stage / n) for n in ('assignment.md', 'input-map.json', 'request.json')],
              'synthetic_science_sentinel': 'UNCHANGED SYNTHETIC'}
    (stage / 'freeze.json').write_bytes(overlay.encode(freeze))
    marker = {'version': 'invocation-clarification-v1', 'stageDir': str(stage), 'dispatch_performed': False,
              'updated_sha256': {n: overlay.sha((stage / n).read_bytes()) for n in overlay.NAMES}}
    (stage / overlay.V1_MARKER).write_bytes(overlay.encode(marker))
    return stage


def snapshot(stage):
    return {str(p.relative_to(stage)): p.read_bytes() for p in stage.rglob('*') if p.is_file() and not p.is_symlink()}


def cli(script, stage, raw=None):
    args = [sys.executable, str(HERE / script), '--stage-dir', str(stage)]
    if raw is not None:
        args += ['--json', raw if isinstance(raw, str) else json.dumps(raw)]
    return subprocess.run(args, capture_output=True, text=True)


def gate(name, stage, raw, success=False):
    before = snapshot(stage)
    p = cli('assert-active-goal.py', stage, raw)
    assert p.returncode == (0 if success else 2), (name, p.stdout, p.stderr)
    assert snapshot(stage) == before
    RESULTS.append({'check': name, 'passed': True, 'exit_code': p.returncode})


def rejected(name, stage):
    before = snapshot(stage)
    p = cli('overlay.py', stage)
    assert p.returncode == 2, (name, p.stdout, p.stderr)
    assert snapshot(stage) == before, name
    RESULTS.append({'check': name, 'passed': True, 'diagnostic': p.stderr.strip()})


def main():
    SCRATCH.mkdir(exist_ok=False)
    try:
        stage = fixture('gate')
        objective = json.loads((stage / 'freeze.json').read_bytes())['native_goal_objective']
        goal = {'threadId': 'SYNTHETIC-NATIVE-ID', 'objective': objective, 'status': 'active',
                'createdAt': 1, 'updatedAt': 1, 'tokensUsed': 0, 'timeUsedSeconds': 0}
        codex = {'goal': goal, 'remainingTokens': None, 'completionBudgetReport': None}
        AUTHORIZED_PROVIDER_INSTANCE = {'goal': {'goal_id': 'SYNTHETIC-MUSE-ID', 'objective': objective, 'status': 'active',
                         'tokens_used': 0, 'elapsed_seconds': 0}, 'remaining_tokens': None}
        gate('matching Codex complete envelope', stage, codex, True)
        gate('matching Muse goal_id envelope', stage, AUTHORIZED_PROVIDER_INSTANCE, True)
        gate('matching Muse direct object', stage, AUTHORIZED_PROVIDER_INSTANCE['goal'], True)
        gate('extracted Codex goal rejected', stage, goal)
        partial = copy.deepcopy(codex)
        del partial['goal']['tokensUsed']
        gate('partial Codex goal fields', stage, partial)
        for name, key, value in [('slash-to-hyphen mismatch', 'objective', objective.replace('C-R1-01/treatment', 'C-R1-01-treatment')),
                                  ('blocked', 'status', 'blocked'), ('complete', 'status', 'complete'),
                                  ('case-sensitive status', 'status', 'ACTIVE'), ('whitespace mismatch', 'objective', objective + ' ')]:
            bad = copy.deepcopy(codex)
            bad['goal'][key] = value
            gate(name, stage, bad)
        for name, raw in [('invalid JSON', '{'), ('trailing JSON', json.dumps(codex) + '{}'),
                          ('partial wrapper', {'goal': goal}), ('missing identity', {'objective': objective, 'status': 'active'}),
                          ('missing status', {'goal_id': 'SYNTHETIC', 'objective': objective}),
                          ('empty identity', {'goal_id': '', 'objective': objective, 'status': 'active'}),
                          ('duplicate field', '{"goal_id":"x","goal_id":"y","objective":"x","status":"active"}')]:
            gate(name, stage, raw)
        (stage / 'link').symlink_to(stage / 'freeze.json')
        gate('gate symlink member', stage, codex)
        (stage / 'link').unlink()
        alias = SCRATCH / 'alias'
        alias.symlink_to(stage, target_is_directory=True)
        gate('gate symlink stage', alias, codex)
        missing = SCRATCH / 'missing-freeze'
        missing.mkdir()
        gate('missing freeze', missing, codex)
        for map_request in (False, True):
            stage = fixture('overlay-' + str(map_request), map_request)
            before = snapshot(stage)
            old_freeze = json.loads(before['freeze.json'])
            out = overlay.transform(stage)
            for n in overlay.NAMES:
                assert (Path(out['backupDir']) / n).read_bytes() == before[n]
            for n in overlay.NAMES[:3]:
                overlay.records(json.loads((stage / n).read_bytes()))
            new_freeze = json.loads((stage / 'freeze.json').read_bytes())
            for key in ('native_goal_objective', 'requested_route', 'deadline_utc', 'stage_deadline_utc', 'whole_deadline_utc', 'synthetic_science_sentinel'):
                assert new_freeze[key] == old_freeze[key]
            assert (stage / overlay.V1_MARKER).read_bytes() == before[overlay.V1_MARKER]
            assert out['command'] in (stage / 'assignment.md').read_text()
            assert out['command'] in json.loads((stage / 'request.json').read_bytes())['args']['task']
            after = snapshot(stage)
            assert overlay.transform(stage)['idempotent'] and snapshot(stage) == after
            RESULTS.append({'check': 'overlay backup/hash closure/idempotent/preservation request-in-map=' + str(map_request), 'passed': True})
            (stage / 'assignment.md').write_bytes((stage / 'assignment.md').read_bytes() + b'changed')
            rejected('changed hash retry', stage)
        for name in ('dispatch', 'used', 'source-used', 'expiry', 'missing-marker', 'marker-hash', 'symlink', 'request-hash'):
            stage = fixture(name)
            if name == 'dispatch':
                (stage / 'dispatch.json').write_text('{}')
            elif name == 'used':
                (stage / 'native-active.json').write_text('{}')
            elif name == 'source-used':
                (stage / 'sources' / 'synthetic.txt').write_text('SYNTHETIC')
            elif name == 'expiry':
                freeze = json.loads((stage / 'freeze.json').read_bytes())
                freeze['deadline_utc'] = '2000-01-01T00:00:00+00:00'
                (stage / 'freeze.json').write_bytes(overlay.encode(freeze))
            elif name == 'missing-marker':
                (stage / overlay.V1_MARKER).unlink()
            elif name == 'marker-hash':
                (stage / 'input-map.json').write_text('{}')
            elif name == 'symlink':
                (stage / 'link').symlink_to(stage / 'freeze.json')
            elif name == 'request-hash':
                (stage / 'request.json').write_bytes((stage / 'request.json').read_bytes() + b' ')
            rejected(name, stage)
        stage = fixture('used-replay')
        overlay.transform(stage)
        (stage / 'dispatch.json').write_text('{}')
        rejected('dispatched idempotent replay', stage)
    finally:
        shutil.rmtree(SCRATCH)
    result = {'version': 'exact-goal-binding-guard-v1', 'synthetic_only': True,
              'all_passed': True, 'count': len(RESULTS), 'checks': RESULTS,
              'live_overlay_runs': 0, 'provider_calls': 0, 'delegations': 0,
              'scientific_qualification': False, 'scratch_removed': True}
    (HERE / 'check-results.json').write_bytes(overlay.encode(result))
    print(json.dumps({'all_passed': True, 'count': len(RESULTS)}))


if __name__ == '__main__':
    main()
