"""V8 exact immutable launch/context admission, never candidate-readable."""
import hashlib
import json
import os
from pathlib import Path
import time
import stat
import re

ACTIVE=None

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def regular(path):
    p=Path(path)
    if not p.is_absolute() or '..' in p.parts or any(q.is_symlink() for q in (p,*p.parents)) or not p.is_file():
        raise ValueError('absolute unaliased regular host file required')
    return p

def record(value):
    if set(value)!={'path','sha256'}: raise ValueError('exact evidence record required')
    path=regular(value['path'])
    if sha(path)!=value['sha256']: raise ValueError('evidence drift')
    return json.loads(path.read_text())

def bind(config_path,lease_path,binding_path,acceptance_path):
    global ACTIVE
    paths=[regular(p) for p in (config_path,lease_path,binding_path,acceptance_path)]
    config,lease,binding,acceptance=[json.loads(p.read_text()) for p in paths]
    ACTIVE={'paths':paths,'hashes':[sha(p) for p in paths], 'config':config,'lease':lease,'binding':binding,'acceptance':acceptance}
    validate_context()
    return ACTIVE

def validate_context():
    if ACTIVE is None: raise ValueError('launch context absent')
    a=ACTIVE; config,lease,binding,acceptance=[a[k] for k in ('config','lease','binding','acceptance')]
    if any(sha(p)!=pin for p,pin in zip(a['paths'],a['hashes'])): raise ValueError('launch binding drift')
    if config.get('schema')!='er8.route.config.v1' or lease.get('schema')!='er8.route.lease.v1' or binding.get('schema')!='er8.route.case-binding.v1': raise ValueError('v8 binding schemas required')
    if binding['config_sha256']!=a['hashes'][0] or binding['lease_sha256']!=a['hashes'][1]: raise ValueError('wrong launch binding')
    snapshot_path=regular(config['snapshot_path']); snapshot=json.loads(snapshot_path.read_text())
    snapshot_hash=sha(snapshot_path)
    if acceptance.get('verdict')!='accepted' or acceptance.get('snapshot_sha256')!=snapshot_hash or binding['mode'] not in acceptance.get('allowed_modes',[]): raise ValueError('independent exact selected scope required')
    if not snapshot.get('closure_sha256'): raise ValueError('empty route closure')
    for path,pin in snapshot['closure_sha256'].items():
        if sha(regular(path))!=pin: raise ValueError('route dependency drift')
    if config.get('native_model')!={'provider_id':'builtin:zai-coding-plan','model_id':'GLM-5.3-Flash','effort':'max','session_mode':'build'}: raise ValueError('one exact native route only')
    for dependency in config['process_dependencies'].values():
        if sha(dependency['path'])!=dependency['sha256']: raise ValueError('selected process dependency drift')
    if binding.get('account_identity')!=config.get('account_identity') or not binding.get('account_identity'): raise ValueError('opaque account role mismatch')
    if os.getppid()!=1 or os.environ.get('PM_BOUND_DEADLINE_NS')!=str(lease['native_stop_monotonic_ns']): raise ValueError('already armed PID1 absolute lifetime required')
    cg=Path('/proc/self/cgroup').read_text().strip()
    if not cg.startswith('0::/') or Path(cg[3:]).name!=lease['owned_unit']: raise ValueError('owned service enrollment required')
    authority=record({'path':lease['case_authority']['path'],'sha256':lease['case_authority']['sha256']})
    if authority!=lease['case_authority']['clock']: raise ValueError('immutable clock drift')
    clock=authority; stage=clock['stages'][binding['stage_id']]
    if binding['case_id']!=clock['case_id'] or binding['case_start_monotonic_ns']!=clock['case_start_monotonic_ns'] or stage!={'stage_start_monotonic_ns':binding['stage_start_monotonic_ns'],'cap_seconds':binding['max_seconds'],'response_cap':binding['max_responses']}: raise ValueError('original case/stage clock required')
    if not 0<clock['case_elapsed_cap_seconds']<=3600 or not 0<clock['case_occupied_cap_seconds']<=5400 or not 0<clock['outside_native_cap_seconds']<=300: raise ValueError('case cap drift')
    for field,cap in (('occupied_seconds_reserved',clock['case_occupied_cap_seconds']),('outside_seconds_reserved',clock['outside_native_cap_seconds'])):
        if type(lease.get(field)) is not int or not 0<=lease[field]<=cap: raise ValueError('inclusive host cost reservation required')
    deadline=min(binding['stage_start_monotonic_ns']+binding['max_seconds']*10**9,clock['case_start_monotonic_ns']+clock['case_elapsed_cap_seconds']*10**9,clock['campaign_native_cutoff_monotonic_ns'])
    if deadline!=lease['deadline_monotonic_ns'] or not 2*10**9<=deadline-lease['native_stop_monotonic_ns']<=30*10**9 or time.monotonic_ns()>=lease['native_stop_monotonic_ns']: raise ValueError('original inclusive lifetime drift/exhaustion')
    if not 30<binding['max_seconds']<=1800 or not 0<binding['max_responses']<=160: raise ValueError('component caps unsupported')
    if binding['mode']=='canary':
        if binding['max_seconds']>480 or binding['max_responses']>64 or binding['public_get'] is not True: raise ValueError('mechanical canary cap/source mismatch')
    elif binding['mode']=='productive':
        proof=record(binding['canary_review'])
        if proof.get('verdict')!='passed' or proof.get('route_snapshot_sha256')!=snapshot_hash or not all(proof.get(k) is True for k in ('inclusive_native_lifetime_verified','native_goal_activation_continuation_completion_verified','privacy_and_actual_tool_inventory_verified','source_capture_and_delivered_range_verified')): raise ValueError('new same-boundary native canary proof required')
    else: raise ValueError('mode not admitted')
    workspace=Path(binding['workspace'])
    if not workspace.is_absolute() or not workspace.is_dir() or any(p.is_symlink() for p in (workspace,*workspace.parents)): raise ValueError('unaliased candidate workspace required')
    out=Path(binding['native_out']); prompt=regular(binding['prompt_file'])
    if not out.is_absolute() or '..' in out.parts or any(p.is_symlink() for p in (out,*out.parents)) or out.exists() or out.resolve().is_relative_to(workspace.resolve()) or workspace.resolve().is_relative_to(out.resolve()): raise ValueError('fresh canonical disjoint host output required')
    if not (workspace/'out').is_dir() or (workspace/'out').is_symlink() or any((workspace/'out').iterdir()): raise ValueError('fresh empty candidate output required')
    if any(p.is_relative_to(workspace) for p in a['paths']) or prompt.is_relative_to(workspace): raise ValueError('host gates/objective outside workspace required')
    objective=prompt.read_text().strip()
    if not objective or len(objective)>4000: raise ValueError('finite exact native objective required')
    if sha(prompt)!=binding.get('prompt_sha256'): raise ValueError('objective drift')
    inputs=binding['immutable_inputs']
    if not isinstance(inputs,dict) or not inputs: raise ValueError('complete immutable input scope required')
    actual={str(workspace/'TASK.md')}
    for path in (workspace/'inputs').rglob('*'):
        if path.is_symlink(): raise ValueError('input alias')
        if path.is_file(): actual.add(str(path))
    if set(inputs)!=actual: raise ValueError('exact immutable input coverage required')
    for path,pin in inputs.items():
        p=regular(path)
        if not p.is_relative_to(workspace) or p.stat().st_nlink!=1 or p.stat().st_size>524288 or sha(p)!=pin: raise ValueError('case input drift')
    capture_inputs=binding.get('immutable_capture_inputs')
    if not isinstance(capture_inputs,dict): raise ValueError('exact immutable same-case public capture inputs required')
    capture_store=workspace/'public_captures'
    actual_captures={str(p) for p in capture_store.glob('*')}
    if set(capture_inputs)!=actual_captures or (binding['mode']=='canary' and capture_inputs): raise ValueError('capture scope mismatch')
    for path,pin in capture_inputs.items():
        p=regular(path)
        if p.parent!=capture_store or re.fullmatch(r'(?:[0-9a-f]{64}\.body|[0-9a-f]{32}\.json)',p.name) is None or p.stat().st_nlink!=1 or p.stat().st_size>524288 or sha(p)!=pin: raise ValueError('same-case capture drift')
    if capture_inputs and binding.get('capture_origin_case_id')!=binding['case_id']: raise ValueError('sibling capture inputs forbidden')
    # Native instruction resolution walks to its project root or filesystem root.
    # Check only enumerated instruction/config names, without reading contents.
    for parent in (workspace,*workspace.parents):
        for name in ('AGENTS.md','CLAUDE.md','ZCODE.md','.zcode/config.json'):
            if (parent/name).exists(): raise ValueError('inherited native instruction/config source')
    return {'runtime_snapshot_sha256':snapshot_hash,'method_sha256':a['hashes'][1]}

def validate_admission(args,here,lab):
    result=validate_context(); b=ACTIVE['binding']
    exact={'workspace':str(args.workspace),'prompt_file':str(args.prompt_file),'native_out':str(args.out),'label':args.label,'max_seconds':args.max_seconds,'max_responses':args.max_responses,'mode':args.mode,'public_get':args.public_get}
    if any(b.get(k)!=v for k,v in exact.items()) or Path(args.admission_file)!=ACTIVE['paths'][2]: raise ValueError('native arguments differ from accepted binding')
    # Host-only one-shot claim; never touch old v7 CANARY or claim artifacts.
    with ACTIVE['paths'][2].with_suffix('.consumed').open('x') as handle:
        handle.write(result['runtime_snapshot_sha256']+'\n')
    return result
