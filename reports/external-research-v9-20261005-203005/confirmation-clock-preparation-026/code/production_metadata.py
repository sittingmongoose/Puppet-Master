"""Pure production GLM metadata preparation, without any process or native Goal.

Ops production worker is the authority for actual placement and clock receipt.
This source-test boundary invokes its pinned clock/config functions only.
"""
import copy
import hashlib
import json
from pathlib import Path
import sys
import prepare as owner
p=owner.p

def modules(spec):
    pin=p.checked(spec['declared_native_source_pin']);directory=Path(spec['declared_native_source_pin']['path']).parent
    for path,digest in pin['runtime_source_pins'].items():
        if hashlib.sha256(Path(path).read_bytes()).hexdigest()!=digest:raise ValueError('Actual runtime closure drift')
    clock=owner.module('production_clock_'+str(spec['complete_final_owner_role']),directory/'clock_binding.py')
    fragment=owner.module('production_fragment_'+str(spec['complete_final_owner_role']),directory/'task_fragment.py')
    sys.modules['clock_binding']=clock;sys.modules['task_fragment']=fragment
    profile=owner.module('production_profile_'+str(spec['complete_final_owner_role']),directory/'profile.py')
    return directory,clock,fragment,profile

def prepare_metadata(spec,resource_path,binding_path,output_directory):
    """Inputs must already be frozen. No Goal objective/Task rewrite or implicit clock."""
    directory,clock,fragment,profile=modules(spec)
    if p.sha(spec['prompt_file'])!=spec['prompt_sha256']:raise ValueError('Frozen Task hash drift')
    if p.sha(spec['tools_config'])!=spec['tools_config_sha256']:raise ValueError('Original admitted tool config hash drift')
    for path,digest in spec['input_pins'].items():
        if not Path(path).absolute().is_relative_to(Path(spec['workspace']).absolute()/'inputs') or p.sha(path)!=digest:
            raise ValueError('Exact admitted input identity required')
    fragment.validate_packet(spec)
    resource=profile.load(resource_path);binding=json.loads(Path(binding_path).read_text())
    total,action,guard=profile.original_clock(resource,binding['original_birth_monotonic_ns'],spec['max_seconds'])
    if binding.get('native_stop_monotonic_ns') not in (None,action):raise ValueError('Original native action allocation drift')
    output=Path(output_directory).absolute();output.mkdir(parents=True,exist_ok=True)
    clock_path=clock.create_descriptor(spec,binding_path,resource,output/'ORIGINAL_CLOCK_PROFILE.json')
    cfg=profile.wrapped_tools(spec,str(resource_path),profile.tool_profile(resource_path,output/'TOOL_RESOURCE_PROFILE.json'),output/'native',clock_path)
    initial=clock.freeze_initial_input(spec,cfg)
    return {'config':cfg,'clock_profile':p.ref(clock_path),'initial_clock_input':initial,'Task_ref':p.ref(spec['prompt_file']),
        'original_action_deadline_monotonic_ns':action,'original_total_cleanup_stop_monotonic_ns':total,
        'native_process_or_Goal_calls':0,'actual_kernel_placement_observed':False}
