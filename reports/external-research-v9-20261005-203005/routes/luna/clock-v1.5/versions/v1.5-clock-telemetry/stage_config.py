"""Actual v1.5 core/optionalB builder with original-clock stage join."""
import hashlib
import importlib.util
from pathlib import Path
_release_spec=importlib.util.spec_from_file_location('_er9_luna_v15_stage_release',Path(__file__).with_name('resource_tool_release.py'))
_release=importlib.util.module_from_spec(_release_spec);_release_spec.loader.exec_module(_release)
load_tools,TOOLS=_release.load_tools,_release.TOOLS


def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def build_stage_config(workspace,resource_profile_path,clock_profile_path,label,native_stop,
                       execution_enabled,public_get,bundle_profile_path=None):
    tools=load_tools();bundle=None
    if bundle_profile_path is not None:
        spec=importlib.util.spec_from_file_location('_er9_luna_clock_bundle_binding',TOOLS/'bundle_carrier.py')
        carrier=importlib.util.module_from_spec(spec);spec.loader.exec_module(carrier)
        bundle=carrier.load_profile(bundle_profile_path);actor=bundle['actor_binding']
        if bundle['stage_id']!=label or actor.get('stage_id')!=label or actor.get('family')!='Luna' or actor.get('model')!='gpt-6-luna' or actor.get('effort','max')!='max' or actor.get('native_goal_id') is not None:
            raise ValueError('exact current future Luna max bundle stage binding required')
    config=tools.mcp_configs(workspace,deadline_monotonic_ns=native_stop,
        execution_enabled=execution_enabled,public_get=public_get,resource_profile_path=resource_profile_path,
        bundle_profile_path=bundle_profile_path,clock_profile_path=clock_profile_path,clock_stage_id=label)
    if config.get('clock_profile_sha256')!=sha(clock_profile_path) or config['initial_clock_metadata']['stage_clock']['stage_id']!=label:
        raise ValueError('actual clock builder acknowledgement missing')
    if config.get('native_bundle_enabled') is not (bundle is not None):raise ValueError('core/bundle opt-in drift')
    expected={'mcp__pm_boundary__read_file','mcp__pm_boundary__write_file','mcp__pm_boundary__mechanical'}
    if public_get:expected.add('mcp__pm_boundary__public_https_get')
    if execution_enabled:expected.add('mcp__pm_execution__python_execute')
    if set(config['tool_allowlist'])!=expected or len(config['tool_allowlist'])!=len(expected):raise ValueError('exact unchanged configured tool inventory required')
    proof={'enabled':bundle is not None,'actual_tools_release':'v1.5-clock-telemetry','stage_id':label,
        'config_builder_sha256':sha(TOOLS/'config.py'),'tools_source_pins_sha256':sha(TOOLS/'SOURCE_PINS.json'),
        'clock_profile_sha256':config['clock_profile_sha256'],'clock_behavioral_version':config['clock_overlay_behavioral_version']}
    if bundle is not None:proof.update(stage_role=bundle['stage_role'],case_id=bundle['case_id'],arm_id=bundle['arm_id'],method_factors=bundle['method_factors'],
        requested_actor={'family':'Luna','model':'gpt-6-luna','effort':'max','native_goal_id':None},bundle_profile_sha256=sha(bundle_profile_path),
        input_role_manifest_sha256=bundle['import_manifest']['sha256'],bundle_carrier_sha256=sha(TOOLS/'bundle_carrier.py'),
        bundle_path=bundle['bundle_path'],commit_dir=bundle['commit_dir'],allowed_outputs=bundle['allowed_outputs'],
        source_quality_and_native_goal_outcome='INDEPENDENT; delivery does not update either')
    return config,proof
