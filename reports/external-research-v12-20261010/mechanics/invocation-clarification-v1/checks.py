#!/usr/bin/env python3
"""Synthetic mechanics checks only: no helper execution, case reads or live writes."""
import argparse
import copy
import datetime as dt
import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path
sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
BASE = HERE.parents[1]
spec = importlib.util.spec_from_file_location('transform', HERE / 'transform.py')
t = importlib.util.module_from_spec(spec)
spec.loader.exec_module(t)

def snapshot(stage):
    return {str(p.relative_to(stage)): p.read_bytes() for p in stage.rglob('*') if p.is_file()}


def reject(stage):
    before = snapshot(stage)
    p = subprocess.run([sys.executable, str(HERE / 'transform.py'), '--stage-dir', str(stage)], capture_output=True, text=True)
    assert p.returncode == 2, p.stdout
    assert snapshot(stage) == before
    return p.stderr.strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scratch-dir', type=Path, default=HERE / 'scratch')
    args = parser.parse_args()
    scratch = args.scratch_dir.absolute()
    assert scratch.is_relative_to(HERE), 'scratch must remain inside the reserved directory'
    scratch.mkdir(exist_ok=False)
    templates = {}
    live_before = {}
    for kind, rel in [('topology', 'runs/A2-01/treatment/stages/investigator'), ('role', 'runs/B-DISC-G-02/control/stages/role')]:
        stage = BASE / rel
        templates[kind] = {n: (stage / n).read_bytes() for n in t.NAMES}
        live_before[str(stage)] = {n: t.sha(v) for n,v in templates[kind].items()}
    results = []
    cases = [('A2', 'investigator', 'treatment'), ('A2', 'critic', 'control'), ('A7', 'investigator', 'control'), ('A7', 'critic-finalizer', 'treatment'), ('role', 'role', 'control'), ('role', 'role', 'treatment'), ('generic', 'investigator', 'control')]
    for i, (top, name, arm) in enumerate(cases):
        stage = scratch / f'{i}-{top}' / arm / 'stages' / name
        stage.mkdir(parents=True)
        data = templates['role' if top == 'role' else 'topology']
        req, freeze, im = [json.loads(data[n]) for n in t.NAMES[:3]]
        assignment = data['assignment.md'].decode()
        oldstage = str(BASE / ('runs/B-DISC-G-02/control/stages/role' if top == 'role' else 'runs/A2-01/treatment/stages/investigator'))
        assignment = assignment.replace(oldstage, str(stage))
        if top == 'generic':
            assignment = assignment.replace('ER12 A2 ', 'ER11 reference ')
        if top == 'A7':
            assignment = assignment.replace('ER12 A2 ', 'ER12 A7 ')
        # Fixture-only paths, hashes and clocks; no source science copied or opened.
        future = (dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=2)).isoformat()
        for obj in [freeze, im]:
            for k in list(obj):
                if k.endswith('_utc'):
                    obj[k] = future
        im['allowed_write_root'] = str(stage)
        im['stage'] = name
        if top != 'role':
            im['run_id'] = 'A2-01-treatment' # existing config path only, never executed
            freeze['stage'] = name
        freeze['native_goal_objective'] = f'SYNTHETIC {top}/{arm}: execute {stage}/assignment.md under the unchanged fixture contract.'
        req['args']['task'] = 'Execute the synthetic assignment; preserve scope.'
        im['frozen_inputs'] = [{'path': str(stage / 'assignment.md'), 'sha256': t.sha(assignment.encode()), 'bytes': len(assignment.encode())}]
        (stage/'assignment.md').write_text(assignment)
        (stage/'input-map.json').write_bytes(t.encode(im))
        freeze['frozen_inputs'] = [{'path': str(stage/n), 'sha256': t.sha((stage/n).read_bytes()), 'bytes': (stage/n).stat().st_size} for n in ['assignment.md','input-map.json']]
        (stage/'request.json').write_bytes(t.encode(req))
        freeze['request_sha256'] = t.sha((stage/'request.json').read_bytes())
        (stage/'freeze.json').write_bytes(t.encode(freeze))
        before = {n:(stage/n).read_bytes() for n in t.NAMES}
        out = t.transform(stage)
        (scratch/f'result-{i}.json').write_bytes(t.encode(out))
        nf, nr, ni = [t.load(stage/n) for n in ['freeze.json','request.json','input-map.json']]
        assert nr['args']['target'] == req['args']['target'] == nf['requested_route']
        assert {k:v for k,v in nr['args'].items() if k != 'task'} == {k:v for k,v in req['args'].items() if k != 'task'}
        assert freeze['native_goal_objective'] in nr['args']['task']
        assert nr['args']['task'].startswith(req['args']['task'])
        assert (stage/'assignment.md').read_bytes().startswith(before['assignment.md'])
        assert nf['request_sha256'] == t.sha((stage/'request.json').read_bytes()) != freeze['request_sha256']
        assert nf['frozen_inputs'][0]['sha256'] != freeze['frozen_inputs'][0]['sha256']
        assert ni['frozen_inputs'][0]['sha256'] == t.sha((stage/'assignment.md').read_bytes())
        t.verify_records(nf)
        t.verify_records(ni)
        for k,v in freeze.items():
            if k not in {'frozen_inputs','request_sha256'}:
                assert nf[k] == v, k
        for n in t.NAMES:
            assert (Path(out['backupDir'])/n).read_bytes() == before[n]
        unchanged = snapshot(stage)
        assert t.transform(stage)['idempotent'] is True
        assert snapshot(stage) == unchanged
        actions = [c['action'] for c in out['commands']]
        expected = {('A2','investigator'):['freeze-investigator','confirm-frozen-active','author-intake','seal-final'], ('A2','critic'):['check-input'], ('A7','investigator'):['freeze-investigator','confirm-frozen-active'], ('A7','critic-finalizer'):['check-input','freeze-review','seal-final']}.get((top,name), [])
        assert actions == expected
        for c in out['commands']:
            assert str(BASE/'helpers/topology-v1/prepare.py') in c['argv_template']
            assert '--config' in c['argv_template'] and '--stage' in c['argv_template']
            assert '...' not in c['shell_template']
        (stage/'dispatch.json').write_text('{}\n')
        reason = reject(stage)
        (stage/'dispatch.json').unlink()
        # Historical reject tested on a separate unused copy, without marker.
        hist = scratch / f'expired-{i}' / name
        hist.mkdir(parents=True)
        for n in t.NAMES:
            (hist/n).write_bytes(before[n])
        hf = t.load(hist/'freeze.json')
        # Rebind only fixture-local paths so expiry is the actual rejection.
        for objname in ['input-map.json', 'freeze.json']:
            obj = t.load(hist/objname)
            def rebind(x):
                if isinstance(x, dict):
                    for k,v in list(x.items()):
                        if isinstance(v,str):
                            x[k] = v.replace(str(stage), str(hist))
                        else:
                            rebind(v)
                elif isinstance(x,list):
                    for v in x:
                        rebind(v)
            rebind(obj)
            (hist/objname).write_bytes(t.encode(obj))
        hf = t.load(hist/'freeze.json')
        for rec in hf['frozen_inputs']:
            rec['sha256'] = t.sha(Path(rec['path']).read_bytes())
            rec['bytes'] = Path(rec['path']).stat().st_size
        hf['deadline_utc'] = '2000-01-01T00:00:00+00:00'
        (hist/'freeze.json').write_bytes(t.encode(hf))
        expired = reject(hist)
        assert 'expired/historical' in expired, expired
        (stage/'goal-active.json').write_text('{}\n')
        used = reject(stage)
        (stage/'goal-active.json').unlink()
        results.append({'case': f'{top}/{name}/{arm}', 'passed': True, 'dispatch_rejection': reason, 'historical_rejection': expired, 'used_stage_rejection': used, 'checks': ['updated request/assignment/map carried hashes', 'service Tier and all non-task args unchanged', 'all non-hash freeze fields/deadlines/Goal unchanged', 'old bytes preserved', 'idempotence byte-stable', 'applicable exact commands', 'rejections do not mutate']})
    for stage, hashes in live_before.items():
        assert {n:t.sha((Path(stage)/n).read_bytes()) for n in t.NAMES} == hashes
    for path, pin in t.load(HERE/'helper-pins.json').items():
        assert t.sha(Path(path).read_bytes()) == pin
    report = {'synthetic_only': True, 'live_templates_unchanged': True, 'helpers_unchanged': True, 'cases': results}
    (HERE/'checks-result.json').write_bytes(t.encode(report))
    print(json.dumps(report))

if __name__ == '__main__':
    main()
