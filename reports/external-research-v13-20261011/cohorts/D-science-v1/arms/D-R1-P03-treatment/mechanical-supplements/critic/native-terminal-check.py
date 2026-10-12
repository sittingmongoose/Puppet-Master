#!/usr/bin/env python3
"""Mechanical completion custody, not source quality or native provenance proof."""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path

GUARD_SHA = '4a61deec5eb0ca5eca149f0e1f30c55c3e90b5a6ad0557fc98946d340cae99ed'
MARKER = 'prospective-terminal-capture-v1.json'
ATTEMPT = 'native-completion-attempt.json'
SNAPSHOT = 'native-completion-output-snapshot.json'
FAILURE = 'native-terminal-capture-failed.json'


def sha(b):
    return hashlib.sha256(b).hexdigest()


def exclusive(path, data):
    fd = os.open(str(path), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    with os.fdopen(fd, 'wb') as f:
        f.write(data)


def guards(stage):
    p = stage.parents[3] / 'mechanics/exact-goal-binding-guard-v1/assert-active-goal.py'
    if any(x.is_symlink() for x in (p, *p.parents)) or sha(p.read_bytes()) != GUARD_SHA:
        raise ValueError('unchanged native guard pin mismatch')
    raw = p.read_text()
    active = {'__name__': 'guard_module'}
    exec(compile(raw, str(p), 'exec'), active)
    # The parent API is explicitly active-only. Adapt only its expected status
    # literal/message in memory; inspect the original terminal JSON unchanged.
    anchor = "if goal['status'] != 'active':"
    if raw.count(anchor) != 1:
        raise ValueError('pinned guard status anchor mismatch')
    terminal = {'__name__': 'guard_module'}
    exec(compile(raw.replace(anchor, "if goal['status'] != 'complete':").replace('native Goal is not active', 'native Goal is not complete'), str(p), 'exec'), terminal)
    return active, terminal


def goal(guard, raw):
    obj = guard['exact_json'](raw)
    return obj.get('goal', obj)


def birth_key(g):
    return {k: g[k] for k in ('threadId', 'createdAt', 'objective')}


def context(stage, active, binding_sha):
    active['no_links'](stage)
    marker = active['exact_json']((stage / MARKER).read_text())
    binding = marker['binding']
    if sha(json.dumps(binding, ensure_ascii=False, sort_keys=True).encode()) != binding_sha or binding['stageDir'] != str(stage):
        raise ValueError('frozen completion binding changed')
    config = Path(binding['config_path']); active['no_links'](config)
    if sha(config.read_bytes()) != binding['config_sha256']:
        raise ValueError('original config/cards/route/budgets changed')
    for name, digest in marker['runtime_pins'].items():
        p = stage / name
        active['no_links'](p)
        if sha(p.read_bytes()) != digest:
            raise ValueError('completion program/mechanical pin changed: ' + name)
    f = active['exact_json']((stage / 'freeze.json').read_text())
    if any(f[k] != v for k,v in binding['frozen_identity'].items()):
        raise ValueError('original native objective/deadline/cap changed')
    times = [f[k] for k in ('deadline_utc', 'stage_deadline_utc', 'whole_deadline_utc') if k in f]
    now = dt.datetime.now(dt.timezone.utc)
    if not times or any(dt.datetime.fromisoformat(x.replace('Z', '+00:00')) <= now for x in times):
        raise ValueError('original deadline expired; never reset clocks')
    # Reuse the existing source/predecessor/request identity checks exactly.
    prep = stage.parents[3] / 'helpers/er12-screen-v1/prepare.py'; active['no_links'](prep)
    if sha(prep.read_bytes()) != marker['preparer_sha256']:
        raise ValueError('existing stage preparer changed')
    module = {'__name__':'preparer_module','__file__':str(prep)}
    exec(compile(prep.read_bytes(),str(prep),'exec'),module)
    module['verify_saved_request'](stage, active['exact_json']((stage/'request.json').read_text()))
    create = stage / 'native-goal-create.json'; active['no_links'](create)
    raw = create.read_text()
    active['check'](stage, raw)
    alias = stage / 'native-goal-active.json'; active['no_links'](alias)
    if alias.read_bytes() != create.read_bytes():
        raise ValueError('activation aliases differ; no reconstructed birth')
    return marker, raw, birth_key(goal(active, raw))


def outputs(stage, marker, active):
    required = marker['binding']['required_outputs']
    paths = [stage / n for n in required]
    sources = stage / 'sources'; active['no_links'](sources)
    if not sources.is_dir():
        raise ValueError('source root missing')
    paths += [p for p in sorted(sources.rglob('*')) if p.is_file() or p.is_symlink()]
    rows = []
    for p in paths:
        active['no_links'](p)
        if not p.is_file() or (str(p.relative_to(stage)) in required and not p.stat().st_size):
            raise ValueError('required output/source missing or empty: ' + p.name)
        rows.append({'relative_path': str(p.relative_to(stage)), 'sha256': sha(p.read_bytes()), 'bytes': p.stat().st_size})
    if stage.name == 'investigator':
        reveal = active['exact_json']((stage / 'plan-reveal.json').read_text())
        discovery = (stage / 'discovery.md').read_bytes(); plan = (stage / 'revealed-plan.md').read_bytes()
        if len(discovery) < 500 or sha(discovery) != reveal.get('discovery_sha256') or sha(plan) != reveal.get('plan_sha256'):
            raise ValueError('existing discovery/one-shot released-plan hashes differ')
    return rows


def run(stage, action, raw, binding_sha):
    if not stage.is_absolute() or any(p.is_symlink() for p in (stage, *stage.parents)):
        raise ValueError('absolute non-symlink stage required')
    encode = lambda x: (json.dumps(x, ensure_ascii=False, indent=2) + '\n').encode()
    if action == 'failure':
        exclusive(stage / FAILURE, encode(json.loads(raw)))
        return {'failed_capture_recorded': True, 'retry_allowed': False}
    if action == 'save':
        # Persist the ACTUAL return even if post-update clocks/outputs/guard fail.
        # A failure remains explicit and cannot qualify this receipt silently.
        exclusive(stage / 'native-goal-terminal.json', raw.encode('utf-8'))
    active, terminal = guards(stage)
    active['no_links'](stage)
    marker, birth_raw, identity = context(stage, active, binding_sha)
    if action in ('preflight', 'claim'):
        if any((stage / n).exists() or (stage / n).is_symlink() for n in (ATTEMPT, SNAPSHOT, FAILURE, 'native-goal-terminal.json')):
            raise ValueError('completion already attempted/failed/recorded; never retry')
        rows = outputs(stage, marker, active)
        if action == 'claim':
            active['check'](stage, raw)
            if birth_key(goal(active, raw)) != identity:
                raise ValueError('preflight current Goal differs from original active birth')
            exclusive(stage / ATTEMPT, encode({'schema':'er13.native_completion_attempt.v1','same_birth':identity,'birth_sha256':sha(birth_raw.encode()),'update_goal_outcome':'UNKNOWN','not_a_terminal_receipt':True,'getter_is_preflight_only':True}))
            exclusive(stage / SNAPSHOT, encode({'schema':'er13.precompletion_output_snapshot.v1','files':rows,'not_a_terminal_task_handoff':True}))
        return {'precompletion_checked': True, 'attempt_claimed': action == 'claim'}
    if action != 'save':
        raise ValueError('unsupported action')
    attempt = active['exact_json']((stage / ATTEMPT).read_text())
    snapshot = active['exact_json']((stage / SNAPSHOT).read_text())
    if attempt['same_birth'] != identity or attempt['birth_sha256'] != sha(birth_raw.encode()):
        raise ValueError('original birth changed after completion claim')
    # Same O_EXCL binary UTF-8 save as the accepted activation helper. No encoder,
    # JSON rebuild, extraction, indentation or getter substituted for this raw.
    terminal['check'](stage, raw)
    if birth_key(goal(terminal, raw)) != identity:
        raise ValueError('actual completion response differs from original birth')
    if (stage / 'native-goal-terminal.json').read_bytes() != raw.encode('utf-8') or outputs(stage, marker, active) != snapshot['files']:
        raise ValueError('terminal bytes/output snapshot changed; capture failed')
    exclusive(stage / 'native-terminal-capture-checked.json', encode({'terminal_capture_checked':True,'response_source':'direct_update_goal_return','terminal_sha256':sha(raw.encode()),'same_birth':identity,'existing_guard_sha256':GUARD_SHA,'expected_status_adaptation':'complete; raw receipt unchanged','provenance_independently_proved':False}))
    return {'terminal_capture_checked': True, 'provenance_independently_proved': False}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--stage-dir', type=Path, required=True)
    ap.add_argument('--action', choices=('preflight','claim','save','failure'), required=True)
    ap.add_argument('--json')
    ap.add_argument('--binding-sha', required=True)
    a = ap.parse_args()
    try:
        print(json.dumps(run(a.stage_dir, a.action, a.json, a.binding_sha)))
    except (ValueError, OSError, KeyError, TypeError) as e:
        ap.exit(2, str(e) + '\n')


if __name__ == '__main__':
    main()
