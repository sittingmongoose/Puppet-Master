"""Actual DEC010 builder selection; complete native stage profile only."""
import hashlib
import importlib.util
from pathlib import Path
from resource_tool_release import load_tools,TOOLS


def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def build_bundle_config(workspace,resource_profile_path,bundle_profile_path,label,native_stop,execution_enabled,public_get):
    tools=load_tools()  # Exact selected immutable source/runtime pins before imports.
    spec=importlib.util.spec_from_file_location('_er9_luna_bundle_binding',TOOLS/'bundle_carrier.py')
    carrier=importlib.util.module_from_spec(spec);spec.loader.exec_module(carrier)
    profile=carrier.load_profile(bundle_profile_path)
    actor=profile['actor_binding']
    if profile['stage_id']!=label or actor.get('stage_id')!=label or actor.get('family')!='Luna' or actor.get('model')!='gpt-6-luna' or actor.get('effort','max')!='max':
        raise ValueError('exact current Luna max stage actor binding required')
    if actor.get('native_goal_id') is not None:raise ValueError('fresh future native Goal cannot be preclaimed by bundle profile')
    config=tools.mcp_configs(workspace,deadline_monotonic_ns=native_stop,
        execution_enabled=execution_enabled,public_get=public_get,
        resource_profile_path=resource_profile_path,bundle_profile_path=bundle_profile_path)
    if config.get('native_bundle_enabled') is not True or config.get('bundle_profile_sha256')!=sha(bundle_profile_path):
        raise ValueError('actual selected bundle builder acknowledgement missing')
    expected={'mcp__pm_boundary__read_file','mcp__pm_boundary__write_file','mcp__pm_boundary__mechanical'}
    if public_get:expected.add('mcp__pm_boundary__public_https_get')
    if execution_enabled:expected.add('mcp__pm_execution__python_execute')
    if set(config['tool_allowlist'])!=expected or len(config['tool_allowlist'])!=len(expected):
        raise ValueError('exact unchanged configured tool inventory required')
    return config,{'enabled':True,'stage_id':profile['stage_id'],'stage_role':profile['stage_role'],
        'case_id':profile['case_id'],'arm_id':profile['arm_id'],'method_factors':profile['method_factors'],
        'requested_actor':{'family':'Luna','model':'gpt-6-luna','effort':'max','native_goal_id':None},
        'bundle_profile_sha256':sha(bundle_profile_path),'input_role_manifest_sha256':profile['import_manifest']['sha256'],
        'config_builder_sha256':sha(TOOLS/'config.py'),'bundle_carrier_sha256':sha(TOOLS/'bundle_carrier.py'),
        'tools_source_pins_sha256':sha(TOOLS/'SOURCE_PINS.json'),
        'bundle_path':profile['bundle_path'],'commit_dir':profile['commit_dir'],'allowed_outputs':profile['allowed_outputs'],
        'source_quality_and_native_goal_outcome':'INDEPENDENT; mechanical delivery does not update either'}
