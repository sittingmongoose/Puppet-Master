"""Source-positive original action clock; no deadline derivation or extension."""
import hashlib
import json
import os
from pathlib import Path

PROFILE_SCHEMA='er9.original-action-clock.profile.v1'

def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def regular(path):
    path=Path(path).absolute()
    if any(p.is_symlink() for p in (path,*path.parents)) or not path.is_file() or path.stat().st_nlink!=1:
        raise ValueError('Unaliased regular original clock proof required')
    return path

def create_descriptor(spec,binding_path,resource,output_path):
    binding_path=regular(binding_path);binding=json.loads(binding_path.read_text())
    if binding.get('job_id')!=spec['job_id'] or binding.get('arm')!=spec['arm'] or binding.get('pair_id')!=spec['pair_id']:
        raise ValueError('Original clock proof must join the exact frozen stage and arm')
    birth=binding.get('original_birth_monotonic_ns');total=binding.get('original_total_stop_monotonic_ns')
    if birth!=resource['original_birth_monotonic_ns'] or total!=resource['original_total_stop_monotonic_ns']:
        raise ValueError('Original clock proof/resource drift')
    allocation=spec['max_seconds']
    if type(allocation) is not int or total-birth!=allocation*1_000_000_000:
        raise ValueError('Original stage allocation identity required')
    # Only an explicit original action field establishes knowledge. Do not
    # manufacture it from total, allocation, process start or clock reserves.
    action=binding.get('native_stop_monotonic_ns')
    if action is not None and (type(action) is not int or not birth<=action<=total):
        raise ValueError('Invalid explicit original candidate action field')
    controller=binding.get('controller_source')
    if action is not None and controller is None:
        action=None  # Missing source proof remains UNKNOWN, never inferred.
    elif action is not None and (not isinstance(controller,dict) or
            controller.get('path')!=str(Path(__file__).with_name('stage_worker.py')) or
            controller.get('sha256')!=sha(controller['path'])):
        raise ValueError('Exact pinned current controller source required for explicit action proof')
    proof=None if action is None else {'kind':'explicit_original_native_action_deadline',
        'controller_path':controller['path'],'controller_sha256':controller['sha256'],
        'action_field':'RESOURCE_BINDING.native_stop_monotonic_ns',
        'receipt':{'path':str(binding_path),'sha256':sha(binding_path),
            'stage_id_selector':'/job_id','birth_selector':'/original_birth_monotonic_ns',
            'allocation_selector':'/original_stage_allocation_seconds',
            'action_deadline_selector':'/native_stop_monotonic_ns',
            'total_cleanup_selector':'/original_total_stop_monotonic_ns'}}
    value={'schema':PROFILE_SCHEMA,'stage_id':spec['job_id'],
        'original_birth_monotonic_ns':birth,'original_stage_allocation_seconds':allocation,
        'original_candidate_action_deadline_monotonic_ns':action,
        'original_total_cleanup_stop_monotonic_ns':total,'action_deadline_proof':proof}
    output_path=Path(output_path).absolute()
    if any(p.is_symlink() for p in (output_path,*output_path.parents)):
        raise ValueError('Clock profile aliases denied')
    with output_path.open('xb') as output:
        output.write(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode('utf-8'))
    output_path.chmod(0o400)
    return output_path

def validate_join(spec,resource,clock_path,clock_module):
    clock_path=regular(clock_path);value=clock_module.load(clock_path,verify_controller=True)
    if value['stage_id']!=spec['job_id'] or value['original_stage_allocation_seconds']!=spec['max_seconds']:
        raise ValueError('Clock descriptor stage/allocation mismatch')
    for ck,rk in [('original_birth_monotonic_ns','original_birth_monotonic_ns'),
                  ('original_total_cleanup_stop_monotonic_ns','original_total_stop_monotonic_ns')]:
        if value[ck]!=resource[rk]:raise ValueError('Clock descriptor original resource identity mismatch')
    proof=value['action_deadline_proof'];action=value['original_candidate_action_deadline_monotonic_ns']
    if proof is not None:
        if proof['action_field']!='RESOURCE_BINDING.native_stop_monotonic_ns':raise ValueError('Exact original native action field required')
        if proof['controller_path']!=str(Path(__file__).with_name('stage_worker.py')) or proof['controller_sha256']!=sha(proof['controller_path']):
            raise ValueError('Exact selected stage controller source required')
        binding=json.loads(regular(proof['receipt']['path']).read_text())
        if any(binding.get(k)!=spec[k] for k in ('job_id','pair_id','arm')):
            raise ValueError('Clock proof stage/arm binding mismatch')
        if binding.get('native_stop_monotonic_ns')!=action:
            raise ValueError('Clock action value differs from pinned explicit controller field')
        if binding.get('original_birth_monotonic_ns')!=value['original_birth_monotonic_ns'] or binding.get('original_total_stop_monotonic_ns')!=value['original_total_cleanup_stop_monotonic_ns']:
            raise ValueError('Clock proof original birth/total mismatch')
    elif action is not None:
        raise ValueError('Unsourced action value denied; explicit missing proof must remain UNKNOWN')
    return value

def freeze_initial_input(spec,config):
    value=config['initial_clock_metadata'];raw=config['initial_clock_metadata_utf8'].encode('utf-8')
    if json.loads(raw)!=value or value['stage_clock']['stage_id']!=spec['job_id']:
        raise ValueError('Actual builder initial clock metadata stage/codec drift')
    path=Path(spec['workspace']).absolute()/'inputs/STAGE_CLOCK.json'
    if any(p.is_symlink() for p in (path,*path.parents)):
        raise ValueError('Initial clock input aliases denied')
    with path.open('xb') as output:output.write(raw)
    path.chmod(0o444)
    return {'path':str(path),'sha256':sha(path),'bytes':len(raw),
            'source':'exact actual builder initial_clock_metadata_utf8',
            'stage_id':spec['job_id'],'captured_before_goal':True}
