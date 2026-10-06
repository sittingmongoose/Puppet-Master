"""Standing explicit INLINE_ONLY native-final profile, no role reference IDs."""
import copy
from pathlib import Path
import prepare_successors as p
import hydrate_role_proofs as h

def bind(stage_ref,card,family):
    source=p.checked(stage_ref);run=Path(stage_ref['path']).parent;ws=Path(source['workspace'])
    module=h.tool_module();role='final_author' if source['stage']=='revision' else source['stage']
    result=module.binding(stage_id=source['job_id'],stage_role=role,case_id=card['case_id'],arm_id=source['arm'],
           method_factors=[card['method_id']],actor_binding={'stage_id':source['job_id'],'family':'Luna' if family=='L' else 'GLM',
             'model':'gpt-6-luna' if family=='L' else 'builtin:zai-coding-plan/GLM-5.3-Flash',
             'effort':'max','native_goal_id':None,'writer_alias':'write_text'},entries=[],complete_final_role=True)
    manifest=ws/'inputs/delivery_role_manifest.json';manifest.write_bytes(result['manifest_bytes'])
    profile=run/'operator-profile/bundle_profile.json';profile.parent.mkdir();profile.write_bytes(result['profile_bytes']);profile.chmod(0o600)
    module.carrier.load_profile(profile,p.sha(profile));module.carrier.reference_closure(result['profile'],lambda rel:(ws/rel).read_bytes())
    spec=copy.deepcopy(source)
    spec.update(input_pins={**source['input_pins'],str(manifest):p.sha(manifest)},bundle_profile=p.ref(profile),
                bundle_profile_role=role,bundle_profile_binding_required=False,dynamic_role_manifest_binding_required=False,
                final_reference_policy='INLINE_ONLY explicit native full text_utf8 for EACH final4 role; no input_id/fallback/hostfill')
    if family=='Z':spec['glm_resource']['bundle_profile']=p.ref(profile)
    else:spec['additional_native_runner_argv']=['--bundle-profile',str(profile)]
    p.put(run/'role-bound-stage.json',spec)
    return p.ref(run/'role-bound-stage.json'),p.ref(profile)
