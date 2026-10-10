#!/usr/bin/env python3
"""Offline setup-only verification: fake clock and disposable copies; no arms/tools."""
import datetime as dt, importlib.util, json, tempfile, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
started = dt.datetime.now(dt.timezone.utc)
timer = time.monotonic()
spec = importlib.util.spec_from_file_location('role', HERE / 'prepare-role.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
checks = []
def check(name, fn):
    fn()
    checks.append(name)
def fails(fn):
    try:
        fn()
    except SystemExit:
        return
    raise AssertionError('expected refusal')

# Syntax compile avoids leaving cache artifacts.
compile((HERE / 'prepare-role.py').read_text(), 'prepare-role.py', 'exec')
checks.append('syntax')
originals = []
for slot in ['B-DISC-M-01', 'B-APPL-G-01']:
    for arm in ['control', 'treatment']:
        d = m.BASE / 'runs' / slot / arm / 'stages' / 'role'
        originals.extend((p, m.digest(p)) for p in [d / n for n in ['assignment.md', 'input-map.json', 'freeze.json', 'request.json', 'dispatch.json']])
        out = m.prepare(slot, arm, m.BASE / 'frozen-inputs' / slot / 'fixture.json')
        assert out['alreadyDispatched'] and out['args'] == m.read_json(d / 'request.json')['args']
checks.append('all four originals: readonly exact saved request and dispatched receipt')
fixed = m.parse_time('2030-01-01T00:00:00+00:00')
m.now = lambda: fixed
with tempfile.TemporaryDirectory(prefix='er12-role-check-') as scratch:
    scratch = Path(scratch)
    requests = m.read_json(m.BASE / 'mechanics' / 'B-FIRST-REQUESTS.json')
    for slot in ['B-DISC-M-01', 'B-APPL-G-01']:
        root = scratch / slot
        fixture = m.BASE / 'frozen-inputs' / slot / 'fixture.json'
        for arm in ['control', 'treatment']:
            out = m.prepare(slot, arm, fixture, root, m.iso(fixed))
            stage = Path(out['stageDir'])
            req_bytes = (stage / 'request.json').read_bytes()
            freeze_bytes = (stage / 'freeze.json').read_bytes()
            orig = next(r for r in requests if (r['slot'], r['arm']) == (slot, arm))
            assert out['args'] == json.loads(json.dumps(orig['args']).replace(orig['stage_dir'], str(stage)))
            freeze = m.read_json(stage / 'freeze.json')
            assert len(freeze['native_goal_objective']) < 4000
            assert (m.parse_time(freeze['deadline_utc']) - fixed).total_seconds() == 900
            assert (m.parse_time(freeze['writing_start_utc']) - fixed).total_seconds() == 600
            original_wrapper = Path(orig['stage_dir']) / 'assignment.md'
            original_freeze = m.read_json(Path(orig['stage_dir']) / 'freeze.json')
            expected = original_wrapper.read_text().replace(original_freeze['native_goal_objective'], freeze['native_goal_objective']).replace(orig['stage_dir'], str(stage)).replace(original_freeze['deadline_utc'], freeze['deadline_utc'])
            assert (stage / 'assignment.md').read_text() == expected
            m.record_response(stage, {'isError': True, 'content': [{'type': 'text', 'text': 'uncertain transport'}]})
            m.now = lambda: fixed + dt.timedelta(seconds=20)
            retry = m.prepare(slot, arm, fixture, root, m.iso(fixed + dt.timedelta(seconds=20)))
            assert retry['retry'] and retry['args'] == out['args']
            assert (stage / 'request.json').read_bytes() == req_bytes and (stage / 'freeze.json').read_bytes() == freeze_bytes
            m.now = lambda: fixed + dt.timedelta(seconds=900)
            fails(lambda: m.prepare(slot, arm, fixture, root, m.iso(fixed + dt.timedelta(seconds=900))))
            m.now = lambda: fixed
            raw = {'structuredContent': {'taskId': 'test-task', 'status': 'running'}}
            m.record_response(stage, raw)
            first = (stage / 'dispatch.json').read_bytes()
            m.now = lambda: fixed + dt.timedelta(microseconds=1)
            fails(lambda: m.record_response(stage, {'taskId': 'conflict'}))
            assert (stage / 'dispatch.json').read_bytes() == first
            m.now = lambda: fixed + dt.timedelta(microseconds=2)
            status = {'structuredContent': {'taskId': 'test-task', 'status': 'completed'}}
            m.record_response(stage, status, status=True)
            assert m.read_json(stage / 'status.json')['raw_response'] == status
            m.now = lambda: fixed + dt.timedelta(microseconds=3)
            fails(lambda: m.record_response(stage, {'taskId': 'other'}, status=True))
            assert len(list((stage / 'records').glob('*.json'))) == 5
            assignment = stage / 'assignment.md'
            saved = assignment.read_bytes()
            assignment.write_bytes(saved + b'changed')
            fails(lambda: m.prepare(slot, arm, fixture, root))
            assignment.write_bytes(saved)
            m.now = lambda: fixed
        assert m.read_json(root / 'control/stages/role/input-map.json')['common_assignment'] == m.read_json(root / 'treatment/stages/role/input-map.json')['common_assignment']
        common = root / 'inputs/assignment.md'
        saved = common.read_bytes()
        common.write_bytes(saved + b'tamper')
        fails(lambda: m.prepare(slot, 'control', fixture, root))
        common.write_bytes(saved)
        fails(lambda: m.prepare(slot, 'control', fixture, scratch / (slot + '-future'), m.iso(fixed + dt.timedelta(seconds=1))))
        fails(lambda: m.prepare(slot, 'control', fixture, scratch / (slot + '-reserve'), m.iso(fixed - dt.timedelta(seconds=600))))
        fails(lambda: m.prepare(slot, 'control', fixture, scratch / (slot + '-no-origin')))
    # Source fixture hash rejection in a disposable fixture copy.
    copyroot = scratch / 'bad-fixture'
    copyroot.mkdir()
    f = m.read_json(m.BASE / 'frozen-inputs/B-DISC-M-01/fixture.json')
    m.put_json(copyroot / 'fixture.json', f)
    (copyroot / 'assignment.md').write_text('tampered')
    fails(lambda: m.validate_fixture(copyroot / 'fixture.json', f['slot_id'], 'control'))
    # Partial preparation never acquires a fresh deadline.
    partial = scratch / 'partial/control/stages/role'
    partial.mkdir(parents=True)
    (partial / 'freeze.json').write_text('{}')
    fails(lambda: m.prepare('B-DISC-M-01', 'control', m.BASE / 'frozen-inputs/B-DISC-M-01/fixture.json', scratch / 'partial', m.iso(fixed)))
checks += ['all four routes and short task exactly equivalent', 'assignment wrappers exactly equivalent after allowed substitutions', 'shared exact fixture inputs and hash rejection', 'uncertain retry preserves request/deadline bytes', 'absolute 900 seconds and 300 second writing reserve including setup', 'expiry/future origin/missing origin/partial stage refuse reset', 'raw uncertain/dispatch/conflicting/status responses retained; exact taskId enforced']
assert all(m.digest(p) == sha for p, sha in originals)
checks.append('original requests/wrappers/maps/freezes/dispatches unchanged')
report = {'schema': 'er12-role-helper-checks-v1', 'started_at_utc': started.isoformat(), 'finished_at_utc': dt.datetime.now(dt.timezone.utc).isoformat(), 'setup_cost_seconds': time.monotonic() - timer, 'accounting': 'setup-only helper verification; excluded from role science; no live arm started or dispatched', 'passed': checks, 'original_science_outputs_read_or_modified': False}
m.put_json(HERE / 'CHECKS.json', report)
print(json.dumps(report, indent=2))
