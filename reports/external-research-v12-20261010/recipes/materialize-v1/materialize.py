#!/usr/bin/env python3
"""Offline R0/A1 caller-owned fresh materialization; never dispatches a task."""
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, os, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
UTC = dt.timezone.utc
BUDGETS = {'investigator': 1800, 'critic': 720, 'reviser': 1080}
SAFE = re.compile(r'/[A-Za-z0-9_./-]+')
IDENT = re.compile(r'[A-Za-z0-9][A-Za-z0-9._-]{0,63}')

def sha(data):
    return hashlib.sha256(data).hexdigest()

def encode(obj):
    return (json.dumps(obj, ensure_ascii=False, indent=2) + '\n').encode()

def put(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(encode(obj))

def regular(path):
    if any(p.is_symlink() for p in (path, *path.parents)):
        raise ValueError('symlink path or ancestry rejected')
    if not path.is_file():
        raise ValueError('regular file required')
    return path

def safe_destination(value):
    p = Path(value).expanduser().absolute()
    if not SAFE.fullmatch(str(p)) or '..' in p.parts:
        raise ValueError('destination requires a simple absolute ASCII path without traversal/quotes/spaces')
    if any(x.lower() in {'.git', 'plans', 'concepts', 'reports', 'cases', 'runs', 'helpers'} for x in p.parts):
        raise ValueError('destination must be dedicated, outside canon and campaign inputs/runs/helpers')
    if p == Path('/') or len(p.parts) < 4:
        raise ValueError('unsafe destination')
    if any(x.is_symlink() for x in (p, *p.parents)):
        raise ValueError('symlink destination rejected')
    if p.exists():
        raise ValueError('destination already exists; refuse duplicate materialization/config')
    if p == HERE or p in HERE.parents or (HERE in p.parents and not p.relative_to(HERE).parts[0].startswith(".offline-smoke-")):
        raise ValueError('destination overlaps recipe')
    return p

def verify(dest):
    dest = Path(dest).absolute()
    manifest = json.loads(regular(dest / 'materialized-manifest.json').read_bytes())
    for row in manifest['files']:
        p = regular(dest / row['relative_path'])
        if sha(p.read_bytes()) != row['sha256'] or p.stat().st_size != row['bytes']:
            raise ValueError('materialized file hash/size mismatch: ' + row['relative_path'])
    print(json.dumps({'verified': True, 'files': len(manifest['files']), 'scope': ['R0', 'A1']}))

def materialize(a):
    if not IDENT.fullmatch(a.run_id) or not IDENT.fullmatch(a.authorized_provider_instance):
        raise ValueError('run ID and authorized route ID require simple 1-64 character identifiers')
    if a.authorized_provider_instance == 'AUTHORIZED_PROVIDER_INSTANCE':
        raise ValueError('supply actual authorized route ID; no placeholder launch')
    dest = safe_destination(a.destination)
    brief = regular(Path(a.brief).expanduser().absolute())
    plan = regular(Path(a.plan).expanduser().absolute())
    if brief.resolve() == plan.resolve() or os.path.samefile(brief, plan):
        raise ValueError('NEW brief and plan must be distinct caller-owned files')
    source_manifest = json.loads(regular(HERE / 'public-input-dependency-manifest.json').read_bytes())
    for row in source_manifest['files']:
        raw = regular(HERE / row['relative_path']).read_bytes()
        if sha(raw) != row['sha256']:
            raise ValueError('public input pin mismatch: ' + row['relative_path'])
    dest.mkdir(parents=True, exist_ok=False)
    mapping = []
    for p in sorted((HERE / 'sources').rglob('*')):
        if not p.is_file():
            continue
        regular(p)
        rel = p.relative_to(HERE / 'sources')
        raw = p.read_bytes()
        text = raw.decode().replace('ER12_RUNTIME', str(dest)).replace('AUTHORIZED_PROVIDER_INSTANCE', a.authorized_provider_instance)
        if p.suffix == '.json':
            json.loads(text)
        out = dest / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text)
        mapping.append({'public_relative_path': str(p.relative_to(HERE)), 'public_sha256': sha(raw),
                        'relocated_relative_path': str(rel), 'relocated_sha256': sha(out.read_bytes()),
                        'public_bytes_unchanged_by_substitution': raw == out.read_bytes()})
    clarification = dest / 'mechanics/invocation-clarification-v1/transform.py'
    clarification.write_text(clarification.read_text().replace('No case input is needed for activation.',
        'No case input is needed for activation. Save the exact unmodified native activation response as native-goal-active.json and the exact completion response as native-goal-terminal.json in this assigned stage directory.'))
    helper = dest / 'helpers/er12-screen-v1'
    # Only the supported fresh-reference methods. The original priority guard stays intact.
    prepare = (helper / 'prepare.py').read_text()
    prepare = prepare.replace('if method not in {"R0", "A1", *METHOD_DELTAS}:', 'if method not in {"R0", "A1"}:')
    prepare = prepare.replace('supported method_id: R0, A1, A3, A4, A5, A6 (optional -v1 suffix)', 'this materialization supports only R0 and A1')
    # Bind every carried source byte, including indexes, rather than only the prose/map.
    needle = '    return files\n\n\ndef make_prompt'
    replacement = '''    for name in (["investigator", "critic"] if stage == "reviser" else ["investigator"]):
        source_root = root / "stages" / name / "sources"
        if source_root.is_symlink() or not source_root.is_dir():
            fail("missing/nonregular carried source root")
        for p in sorted(source_root.rglob("*")):
            if p.is_symlink():
                fail("symlink carried source rejected")
            if p.is_file():
                files.append(p)
    return files


def make_prompt'''
    if needle not in prepare:
        raise ValueError('preparer source binding anchor changed')
    prepare = prepare.replace(needle, replacement)
    prepare = prepare.replace('s.get("hasPendingChildRuns") is True', 's.get("hasPendingChildRuns") is not False')
    prepare = prepare.replace('    if req["args"].get("clientRequestId") != req.get("clientRequestId"):',
        '    for entry in freeze.get("carried_source_inventory", []):\n'
        '        source_root = Path(entry["root"])\n'
        '        if source_root.is_symlink() or not source_root.is_dir():\n'
        '            fail("carried source root changed")\n'
        '        members = sorted(source_root.rglob("*"))\n'
        '        if any(p.is_symlink() for p in members):\n'
        '            fail("symlink carried source rejected")\n'
        '        actual = [str(p) for p in members if p.is_file()]\n'
        '        if actual != entry["paths"]:\n'
        '            fail("carried source inventory changed; stop redispatch")\n'
        '    if req["args"].get("clientRequestId") != req.get("clientRequestId"):')
    prepare = prepare.replace('    put_json(stage_dir / "freeze.json", freeze)',
        '    if stage != "investigator":\n'
        '        freeze["carried_source_inventory"] = [{"root": str(p), "paths": [str(f) for f in sorted(p.rglob("*")) if f.is_file()]} for p in map(Path, input_map["source_roots"])]\n'
        '    put_json(stage_dir / "freeze.json", freeze)')
    (helper / 'prepare.py').write_text(prepare)
    put(dest / 'mechanics/invocation-clarification-v1/helper-pins.json',
        {str(helper / n): sha((helper / n).read_bytes()) for n in ('prepare.py', 'reveal.py')})
    # Freeze caller-owned NEW inputs; never import report/campaign semantic case bytes.
    control_inputs = dest / 'control-inputs'
    control_inputs.mkdir()
    (control_inputs / 'brief.md').write_bytes(brief.read_bytes())
    (control_inputs / 'plan.md').write_bytes(plan.read_bytes())
    started = dt.datetime.now(UTC)
    config = dest / 'configs' / (a.run_id + '.json')
    run = dest / 'run' / a.run_id
    put(config, {'run_id': a.run_id, 'runtime_root': str(run),
        'brief_path': str(control_inputs / 'brief.md'), 'plan_path': str(control_inputs / 'plan.md'),
        'whole_deadline_utc': (started + dt.timedelta(minutes=60)).isoformat(timespec='milliseconds').replace('+00:00', 'Z'),
        'stage_budgets_s': BUDGETS, 'provider': {'providerInstanceId': a.authorized_provider_instance,
        'model': 'gpt-6-luna', 'options': {'reasoningEffort': 'max', 'serviceTier': 'priority'}},
        'runtime_mode': 'full-access', 'method_id': a.method, 'stage_prompt_deltas': {}})
    # Reuse the existing bootstrap, with inline existing root functions, no functions store.
    bootstrap = (helper / 'bootstrap.js').read_text()
    bootstrap = re.sub(r'const RECIPE_DIR = .*?;', 'const RECIPE_DIR = ' + json.dumps(str(helper)) + ';', bootstrap, count=1)
    bootstrap = re.sub(r'const CONFIG = .*?;', 'const CONFIG = ' + json.dumps(str(config)) + ';', bootstrap, count=1)
    standard = (dest / 'mechanics/native-root-code-mode/standardSpecJS.js').read_text()
    clarify = (dest / 'mechanics/native-root-code-mode/clarifySpecJS.js').read_text()
    bootstrap = standard + '\n' + clarify + '\n' + bootstrap
    bootstrap = bootstrap.replace('const spec = await py(["prepare", "--config", CONFIG, "--stage", STAGE]);',
        'const spec = await clarifySpec(await standardSpec(await py(["prepare", "--config", CONFIG, "--stage", STAGE])));')
    bootstrap = bootstrap.replace('!supported("serviceTier", "priority")', '!supported("serviceTier", "priority") || !supported("serviceTier", "default") || provider.canRunChildTask !== true')
    bootstrap = bootstrap.replace('status.hasPendingChildRuns)', 'status.hasPendingChildRuns !== false)')
    bootstrap = bootstrap.replace('supported: { reasoningEffort: ["max"], serviceTier: ["priority"] }',
        'supported: { reasoningEffort: ["max"], serviceTier: ["priority", "default"] }, requested_stage_serviceTier: "default"')
    bootstrap = bootstrap.replace('const capRaw =', '''const integrity = await tools.exec_command({cmd: "python3 -B " + shq(RECIPE_DIR + "/materialize.py") + " --verify " + shq("''' + str(dest) + '''"), max_output_tokens: 400});
if (integrity.exit_code !== 0) throw new Error("Materialization integrity failed; stop");
const capRaw =''')
    bootstrap = bootstrap.replace('/ max / priority route is unavailable', '/ max / priority guard / Standard route is unavailable')
    bootstrap = bootstrap.replace('  childRunId: returned?.childRunId || null, providerInstanceId: returned?.providerInstanceId || null,', '  childRunId: returned?.childRunId || null,')
    (helper / 'bootstrap.js').write_text(bootstrap)
    (helper / 'materialize.py').write_bytes((HERE / 'materialize.py').read_bytes())
    # Never claim the first substitution hash is the final pin after explicit amendments.
    for row in mapping:
        p = dest / row['relocated_relative_path']
        row['final_materialized_sha256'] = sha(p.read_bytes())
    files = [{'relative_path': str(p.relative_to(dest)), 'sha256': sha(p.read_bytes()), 'bytes': p.stat().st_size}
             for p in sorted(dest.rglob('*')) if p.is_file()]
    put(dest / 'materialized-manifest.json', {'version': 'materialize-v1', 'scope': ['R0', 'A1'],
        'created_at_utc': started.isoformat(), 'new_materialization_provenance': True,
        'historical_replay': False, 'production_qualified': False,
        'changes': ['path/route substitution', 'fresh config/inputs/deadlines', 'R0/A1 scope guard',
                    'explicit quiet predecessor', 'full carried source pins', 'inline Standard then exact native objective transforms', 'explicit native receipt filenames'],
        'public_to_relocated_hash_mapping': mapping, 'files': files,
        'mutable_runtime_excluded': 'run/; original/updated stage hashes and native receipts are recorded there by helpers',
        'public_input_manifest_sha256': sha((HERE / 'public-input-dependency-manifest.json').read_bytes())})
    # Avoid route, prompt, plan or request contents in stdout/public logs.
    print(json.dumps({'materialized': True, 'method': a.method, 'stage_budgets_s': BUDGETS,
                      'deadline_minutes': 60, 'dispatch_performed': False}))

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--verify', metavar='DESTINATION')
    ap.add_argument('--destination')
    ap.add_argument('--authorized-provider-instance')
    ap.add_argument('--brief')
    ap.add_argument('--plan')
    ap.add_argument('--run-id')
    ap.add_argument('--method', choices=['R0', 'A1'], default='R0')
    a = ap.parse_args()
    try:
        if a.verify:
            verify(a.verify)
        else:
            if not all((a.destination, a.authorized_provider_instance, a.brief, a.plan, a.run_id)):
                ap.error('destination, authorized-provider-instance, NEW brief/plan and unique run-id are required')
            materialize(a)
    except (ValueError, OSError, KeyError) as exc:
        ap.exit(2, str(exc) + '\n')

if __name__ == '__main__':
    main()
