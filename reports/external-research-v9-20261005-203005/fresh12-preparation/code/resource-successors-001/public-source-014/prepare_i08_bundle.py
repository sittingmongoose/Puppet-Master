#!/usr/bin/env python3
"""Single genuinely missing I08 C final; T terminal roles are never duplicated."""
import copy
import json
from pathlib import Path
import prepare_successors as p
import prepare_bundle_transport as transport
import prepare_fresh_cohort as fresh
import hydrate_role_proofs as hydration

ROOT=Path(__file__).resolve().parent
CONTEXT={'path':str(p.LAB/'ops/dispatcher/source-contexts/I08-R002-C-CRITIC.json'),
         'sha256':'c0b11bea8ecaa53dfc0a355fdeb5fa20df6376685f2c7187f542d8020c0e641c'}

def prepare():
    source_ref=p.checked(p.ref(ROOT/'luna-batch003/OUTBOX.json'))['requests'][0]
    source=p.checked(source_ref);control=next(r for r in source['stage_jobs'] if r['arm']=='control')
    excluded=[r['job_id'] for r in source['stage_jobs'] if r['arm']=='treatment']
    copies,context_proof=p.closed_context(CONTEXT,'control','I-08-DELIVERY-RECOVERY-R002-control-critique-a001')
    reg_ref=transport.prepare(source_ref,fresh.TOOLS14,'bundle-i08-001',excluded,
               classification_override='unpaired_warm_control_final_after_structural_T_terminal_role_carry',
               native_source_pin_ref=fresh.LUNA14,extra_imports_by_source_job={control['job_id']:copies})
    reg=p.checked(reg_ref);row=reg['stage_jobs'][0];spec=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
    card=p.checked({'path':reg['card_path'],'sha256':reg['card_sha256']});run=Path(row['stage_json']).parent
    closure=hydration.hydrate(spec,card,
              ['I-08-LUNA-S1-control-research-a001','I-08-DELIVERY-RECOVERY-R002-control-critique-a001'],
              run/'operator-profile'/'bundle_profile.json')
    selected=copy.deepcopy(spec)
    selected.update(bundle_profile=closure['profile_ref'],input_pins={**spec['input_pins'],**closure['new_input_pins']},
                    current_role_reference_closure=closure,
                    dynamic_role_manifest_binding_required=False,
                    bundle_profile_binding_required=False,
                    declared_native_source_pin=fresh.LUNA14,
                    declared_native_runner=reg and p.checked(reg['resource_binding'])['native_stage_runner'],
                    additional_native_runner_argv=['--bundle-profile',closure['profile_ref']['path']])
    p.put(run/'role-bound-stage.json',selected)
    newrow=copy.deepcopy(row);newrow.update(stage_json=str(run/'role-bound-stage.json'),stage_sha256=p.sha(run/'role-bound-stage.json'),
                 status='PREPARED_NOT_ADMITTED',reference_closure_binding_required=False,
                 bundle_profile=closure['profile_ref'])
    registered=copy.deepcopy(reg)
    registered.update(request_id=reg['request_id']+'-proof-r002',stage_jobs=[newrow],root_scope_required=False,
              root_or_max_go_required=False,actual_role_reference_closure=closure,
              source_context_import=context_proof,
              native_complete_pipeline_claim=False,fresh_matched_causal_credit=False,
              treatment_terminal_role_selector=p.ref(ROOT/'I08_TERMINAL_ROLE_SELECTION_001.json'),
              additional_admission_gate=None,source_registration_ref=reg_ref,
              dispatch_condition='Ops verifies all superseded C-stage starts0, exact original T quiet and full all-owned growth; select this single C600 final version only')
    p.put(run.parent/'role-bound-registration.json',registered)
    outbox={'schema':'er9.current-role-bundle-bound-outbox.v1','requests':[p.ref(run.parent/'role-bound-registration.json')],
            'current_missing_native_stages':1,'actual_native_starts':0,'treatment_duplicate_stages':0,
            'source_context_count':context_proof['source_count'],'actual_reference_count':closure['actual_reference_count'],
            'source_registration_preserved':source_ref,'unpaired_warm_delivery_only':True,
            'all_old_clocks_costs_native_failure_flags_retained':True}
    p.put(ROOT/'bundle-i08-001/OUTBOX.json',outbox)
    print(json.dumps(p.ref(ROOT/'bundle-i08-001/OUTBOX.json')))

if __name__=='__main__':prepare()
