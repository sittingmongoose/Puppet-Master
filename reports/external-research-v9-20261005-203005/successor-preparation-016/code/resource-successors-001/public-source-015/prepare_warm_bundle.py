#!/usr/bin/env python3
"""Finite separate warm final versions; no duplicate R/critic or fresh credit."""
import copy
import json
from pathlib import Path
import prepare_successors as p
import prepare_bundle_transport as transport
import prepare_fresh_cohort as fresh
import hydrate_role_proofs as hydration
import bind_fresh_runtime as runtime

ROOT=Path(__file__).resolve().parent

def prepare():
    selected=[]
    # C4 and I08 already have dedicated exact current versions; seeds/V06 stay
    # outside generic carrier. I01 is prepared separately from actual Tcritic.
    for name in ['glm-batch001','glm-batch002','luna-batch001']:
        outbox=p.checked(p.ref(ROOT/name/'OUTBOX.json'))
        for ref in outbox['requests']:
            reg=p.checked(ref)
            if reg['pair_id'].startswith(('C-','SEED-','D-')):continue
            selected.append(ref)
    destination=ROOT/'warm-bundle001';requests=[]
    for source_ref in selected:
        original=p.checked(source_ref)
        classification='unpaired_warm_delivery_continuation' if original['scientific_recovery_mode']=='unpaired_warm_delivery_continuation' else 'coupled_warm_delivery_version_no_fresh_matched_pipeline_credit'
        family=original['family'];native_ref=fresh.LUNA14 if family=='L' else runtime.BUNDLE
        base_ref=transport.prepare(source_ref,fresh.TOOLS14,'warm-bundle001',classification_override=classification,native_source_pin_ref=native_ref)
        base=p.checked(base_ref);card=p.checked({'path':base['card_path'],'sha256':base['card_sha256']})
        rows=[]
        for row in base['stage_jobs']:
            source=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});run=Path(row['stage_json']).parent;ws=Path(source['workspace'])
            module=hydration.tool_module()
            role='final_author' if source['stage']=='revision' else source['stage']
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
                      declared_native_source_pin=native_ref,final_reference_policy='INLINE_ONLY complete native text_utf8 final4',
                      actual_missing_same_arm_predecessor_input_closure_honestly_pending=True)
            if family=='Z':spec['glm_resource']['bundle_profile']=p.ref(profile)
            else:spec['additional_native_runner_argv']=['--bundle-profile',str(profile)]
            p.put(run/'role-bound-stage.json',spec)
            newrow=copy.deepcopy(row);newrow.update(stage_json=str(run/'role-bound-stage.json'),stage_sha256=p.sha(run/'role-bound-stage.json'),
                   status='AWAITING_ACTUAL_SAME_ARM_PREDECESSOR_INPUT_CLOSURE',bundle_profile=p.ref(profile),reference_closure_binding_required=False)
            rows.append(newrow)
        if classification!='unpaired_warm_delivery_continuation' and {r['arm'] for r in rows}!={'control','treatment'}:
            raise ValueError('Coupled warm final transport must include both arms')
        reg=copy.deepcopy(base)
        reg.update(request_id=base['request_id']+'-inline-r002',stage_jobs=rows,root_scope_required=False,root_or_max_go_required=False,
                   scientific_recovery_mode=classification,full_fresh_pipeline_or_matched_causal_credit=False,
                   duplicate_ordinary_research_critic_stages=0,final_reference_policy='INLINE_ONLY both arms where coupled',
                   actual_input_birth_rule='Ops binds actual first-chronological structurally eligible same-arm native roles/allcaptures before final launch; never completed/fake missing-role claim',
                   pending_predecessor_inputs='Original registered DAG/role dependencies remain actual pending; profile readiness is independent',
                   no_new_premium_authored_answers_or_evaluator_feedback_supplied=True)
        path=Path(base_ref['path']).parent/'role-bound-registration.json';p.put(path,reg);requests.append(p.ref(path))
    p.put(destination/'OUTBOX.json',{'schema':'er9.finite-warm-final-transport-outbox.v1','requests':requests,
                    'lineage_count':len(requests),'final_stage_count':sum(len(p.checked(r)['stage_jobs']) for r in requests),
                    'new_nonfinal_stages':0,'native_starts':0,'fresh12_and_C4_separate':True,
                    'actual_same_arm_predecessor_hashes_required_at_final_birth':True,
                    'first_research_runtime_choices_retroactively_repaired_claim':False,
                    'automatic_extra_pipeline_or_bestof_repeat':False})
    print(json.dumps(p.ref(destination/'OUTBOX.json')))

if __name__=='__main__':prepare()
