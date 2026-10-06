#!/usr/bin/env python3
"""Exactly one prepared immutable stage packet -> native Goal -> actual output freeze."""
import argparse
import json
from pathlib import Path, PurePosixPath
import shutil
import time
import profile
import glm_stage as g
import clock_binding
import task_fragment

def digest(path): return g.ns.sha(Path(path).read_bytes())

def pinned(path, expected):
    original=Path(path).absolute()
    if any(p.is_symlink() for p in (original,*original.parents)) or not original.is_file():
        raise ValueError('Pinned regular file without aliases required')
    if digest(original)!=expected: raise ValueError('Prospective file pin mismatch: '+str(original))
    return original

def inventory(root):
    rows=[]
    for path in sorted(root.rglob('*')):
        if path.is_symlink(): raise ValueError('Output alias cannot be frozen')
        if path.is_file():
            rows.append({'path':str(path),'relative_path':path.relative_to(root).as_posix(),
                         'sha256':digest(path),'bytes':path.stat().st_size})
    return rows

def run(spec,birth_ns,resource_path,resource_sha):
    profile_value=profile.load(pinned(resource_path,resource_sha))
    stop_ns,native_stop_ns,guard_stop_ns=profile.original_clock(profile_value,birth_ns,spec['max_seconds'])
    outer_placement=profile.reader.own_placement(profile_value)
    started=birth_ns/1e9; epoch=time.time()-(time.monotonic()-started); deadline=stop_ns/1e9
    ws=Path(spec['workspace']).absolute(); out=Path(spec['out']).absolute()
    final=Path(spec.get('freeze_out',str(out.parent/'OUTPUT_FREEZE.json'))).absolute()
    if final.exists(): raise ValueError('Original stage freeze already exists')
    if any(p.is_symlink() for p in (ws,*ws.parents,out,*out.parents,final,*final.parents)):
        raise ValueError('Stage path aliases denied')
    pinned(spec['prompt_file'],spec['prompt_sha256'])
    pinned(spec['tools_config'],spec['tools_config_sha256'])
    freeze=spec['pair_freeze']; pinned(freeze['path'],freeze['sha256'])
    for path,sha in spec['input_pins'].items():
        admitted=Path(path).absolute()
        if not admitted.is_relative_to(ws/'inputs'): raise ValueError('Candidate input outside its read-only namespace')
        pinned(admitted,sha)
    required=[]
    for path in spec['required_artifacts']:
        rel=PurePosixPath(path)
        if rel.is_absolute() or '..' in rel.parts or str(rel)!=path or rel.parts[0]!='out':
            raise ValueError('Canonical out/ artifact path required')
        required.append(str(rel))
    fragment=task_fragment.validate_packet(spec)
    # Seal the original computed deadline fields before the builder reads
    # them. Config hashes belong to a second immutable binding, avoiding a
    # receipt/config/clock-profile SHA dependency cycle.
    binding=out.parent/'RESOURCE_BINDING.json'
    if binding.exists():raise ValueError('Original stage resource binding already sealed')
    g.atomic(binding,{'resource_profile':{'path':resource_path,'sha256':resource_sha},
        'job_id':spec['job_id'],'pair_id':spec['pair_id'],'arm':spec['arm'],
        'outer_unit':outer_placement['unit'],'outer_placement':outer_placement,
        'original_birth_monotonic_ns':birth_ns,'original_total_stop_monotonic_ns':stop_ns,
        'original_stage_allocation_seconds':spec['max_seconds'],
        'native_stop_monotonic_ns':native_stop_ns,'guard_stop_monotonic_ns':guard_stop_ns,
        'model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max','fit':'UNKNOWN',
        'controller_source':{'path':str(Path(__file__).resolve()),'sha256':digest(__file__)},
        'external_release_after_outer_exit_required':True})
    binding.chmod(0o400)
    clock_path=clock_binding.create_descriptor(spec,binding,profile_value,out.parent/'ORIGINAL_CLOCK_PROFILE.json')
    private_tool_profile=profile.tool_profile(resource_path,out.parent/'TOOL_RESOURCE_PROFILE.json')
    actual_config=profile.wrapped_tools(spec,resource_path,private_tool_profile,out,clock_path)
    actual_config_path=out.parent/'RESOURCE_TOOLS_CONFIG.json'
    if actual_config_path.exists():raise ValueError('Resource config already sealed')
    g.atomic(actual_config_path,actual_config)
    initial_clock_input=clock_binding.freeze_initial_input(spec,actual_config)
    config_binding_path=out.parent/'RESOURCE_CONFIG_BINDING.json'
    if config_binding_path.exists():raise ValueError('Original clock/config binding already sealed')
    config_binding={'schema':'er9.glm.original-action-clock-config-binding.v1',
        'job_id':spec['job_id'],'pair_id':spec['pair_id'],'arm':spec['arm'],
        'resource_binding':{'path':str(binding),'sha256':digest(binding)},
        'actual_tools_config':{'path':str(actual_config_path),'sha256':digest(actual_config_path)},
        'clock_profile':{'path':str(clock_path),'sha256':digest(clock_path)},
        'initial_clock_input':initial_clock_input,'declared_task_fragment':fragment,
        'frozen_task':{'path':spec['prompt_file'],'sha256':spec['prompt_sha256']},
        'candidate_clock_awareness_behavioral_version':task_fragment.BEHAVIORAL_VERSION,
        'captured_before_goal':True,'objective_hidden_append':False}
    g.atomic(config_binding_path,config_binding)
    # The goal uses the originally declared frozen Task. New mechanical input
    # bytes are separately pinned at original role birth, before any inference.
    pinned(spec['prompt_file'],spec['prompt_sha256'])
    pinned(initial_clock_input['path'],initial_clock_input['sha256'])
    args=argparse.Namespace(workspace=str(ws),prompt_file=spec['prompt_file'],out=str(out),
            job_id=spec['job_id'],max_seconds=spec['max_seconds'],max_responses=spec['max_responses'],
            tools_config=str(actual_config_path),probe=False,cli=g.CLI,node=g.ns.DEFAULT_NODE,
            desktop_config=g.ns.DEFAULT_DESKTOP_CONFIG,deadline_monotonic=deadline,
            birth_monotonic_ns=birth_ns,resource_profile=resource_path)
    result=g.run(args)
    frozen=out.parent/'frozen-output'
    shutil.copytree(ws/'out',frozen)
    artifacts=inventory(frozen)
    index={'out/'+r['relative_path']:r for r in artifacts}
    missing=[r for r in required if r not in index or index[r]['bytes']==0]
    json_errors=[]
    for path in required:
        if path.endswith('.json') and path in index:
            try: json.loads(Path(index[path]['path']).read_text())
            except (ValueError,UnicodeError): json_errors.append(path)
    elapsed=time.monotonic()-started
    complete=(result['status']=='completed' and result.get('goal_activated') is True and
              result.get('cleanup',{}).get('native_quiescent') is True and not missing and
              not json_errors and elapsed<spec['max_seconds'])
    receipt={'schema':'er9.stage-output-freeze.v1','job_id':spec['job_id'],
             'pair_id':spec['pair_id'],'arm':spec['arm'],'stage':spec['stage'],
             'operational_complete':complete,'semantic_quality':'PENDING_INDEPENDENT_EVALUATION',
             'native_status':result['status'],'native_quiescent':result.get('cleanup',{}).get('native_quiescent',False),
             'native_receipt':{'path':str(out/'receipt.json'),'sha256':digest(out/'receipt.json')},
             'pair_freeze':spec['pair_freeze'],'artifacts':artifacts,'missing_required_artifacts':missing,
             'invalid_json_artifacts':json_errors,'elapsed_seconds':elapsed,'birth_epoch':epoch,
             'birth_monotonic':started,'end_monotonic':time.monotonic(),
             'goal_session_id':result.get('session_id'),'goal_target_id':result.get('goal_target_id'),
             'native_goal_starts':int(result.get('goal_activated') is True),
             'native_responses':result.get('native_responses'),'usage':'Exact native session receipt and redacted request attempts; no inferred dollars'}
    receipt.update(resource_profile={'path':resource_path,'sha256':resource_sha},
                   resource_oom_observed=result.get('resource_oom_observed','UNKNOWN'),
                   external_outer_slice_release_required=True,resource_components_quiet=result.get('resource_components_quiet',False),
                   original_birth_monotonic_ns=birth_ns,original_total_stop_monotonic_ns=stop_ns,
                   complete_job_memory_max_bytes=profile_value['aggregate_memory_max_bytes'],research_resource_fit='UNKNOWN')
    receipt['operational_complete']=complete and result.get('resource_oom_observed') is False and result.get('resource_components_quiet') is True
    receipt['original_action_clock_binding']={'path':str(config_binding_path),'sha256':digest(config_binding_path)}
    receipt['original_action_deadline_monotonic_ns']=native_stop_ns
    g.atomic(final,receipt)
    return receipt,final

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--stage-json',required=True); p.add_argument('--stage-sha256',required=True)
    p.add_argument('--birth-monotonic-ns',type=int,required=True);p.add_argument('--resource-profile',required=True);p.add_argument('--resource-profile-sha256',required=True)
    a=p.parse_args(); spec=json.loads(pinned(a.stage_json,a.stage_sha256).read_text())
    try:
        result,path=run(spec,a.birth_monotonic_ns,a.resource_profile,a.resource_profile_sha256)
        print(json.dumps({'job_id':spec['job_id'],'operational_complete':result['operational_complete'],
                          'freeze_path':str(path)}),flush=True)
        return 0 if result['operational_complete'] else 1
    except Exception as exc:
        print(json.dumps({'job_id':spec.get('job_id'),'status':'worker_error','error_class':type(exc).__name__,
                          'error':g.ns.sanitized(str(exc))}),flush=True)
        return 1
if __name__=='__main__': raise SystemExit(main())
