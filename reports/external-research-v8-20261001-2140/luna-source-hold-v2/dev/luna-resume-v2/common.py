"""Generic operator mechanics. No evaluator content or private native paths."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import time

HERE = Path(__file__).resolve().parent
CONTROL=json.loads((HERE/'recovery-control.json').read_text())
CAMPAIGN = Path(CONTROL['campaign'])
PLANNING = CAMPAIGN / 'cases/planning-v1'
EXECUTION = Path(CONTROL['execution'])
ASSEMBLY = Path(CONTROL['assembly'])
GATE = EXECUTION / 'deadline_gate'
PYTHON = '/usr/bin/python3'
STOP_EPOCH = CONTROL['deadline_epoch']
ACCOUNT = 'EXISTING_AUTHORIZED_CODEX_SUBSCRIPTION'
LUNA_ROUTE=Path(CONTROL['luna_route'])
POLICY='wall-goal-token-observation-v1'
ACCOUNTING_SHA = CONTROL['ledger']['sha256']
QUEUE = list(CONTROL['default_queue'])
ROLES = [('research-proposal', 1800, 'PROPOSAL.md'),
         ('independent-candidate-critic', 600, 'CRITIQUE.md'),
         ('final-correction', 600, 'FINAL_PROPOSAL.md')]
PUBLIC_NATIVE = {'activation.json', 'progress.jsonl', 'receipt.json', 'public-metrics.json'}


def regular(path):
    p = Path(path)
    if not p.is_absolute() or '..' in p.parts or any(q.is_symlink() for q in (p, *p.parents)) or not p.is_file():
        raise ValueError('canonical regular absolute file required')
    return p


def sha(path):
    return hashlib.sha256(regular(path).read_bytes()).hexdigest()


def read_json(path):
    p = regular(path)
    if p.stat().st_size > 4 * 1024 * 1024:
        raise ValueError('bounded metadata required')
    return json.loads(p.read_text())


def native_json(home, name):
    if name not in PUBLIC_NATIVE or name == 'progress.jsonl':
        raise ValueError('positive native JSON path required')
    return read_json(Path(home) / 'native-public' / name)


def atomic(path, value):
    path = Path(path)
    if any(p.is_symlink() for p in (path, *path.parents)):
        raise ValueError('no metadata aliases')
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    tmp = path.with_suffix(path.suffix + '.tmp')
    with tmp.open('w') as out:
        json.dump(value, out, indent=2)
        out.write('\n')
        out.flush()
        os.fsync(out.fileno())
    os.replace(tmp, path)


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def ledger_module():
    path = Path(CONTROL['ledger']['path'])
    if sha(path) != ACCOUNTING_SHA:
        raise ValueError('frozen accounting source drift')
    return load('er8_integrated_accounting', path)


def ledger(action, request=None):
    module = ledger_module()
    with module.transaction() as state:
        return module.apply(state, action, request or {})


def pin_record(value):
    if not isinstance(value, dict) or set(value) != {'path','sha256'} or sha(value['path']) != value['sha256']:
        raise ValueError('exact immutable positive record required')
    return value


def record(value):
    if not isinstance(value, dict) or set(value) != {'path', 'sha256'} or sha(value['path']) != value['sha256']:
        raise ValueError('exact immutable positive record required')
    return read_json(value['path'])


def check_release(release):
    from release_binding import check_parent_release, PREDICATES
    check_parent_release(release,'productive')
    selected_queue=release.get('case_queue')
    if not isinstance(selected_queue,list) or not selected_queue or len(set(selected_queue))!=len(selected_queue):raise ValueError('root selected unstarted Luna queue required')
    inputs=load('assigned_inputs',Path(CONTROL['planning_map']).parent/'candidate_inputs.py')
    for case in selected_queue:
        assigned=inputs.case_record(case,release.get('case_sources'))
        if assigned.get('family_provisional')!='L':
            rebound=record(release.get('pair_bindings',{})[assigned['pair_id']])
            if rebound.get('root_authority') is not True or rebound.get('family')!='L' or rebound.get('account_identity')!=ACCOUNT or rebound.get('route')!=release['route'] or rebound.get('pins')!=release['pins'] or case not in rebound.get('cases',[]):raise ValueError('whole unstarted pair binding required')
    QUEUE[:]=selected_queue
    proof=record(release['canary_review'])
    if proof.get('verdict')!='passed' or proof.get('route_snapshot_sha256')!=release['route_snapshot']['sha256'] or not all(proof.get(k) is True for k in PREDICATES):raise ValueError('same-boundary actual Luna native canary required')
    with ledger_module().transaction() as state:
        for case in QUEUE:
            promise=state['reservation_by_case'].get(case,{})
            if promise.get('native_starts')!=3 or promise.get('final_job')!=case+'-final-correction':raise ValueError('protected literal correction and three starts required')
    return {'route':release['route'],'pins':release['pins']}


def check_planning(release, case):
    """Hash just assigned input lineage; no evaluation registry or scope reads."""
    pins = release.get('planning_input_sha256')
    if not isinstance(pins, dict):
        raise ValueError('prospective exact planning input pins required')
    inputs=load('assigned_inputs',Path(CONTROL['planning_map']).parent/'candidate_inputs.py')
    item=inputs.case_record(case,release.get('case_sources'))
    manifest_path=Path(item['manifest']);manifest=read_json(manifest_path)
    root=Path(item['root']);directory=Path(item['case_dir'])
    # Equivalent assigned-input inventory; only template path joining is repaired.
    needed=[Path(CONTROL['planning_map']),Path(item['objectives']),manifest_path,
            root/manifest['brief'],root/manifest['thin_plan'],root/manifest['source_access'],
            directory/'METHOD.md',directory/'TASK.md',
            *(root/stage['task_template'] for stage in manifest['stages'])]
    for p in needed:
        if pins.get(str(p)) != sha(p):
            raise ValueError('assigned prospective planning source drift')
    return manifest


def deadline(stage_ns, cap, case_ns, campaign_ns):
    return min(stage_ns + cap * 10**9, case_ns + 3600 * 10**9, campaign_ns)


def armed(expected):
    if os.environ.get('PM_BOUND_DEADLINE_NS') != str(expected) or time.monotonic_ns() >= expected:
        raise ValueError('already armed ORIGINAL absolute deadline required')


def gate_command(cutoff, script, args):
    return [str(GATE), '--absolute-ns', str(cutoff), '--', PYTHON, '-I', '-B', str(HERE / script), *map(str, args)]


def group_absent(pid):
    if type(pid) is not int or pid <= 1:
        raise ValueError('held Popen PGID required')
    try:
        os.killpg(pid, 0)
        return False
    except ProcessLookupError:
        return True
    except PermissionError:
        return False


def charge(case, job, begin, end, suffix, category='cleanup'):
    if type(begin) is not int or type(end) is not int or end < begin:
        raise ValueError('nonoverlapping monotonic host interval required')
    return ledger('event', {'case': case, 'job': job, 'category': category,
        'seconds': (end-begin)/10**9, 'outside_native_seconds': (end-begin)/10**9,
        'interval_begin_monotonic_ns': begin, 'interval_end_monotonic_ns': end,
        'interval_receipt_id': job + '-' + suffix})


def artifacts_for_next(case, exports, role):
    allowed = {'PROPOSAL.md', 'UNRESOLVED_LEADS.md'}
    if role == 'final-correction':
        allowed.add('CRITIQUE.md')
    result = {}
    for index, export in enumerate(exports):
        if export['case_id'] != case:
            raise ValueError('cross-case artifact transfer forbidden')
        for item in export['artifacts']:
            name = Path(item['path']).name
            if name in allowed and (name != 'PROPOSAL.md' or index == 0) and (name != 'CRITIQUE.md' or index == 1):
                result[name] = {'path': item['path'], 'sha256': item['sha256'], 'case_id': case}
    required = {'PROPOSAL.md'} | ({'CRITIQUE.md'} if role == 'final-correction' else set())
    if not required <= result.keys():
        raise ValueError('current actual proposal/critique chain required')
    return result


def validate_stage_close(complete, quiet, *, case, job, start, cutoff, pid, rc, exited, now, absent):
    if complete.get('case') != case or complete.get('job') != job or complete.get('stage_start_monotonic_ns') != start or complete.get('original_deadline_monotonic_ns') != cutoff:
        raise ValueError('exact stage ancestry mismatch')
    if complete.get('lease_release_deferred') is not True or complete.get('lease_released_by_actor') is not False:
        raise ValueError('actor cannot release its own lifetime')
    if type(pid) is not int or pid <= 1 or rc != 0 or not start <= exited <= now < cutoff or not absent:
        raise ValueError('held stage Popen exited/PGID absent on ORIGINAL deadline required')
    if quiet.get('owned_native_quiescent') is not True or quiet.get('inclusive_native_lifetime_established') is not True or quiet.get('original_deadline_monotonic_ns') != cutoff or quiet.get('quiescence_observed_monotonic_ns', cutoff+1) >= cutoff:
        raise ValueError('positive original inner cgroup quiet required')
    if complete.get('host_groups_absent') is not True:
        raise ValueError('positive native/MCP groups absent required')


def validate_luna_metrics(metrics):
    if metrics.get('requested_model')!='gpt-6-luna' or metrics.get('requested_effort')!='max' or metrics.get('native_response_policy')!=POLICY or type(metrics.get('candidate_goals_set_by_host')) is not int or metrics.get('candidate_goals_set_by_host')!=1 or metrics.get('goal_replacements_observed')!=0 or metrics.get('host_initial_turns_started')!=1 or metrics.get('host_followup_turns_started')!=0 or metrics.get('source_proven_tool_restriction_verified') is not True or metrics.get('inventory_check',{}).get('native_mcp_catalog_verified') is not True:
        raise ValueError('exact source-proven Luna one-Goal boundary required')
    if metrics.get('inventory_check',{}).get('actual_inference_tool_payload_observed') is not False or metrics.get('inventory_check',{}).get('verified') is not False:
        raise ValueError('actual inference inventory must remain honestly UNOBSERVED')
    if metrics.get('goal_status_final')!='complete' or metrics.get('goal_started_turn') is not True or metrics.get('fresh_session') is not True or metrics.get('component_outcome')!='passed':raise ValueError('fresh active completed native Goal required')
    if metrics.get('native_owned_continuation_observed') is not True or metrics.get('native_turns_started',0)<2 or metrics.get('native_turns_completed',0)<2:raise ValueError('native-owned continuation required')
