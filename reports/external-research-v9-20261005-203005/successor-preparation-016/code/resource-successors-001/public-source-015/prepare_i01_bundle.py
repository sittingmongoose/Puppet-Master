#!/usr/bin/env python3
"""Actual I01 C/T critics retained; only missing final600 both arms."""
import copy
import json
from pathlib import Path
import prepare_successors as p
import prepare_bundle_transport as transport
import prepare_fresh_cohort as fresh
import hydrate_role_proofs as h
import bind_fresh_runtime as runtime
import inline_final_binding as inline

ROOT=Path(__file__).resolve().parent
CONTEXT={'path':str(p.LAB/'ops/dispatcher/source-contexts/I01-R002-T-CRITIC-EXACT-OWNER.json'),
         'sha256':'9e2a7c2bfb4785446e1ea9c18e9c19ca2c0aa5d859ddf560dab978736b3c2426'}

def prepare():
    capsule=p.checked(h.CAPSULE)
    critic=next(r for r in capsule['rows'] if r['job_id']=='I-01-DELIVERY-RECOVERY-R002-treatment-critique-a001')
    files,proof=p.role_import(critic['output_freeze'],'treatment','critique',['critique/review.md'])
    context,contextproof=p.closed_context(CONTEXT,'treatment',critic['job_id'])
    rows=p.rows_for('I-01-DELIVERY-RECOVERY-R002')
    if len(rows)!=2 or {r['arm'] for r in rows}!={'control','treatment'}:raise ValueError('Exact two original missing final roles')
    if any(r['stage']!='revision' or r['max_seconds']!=600 for r in rows):raise ValueError('No duplicated900 or altered final budget')
    _,data=runtime.integration(False);common=p.binding('L')
    common.update(family='Z',source_pin=runtime.BASE,native_stage_runner=data['worker_path'],resource_contract=data['contract'],
                  glm_stage_options=data['stage_glm_resource'],resource_definition=data['row_resource_definition'],integration_outbox_ref=runtime.BASE_INTEGRATION)
    imports={r['job_id']:files+context for r in rows if r['arm']=='treatment'}
    original=p.prepare_pair(rows,'entered_matched_lineage',common,'glm-batch003',
            source_roles=[proof,contextproof],imports_by_job=imports,
            extra_gate='Actual original Ccritic+new Tgenuinecritic completedquiet; only both600 finals, no fresh900/native-completed-pipeline/freshmatched credit')
    base_ref=transport.prepare(original,fresh.TOOLS14,'bundle-i01-001',
             classification_override='coupled_warm_final600_only_no_fresh_matched_pipeline_credit',native_source_pin_ref=runtime.BUNDLE)
    base=p.checked(base_ref);card=p.checked({'path':base['card_path'],'sha256':base['card_sha256']});stages=[]
    for row in base['stage_jobs']:
        selected,profile=inline.bind({'path':row['stage_json'],'sha256':row['stage_sha256']},card,'Z')
        stage=copy.deepcopy(row);stage.update(stage_json=selected['path'],stage_sha256=selected['sha256'],bundle_profile=profile,
                    status='PREPARED_NOT_ADMITTED',reference_closure_binding_required=False)
        stages.append(stage)
    reg=copy.deepcopy(base)
    reg.update(request_id=base['request_id']+'-inline-r002',stage_jobs=stages,root_scope_required=False,root_or_max_go_required=False,
               existing_genuine_treatment_critic_carried=True,new_critic_stages=0,
               source_context_import=contextproof,fresh_matched_pipeline_credit=False,
               final_reference_policy='INLINE_ONLY full native text_utf8 final4 botharms',additional_admission_gate=None,
               no_new_premium_authored_answers_or_evaluator_feedback_supplied=True)
    path=Path(base_ref['path']).parent/'role-bound-registration.json';p.put(path,reg)
    p.put(ROOT/'bundle-i01-001/OUTBOX.json',{'schema':'er9.actual-I01-final-only-bundle-outbox.v1','requests':[p.ref(path)],
          'native_stages':2,'per_arm_final_seconds':600,'new_critic_stages':0,'actual_Tcritic_elapsed_seconds':proof['original_elapsed_seconds'],
          'exact_owned_Tcritic_context_count':contextproof['source_count'],'Tcapture_directory_membership_selection_used':False,
          'all_original_clocks_costs_failure_flags_retained':True,'native_starts':0,'fresh_matched_pipeline_credit':False})
    print(json.dumps(p.ref(ROOT/'bundle-i01-001/OUTBOX.json')))

if __name__=='__main__':prepare()
