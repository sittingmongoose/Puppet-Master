"""Neutral metadata-only operator binding; no scan, source body, grade or fallback.

Ops supplies already-admitted actual input rows and positive native proof capsules
before launch. Pending unknown future roles are not filled or selected here.
"""
import importlib.util
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('binding_bundle_carrier',HERE/'bundle_carrier.py')
carrier=importlib.util.module_from_spec(spec);spec.loader.exec_module(carrier)

def binding(*,stage_id,stage_role,case_id,arm_id,method_factors,actor_binding,entries,complete_final_role,manifest_path='inputs/delivery_role_manifest.json'):
    if complete_final_role is not True:raise ValueError('explicit complete-final owner contract required')
    manifest={'schema':carrier.MANIFEST_SCHEMA,'stage_id':stage_id,'case_id':case_id,'arm_id':arm_id,'entries':entries}
    raw=carrier.encoded(manifest)+b'\n'
    if len(raw)>carrier.MAX_MANIFEST:raise ValueError('neutral manifest metadata cap')
    profile={'schema':carrier.PROFILE_SCHEMA,'final_role_enabled':True,'stage_id':stage_id,'stage_role':stage_role,'case_id':case_id,'arm_id':arm_id,
             'method_factors':method_factors,'bundle_path':'out/final_bundle.json','commit_dir':'out/final','allowed_outputs':{n:'out/final/'+n for n in carrier.NAMES},
             'import_manifest':{'path':manifest_path,'sha256':carrier.sha(raw)},'actor_binding':actor_binding}
    carrier.validate_profile(profile)
    return {'manifest':manifest,'manifest_bytes':raw,'profile':profile,'profile_bytes':carrier.encoded(profile)+b'\n',
            'dispatch_condition':'Actual same-arm imports, positive proofs and all hashes must pass config.mcp_configs before launch; no pending closure may dispatch.'}
