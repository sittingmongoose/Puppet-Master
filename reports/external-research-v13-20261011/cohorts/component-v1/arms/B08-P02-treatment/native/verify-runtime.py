#!/usr/bin/env python3
"""Offline immutable COMPONENT admission preparation. Root alone dispatches."""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import sys

HERE = Path(__file__).absolute().parent
UTC = dt.timezone.utc
CASES = tuple(f'{b}-P0{p}' for b in ('B01', 'B04', 'B05', 'B08') for p in (1, 2))
BASE = ('brief.md', 'plan.md', 'draft.md', 'source-index.json')
TIME = ('Complete all substantive research and planning obligations within a maximum of 25 elapsed minutes. '
        'Finish earlier when the complete output is ready. There is no minimum research duration, no requirement '
        'to consume the allowance, and no credit for waiting. The deadline includes arm-specific setup, provider '
        'queueing after admission, tools, native retries, handoffs, revision and delivery. Output quality is '
        'assessed independently of elapsed time.')
DELTAS = {
    'B01': {
        'control': 'After the shared source-backed critique, author a complete fresh final rewrite.',
        'treatment': 'After the identical shared source-backed critique, author targeted evidence-backed amendments and use deterministic assembly of unchanged supported draft prose plus those amendments into a COMPLETE self-contained final.md. Save amendments and actual assembly code/results. Deterministic retention does not establish truth; verify governing context and new errors.'},
    'B04': {
        'control': 'Read the conventional full critique and its primary evidence; resolve it into the complete final.',
        'treatment': 'Read the compact actionable critique and its primary evidence; resolve it into the complete final. It represents the SAME full immutable criticism findings, counterevidence, keep/uncertain dispositions and coverage as the conventional critique. There is no word cap or reduced obligation.'},
    'B05': {
        'control': 'In this one fresh critic+finalizer role, independently look up and inspect primary sources using public URLs/locators. Do not read any treatment cache, preparer source pool, navigation, findings or another arm. Both arms may independently expand lookup; no inherited semantic conclusions.',
        'treatment': 'In this one fresh critic+finalizer role, inspect exact cached primary-source neighborhoods using the navigable index and expand on demand to adjacent governing definitions, versions and exceptions or full bodies. Both arms may independently look up further primary evidence. Group compatible source questions without collapsing conditions. Reuse source bytes only; no inherited semantic conclusions.'},
    'B08': {
        'control': 'Independently critique and finalize with ordinary candidate verification using the permitted tools.',
        'treatment': 'Independently critique and finalize. For consequential derivations or universal limits, bind domain, subject, units and version, then use an independently derived result, governing implementation/oracle or discriminating counterexample. Repeating the draft formula is not an independent oracle. Keep supported claims and conditional derivations; excessive rejection is detectable. Use existing bounded execution capabilities.'}}


def sha(b):
    return hashlib.sha256(b).hexdigest()


def encode(obj):
    return (json.dumps(obj, indent=2, ensure_ascii=False, allow_nan=False) + '\n').encode()


def read(path):
    return json.loads(path.read_bytes())


def no_links(path):
    if not path.is_absolute() or any(x.is_symlink() for x in (path, *path.parents)):
        raise ValueError('absolute non-symlink path required: ' + str(path))


def instant(text):
    value = dt.datetime.fromisoformat(text.replace('Z', '+00:00'))
    if value.tzinfo is None:
        raise ValueError('timezone required')
    return value.astimezone(UTC)


def iso(value):
    return value.astimezone(UTC).isoformat().replace('+00:00', 'Z')


def put(path, body):
    no_links(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    data = body if isinstance(body, bytes) else body.encode() if isinstance(body, str) else encode(body)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    with os.fdopen(fd, 'wb') as stream:
        stream.write(data)


def fixture(root, case):
    directory = root / 'inputs' / case
    no_links(directory)
    ready = read(directory / 'READY.json')
    manifest = read(directory / 'MANIFEST.json')
    metadata = read(directory / 'metadata.json')
    support = root / 'helpers/component-fixtures-v1'
    support_manifest = read(support / 'MANIFEST.json')
    row = next((r for r in support_manifest['input_packages'] if r['case'] == case), None)
    if not row or row['manifest_sha256'] != sha((directory / 'MANIFEST.json').read_bytes()):
        raise ValueError('fixture helper readiness pin mismatch')
    verification = read(support / 'VERIFICATION.json')
    if verification['status'] != 'PASS' or not any(r['case'] == case for r in verification['cases']):
        raise ValueError('fixture helper has no passing readiness for case')
    if ready['case'] != case or ready['max_minutes'] != 25 or ready['min_minutes'] != 0 or not ready['component_not_full_discovery']:
        raise ValueError('invalid component readiness/time contract')
    if ready['manifest_sha256'] != sha((directory / 'MANIFEST.json').read_bytes()):
        raise ValueError('fixture manifest changed')
    if metadata['scope'] != 'COMPONENT' or metadata['component_max_minutes'] != 25 or metadata['component_min_minutes'] != 0:
        raise ValueError('component metadata contract mismatch')
    for rel, digest in manifest['files'].items():
        path = directory / rel
        if Path(rel).is_absolute() or '..' in Path(rel).parts:
            raise ValueError('unsafe fixture member')
        no_links(path)
        if not path.is_file() or sha(path.read_bytes()) != digest:
            raise ValueError('frozen input changed: ' + rel)
    raw = {rel: manifest['files'][rel] for rel in BASE}
    if metadata['matched_raw_base'] != raw or row['raw_pair_sha256'] != ready['pair_raw_base_sha256']:
        raise ValueError('matched common input pin mismatch')
    # The fixture's raw-pair digest is SHA-256 of the sorted JSON hash dictionary.
    if sha(json.dumps(raw, sort_keys=True).encode()) != ready['pair_raw_base_sha256']:
        raise ValueError('matched raw digest mismatch')
    return directory, manifest, ready, support_manifest


def verify(runtime, now=None, allow_terminal=False):
    no_links(runtime)
    freeze = read(runtime / 'freeze.json')
    seal = read(runtime / 'IMMUTABLE.json')
    if any(p.is_symlink() for p in runtime.rglob('*')):
        raise ValueError('symlink runtime member rejected')
    for rel, digest in seal['files'].items():
        if sha((runtime / rel).read_bytes()) != digest:
            raise ValueError('immutable request/input changed: ' + rel)
    t0, deadline = instant(freeze['t0_utc']), instant(freeze['whole_deadline_utc'])
    if (deadline - t0).total_seconds() != 1500:
        raise ValueError('maximum clock changed')
    now = now or dt.datetime.now(UTC)
    if now < t0 or (now >= deadline and not allow_terminal):
        raise ValueError('future T0 or expired arm; never reset clock')
    request = read(runtime / 'request.json')
    if sha((runtime / 'request.json').read_bytes()) != freeze['request_sha256'] or request['args']['target'] != freeze['requested_route']:
        raise ValueError('request/route changed')
    return request


def prepare(root, runtime, case, arm, run_id, t0_text, provider, selection_path=None, now=None):
    no_links(root)
    no_links(runtime)
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]{0,100}', run_id):
        raise ValueError('invalid run id')
    if case not in CASES or arm not in ('control', 'treatment') or not provider.strip():
        raise ValueError('invalid case/arm/provider')
    now = now or dt.datetime.now(UTC)
    t0 = instant(t0_text)
    deadline = t0 + dt.timedelta(seconds=1500)
    if now < t0 or now >= deadline:
        raise ValueError('future T0 or expired arm; root must supply original honest T0')
    if runtime.exists():
        raise ValueError('runtime already exists; no overwrite, clock reset, retry or replacement')
    directory, manifest, ready, support_manifest = fixture(root, case)
    if instant(ready['ready_utc']) > t0:
        raise ValueError('fixture was not frozen before admission T0')
    reference = root / 'reference/recipes/materialize-v3'
    pins = {r['relative_path']: r['sha256'] for r in read(reference / 'bundle-manifest.json')['files']}
    native_refs = {'assert-active-goal.py': 'sources/mechanics/exact-goal-binding-guard-v1/assert-active-goal.py',
                   'activation-snippet-template.js': 'sources/mechanics/exact-activation-capture-v2-1/activation-snippet-template.js'}
    native = {}
    for name, rel in native_refs.items():
        data = (HERE / 'native' / name).read_bytes()
        if sha(data) != pins[rel] or data != (reference / rel).read_bytes():
            raise ValueError('pinned native guard/template changed')
        native[name] = data
    target = {'providerInstanceId': provider, 'model': 'gpt-6-luna', 'options': {'reasoningEffort': 'max', 'serviceTier': 'default'}}
    selection = {'target': target, 'route_resolution_owner': 'root', 'requested_label': 'Luna Max Standard', 'observed_route': 'UNKNOWN until candidate returned identity', 'case': case, 'arm': arm}
    if selection_path:
        no_links(selection_path)
        selection['root_selection_evidence'] = read(selection_path)
        selection['root_selection_sha256'] = sha(selection_path.read_bytes())
    method = case.split('-')[0]
    permitted = list(BASE)
    if method == 'B01':
        permitted.append('critique.md')
    if method == 'B04':
        permitted.append('critique.md' if arm == 'control' else 'critique-compact.md')
    cache_prefix = 'treatment-cache/' if method == 'B05' and arm == 'treatment' else 'source-cache/' if method != 'B05' else None
    if cache_prefix:
        permitted.extend(rel for rel in manifest['files'] if rel.startswith(cache_prefix))
    reader = (root / 'helpers/component-fixtures-v1/source_reader.py').read_bytes()
    if sha(reader) != support_manifest['helper_files']['source_reader.py']:
        raise ValueError('source reader pin changed')
    runtime.mkdir(parents=True, exist_ok=False)
    for rel in permitted:
        put(runtime / 'inputs' / case / rel, (directory / rel).read_bytes())
    if cache_prefix:
        # Preserve original reader verbatim; its parents[2]/inputs path resolves here.
        put(runtime / 'helpers/component-fixtures-v1/source_reader.py', reader)
    for name, body in native.items():
        put(runtime / 'native' / name, body)
    put(runtime / 'selection.json', selection)
    tools = ['functions.exec', 'tools.exec_command', 'tools.create_goal', 'tools.update_goal', 'tools.get_goal', 'existing primary-source web/search tools when available']
    delta = DELTAS[method][arm]
    objective = f'ER13 COMPONENT {run_id}: complete only {case} {arm} under {runtime}/assignment.md and the original T0+25-minute deadline; save COMPLETE final.md, criticism dispositions, source-map.json and actual witness code/results when used before completing this same native Goal.'
    activation = native['activation-snippet-template.js'].decode().replace('__STAGE_DIR_JSON__', json.dumps(str(runtime)))
    activation = activation.replace('"ER12_RUNTIME/mechanics/exact-goal-binding-guard-v1/assert-active-goal.py"', json.dumps(str(runtime / 'native/assert-active-goal.py')))
    # Capture template is unchanged except its two documented runtime path parameters.
    put(runtime / 'native/verify-runtime.py', Path(__file__).read_bytes())
    checker = 'python3 -B ' + shlex.quote(str(runtime / 'native/verify-runtime.py')) + ' verify --runtime-dir ' + shlex.quote(str(runtime))
    preflight = 'const clockCheck = await tools.exec_command({cmd: ' + json.dumps(checker) + ', max_output_tokens: 1000});\nif (clockCheck.exit_code !== 0 || clockCheck.session_id) throw Error("STOP: frozen clock/input verification failed: " + clockCheck.output);\n'
    activation = preflight + activation
    put(runtime / 'activation.js', activation)
    completion = '''const q = s => "'" + s.replaceAll("'", "'\\\\''") + "'";
const response = await tools.update_goal({status: "complete"});
const raw = JSON.stringify(response);
const save = "import os,sys; p=sys.argv[1]; fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444); f=os.fdopen(fd,'w',encoding='utf-8'); f.write(sys.argv[2]); f.close()";
const saved = await tools.exec_command({cmd: "python3 -B -c " + q(save) + " " + q(__TERMINAL__) + " " + q(raw), max_output_tokens: 1000});
if (saved.exit_code !== 0 || saved.session_id) throw Error("STOP: terminal raw receipt save failed: " + saved.output);
text({terminal_receipt_path: __TERMINAL__});
'''.replace('__TERMINAL__', json.dumps(str(runtime / 'native-goal-terminal.json')))
    put(runtime / 'completion.js', completion)
    outputs = ['final.md', 'criticism-dispositions.md', 'source-map.json', 'witnesses/ actual code/results when used', 'native-goal-create.json', 'native-goal-terminal.json']
    if method in ('B05', 'B08'):
        outputs.append('critique.md')
    if method == 'B01' and arm == 'treatment':
        outputs.extend(['amendments.json', 'assemble.py', 'assembly-results.json'])
    assignment = f'''ER13 COMPONENT {case} {arm}; run {run_id}\n\n{TIME}\nT0: {iso(t0)}\nAbsolute deadline: {iso(deadline)}. Preparation/queueing already consumes this clock; no reset. This is a component review/finalization test; no discovery-effectiveness claim follows.\n\nBefore reading scientific inputs, verify immutable files and remaining clock by executing: {checker}\nThen execute the exact activation.js body below ONCE in functions.exec using supported native Codex tools. It reads the frozen objective, invokes tools.create_goal once, saves the unmodified full response JSON and executes the byte-identical pinned native assertion. No manual transcription, extracted receipt, fallback, replacement or second Goal. Stop on unsupported tools or failed binding and preserve diagnostics.\n```javascript\n{activation}\n```\n\nAfter successful activation, read input-map.json and only its permitted copied inputs. Work as one fresh {'critic+finalizer' if method in ('B05', 'B08') else 'finalizer resolving common source-backed criticism'}. {delta}\n\nBoth arms preserve all brief/plan obligations, supported capabilities, governing conditions and versions, negative constraints, useful alternatives, legitimate rejections, original history, uncertainty and future validation. Check the entire draft and corrections; deliver COMPLETE self-contained final.md, never just patches, excerpts or a criticism list. Full criticism dispositions must give accept/amend/reject/keep/uncertain decisions with primary evidence and reasons for every material criticism; B05/B08 generate their own critique.md as well. source-map.json maps final claims/sections to public primary URL, exact locator, version/hash where known, governing scope and unresolved uncertainty. When using any executable witness, save actual code, command/runtime/version, stdout/stderr/results and interpretation/limits; no invented execution. B01 treatment also saves amendments.json, assemble.py and actual assembly-results.json; record retained text intervals and replacements so assembly is reproducible. There is no scope truncation or word cap.\n\nTools frozen: {json.dumps(tools)}. Both arms may independently expand source inspection and primary lookup. All execution is charged to this arm. No nested delegates, launches, reserve use, scheduler, provider/account/tier changes, parent history, evaluators, preparer scripts/findings/rubrics, sibling files or other arms. B05 control has no cache access. Filesystem access boundaries are an instruction contract, not proven sandbox isolation. Only the root dispatches and accounts for jobs. Requested route: Luna Max Standard; do not substitute another provider/model/tier. Record actual returned identity/observed options when available; unknown stays unknown.\n\nSave outputs in {runtime}; required selection: {json.dumps(outputs)}. Before the absolute deadline, after saving the complete result, complete the SAME native Goal once through tools.update_goal and save its full raw response by executing completion.js below in functions.exec. If incomplete, preserve partial artifacts with honest status and report failure; do not claim completion or reset/relaunch.\n```javascript\n{completion}\n```\n'''
    put(runtime / 'assignment.md', assignment)
    input_map = {'case': case, 'arm': arm, 'inputs': [{'path': str(runtime / 'inputs' / case / rel), 'sha256': manifest['files'][rel]} for rel in permitted], 'independent_lookup_allowed': True, 'cache_access': bool(cache_prefix), 'semantic_conclusions_shared': method in ('B01', 'B04'), 'excluded': ['rubric.json', 'findings.json', 'metadata.json', 'preparer scripts/source pool', 'other arms/evaluators']}
    if cache_prefix:
        input_map['reader'] = {'path': str(runtime / 'helpers/component-fixtures-v1/source_reader.py'), 'sha256': sha(reader), 'usage': f'python3 -B <reader> --case {case} --arm {arm} --source S1 --start 1 --end N; arbitrary adjacent/full-body expansion permitted'}
    put(runtime / 'input-map.json', input_map)
    args = {'clientRequestId': 'er13-component-' + run_id + '-v1', 'mode': 'async', 'role': 'general', 'title': f'ER13 COMPONENT {case} {arm}', 'target': target, 'runtimeMode': 'full-access', 'interactionMode': 'default', 'task': assignment}
    request = {'tool': 'delegate_task', 'dispatch_owner': 'root', 'dispatch_performed': False, 'args': args}
    # Everything substantive is now frozen, before the request is emitted or saved.
    freeze = {'version': 'component-admit-v1', 'scope': 'COMPONENT', 'case': case, 'arm': arm, 'run_id': run_id, 'prepared_at_utc': iso(now), 't0_utc': iso(t0), 'whole_deadline_utc': iso(deadline), 'stage_deadline_utc': iso(deadline), 'whole_budget_s': 1500, 'minimum_seconds': 0, 'available_seconds_at_prepare': (deadline-now).total_seconds(), 'native_goal_objective': objective, 'requested_route': target, 'observed_route': 'UNKNOWN', 'selection_sha256': sha((runtime / 'selection.json').read_bytes()), 'fixture_ready': ready, 'fixture_manifest_sha256': sha((directory / 'MANIFEST.json').read_bytes()), 'common_raw_sha256': {r: manifest['files'][r] for r in BASE}, 'frozen_inputs': input_map, 'method_delta': delta, 'tools': tools, 'output_selection': outputs, 'request_sha256': sha(encode(request)), 'assignment_sha256': sha(assignment.encode()), 'native_pins': {n: sha(b) for n,b in native.items()}, 'discovery_effectiveness_claim': False, 'native_provenance_freshness': 'UNKNOWN beyond exact binding checker', 'preparation_accounting': 'arm-specific preparation/queue charged from root T0; common fixture cold acquisition/preparation separately charged by root, warm reuse disclosed'}
    put(runtime / 'freeze.json', freeze)
    put(runtime / 'request.json', request)
    files = {str(p.relative_to(runtime)): sha(p.read_bytes()) for p in sorted(runtime.rglob('*')) if p.is_file()}
    put(runtime / 'IMMUTABLE.json', {'version': 'component-admit-v1', 'files': files, 'dispatch_performed': False})
    verify(runtime)  # Real final wall clock: never emit a request after preparation expires.
    return {'stageDir': str(runtime), 'request_path': str(runtime / 'request.json'), 'request_sha256': freeze['request_sha256'], 'freeze_sha256': sha((runtime/'freeze.json').read_bytes()), 'args': args, 'dispatch_performed': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('prepare')
    p.add_argument('--campaign-root', type=Path, default=HERE.parents[1])
    p.add_argument('--runtime-dir', type=Path, required=True)
    p.add_argument('--case', choices=CASES, required=True)
    p.add_argument('--arm', choices=('control', 'treatment'), required=True)
    p.add_argument('--run-id', required=True)
    p.add_argument('--t0', required=True)
    p.add_argument('--provider-instance', required=True)
    p.add_argument('--selection-json', type=Path)
    p = sub.add_parser('verify')
    p.add_argument('--runtime-dir', type=Path, required=True)
    p.add_argument('--allow-terminal', action='store_true', help='Read-only artifact verification after deadline; does not admit or emit a request')
    a = parser.parse_args()
    try:
        if a.command == 'prepare':
            result = prepare(a.campaign_root, a.runtime_dir, a.case, a.arm, a.run_id, a.t0, a.provider_instance, a.selection_json)
        else:
            verify(a.runtime_dir, allow_terminal=a.allow_terminal)
            result = {'ok': True, 'dispatch_performed': False}
        print(json.dumps(result, ensure_ascii=False))
    except (ValueError, OSError, KeyError, TypeError, StopIteration) as exc:
        parser.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    main()
