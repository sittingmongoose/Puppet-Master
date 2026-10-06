"""Production no-native preparation ABI; compiler may replay synthetic fixtures.

No auth copy, native process/thread/Goal, source call, controller allocation or
scientific file read. Only explicitly supplied body bytes and clock variables.
"""
import importlib.util
from pathlib import Path

HERE=Path(__file__).resolve().parent


def sibling(name):
    spec=importlib.util.spec_from_file_location('_er9_luna_v15_'+name,HERE/(name+'.py'))
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

clock=sibling('clock_stage');builder=sibling('stage_config')


def prepare_stage(*,workspace,private,label,original_birth_monotonic_ns,max_seconds,
                  native_stop_monotonic_ns,total_stop_monotonic_ns,resource_profile,
                  clock_declaration,clock_declaration_sha256,execution_enabled,public_get,
                  scientific_body,goal_objective,source_prompt_sha256,source_TASK_sha256,
                  bundle_profile=None,controller_path=None):
    declared=clock.validate_declaration(clock_declaration,clock_declaration_sha256,label)
    profile,original=clock.prepare_original_clock(private,label,original_birth_monotonic_ns,max_seconds,
        native_stop_monotonic_ns,total_stop_monotonic_ns,controller_path or HERE/'dynamic_stage_runner.py')
    config,binding=builder.build_stage_config(workspace,resource_profile,profile,label,native_stop_monotonic_ns,
        execution_enabled,public_get,bundle_profile)
    native_input,input_proof=clock.materialize_clock_input(config,workspace,label,scientific_body,goal_objective)
    input_proof.update(source_prompt_sha256=source_prompt_sha256,source_TASK_sha256=source_TASK_sha256,
                       declaration_sha256=clock_declaration_sha256)
    return {'config':config,'config_binding':binding,'clock_declaration':declared,
        'clock_profile_path':profile,'original_clock':original,'native_input':native_input,
        'input_binding':input_proof,'native_calls_or_processes_started':False}
